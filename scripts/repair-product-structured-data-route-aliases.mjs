import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { tsImport } from "tsx/esm/api";

const SITE = "https://www.alloutdooradventures.com";
const DIST = path.resolve("dist");
const SITEMAP = "sitemap-tours.xml";
const SCRIPT_ID = "product-structured-data-route-repair";

const normalizePath = value => {
  const pathname = value || "/";
  const normalized = pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return normalized || "/";
};

const outputCandidatesFor = pathname => {
  const clean = normalizePath(pathname).replace(/^\//, "");
  if (!clean) return [path.join(DIST, "index.html")];
  return [
    path.join(DIST, clean, "index.html"),
    path.join(DIST, `${clean}.html`),
  ];
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
      // The downstream integrity audit reports malformed JSON-LD.
    }
  }
  return scripts;
};

const productMatchesCanonical = (product, canonicalUrl) => {
  const canonical = canonicalUrl.replace(/\/$/, "");
  const values = [product?.url, product?.["@id"]]
    .filter(value => typeof value === "string")
    .map(value => value.split("#")[0].replace(/\/$/, ""));
  return values.includes(canonical);
};

const hasCanonicalProduct = (html, canonicalUrl) =>
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

const upsertRepairScript = (html, graph) => {
  const script = `<script id="${SCRIPT_ID}" type="application/ld+json">${JSON.stringify(graph).replace(/</g, "\\u003c")}</script>`;
  const existing = new RegExp(
    `<script\\b[^>]*id=["']${SCRIPT_ID}["'][^>]*>[\\s\\S]*?<\\/script>`,
    "i"
  );
  if (existing.test(html)) return html.replace(existing, script);
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
const getTourBySlugs = toursDataModule.getTourBySlugs;
const getFlagstaffTourBySlug = flagstaffModule.getFlagstaffTourBySlug;
const normalizeStructuredData = structuredDataModule.normalizeStructuredData;
const getSiteStructuredDataNodes = structuredDataModule.getSiteStructuredDataNodes;
const buildWebPageStructuredData =
  structuredDataModule.buildWebPageStructuredData;
const buildTourProductStructuredData =
  structuredDataModule.buildTourProductStructuredData;
const buildTourTripStructuredData =
  structuredDataModule.buildTourTripStructuredData;
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

const resolveUnifiedTour = pathname => {
  let match = /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(
    pathname
  );
  if (match && typeof getTourBySlugs === "function") {
    return getTourBySlugs(match[1], match[2], match[3]) ?? null;
  }

  match =
    /^\/destinations\/united-states\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(
      pathname
    );
  if (match && typeof getTourBySlugs === "function") {
    return getTourBySlugs(match[1], match[2], match[3]) ?? null;
  }

  match = /^\/tours\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(pathname);
  if (match && typeof getTourBySlugs === "function") {
    return getTourBySlugs(match[1], match[2], match[3]) ?? null;
  }

  match = /^\/tours\/([^/]+)$/.exec(pathname);
  if (match && typeof getFlagstaffTourBySlug === "function") {
    return getFlagstaffTourBySlug(match[1]) ?? null;
  }

  return null;
};

const buildUnifiedGraph = ({ tour, canonicalUrl, html }) => {
  const description =
    html
      .match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1]
      ?.trim() ??
    tour.longDescription ??
    tour.shortDescription ??
    "";
  const image =
    html
      .match(/<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1]
      ?.trim() ??
    tour.heroImage ??
    tour.primaryImageUrl ??
    "";

  let bookingUrl = tour.bookingUrl || canonicalUrl;
  try {
    if (typeof getTourBookingPath === "function") {
      const bookingPath = getTourBookingPath(tour);
      if (bookingPath) bookingUrl = new URL(bookingPath, SITE).toString();
    }
  } catch {
    // Keep the tour's direct booking URL/canonical fallback.
  }

  const nodes = [
    ...getSiteStructuredDataNodes(),
    buildWebPageStructuredData({
      url: canonicalUrl,
      name: tour.title,
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
    const sourceSeo = buildEngine2Seo(engine2Tour);
    const routeSeo = {
      ...sourceSeo,
      canonical: canonicalUrl,
      og: {
        ...sourceSeo.og,
        url: canonicalUrl,
      },
    };
    const graph = normalizeStructuredData({
      "@context": "https://schema.org",
      "@graph": buildEngine2Graph(engine2Tour, routeSeo),
    });
    if (
      graph &&
      collectTypedNodes(graph, "Product").some(product =>
        productMatchesCanonical(product, canonicalUrl)
      )
    ) {
      return { source: "engine2-route-canonical", graph };
    }
  }

  const unifiedTour = resolveUnifiedTour(pathname);
  if (unifiedTour) {
    return {
      source: "unified-route",
      graph: buildUnifiedGraph({ tour: unifiedTour, canonicalUrl, html }),
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
const unresolved = [];

for (const url of urls) {
  const parsed = new URL(url);
  const pathname = normalizePath(parsed.pathname);
  const artifact = await readFirstExisting(pathname);
  if (!artifact) {
    unresolved.push(`${pathname}: missing prerendered HTML artifact`);
    continue;
  }

  const canonicalUrl = `${SITE}${pathname}`;
  if (hasCanonicalProduct(artifact.html, canonicalUrl)) {
    alreadyValid += 1;
    continue;
  }

  const built = buildGraphForRoute({ pathname, canonicalUrl, html: artifact.html });
  const graph = built?.graph ? normalizeGraph(built.graph) : null;
  if (!graph) {
    unresolved.push(`${pathname}: no route-backed schema source resolved`);
    continue;
  }

  const products = collectTypedNodes(graph, "Product");
  if (!products.some(product => productMatchesCanonical(product, canonicalUrl))) {
    unresolved.push(
      `${pathname}: ${built.source} did not produce a canonical Product`
    );
    continue;
  }

  await writeFile(artifact.path, upsertRepairScript(artifact.html, graph), "utf8");
  repaired += 1;
  repairedBySource.set(
    built.source,
    (repairedBySource.get(built.source) ?? 0) + 1
  );
}

const sourceSummary =
  [...repairedBySource.entries()]
    .map(([source, count]) => `${source}=${count}`)
    .join(", ") || "none";

console.log(
  `[product-schema-route-repair] ${alreadyValid.toLocaleString()} already valid; repaired ${repaired.toLocaleString()} (${sourceSummary}).`
);

if (unresolved.length) {
  console.warn(
    `[product-schema-route-repair] ${unresolved.length.toLocaleString()} route(s) remain unresolved for the mandatory finalizer/audit.`
  );
  unresolved.slice(0, 50).forEach(message => console.warn(`  ${message}`));
}
