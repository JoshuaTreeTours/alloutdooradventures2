import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { tsImport } from "tsx/esm/api";

const SITE = "https://www.alloutdooradventures.com";
const DIST = path.resolve("dist");
const SITEMAP = "sitemap-tours.xml";

const normalizePath = value => {
  const pathname = value || "/";
  const normalized = pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return normalized || "/";
};

const outputCandidatesFor = pathname => {
  const clean = normalizePath(pathname).replace(/^\//, "");
  if (!clean) return [path.join(DIST, "index.html")];
  return [path.join(DIST, clean, "index.html"), path.join(DIST, `${clean}.html`)];
};

const readFirstExisting = async pathname => {
  for (const candidate of outputCandidatesFor(pathname)) {
    try {
      return { path: candidate, html: await readFile(candidate, "utf8") };
    } catch {
      // Try the next supported prerender layout.
    }
  }
  return null;
};

const decodeXml = value =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const sitemapUrls = async () => {
  const xml = await readFile(path.join(DIST, SITEMAP), "utf8");
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map(match => decodeXml(match[1].trim()))
    .filter(Boolean);
};

const isTourProductUrl = pathname => {
  const p = normalizePath(pathname);
  if (/\/book$/i.test(p)) return false;
  if (/^\/destinations\/.+\/tours\/[^/]+$/i.test(p)) return true;
  if (/^\/tours\/(?:[^/]+|[^/]+\/[^/]+\/[^/]+)$/i.test(p)) return true;
  return false;
};

const typeIncludes = (node, wanted) => {
  const type = node?.["@type"];
  return Array.isArray(type) ? type.includes(wanted) : type === wanted;
};

const collectTypedNodes = (value, wanted) => {
  const found = [];
  const visit = node => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeIncludes(node, wanted)) found.push(node);
    Object.values(node).forEach(visit);
  };
  visit(value);
  return found;
};

const parseLdJson = html => {
  const scripts = [];
  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(pattern)) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      scripts.push(JSON.parse(raw));
    } catch {
      // The final audit reports malformed JSON-LD. Do not mask it here.
    }
  }
  return scripts;
};

const canonicalFromHtml = html => {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (!/\brel=["']canonical["']/i.test(tag)) continue;
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1]?.trim();
    if (href) return href;
  }
  return null;
};

const titleFromHtml = html =>
  html
    .match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    ?.replace(/\s+/g, " ")
    .trim() ?? "";

const metaDescriptionFromHtml = html => {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (!/\bname=["']description["']/i.test(tag)) continue;
    const value = tag.match(/\bcontent=["']([^"']*)["']/i)?.[1]?.trim();
    if (value) return value;
  }
  return "";
};

const imageFromHtml = html => {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (!/\bproperty=["']og:image["']/i.test(tag)) continue;
    const value = tag.match(/\bcontent=["']([^"']*)["']/i)?.[1]?.trim();
    if (value) return value;
  }
  return "";
};

const productMatchesCanonical = (product, canonicalUrl) => {
  const canonical = canonicalUrl.replace(/\/$/, "");
  const urls = [product?.url, product?.["@id"]]
    .filter(value => typeof value === "string")
    .map(value => value.split("#")[0].replace(/\/$/, ""));
  return urls.includes(canonical);
};

const hasProductForCanonical = (html, canonicalUrl) =>
  parseLdJson(html)
    .flatMap(script => collectTypedNodes(script, "Product"))
    .some(product => productMatchesCanonical(product, canonicalUrl));

const stripBreadcrumbs = value => {
  if (Array.isArray(value)) {
    return value
      .map(stripBreadcrumbs)
      .filter(item => item !== null && item !== undefined);
  }
  if (!value || typeof value !== "object") return value;
  if (typeIncludes(value, "BreadcrumbList")) return null;
  const next = {};
  for (const [key, child] of Object.entries(value)) {
    const stripped = stripBreadcrumbs(child);
    if (stripped === null || stripped === undefined) {
      if (key === "@graph") next[key] = [];
      continue;
    }
    next[key] = stripped;
  }
  return next;
};

const normalizeGraph = value => {
  const stripped = stripBreadcrumbs(value);
  if (!stripped || typeof stripped !== "object") return null;
  if (Array.isArray(stripped)) {
    return { "@context": "https://schema.org", "@graph": stripped };
  }
  if (Array.isArray(stripped["@graph"])) return stripped;
  return { "@context": "https://schema.org", "@graph": [stripped] };
};

const replacePrimaryStructuredData = (html, graph) => {
  const script = `<script id="structured-data" type="application/ld+json">${JSON.stringify(graph).replace(/</g, "\\u003c")}</script>`;
  const byId = /<script\b[^>]*id=["']structured-data["'][^>]*>[\s\S]*?<\/script>/i;
  if (byId.test(html)) return html.replace(byId, script);
  return /<\/head>/i.test(html)
    ? html.replace(/<\/head>/i, `${script}</head>`)
    : `${script}${html}`;
};

const [
  engine6Registry,
  engine6SchemaModule,
  engine4SchemaModule,
  engine2DataModule,
  engine2SeoModule,
  engine2SchemaModule,
  toursDataModule,
  flagstaffModule,
  structuredDataModule,
  tourPathsModule,
] = await Promise.all([
  tsImport("../src/engine6/registry.ts", import.meta.url),
  tsImport("../src/engine6/schema/buildEngine6SchemaGraph.ts", import.meta.url),
  tsImport(
    "../src/engine4/schema/buildEngine4ViatorStructuredDataForPath.ts",
    import.meta.url
  ),
  tsImport("../src/engine2/data/loadEngine2.ts", import.meta.url),
  tsImport("../src/engine2/seo/buildEngine2Seo.ts", import.meta.url),
  tsImport("../src/engine2/schema/buildSchemaGraph.ts", import.meta.url),
  tsImport("../src/data/tours.ts", import.meta.url),
  tsImport("../src/data/flagstaffTours.ts", import.meta.url),
  tsImport("../src/utils/structuredData.ts", import.meta.url),
  tsImport("../src/data/tourPaths.ts", import.meta.url),
]);

const engine6Tours = Array.isArray(engine6Registry.engine6ResolvedTours)
  ? engine6Registry.engine6ResolvedTours
  : [];
const engine6ByPath = new Map(
  engine6Tours.map(tour => [normalizePath(tour.canonicalPath), tour])
);
const getEngine4Nodes =
  engine4SchemaModule.buildEngine4ViatorStructuredDataNodesForPath;
const getEngine2ByPath = engine2DataModule.getEngine2TourByPath;
const getEngine2BySlug = engine2DataModule.getEngine2TourBySlug;
const getEngine2CanadaBySlug = engine2DataModule.getEngine2CanadaTourBySlug;
const buildEngine2Seo = engine2SeoModule.buildEngine2Seo;
const buildEngine2Graph = engine2SchemaModule.buildSchemaGraph;
const legacyTours = Array.isArray(toursDataModule.tours)
  ? toursDataModule.tours
  : [];
const getFlagstaffTourBySlug = flagstaffModule.getFlagstaffTourBySlug;
const buildWebPageStructuredData =
  structuredDataModule.buildWebPageStructuredData;
const buildTourProductStructuredData =
  structuredDataModule.buildTourProductStructuredData;
const buildTourTripStructuredData =
  structuredDataModule.buildTourTripStructuredData;
const getSiteStructuredDataNodes =
  structuredDataModule.getSiteStructuredDataNodes;
const normalizeStructuredData = structuredDataModule.normalizeStructuredData;
const getTourBookingPath = tourPathsModule.getTourBookingPath;

const resolveEngine2Tour = pathname => {
  const exact =
    typeof getEngine2ByPath === "function" ? getEngine2ByPath(pathname) : null;
  if (exact) return exact;

  let match =
    /^\/destinations\/united-states\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(
      pathname
    );
  if (match && typeof getEngine2BySlug === "function") {
    return getEngine2BySlug(match[1], match[2], match[3]) ?? null;
  }

  match = /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(
    pathname
  );
  if (match && typeof getEngine2BySlug === "function") {
    return getEngine2BySlug(match[1], match[2], match[3]) ?? null;
  }

  match =
    /^\/destinations\/world\/canada\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(
      pathname
    );
  if (match && typeof getEngine2CanadaBySlug === "function") {
    return getEngine2CanadaBySlug(match[1], match[2], match[3]) ?? null;
  }

  return null;
};

const resolveLegacyTour = pathname => {
  let match = /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(
    pathname
  );
  if (match) {
    return (
      legacyTours.find(
        tour =>
          tour?.destination?.stateSlug === match[1] &&
          tour?.destination?.citySlug === match[2] &&
          tour?.slug === match[3]
      ) ?? null
    );
  }

  match =
    /^\/destinations\/united-states\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(
      pathname
    );
  if (match) {
    return (
      legacyTours.find(
        tour =>
          tour?.destination?.stateSlug === match[1] &&
          tour?.destination?.citySlug === match[2] &&
          tour?.slug === match[3]
      ) ?? null
    );
  }

  match = /^\/tours\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(pathname);
  if (match) {
    return (
      legacyTours.find(
        tour =>
          tour?.destination?.stateSlug === match[1] &&
          tour?.destination?.citySlug === match[2] &&
          tour?.slug === match[3]
      ) ?? null
    );
  }

  match = /^\/tours\/([^/]+)$/.exec(pathname);
  if (match && typeof getFlagstaffTourBySlug === "function") {
    return getFlagstaffTourBySlug(match[1]) ?? null;
  }

  return null;
};

const buildLegacyGraph = ({ tour, canonicalUrl, html }) => {
  const description = metaDescriptionFromHtml(html);
  const image = imageFromHtml(html);
  const bookingPath =
    typeof getTourBookingPath === "function" ? getTourBookingPath(tour) : null;
  const bookingUrl = bookingPath
    ? new URL(bookingPath, SITE).toString()
    : canonicalUrl;
  const nodes = [
    ...getSiteStructuredDataNodes(),
    buildWebPageStructuredData({
      url: canonicalUrl,
      name: titleFromHtml(html) || tour.title,
      description,
      image: image || undefined,
    }),
    buildTourProductStructuredData({
      tour,
      detailUrl: canonicalUrl,
      bookingUrl,
      description,
      images: image ? [image] : undefined,
    }),
    buildTourTripStructuredData({
      tour,
      detailUrl: canonicalUrl,
      bookingUrl,
      description,
      images: image ? [image] : undefined,
    }),
  ];
  return normalizeStructuredData({
    "@context": "https://schema.org",
    "@graph": nodes,
  });
};

const buildGraphForRoute = ({ pathname, canonicalUrl, html }) => {
  const engine6Tour = engine6ByPath.get(pathname);
  if (engine6Tour) {
    return {
      source: "engine6",
      graph: engine6SchemaModule.buildEngine6SchemaGraph(engine6Tour),
    };
  }

  if (typeof getEngine4Nodes === "function") {
    const engine4Nodes = getEngine4Nodes(pathname);
    if (Array.isArray(engine4Nodes) && engine4Nodes.length) {
      return {
        source: "engine4",
        graph: normalizeStructuredData({
          "@context": "https://schema.org",
          "@graph": engine4Nodes,
        }),
      };
    }
  }

  const engine2Tour = resolveEngine2Tour(pathname);
  if (
    engine2Tour &&
    typeof buildEngine2Seo === "function" &&
    typeof buildEngine2Graph === "function"
  ) {
    const seo = buildEngine2Seo(engine2Tour);
    return {
      source: "engine2",
      graph: normalizeStructuredData({
        "@context": "https://schema.org",
        "@graph": buildEngine2Graph(engine2Tour, seo),
      }),
    };
  }

  const legacyTour = resolveLegacyTour(pathname);
  if (legacyTour) {
    return {
      source: "legacy",
      graph: buildLegacyGraph({ tour: legacyTour, canonicalUrl, html }),
    };
  }

  return null;
};

const urls = [
  ...new Set(
    (await sitemapUrls()).filter(url =>
      isTourProductUrl(new URL(url).pathname)
    )
  ),
];
let alreadyValid = 0;
let repaired = 0;
const repairedBySource = new Map();
const failures = [];

for (const url of urls) {
  const pathname = normalizePath(new URL(url).pathname);
  const artifact = await readFirstExisting(pathname);
  if (!artifact) {
    failures.push(`${pathname}: missing prerendered HTML artifact`);
    continue;
  }

  const canonicalRaw = canonicalFromHtml(artifact.html);
  if (!canonicalRaw) {
    failures.push(`${pathname}: missing canonical link`);
    continue;
  }

  let canonicalUrl;
  try {
    const parsedCanonical = new URL(canonicalRaw, SITE);
    if (normalizePath(parsedCanonical.pathname) !== pathname) {
      failures.push(
        `${pathname}: canonical path mismatch ${parsedCanonical.pathname}`
      );
      continue;
    }
    canonicalUrl = `${SITE}${pathname}`;
  } catch {
    failures.push(`${pathname}: invalid canonical ${canonicalRaw}`);
    continue;
  }

  if (hasProductForCanonical(artifact.html, canonicalUrl)) {
    alreadyValid += 1;
    continue;
  }

  const built = buildGraphForRoute({
    pathname,
    canonicalUrl,
    html: artifact.html,
  });
  if (!built?.graph) {
    failures.push(
      `${pathname}: missing Product and no tour schema source could resolve the route`
    );
    continue;
  }

  const graph = normalizeGraph(built.graph);
  if (!graph) {
    failures.push(
      `${pathname}: ${built.source} schema builder returned no usable graph`
    );
    continue;
  }

  const products = collectTypedNodes(graph, "Product");
  if (!products.some(product => productMatchesCanonical(product, canonicalUrl))) {
    failures.push(
      `${pathname}: ${built.source} schema graph did not contain a canonical Product`
    );
    continue;
  }

  const output = replacePrimaryStructuredData(artifact.html, graph);
  await writeFile(artifact.path, output, "utf8");
  repaired += 1;
  repairedBySource.set(
    built.source,
    (repairedBySource.get(built.source) ?? 0) + 1
  );
}

if (failures.length) {
  console.error("[finalize-product-schema] failures:");
  failures.slice(0, 100).forEach(failure => console.error(`  ${failure}`));
  if (failures.length > 100) {
    console.error(`  ... ${failures.length - 100} more`);
  }
  throw new Error(
    `Product structured-data finalization failed for ${failures.length} tour route(s); refusing production output.`
  );
}

const sourceSummary =
  [...repairedBySource.entries()]
    .map(([source, count]) => `${source}=${count}`)
    .join(", ") || "none";
console.log(
  `[finalize-product-schema] ${alreadyValid.toLocaleString()} tour pages already had canonical Product JSON-LD; repaired ${repaired.toLocaleString()} missing pages (${sourceSummary}).`
);
