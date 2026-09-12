import { readFile } from "node:fs/promises";
import path from "node:path";

const SITE = "https://www.alloutdooradventures.com";
const DIST = path.resolve("dist");
const SITEMAP = "sitemap-tours.xml";
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
      return await readFile(candidate, "utf8");
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

const parseLdJson = html => {
  const scripts = [];
  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(pattern)) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      scripts.push(JSON.parse(raw));
    } catch {
      // The main Product audit reports malformed JSON-LD separately.
    }
  }
  return scripts;
};

const repairScriptPattern = new RegExp(
  `<script\\b[^>]*id=["']${REPAIR_SCRIPT_ID}["'][^>]*>`,
  "i"
);

const failures = [];
let audited = 0;

const urls = [
  ...new Set(
    (await sitemapUrls()).filter(url =>
      isTourProductUrl(new URL(url).pathname)
    )
  ),
];

for (const url of urls) {
  const pathname = normalizePath(new URL(url).pathname);
  const html = await readFirstExisting(pathname);
  if (!html) continue;
  audited += 1;

  if (repairScriptPattern.test(html)) {
    failures.push(
      `${pathname}: legacy #${REPAIR_SCRIPT_ID} script remains in final HTML`
    );
  }

  const canonicalUrl = `${SITE}${pathname}`;
  const canonicalProducts = parseLdJson(html)
    .flatMap(script => collectTypedNodes(script, "Product"))
    .filter(product => productMatchesCanonical(product, canonicalUrl));

  if (canonicalProducts.length !== 1) {
    failures.push(
      `${pathname}: found ${canonicalProducts.length} canonical Product nodes; expected exactly 1`
    );
    continue;
  }

  const ids = canonicalProducts
    .map(product => product?.["@id"])
    .filter(value => typeof value === "string");
  if (ids.length !== new Set(ids).size) {
    failures.push(`${pathname}: duplicate canonical Product @id detected`);
  }
}

if (failures.length) {
  console.error(
    `[product-schema-uniqueness] FAILED: ${failures.length} duplicate/legacy Product-manifest defect(s) across ${urls.length.toLocaleString()} sitemap-listed product URLs.`
  );
  failures.slice(0, 100).forEach(failure => console.error(`  ${failure}`));
  if (failures.length > 100) {
    console.error(`  ... ${failures.length - 100} more`);
  }
  process.exit(1);
}

console.log(
  `[product-schema-uniqueness] PASS: ${audited.toLocaleString()} built tour pages contain exactly one canonical Product and no legacy route-repair Product script.`
);
