import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tsImport } from "tsx/esm/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, "../dist");

const { buildCanonicalUrl } = await tsImport(
  "../src/utils/seo.ts",
  import.meta.url,
);

const buildOutputPath = (pathname) => {
  if (!pathname || pathname === "/") {
    return path.join(distDir, "index.html");
  }
  const normalized = pathname.replace(/^\/+|\/+$/g, "");
  return path.join(distDir, normalized, "index.html");
};

const findTag = (html, tagName, attrName, attrValue) => {
  const pattern = new RegExp(
    `<${tagName}\\s+[^>]*${attrName}\\s*=\\s*["']${attrValue}["'][^>]*>`,
    "i",
  );
  const match = html.match(pattern);
  return match ? match[0] : null;
};

const extractAttribute = (tag, attrName) => {
  if (!tag) {
    return null;
  }
  const pattern = new RegExp(`${attrName}\\s*=\\s*["']([^"']+)["']`, "i");
  const match = tag.match(pattern);
  return match?.[1] ?? null;
};

const extractJsonLd = (html) => {
  const matches = Array.from(
    html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  );

  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one JSON-LD script, found ${matches.length}.`,
    );
  }

  return JSON.parse(matches[0][1]);
};

const getGraphNodes = (jsonLd) =>
  Array.isArray(jsonLd?.["@graph"]) ? jsonLd["@graph"] : [];

const getNodeById = (nodes, id) =>
  nodes.filter((node) => node && typeof node === "object" && node["@id"] === id);

const hasNodeType = (node, type) => {
  if (!node || typeof node !== "object") {
    return false;
  }
  const nodeType = node["@type"];
  if (Array.isArray(nodeType)) {
    return nodeType.includes(type);
  }
  return nodeType === type;
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const verifyRoute = async (pathname) => {
  const outputPath = buildOutputPath(pathname);
  const html = await readFile(outputPath, "utf8");
  const canonical = buildCanonicalUrl(pathname);

  const canonicalTag = findTag(html, "link", "rel", "canonical");
  assert(canonicalTag, "Missing canonical link tag.");
  assert(
    extractAttribute(canonicalTag, "href") === canonical,
    "Canonical tag does not match expected URL.",
  );

  const ogUrlTag = findTag(html, "meta", "property", "og:url");
  assert(ogUrlTag, "Missing og:url meta tag.");
  assert(
    extractAttribute(ogUrlTag, "content") === canonical,
    "og:url does not match canonical URL.",
  );

  const jsonLd = extractJsonLd(html);
  const graphNodes = getGraphNodes(jsonLd);

  const orgId = `${buildCanonicalUrl("/")}#org`;
  const websiteId = `${buildCanonicalUrl("/")}#website`;
  const orgNodes = getNodeById(graphNodes, orgId);
  const websiteNodes = getNodeById(graphNodes, websiteId);
  assert(orgNodes.length === 1, "Expected exactly one Organization node.");
  assert(websiteNodes.length === 1, "Expected exactly one WebSite node.");

  const orgNode = orgNodes[0];
  assert(
    orgNode.name === "Outdoor Adventures",
    "Organization.name must be Outdoor Adventures.",
  );
  const sameAs = Array.isArray(orgNode.sameAs) ? orgNode.sameAs : [];
  assert(
    sameAs.includes("https://www.facebook.com/alloutdooradventuresonline"),
    "Organization.sameAs missing Facebook URL.",
  );
  assert(
    sameAs.includes("https://www.linkedin.com/company/all-outdoor-adventures"),
    "Organization.sameAs missing LinkedIn URL.",
  );

  const pageId = `${canonical}#webpage`;
  const pageNode = getNodeById(graphNodes, pageId)[0];
  assert(pageNode, "Missing WebPage node.");
  assert(
    pageNode.url === canonical,
    "WebPage.url does not match canonical URL.",
  );

  const hasBreadcrumb = graphNodes.some((node) =>
    hasNodeType(node, "BreadcrumbList"),
  );
  assert(hasBreadcrumb, "Missing BreadcrumbList node.");
};

const routesToVerify = [
  "/destinations/states/california",
  "/destinations/states/california/cities/joshua-tree",
  "/destinations/california/joshua-tree/tours",
  "/destinations/california/joshua-tree/tours/sightseeing-tour-459544",
];

const run = async () => {
  for (const route of routesToVerify) {
    await verifyRoute(route);
  }
  console.log("[verify-seo] All checks passed.");
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
