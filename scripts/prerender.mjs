import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tsImport } from "tsx/esm/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, "../dist");
const templatePath = path.join(distDir, "index.html");

const escapeAttribute = (value) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const escapeScriptJson = (value) => value.replace(/</g, "\\u003c");

const toTitleCase = (value) =>
  value
    .split("-")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");

const buildFallbackTitle = (segments, defaultTitle) => {
  if (!segments.length) {
    return defaultTitle;
  }

  const label = segments.map(toTitleCase).join(" ");

  return `${label} | Outdoor Adventures`;
};

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFallbackDescription = (segments, defaultDescription) => {
  if (!segments.length) {
    return defaultDescription;
  }

  const label = segments.map(toTitleCase).join(" ");

  return `Discover ${label} tours, guides, and outdoor experiences curated by Outdoor Adventures.`;
};

const replaceTagAttribute = (tag, attrName, placeholder) => {
  const attributePattern = new RegExp(
    `${attrName}\\s*=\\s*["'][^"']*["']`,
    "i",
  );
  return tag.replace(attributePattern, `${attrName}="${placeholder}"`);
};

const ensureTemplatePlaceholders = (template) => {
  if (template.includes("__SEO_TITLE__") && template.includes("__SEO_CANONICAL__")) {
    return template;
  }

  let normalized = template.replace(
    /<title[^>]*>[\s\S]*?<\/title>/i,
    "<title>__SEO_TITLE__</title>",
  );

  const metaPlaceholders = [
    ["name", "description", "__SEO_DESCRIPTION__"],
    ["property", "og:title", "__SEO_OG_TITLE__"],
    ["property", "og:description", "__SEO_OG_DESCRIPTION__"],
    ["property", "og:url", "__SEO_OG_URL__"],
    ["property", "og:image", "__SEO_OG_IMAGE__"],
    ["name", "twitter:title", "__SEO_TWITTER_TITLE__"],
    ["name", "twitter:description", "__SEO_TWITTER_DESCRIPTION__"],
    ["name", "twitter:image", "__SEO_TWITTER_IMAGE__"],
  ];

  metaPlaceholders.forEach(([attrName, attrValue, placeholder]) => {
    const tagPattern = new RegExp(
      `<meta\\s+[^>]*${attrName}\\s*=\\s*["']${escapeRegExp(
        attrValue,
      )}["'][^>]*>`,
      "i",
    );
    normalized = normalized.replace(tagPattern, (tag) =>
      replaceTagAttribute(tag, "content", placeholder),
    );
  });

  const canonicalPattern = new RegExp(
    `<link\\s+[^>]*rel\\s*=\\s*["']canonical["'][^>]*>`,
    "i",
  );
  normalized = normalized.replace(canonicalPattern, (tag) =>
    replaceTagAttribute(tag, "href", "__SEO_CANONICAL__"),
  );

  return normalized;
};

const replaceMeta = (html, seo) => {
  const title = escapeAttribute(seo.title);
  const description = escapeAttribute(seo.description);
  const url = escapeAttribute(seo.url);
  const type = escapeAttribute(seo.type);
  const image = escapeAttribute(seo.image);

  return html
    .replaceAll("__SEO_TITLE__", title)
    .replaceAll("__SEO_DESCRIPTION__", description)
    .replaceAll("__SEO_CANONICAL__", url)
    .replaceAll("__SEO_OG_TITLE__", title)
    .replaceAll("__SEO_OG_DESCRIPTION__", description)
    .replaceAll("__SEO_OG_IMAGE__", image)
    .replaceAll("__SEO_OG_URL__", url)
    .replaceAll("__SEO_TWITTER_TITLE__", title)
    .replaceAll("__SEO_TWITTER_DESCRIPTION__", description)
    .replaceAll("__SEO_TWITTER_IMAGE__", image);
};

const STRUCTURED_DATA_SCRIPT_ID = "structured-data";

const replaceStructuredData = (html, structuredData) => {
  const scriptTag = structuredData
    ? `<script id="${STRUCTURED_DATA_SCRIPT_ID}" type="application/ld+json">${escapeScriptJson(
        JSON.stringify(structuredData),
      )}</script>`
    : "";
  const scriptPattern =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i;
  if (scriptPattern.test(html)) {
    return html.replace(scriptPattern, scriptTag);
  }

  if (!scriptTag) {
    return html;
  }

  return html.replace("</head>", `${scriptTag}</head>`);
};

const buildOutputPath = (pathname) => {
  if (!pathname || pathname === "/") {
    return { outputPath: templatePath, shouldWrite: true };
  }

  const normalized = pathname.replace(/^\/+|\/+$/g, "");
  const ext = path.extname(normalized);

  if (ext) {
    return {
      outputPath: path.join(distDir, normalized),
      shouldWrite: false,
    };
  }

  return {
    outputPath: path.join(distDir, normalized, "index.html"),
    shouldWrite: true,
  };
};

const ensureDirectory = async (dir) => {
  try {
    const stats = await stat(dir);
    if (!stats.isDirectory()) {
      return false;
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
    await mkdir(dir, { recursive: true });
  }
  return true;
};

const ensurePrerenderedFile = async (pathname) => {
  const { outputPath, shouldWrite } = buildOutputPath(pathname);
  if (!shouldWrite) {
    return false;
  }
  try {
    const stats = await stat(outputPath);
    return stats.isFile();
  } catch {
    return false;
  }
};

const readSitemapUrls = async () => {
  let files = [];

  try {
    const entries = await readdir(distDir);
    files = entries.filter(
      (entry) => entry.startsWith("sitemap") && entry.endsWith(".xml"),
    );
  } catch {
    return [];
  }

  const urls = new Set();
  for (const file of files) {
    const contents = await readFile(path.join(distDir, file), "utf8");
    const locPattern = /<loc>(.*?)<\/loc>/g;
    let match = locPattern.exec(contents);
    while (match) {
      urls.add(match[1]);
      match = locPattern.exec(contents);
    }
  }

  return Array.from(urls);
};

const normalizePathname = (pathname) => {
  if (!pathname) {
    return "/";
  }
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === "/") {
    return "/";
  }
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
};

const STATIC_PATHS = new Set([
  "/faqs",
  "/journeys",
  "/about",
  "/contact",
  "/tours",
  "/destinations",
  "/guides",
  "/privacy",
  "/terms",
  "/cookies",
  "/disclosure",
]);

const isHome = (pathname) => normalizePathname(pathname) === "/";

const isStatic = (pathname) =>
  STATIC_PATHS.has(normalizePathname(pathname));

const isTour = (pathname) => {
  const normalized = normalizePathname(pathname);
  return (
    /^\/tours\/[^/]+\/[^/]+\/[^/]+$/.test(normalized) ||
    /^\/tours\/[^/]+$/.test(normalized) ||
    /^\/destinations\/[^/]+\/[^/]+\/tours\/[^/]+(\/book)?$/.test(
      normalized,
    ) ||
    /^\/destinations\/states\/[^/]+\/cities\/[^/]+\/tours\/[^/]+(\/book)?$/.test(
      normalized,
    )
  );
};

const isBooking = (pathname) =>
  /\/book$/.test(normalizePathname(pathname)) &&
  (isTour(pathname) || /^\/tours\/[^/]+\/book$/.test(normalizePathname(pathname)));

const isCityToursIndex = (pathname) => {
  const normalized = normalizePathname(pathname);
  return (
    /^\/destinations\/[^/]+\/[^/]+\/tours$/.test(normalized) ||
    /^\/destinations\/states\/[^/]+\/cities\/[^/]+\/tours$/.test(normalized) ||
    /^\/destinations\/world\/[^/]+\/cities\/[^/]+\/tours$/.test(normalized) ||
    /^\/destinations\/europe\/[^/]+\/cities\/[^/]+\/tours$/.test(normalized)
  );
};

const isDestination = (pathname) => {
  const normalized = normalizePathname(pathname);
  return (
    normalized.startsWith("/destinations") &&
    !/^\/destinations\/[^/]+\/[^/]+\/tours\/[^/]+(\/book)?$/.test(normalized) &&
    !/^\/destinations\/states\/[^/]+\/cities\/[^/]+\/tours\/[^/]+(\/book)?$/.test(
      normalized,
    )
  );
};

const logVerificationFailure = ({ label, url, assertion, details }) => {
  console.error("[prerender-verify] Verification failed");
  console.error(`  label: ${label}`);
  console.error(`  url: ${url}`);
  console.error(`  assertion: ${assertion}`);
  if (details) {
    console.error(`  details: ${details}`);
  }
};

const findTag = (html, tagName, attrName, attrValue) => {
  const pattern = new RegExp(
    `<${tagName}\\s+[^>]*${attrName}\\s*=\\s*["']${escapeRegExp(
      attrValue,
    )}["'][^>]*>`,
    "i",
  );
  const match = html.match(pattern);
  if (!match) {
    return null;
  }
  return match[0];
};

const extractAttribute = (tag, attrName) => {
  if (!tag) {
    return null;
  }
  const pattern = new RegExp(`${attrName}\\s*=\\s*["']([^"']+)["']`, "i");
  const match = tag.match(pattern);
  if (!match || !match[1]) {
    return null;
  }
  return match[1];
};

const findStructuredDataScripts = (html) => {
  const pattern =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = [];
  let match;
  while ((match = pattern.exec(html)) !== null) {
    matches.push(match[1]?.trim() ?? "");
  }
  return matches.filter(Boolean);
};

const nodeHasType = (node, type) => {
  if (!node || typeof node !== "object") {
    return false;
  }
  const nodeType = node["@type"];
  if (Array.isArray(nodeType)) {
    return nodeType.includes(type);
  }
  return nodeType === type;
};

const buildTourBreadcrumbs = ({
  tour,
  detailUrl,
  stateHref,
  cityHref,
  toursHref,
  includeDestinations,
}) => {
  if (!tour) {
    return null;
  }
  if (!includeDestinations) {
    return [
      { name: "Tours", url: "/tours" },
      { name: tour.title, url: detailUrl },
    ];
  }

  const crumbs = [{ name: "Destinations", url: "/destinations" }];
  if (stateHref) {
    crumbs.push({ name: tour.destination.state, url: stateHref });
  }
  if (cityHref) {
    crumbs.push({ name: tour.destination.city, url: cityHref });
  }
  if (toursHref) {
    crumbs.push({ name: "Tours", url: toursHref });
  }
  crumbs.push({ name: tour.title, url: detailUrl });

  return crumbs;
};

const verifyPrerenderedPage = async ({
  pathname,
  expectedUrl,
  defaultTitle,
  defaultDescription,
  label,
  allowDefaultSeo = false,
  structuredDataExpectation = {},
  siteOrganizationId,
  siteWebsiteId,
}) => {
  const { outputPath, shouldWrite } = buildOutputPath(pathname);
  if (!shouldWrite) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "prerender",
      details: "No prerendered HTML output was generated.",
    });
    throw new Error("Prerender verification failed.");
  }

  const html = await readFile(outputPath, "utf8");
  const robotsTag = findTag(html, "meta", "name", "robots");
  if (!robotsTag) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "robots",
      details: "Missing <meta name=\"robots\">.",
    });
    throw new Error("Prerender verification failed.");
  }
  const robotsContent = extractAttribute(robotsTag, "content");
  if (robotsContent !== "index,follow,max-image-preview:large") {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "robots",
      details: `Unexpected robots content: ${robotsContent ?? "missing"}.`,
    });
    throw new Error("Prerender verification failed.");
  }

  const googlebotTag = findTag(html, "meta", "name", "googlebot");
  if (!googlebotTag) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "googlebot",
      details: "Missing <meta name=\"googlebot\">.",
    });
    throw new Error("Prerender verification failed.");
  }
  const googlebotContent = extractAttribute(googlebotTag, "content");
  if (googlebotContent !== "index,follow,max-image-preview:large") {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "googlebot",
      details: `Unexpected googlebot content: ${googlebotContent ?? "missing"}.`,
    });
    throw new Error("Prerender verification failed.");
  }

  const canonicalTag = findTag(html, "link", "rel", "canonical");
  if (!canonicalTag) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "canonical",
      details: "Missing <link rel=\"canonical\">.",
    });
    throw new Error("Prerender verification failed.");
  }
  const canonicalHref = extractAttribute(canonicalTag, "href");
  if (!canonicalHref) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "canonical",
      details: "Canonical tag is missing an href attribute.",
    });
    throw new Error("Prerender verification failed.");
  }
  if (canonicalHref !== expectedUrl) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "canonical",
      details: `Expected ${expectedUrl} but found ${canonicalHref}.`,
    });
    throw new Error("Prerender verification failed.");
  }

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleMatch || !titleMatch[1]) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "title",
      details: "Missing <title> tag.",
    });
    throw new Error("Prerender verification failed.");
  }
  const titleValue = titleMatch[1].trim();
  if (!allowDefaultSeo && titleValue === defaultTitle) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "title",
      details: "Using the default title.",
    });
    throw new Error("Prerender verification failed.");
  }

  const descriptionTag = findTag(html, "meta", "name", "description");
  if (!descriptionTag) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "description",
      details: "Missing <meta name=\"description\">.",
    });
    throw new Error("Prerender verification failed.");
  }
  const descriptionValue = extractAttribute(descriptionTag, "content");
  if (!descriptionValue) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "description",
      details: "Meta description is empty.",
    });
    throw new Error("Prerender verification failed.");
  }
  if (!allowDefaultSeo && descriptionValue.trim() === defaultDescription) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "description",
      details: "Using the default description.",
    });
    throw new Error("Prerender verification failed.");
  }

  const ogTitleTag = findTag(html, "meta", "property", "og:title");
  const ogTitleValue = extractAttribute(ogTitleTag, "content");
  if (!ogTitleValue) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "og:title",
      details: "Missing og:title content.",
    });
    throw new Error("Prerender verification failed.");
  }
  if (ogTitleValue.trim() !== titleValue) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "og:title",
      details: `Expected og:title to match title (${titleValue}).`,
    });
    throw new Error("Prerender verification failed.");
  }

  const ogDescriptionTag = findTag(html, "meta", "property", "og:description");
  const ogDescriptionValue = extractAttribute(ogDescriptionTag, "content");
  if (!ogDescriptionValue) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "og:description",
      details: "Missing og:description content.",
    });
    throw new Error("Prerender verification failed.");
  }
  if (ogDescriptionValue.trim() !== descriptionValue.trim()) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "og:description",
      details: "Expected og:description to match meta description.",
    });
    throw new Error("Prerender verification failed.");
  }

  const ogUrlTag = findTag(html, "meta", "property", "og:url");
  const ogUrlValue = extractAttribute(ogUrlTag, "content");
  if (!ogUrlValue) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "og:url",
      details: "Missing og:url content.",
    });
    throw new Error("Prerender verification failed.");
  }
  if (ogUrlValue !== expectedUrl) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "og:url",
      details: `Expected og:url ${expectedUrl} but found ${ogUrlValue}.`,
    });
    throw new Error("Prerender verification failed.");
  }

  const twitterTitleTag = findTag(html, "meta", "name", "twitter:title");
  const twitterTitleValue = extractAttribute(twitterTitleTag, "content");
  if (!twitterTitleValue) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "twitter:title",
      details: "Missing twitter:title content.",
    });
    throw new Error("Prerender verification failed.");
  }
  if (twitterTitleValue.trim() !== titleValue) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "twitter:title",
      details: `Expected twitter:title to match title (${titleValue}).`,
    });
    throw new Error("Prerender verification failed.");
  }

  const twitterDescriptionTag = findTag(
    html,
    "meta",
    "name",
    "twitter:description",
  );
  const twitterDescriptionValue = extractAttribute(
    twitterDescriptionTag,
    "content",
  );
  if (!twitterDescriptionValue) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "twitter:description",
      details: "Missing twitter:description content.",
    });
    throw new Error("Prerender verification failed.");
  }
  if (twitterDescriptionValue.trim() !== descriptionValue.trim()) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "twitter:description",
      details: "Expected twitter:description to match meta description.",
    });
    throw new Error("Prerender verification failed.");
  }

  const ogImageTag = findTag(html, "meta", "property", "og:image");
  const ogImageValue = extractAttribute(ogImageTag, "content");
  if (!ogImageValue) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "og:image",
      details: "Missing og:image content.",
    });
    throw new Error("Prerender verification failed.");
  }

  const twitterImageTag = findTag(html, "meta", "name", "twitter:image");
  const twitterImageValue = extractAttribute(twitterImageTag, "content");
  if (!twitterImageValue) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "twitter:image",
      details: "Missing twitter:image content.",
    });
    throw new Error("Prerender verification failed.");
  }

  if (ogImageValue !== twitterImageValue) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "image",
      details: "og:image and twitter:image do not match.",
    });
    throw new Error("Prerender verification failed.");
  }

  const structuredDataScripts = findStructuredDataScripts(html);
  if (structuredDataScripts.length !== 1) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "structured-data",
      details: `Expected exactly one JSON-LD script but found ${structuredDataScripts.length}.`,
    });
    throw new Error("Prerender verification failed.");
  }

  let structuredData;
  try {
    structuredData = JSON.parse(structuredDataScripts[0]);
  } catch (error) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "structured-data",
      details: `Invalid JSON-LD payload: ${error?.message ?? "parse error"}.`,
    });
    throw new Error("Prerender verification failed.");
  }

  const graph = structuredData?.["@graph"];
  if (!Array.isArray(graph)) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "structured-data",
      details: "JSON-LD graph is missing or malformed.",
    });
    throw new Error("Prerender verification failed.");
  }

  const organizationNodes = graph.filter((node) => nodeHasType(node, "Organization"));
  if (organizationNodes.length !== 1) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "structured-data",
      details: `Expected exactly one Organization node but found ${organizationNodes.length}.`,
    });
    throw new Error("Prerender verification failed.");
  }
  const organizationNode = organizationNodes[0];
  if (siteOrganizationId && organizationNode["@id"] !== siteOrganizationId) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "structured-data",
      details: `Organization @id mismatch (${organizationNode["@id"]}).`,
    });
    throw new Error("Prerender verification failed.");
  }
  if (organizationNode.name !== "Outdoor Adventures") {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "structured-data",
      details: `Organization name mismatch (${organizationNode.name}).`,
    });
    throw new Error("Prerender verification failed.");
  }
  const sameAs = Array.isArray(organizationNode.sameAs)
    ? organizationNode.sameAs
    : [];
  const requiredSameAs = [
    "https://www.facebook.com/alloutdooradventuresonline",
    "https://www.linkedin.com/company/all-outdoor-adventures",
  ];
  const missingSameAs = requiredSameAs.filter(
    (url) => !sameAs.includes(url),
  );
  if (missingSameAs.length || sameAs.length !== requiredSameAs.length) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "structured-data",
      details: `Organization sameAs mismatch. Missing: ${missingSameAs.join(", ") || "none"}.`,
    });
    throw new Error("Prerender verification failed.");
  }

  const websiteNodes = graph.filter((node) => nodeHasType(node, "WebSite"));
  if (websiteNodes.length !== 1) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "structured-data",
      details: `Expected exactly one WebSite node but found ${websiteNodes.length}.`,
    });
    throw new Error("Prerender verification failed.");
  }
  if (siteWebsiteId && websiteNodes[0]["@id"] !== siteWebsiteId) {
    logVerificationFailure({
      label,
      url: expectedUrl,
      assertion: "structured-data",
      details: `WebSite @id mismatch (${websiteNodes[0]["@id"]}).`,
    });
    throw new Error("Prerender verification failed.");
  }

  if (structuredDataExpectation.requireProduct) {
    const productNodes = graph.filter((node) => nodeHasType(node, "Product"));
    if (!productNodes.length) {
      logVerificationFailure({
        label,
        url: expectedUrl,
        assertion: "structured-data",
        details: "Expected Product node but none found.",
      });
      throw new Error("Prerender verification failed.");
    }
  }

  if (structuredDataExpectation.requireItemList) {
    const itemListNodes = graph.filter((node) => nodeHasType(node, "ItemList"));
    if (!itemListNodes.length) {
      logVerificationFailure({
        label,
        url: expectedUrl,
        assertion: "structured-data",
        details: "Expected ItemList node but none found.",
      });
      throw new Error("Prerender verification failed.");
    }
  }

  if (structuredDataExpectation.forbidProduct) {
    const productNodes = graph.filter((node) => nodeHasType(node, "Product"));
    if (productNodes.length) {
      logVerificationFailure({
        label,
        url: expectedUrl,
        assertion: "structured-data",
        details: "Product node found on a booking page.",
      });
      throw new Error("Prerender verification failed.");
    }
  }
};


const safeImport = async (importPath, label) => {
  try {
    return await tsImport(importPath, import.meta.url);
  } catch (error) {
    console.warn(
      `[prerender] Optional import failed${label ? ` (${label})` : ""}:`,
      error,
    );
    return null;
  }
};

const main = async () => {
  const template = ensureTemplatePlaceholders(
    await readFile(templatePath, "utf8"),
  );
  const [toursGeneratedModule, flagstaffModule, seoModule] =
    await Promise.all([
      tsImport("../src/data/tours.generated.ts", import.meta.url),
      tsImport("../src/data/flagstaffTours.ts", import.meta.url),
      tsImport("../src/utils/seo.ts", import.meta.url),
    ]);
  const [structuredDataModule, tourNarrativesModule, toursModule] =
    await Promise.all([
      safeImport("../src/utils/structuredData.ts", "structuredData"),
      safeImport("../src/data/tourNarratives.ts", "tourNarratives"),
      safeImport("../src/data/tours.ts", "tours"),
    ]);

  const tours = Array.isArray(toursGeneratedModule.toursGenerated)
    ? toursGeneratedModule.toursGenerated
    : [];
  const getTourBySlugs = (stateSlug, citySlug, tourSlug) =>
    tours.find(
      (tour) =>
        tour.destination.stateSlug === stateSlug &&
        tour.destination.citySlug === citySlug &&
        tour.slug === tourSlug,
    );
  const getTourDetailPath = (tour) =>
    `/tours/${tour.destination.stateSlug}/${tour.destination.citySlug}/${tour.slug}`;
  const getCityTourDetailPath = (tour) =>
    `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;
  const {
    getFlagstaffTourBySlug,
    getFlagstaffTourDetailPath,
  } = flagstaffModule;
  const {
    DEFAULT_SEO,
    buildMetaDescription,
    buildTourMetaDescription,
    buildCanonicalUrl,
    buildImageUrl,
    getStaticPageSeo,
  } = seoModule;
  const buildBreadcrumbList =
    structuredDataModule?.buildBreadcrumbList ?? null;
  const buildCollectionPageStructuredData =
    structuredDataModule?.buildCollectionPageStructuredData ?? null;
  const buildItemList = structuredDataModule?.buildItemList ?? null;
  const buildPlaceStructuredData =
    structuredDataModule?.buildPlaceStructuredData ?? null;
  const buildTourProductStructuredData =
    structuredDataModule?.buildTourProductStructuredData ?? null;
  const buildTourTripStructuredData =
    structuredDataModule?.buildTourTripStructuredData ?? null;
  const buildWebPageStructuredData =
    structuredDataModule?.buildWebPageStructuredData ?? null;
  const getSiteStructuredDataNodes =
    structuredDataModule?.getSiteStructuredDataNodes ?? null;
  const normalizeStructuredData =
    structuredDataModule?.normalizeStructuredData ?? null;
  const SITE_ORGANIZATION_ID =
    structuredDataModule?.SITE_ORGANIZATION_ID ?? null;
  const SITE_WEBSITE_ID = structuredDataModule?.SITE_WEBSITE_ID ?? null;
  const getExpandedTourDescription =
    tourNarrativesModule?.getExpandedTourDescription ?? null;
  const getCityTourBookingPath = toursModule?.getCityTourBookingPath ?? null;

  if (!getCityTourBookingPath) {
    throw new Error(
      "[prerender] Missing getCityTourBookingPath export from src/data/tours.ts. Booking structured data cannot be generated without it.",
    );
  }

  if (!buildWebPageStructuredData || !normalizeStructuredData || !getSiteStructuredDataNodes) {
    throw new Error(
      "[prerender] Structured data helpers are missing. Ensure buildWebPageStructuredData, normalizeStructuredData, and getSiteStructuredDataNodes are exported.",
    );
  }

  if (!SITE_ORGANIZATION_ID || !SITE_WEBSITE_ID) {
    throw new Error(
      "[prerender] Structured data identifiers are missing. Ensure SITE_ORGANIZATION_ID and SITE_WEBSITE_ID are exported.",
    );
  }

  const urls = await readSitemapUrls();
  if (!urls.length) {
    return;
  }

  for (const url of urls) {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/").filter(Boolean);
    const seo = {
      title: DEFAULT_SEO.title,
      description: DEFAULT_SEO.description,
      url: buildCanonicalUrl(pathname),
      type: DEFAULT_SEO.type,
      image: buildImageUrl(DEFAULT_SEO.image),
    };

    if (segments[0] === "tours" && segments.length === 4) {
      const tour = getTourBySlugs(segments[1], segments[2], segments[3]);
      if (tour) {
        const regionLabel =
          tour.destination.state || tour.destination.country || "";
        const destinationLabel = regionLabel
          ? `${tour.destination.city}, ${regionLabel}`
          : tour.destination.city;
        seo.title = `${tour.title} | ${destinationLabel} Outdoor Tour`;
        seo.description = buildTourMetaDescription(tour);
        seo.url = buildCanonicalUrl(getTourDetailPath(tour));
        seo.image = buildImageUrl(tour.heroImage);
      }
    } else if (segments[0] === "tours" && segments.length === 2) {
      const tour = getFlagstaffTourBySlug(segments[1]);
      if (tour) {
        seo.title = `${tour.title} | ${tour.destination.city}, ${tour.destination.state} Outdoor Tour`;
        seo.description = buildTourMetaDescription(tour);
        seo.url = buildCanonicalUrl(getFlagstaffTourDetailPath(tour));
        seo.image = buildImageUrl(tour.heroImage);
      }
    } else if (
      segments[0] === "destinations" &&
      segments[3] === "tours" &&
      segments.length === 5
    ) {
      const [stateSlug, citySlug, , tourSlug] = segments.slice(1);
      const isFlagstaff = stateSlug === "arizona" && citySlug === "flagstaff";
      const tour = isFlagstaff
        ? getFlagstaffTourBySlug(tourSlug)
        : getTourBySlugs(stateSlug, citySlug, tourSlug);
      if (tour) {
        seo.title = `${tour.title} | ${tour.destination.city}, ${tour.destination.state} Outdoor Tour`;
        seo.description = buildTourMetaDescription(tour);
        seo.url = buildCanonicalUrl(
          isFlagstaff
            ? getFlagstaffTourDetailPath(tour)
            : getCityTourDetailPath(tour),
        );
        seo.image = buildImageUrl(tour.heroImage);
      }
    } else if (
      segments[0] === "destinations" &&
      segments[1] === "states" &&
      segments[4] === "cities" &&
      segments[6] === "tours" &&
      segments.length === 8
    ) {
      const stateSlug = segments[2];
      const citySlug = segments[5];
      const tourSlug = segments[7];
      const isFlagstaff = stateSlug === "arizona" && citySlug === "flagstaff";
      const tour = isFlagstaff
        ? getFlagstaffTourBySlug(tourSlug)
        : getTourBySlugs(stateSlug, citySlug, tourSlug);
      if (tour) {
        seo.title = `${tour.title} | ${tour.destination.city}, ${tour.destination.state} Outdoor Tour`;
        seo.description = buildTourMetaDescription(tour);
        seo.url = buildCanonicalUrl(
          isFlagstaff
            ? getFlagstaffTourDetailPath(tour)
            : getCityTourDetailPath(tour),
        );
        seo.image = buildImageUrl(tour.heroImage);
      }
    } else {
      const staticSeo = getStaticPageSeo(pathname);
      if (staticSeo) {
        seo.title = staticSeo.title;
        seo.description = staticSeo.description;
        seo.url = staticSeo.url;
        seo.image = staticSeo.image;
      } else {
        seo.title = buildFallbackTitle(segments, DEFAULT_SEO.title);
        seo.description = buildFallbackDescription(
          segments,
          DEFAULT_SEO.description,
        );
      }
    }

    const canonicalUrl = seo.url;
    let structuredData = null;

    if (
      buildWebPageStructuredData &&
      getSiteStructuredDataNodes &&
      normalizeStructuredData
    ) {
      const baseStructuredDataNodes = getSiteStructuredDataNodes();
      const structuredDataNodes = [];
      let tourForStructuredData = null;
      let bookingUrl = null;
      let tourDetailUrl = null;
      let breadcrumbItems = null;
      let isBookingPage = segments[segments.length - 1] === "book";
      const canBuildTourNodes =
        Boolean(buildTourProductStructuredData) &&
        Boolean(buildTourTripStructuredData) &&
        Boolean(getExpandedTourDescription) &&
        Boolean(getCityTourBookingPath);

      if (canBuildTourNodes && segments[0] === "tours" && segments.length === 4) {
        tourForStructuredData = getTourBySlugs(
          segments[1],
          segments[2],
          segments[3],
        );
        if (tourForStructuredData) {
          bookingUrl = buildCanonicalUrl(
            getCityTourBookingPath(tourForStructuredData),
          );
          tourDetailUrl = canonicalUrl;
          breadcrumbItems = buildTourBreadcrumbs({
            tour: tourForStructuredData,
            detailUrl: canonicalUrl,
            stateHref: `/destinations/states/${segments[1]}`,
            cityHref: `/destinations/states/${segments[1]}/cities/${segments[2]}`,
            toursHref: `/destinations/${segments[1]}/${segments[2]}/tours`,
            includeDestinations: true,
          });
        }
      } else if (
        canBuildTourNodes &&
        segments[0] === "tours" &&
        segments.length === 2
      ) {
        tourForStructuredData = getFlagstaffTourBySlug(segments[1]);
        if (tourForStructuredData) {
          bookingUrl = buildCanonicalUrl(
            getFlagstaffTourBookingPath(tourForStructuredData),
          );
          tourDetailUrl = canonicalUrl;
          const stateSlug = tourForStructuredData.destination.stateSlug;
          const citySlug = tourForStructuredData.destination.citySlug;
          breadcrumbItems = buildTourBreadcrumbs({
            tour: tourForStructuredData,
            detailUrl: canonicalUrl,
            stateHref: `/destinations/states/${stateSlug}`,
            cityHref: `/destinations/states/${stateSlug}/cities/${citySlug}`,
            toursHref: `/destinations/${stateSlug}/${citySlug}/tours`,
            includeDestinations: true,
          });
        }
      } else if (
        segments[0] === "tours" &&
        segments.length === 3 &&
        segments[2] === "book"
      ) {
        isBookingPage = true;
        tourForStructuredData = getFlagstaffTourBySlug(segments[1]);
        if (tourForStructuredData) {
          bookingUrl = canonicalUrl;
          tourDetailUrl = buildCanonicalUrl(
            getFlagstaffTourDetailPath(tourForStructuredData),
          );
          const stateSlug = tourForStructuredData.destination.stateSlug;
          const citySlug = tourForStructuredData.destination.citySlug;
          breadcrumbItems = [
            ...(buildTourBreadcrumbs({
              tour: tourForStructuredData,
              detailUrl: tourDetailUrl,
              stateHref: `/destinations/states/${stateSlug}`,
              cityHref: `/destinations/states/${stateSlug}/cities/${citySlug}`,
              toursHref: `/destinations/${stateSlug}/${citySlug}/tours`,
              includeDestinations: true,
            }) ?? []),
            { name: "Book", url: bookingUrl },
          ];
        }
      } else if (
        canBuildTourNodes &&
        segments[0] === "destinations" &&
        segments[3] === "tours" &&
        (segments.length === 5 || segments.length === 6)
      ) {
        const [stateSlug, citySlug, , tourSlug] = segments.slice(1);
        const isBooking = segments[5] === "book";
        const isFlagstaff = stateSlug === "arizona" && citySlug === "flagstaff";
        tourForStructuredData = isFlagstaff
          ? getFlagstaffTourBySlug(tourSlug)
          : getTourBySlugs(stateSlug, citySlug, tourSlug);
        if (tourForStructuredData) {
          isBookingPage = isBooking;
          bookingUrl = isBooking
            ? canonicalUrl
            : buildCanonicalUrl(
                isFlagstaff
                  ? getFlagstaffTourBookingPath(tourForStructuredData)
                  : getCityTourBookingPath(tourForStructuredData),
              );
          tourDetailUrl = isBooking
            ? buildCanonicalUrl(
                isFlagstaff
                  ? getFlagstaffTourDetailPath(tourForStructuredData)
                  : getCityTourDetailPath(tourForStructuredData),
              )
            : canonicalUrl;
          breadcrumbItems = [
            ...(buildTourBreadcrumbs({
              tour: tourForStructuredData,
              detailUrl: tourDetailUrl,
              stateHref: `/destinations/states/${stateSlug}`,
              cityHref: `/destinations/states/${stateSlug}/cities/${citySlug}`,
              toursHref: `/destinations/${stateSlug}/${citySlug}/tours`,
              includeDestinations: true,
            }) ?? []),
            ...(isBooking ? [{ name: "Book", url: bookingUrl }] : []),
          ];
        }
      } else if (
        canBuildTourNodes &&
        segments[0] === "destinations" &&
        segments[1] === "states" &&
        segments[4] === "cities" &&
        segments[6] === "tours" &&
        (segments.length === 8 || segments.length === 9)
      ) {
        const stateSlug = segments[2];
        const citySlug = segments[5];
        const tourSlug = segments[7];
        const isBooking = segments[8] === "book";
        const isFlagstaff = stateSlug === "arizona" && citySlug === "flagstaff";
        tourForStructuredData = isFlagstaff
          ? getFlagstaffTourBySlug(tourSlug)
          : getTourBySlugs(stateSlug, citySlug, tourSlug);
        if (tourForStructuredData) {
          isBookingPage = isBooking;
          bookingUrl = isBooking
            ? canonicalUrl
            : buildCanonicalUrl(
                isFlagstaff
                  ? getFlagstaffTourBookingPath(tourForStructuredData)
                  : getCityTourBookingPath(tourForStructuredData),
              );
          tourDetailUrl = isBooking
            ? buildCanonicalUrl(
                isFlagstaff
                  ? getFlagstaffTourDetailPath(tourForStructuredData)
                  : getCityTourDetailPath(tourForStructuredData),
              )
            : canonicalUrl;
          breadcrumbItems = [
            ...(buildTourBreadcrumbs({
              tour: tourForStructuredData,
              detailUrl: tourDetailUrl,
              stateHref: `/destinations/states/${stateSlug}`,
              cityHref: `/destinations/states/${stateSlug}/cities/${citySlug}`,
              toursHref: `/destinations/${stateSlug}/${citySlug}/tours`,
              includeDestinations: true,
            }) ?? []),
            ...(isBooking ? [{ name: "Book", url: bookingUrl }] : []),
          ];
        }
      } else if (
        buildCollectionPageStructuredData &&
        buildItemList &&
        buildPlaceStructuredData &&
        isCityToursIndex(pathname)
      ) {
        let stateSlug = null;
        let citySlug = null;
        let toursHref = canonicalUrl;
        let baseHref = "/destinations";

        if (segments[1] === "states") {
          stateSlug = segments[2];
          citySlug = segments[5];
          baseHref = `/destinations/states/${stateSlug}`;
          toursHref = buildCanonicalUrl(
            `/destinations/states/${stateSlug}/cities/${citySlug}/tours`,
          );
        } else if (segments[1] === "world" || segments[1] === "europe") {
          stateSlug = segments[2];
          citySlug = segments[4];
          baseHref = `/destinations/${segments[1]}/${stateSlug}`;
          toursHref = buildCanonicalUrl(
            `/destinations/${segments[1]}/${stateSlug}/cities/${citySlug}/tours`,
          );
        } else {
          stateSlug = segments[1];
          citySlug = segments[2];
          baseHref = `/destinations/${stateSlug}`;
          toursHref = buildCanonicalUrl(
            `/destinations/${stateSlug}/${citySlug}/tours`,
          );
        }

        if (stateSlug && citySlug) {
          const isFlagstaff =
            stateSlug === "arizona" && citySlug === "flagstaff";
          const cityTours = isFlagstaff
            ? flagstaffModule.flagstaffTours ?? []
            : tours.filter(
                (tour) =>
                  tour.destination.stateSlug === stateSlug &&
                  tour.destination.citySlug === citySlug,
              );
          const cityName =
            cityTours[0]?.destination.city ?? toTitleCase(citySlug);
          const stateName =
            cityTours[0]?.destination.state ?? toTitleCase(stateSlug);
          const heroImage = cityTours[0]?.heroImage
            ? buildImageUrl(cityTours[0].heroImage)
            : undefined;
          const itemListLimit = 100;
          const itemListId = `${toursHref}#itemlist`;

          structuredDataNodes.push(
            buildCollectionPageStructuredData({
              url: toursHref,
              name: `Tours in ${cityName}`,
              description: `Browse guided tours and outdoor experiences in ${cityName}.`,
              image: heroImage,
              mainEntity: cityTours.length ? { "@id": itemListId } : undefined,
            }),
          );

          structuredDataNodes.push(
            buildPlaceStructuredData({
              id: `${buildCanonicalUrl(
                segments[1] === "world" || segments[1] === "europe"
                  ? `${baseHref}/cities/${citySlug}`
                  : `/destinations/states/${stateSlug}/cities/${citySlug}`,
              )}#place`,
              name: cityName,
              containedInPlace: [
                {
                  "@type": "Place",
                  name: stateName,
                },
                {
                  "@type": "Country",
                  name:
                    segments[1] === "world" || segments[1] === "europe"
                      ? stateName
                      : "United States",
                },
              ],
            }),
          );

          if (cityTours.length) {
            structuredDataNodes.push(
              buildItemList(
                cityTours.slice(0, itemListLimit).map((tour) => ({
                  name: tour.title,
                  url: buildCanonicalUrl(
                    isFlagstaff
                      ? getFlagstaffTourDetailPath(tour)
                      : getCityTourDetailPath(tour),
                  ),
                  image: tour.heroImage ? [tour.heroImage] : undefined,
                })),
                { id: itemListId },
              ),
            );
          }

          breadcrumbItems = [
            { name: "Destinations", url: "/destinations" },
            { name: stateName, url: baseHref },
            {
              name: cityName,
              url:
                segments[1] === "world" || segments[1] === "europe"
                  ? `${baseHref}/cities/${citySlug}`
                  : `/destinations/states/${stateSlug}/cities/${citySlug}`,
            },
            { name: "Tours", url: toursHref },
          ];
        }
      }

      if (tourForStructuredData && bookingUrl && canBuildTourNodes && !isBookingPage) {
        const heroImage = buildImageUrl(tourForStructuredData.heroImage);
        const productDescription =
          getExpandedTourDescription(tourForStructuredData)[0];
        structuredDataNodes.push(
          buildWebPageStructuredData({
            url: canonicalUrl,
            name: seo.title,
            description: seo.description,
            image: heroImage,
          }),
          buildTourProductStructuredData({
            tour: tourForStructuredData,
            detailUrl: tourDetailUrl ?? canonicalUrl,
            bookingUrl,
            description: productDescription,
          }),
          buildTourTripStructuredData({
            tour: tourForStructuredData,
            detailUrl: tourDetailUrl ?? canonicalUrl,
            bookingUrl,
            description: productDescription,
          }),
        );
      } else if (tourForStructuredData && isBookingPage && tourDetailUrl) {
        const heroImage = buildImageUrl(tourForStructuredData.heroImage);
        structuredDataNodes.push({
          ...buildWebPageStructuredData({
            url: canonicalUrl,
            name: seo.title,
            description: seo.description,
            image: heroImage,
          }),
          mainEntity: { "@id": `${tourDetailUrl}#product` },
        });
      } else if (!structuredDataNodes.length) {
        structuredDataNodes.push(
          buildWebPageStructuredData({
            url: canonicalUrl,
            name: seo.title,
            description: seo.description,
          }),
        );
      }

      if (breadcrumbItems?.length && buildBreadcrumbList) {
        structuredDataNodes.push(buildBreadcrumbList(breadcrumbItems));
      }

      structuredData = normalizeStructuredData({
        "@context": "https://schema.org",
        "@graph": [...baseStructuredDataNodes, ...structuredDataNodes],
      });
    }

    const { outputPath, shouldWrite } = buildOutputPath(pathname);

    if (!shouldWrite || path.basename(outputPath) !== "index.html") {
      continue;
    }

    const dir = path.dirname(outputPath);
    const canWrite = await ensureDirectory(dir);
    if (!canWrite) {
      continue;
    }
    const htmlWithMeta = replaceMeta(template, seo);
    const htmlWithStructuredData = replaceStructuredData(
      htmlWithMeta,
      structuredData,
    );
    await writeFile(outputPath, htmlWithStructuredData, "utf8");
  }

  const findUrl = (predicate) =>
    urls.find((url) => predicate(normalizePathname(new URL(url).pathname)));

  const verificationTargets = [
    {
      label: "Homepage",
      url: findUrl(isHome),
    },
    {
      label: "Tour detail",
      url: findUrl((pathname) => isTour(pathname) && !isBooking(pathname)),
      structuredDataExpectation: { requireProduct: true },
    },
    {
      label: "Tour booking",
      url: findUrl(isBooking),
      structuredDataExpectation: { forbidProduct: true },
    },
    {
      label: "City tours index",
      url: findUrl(isCityToursIndex),
      structuredDataExpectation: { requireItemList: true },
    },
    {
      label: "Destination state",
      url: findUrl((pathname) =>
        /^\/destinations\/states\/[^/]+$/.test(normalizePathname(pathname)),
      ),
    },
    {
      label: "Destination city",
      url: findUrl((pathname) =>
        /^\/destinations\/states\/[^/]+\/cities\/[^/]+$/.test(
          normalizePathname(pathname),
        ),
      ),
    },
    {
      label: "Static",
      url: findUrl(
        (pathname) =>
          normalizePathname(pathname) === "/faqs" || isStatic(pathname),
      ),
    },
  ];

  verificationTargets.forEach((target) => {
    if (!target.url) {
      logVerificationFailure({
        label: target.label,
        url: "unknown",
        assertion: "route",
        details: "No matching URL found in sitemap.",
      });
      throw new Error("Prerender verification failed.");
    }
  });

  const faqPath = "/faqs";
  const faqPrerendered = await ensurePrerenderedFile(faqPath);
  if (!faqPrerendered) {
    logVerificationFailure({
      label: "FAQ",
      url: buildCanonicalUrl(faqPath),
      assertion: "prerender",
      details: "Missing prerendered FAQ HTML output.",
    });
    throw new Error("Prerender verification failed.");
  }

  for (const target of verificationTargets) {
    const pathname = normalizePathname(new URL(target.url).pathname);
    const expectedUrl = buildCanonicalUrl(pathname);
    const allowDefaultSeo = isHome(pathname);

    await verifyPrerenderedPage({
      pathname,
      expectedUrl,
      defaultTitle: DEFAULT_SEO.title,
      defaultDescription: DEFAULT_SEO.description,
      label: target.label,
      allowDefaultSeo,
      structuredDataExpectation: target.structuredDataExpectation,
      siteOrganizationId: SITE_ORGANIZATION_ID,
      siteWebsiteId: SITE_WEBSITE_ID,
    });
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
