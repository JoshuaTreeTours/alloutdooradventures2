import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE = "https://www.alloutdooradventures.com";
const SITE_HOSTS = new Set([
  "www.alloutdooradventures.com",
  "alloutdooradventures.com",
]);
const DIST = path.resolve("dist");
const SITEMAP = "sitemap-tours.xml";
const REPORT = path.resolve("reports/product-structured-data-integrity.json");

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

const parseLdJson = html => {
  const scripts = [];
  const parseErrors = [];
  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(pattern)) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      scripts.push(JSON.parse(raw));
    } catch (error) {
      parseErrors.push(error instanceof Error ? error.message : String(error));
    }
  }
  return { scripts, parseErrors };
};

const collectNodes = value => {
  const found = [];
  const seen = new Set();
  const visit = node => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (seen.has(node)) return;
    seen.add(node);
    found.push(node);
    Object.values(node).forEach(visit);
  };
  visit(value);
  return found;
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

const toUrl = value => {
  if (!value || typeof value !== "string") return null;
  try {
    return new URL(value, SITE);
  } catch {
    return null;
  }
};

const productMatchesCanonical = (product, canonicalUrl) => {
  const canonical = canonicalUrl.replace(/\/$/, "");
  const values = [product?.url, product?.["@id"]]
    .filter(value => typeof value === "string")
    .map(value => value.split("#")[0].replace(/\/$/, ""));
  return values.includes(canonical);
};

const hasCommercialPrice = offer => {
  const values = [offer?.price, offer?.lowPrice, offer?.highPrice];
  return values.some(value => {
    if (typeof value === "number") return Number.isFinite(value) && value >= 0;
    if (typeof value !== "string") return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    const numeric = Number(trimmed.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(numeric) && numeric >= 0;
  });
};

const resolveOffers = ({ product, byId }) => {
  const rawOffers = Array.isArray(product?.offers)
    ? product.offers
    : product?.offers
      ? [product.offers]
      : [];
  const resolved = [];

  for (const raw of rawOffers) {
    if (!raw || typeof raw !== "object") continue;
    if (typeIncludes(raw, "Offer") || typeIncludes(raw, "AggregateOffer")) {
      resolved.push(raw);
      continue;
    }
    const id = typeof raw["@id"] === "string" ? raw["@id"] : null;
    const referenced = id ? byId.get(id) : null;
    if (
      referenced &&
      (typeIncludes(referenced, "Offer") ||
        typeIncludes(referenced, "AggregateOffer"))
    ) {
      resolved.push(referenced);
    }
  }

  return resolved;
};

const failures = [];
const failureCounts = new Map();
const warnings = [];
const warningCounts = new Map();

const fail = (pathname, code, message) => {
  failures.push({ pathname, code, message });
  failureCounts.set(code, (failureCounts.get(code) ?? 0) + 1);
};

const warn = (pathname, code, message) => {
  warnings.push({ pathname, code, message });
  warningCounts.set(code, (warningCounts.get(code) ?? 0) + 1);
};

const urls = [
  ...new Set(
    (await sitemapUrls()).filter(url =>
      isTourProductUrl(new URL(url).pathname)
    )
  ),
];

let audited = 0;
let productsFound = 0;
let offersFound = 0;
let commerciallyCompleteOffers = 0;

for (const url of urls) {
  const parsedRoute = toUrl(url);
  if (!parsedRoute) {
    fail(url, "invalid-sitemap-url", "sitemap URL is not parseable");
    continue;
  }
  const pathname = normalizePath(parsedRoute.pathname);
  const artifact = await readFirstExisting(pathname);
  if (!artifact) {
    fail(pathname, "missing-artifact", "missing prerendered HTML artifact");
    continue;
  }
  audited += 1;

  const canonicalRaw = canonicalFromHtml(artifact.html);
  const canonical = toUrl(canonicalRaw);
  if (!canonicalRaw || !canonical) {
    fail(pathname, "missing-canonical", "missing or invalid canonical link");
    continue;
  }
  if (!SITE_HOSTS.has(canonical.hostname)) {
    fail(pathname, "offsite-canonical", `canonical points off-site: ${canonicalRaw}`);
    continue;
  }
  if (normalizePath(canonical.pathname) !== pathname) {
    fail(
      pathname,
      "canonical-mismatch",
      `canonical path mismatch: ${canonical.pathname}`
    );
    continue;
  }
  const canonicalUrl = `${SITE}${pathname}`;

  const { scripts, parseErrors } = parseLdJson(artifact.html);
  if (parseErrors.length) {
    fail(pathname, "malformed-jsonld", `malformed JSON-LD: ${parseErrors[0]}`);
  }
  if (!scripts.length) {
    fail(pathname, "missing-jsonld", "no parseable JSON-LD scripts in built HTML");
    continue;
  }

  const nodes = scripts.flatMap(collectNodes);
  const byId = new Map(
    nodes
      .filter(node => typeof node?.["@id"] === "string")
      .map(node => [node["@id"], node])
  );
  const products = nodes.filter(node => typeIncludes(node, "Product"));
  const canonicalProducts = products.filter(product =>
    productMatchesCanonical(product, canonicalUrl)
  );

  if (!canonicalProducts.length) {
    fail(
      pathname,
      "missing-product",
      `no Product JSON-LD node matches canonical ${canonicalUrl}`
    );
    continue;
  }
  productsFound += 1;

  const product = canonicalProducts[0];
  if (typeof product.name !== "string" || !product.name.trim()) {
    fail(pathname, "missing-product-name", "canonical Product has no usable name");
  }

  const offers = resolveOffers({ product, byId });
  if (!offers.length) {
    fail(
      pathname,
      "missing-offer",
      "canonical Product has no inline or resolvable Offer/AggregateOffer"
    );
    continue;
  }
  offersFound += 1;

  const commercialOffers = offers.filter(offer => {
    const currency =
      typeof offer.priceCurrency === "string" && offer.priceCurrency.trim();
    const availability =
      typeof offer.availability === "string" && offer.availability.trim();
    return currency && availability && hasCommercialPrice(offer);
  });

  if (commercialOffers.length) {
    commerciallyCompleteOffers += 1;
  } else {
    warn(
      pathname,
      "incomplete-commercial-offer",
      "Product Offer exists but lacks price, priceCurrency, or availability"
    );
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  site: SITE,
  scope: {
    sitemapProductUrls: urls.length,
    auditedArtifacts: audited,
    canonicalProductsFound: productsFound,
    productsWithResolvableOffers: offersFound,
    productsWithCommerciallyCompleteOffers: commerciallyCompleteOffers,
  },
  failureCounts: Object.fromEntries(failureCounts),
  warningCounts: Object.fromEntries(warningCounts),
  failures,
  warnings,
};

await mkdir(path.dirname(REPORT), { recursive: true });
await writeFile(REPORT, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (warnings.length) {
  console.warn(
    `[product-schema-audit] ${warnings.length} commercial Offer warning(s); Product/Offer structure remains valid. See reports/product-structured-data-integrity.json.`
  );
  warnings.slice(0, 25).forEach(warning =>
    console.warn(`  ${warning.pathname}: [${warning.code}] ${warning.message}`)
  );
  if (warnings.length > 25) {
    console.warn(`  ... ${warnings.length - 25} more warning(s)`);
  }
}

if (failures.length) {
  console.error(
    `[product-schema-audit] FAILED: ${failures.length} structural defect(s) across ${urls.length.toLocaleString()} sitemap-listed product URLs.`
  );
  failures.slice(0, 100).forEach(failure =>
    console.error(`  ${failure.pathname}: [${failure.code}] ${failure.message}`)
  );
  if (failures.length > 100) {
    console.error(
      `  ... ${failures.length - 100} more; see reports/product-structured-data-integrity.json`
    );
  }
  process.exit(1);
}

console.log(
  `[product-schema-audit] PASS: ${urls.length.toLocaleString()} sitemap-listed tour product pages have canonical Product JSON-LD with a resolvable Offer/AggregateOffer.`
);
