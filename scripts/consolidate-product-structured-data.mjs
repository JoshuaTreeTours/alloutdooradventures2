import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE = "https://www.alloutdooradventures.com";
const DIST = path.resolve("dist");
const SITEMAP = "sitemap-tours.xml";
const PRIMARY_SCRIPT_ID = "structured-data";
const REPAIR_SCRIPT_ID = "product-structured-data-route-repair";

const normalizePath = value => {
  const pathname = value || "/";
  const normalized = pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return normalized || "/";
};

const isTourProductUrl = pathname => {
  const p = normalizePath(pathname);
  if (/\/book$/i.test(p)) return false;
  if (/^\/destinations\/.+\/tours\/[^/]+$/i.test(p)) return true;
  if (/^\/tours\/(?:[^/]+|[^/]+\/[^/]+\/[^/]+)$/i.test(p)) return true;
  return false;
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

const productMatchesCanonical = (product, canonicalUrl) => {
  const canonical = canonicalUrl.replace(/\/$/, "");
  return [product?.url, product?.["@id"]]
    .filter(value => typeof value === "string")
    .map(value => value.split("#")[0].replace(/\/$/, ""))
    .includes(canonical);
};

const parseAllJsonLd = html => {
  const scripts = [];
  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(pattern)) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      scripts.push(JSON.parse(raw));
    } catch {
      // The downstream structural audit owns malformed JSON-LD reporting.
    }
  }
  return scripts;
};

const canonicalProductCount = (html, canonicalUrl) =>
  parseAllJsonLd(html)
    .flatMap(script => collectTypedNodes(script, "Product"))
    .filter(product => productMatchesCanonical(product, canonicalUrl)).length;

const scriptPatternById = id =>
  new RegExp(
    `<script\\b[^>]*id=["']${id}["'][^>]*type=["']application\\/ld\\+json["'][^>]*>([\\s\\S]*?)<\\/script>`,
    "i"
  );

const repairPattern = scriptPatternById(REPAIR_SCRIPT_ID);
const primaryPattern = scriptPatternById(PRIMARY_SCRIPT_ID);

const buildPrimaryScript = graph =>
  `<script id="${PRIMARY_SCRIPT_ID}" type="application/ld+json">${JSON.stringify(graph).replace(/</g, "\\u003c")}</script>`;

const failures = [];
let inspected = 0;
let consolidated = 0;

const urls = [
  ...new Set(
    (await sitemapUrls()).filter(url =>
      isTourProductUrl(new URL(url).pathname)
    )
  ),
];

for (const url of urls) {
  const pathname = normalizePath(new URL(url).pathname);
  const artifact = await readFirstExisting(pathname);
  if (!artifact) continue;
  inspected += 1;

  const repairMatch = artifact.html.match(repairPattern);
  if (!repairMatch) continue;

  const canonicalUrl = `${SITE}${pathname}`;
  let repairGraph;
  try {
    repairGraph = JSON.parse(repairMatch[1].trim());
  } catch (error) {
    failures.push(
      `${pathname}: repair JSON-LD is malformed: ${error instanceof Error ? error.message : String(error)}`
    );
    continue;
  }

  const repairProducts = collectTypedNodes(repairGraph, "Product").filter(product =>
    productMatchesCanonical(product, canonicalUrl)
  );
  if (repairProducts.length !== 1) {
    failures.push(
      `${pathname}: route-repair graph contains ${repairProducts.length} canonical Product nodes; expected exactly 1`
    );
    continue;
  }

  const primaryScript = buildPrimaryScript(repairGraph);
  let html = artifact.html.replace(repairPattern, "");
  if (primaryPattern.test(html)) {
    html = html.replace(primaryPattern, primaryScript);
  } else if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${primaryScript}</head>`);
  } else {
    html = `${primaryScript}${html}`;
  }

  const productCount = canonicalProductCount(html, canonicalUrl);
  if (productCount !== 1) {
    failures.push(
      `${pathname}: consolidation would leave ${productCount} canonical Product nodes; expected exactly 1`
    );
    continue;
  }

  if (repairPattern.test(html)) {
    failures.push(`${pathname}: route-repair JSON-LD script survived consolidation`);
    continue;
  }

  await writeFile(artifact.path, html, "utf8");
  consolidated += 1;
}

if (failures.length) {
  console.error(
    `[product-schema-consolidation] FAILED: ${failures.length} route(s) could not be safely consolidated.`
  );
  failures.slice(0, 100).forEach(failure => console.error(`  ${failure}`));
  if (failures.length > 100) {
    console.error(`  ... ${failures.length - 100} more`);
  }
  process.exit(1);
}

console.log(
  `[product-schema-consolidation] PASS: inspected ${inspected.toLocaleString()} tour artifacts; consolidated ${consolidated.toLocaleString()} route-repair Product graphs into #${PRIMARY_SCRIPT_ID}.`
);
