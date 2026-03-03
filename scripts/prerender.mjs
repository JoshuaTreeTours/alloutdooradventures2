import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tsImport } from "tsx/esm/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, "../dist");
const templatePath = path.join(distDir, "index.html");

const escapeAttribute = value =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const escapeScriptJson = value => value.replace(/</g, "\\u003c");

const stripHtmlTags = value =>
  String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const trimExcerpt = (value, maxLength = 160) => {
  const normalized = stripHtmlTags(value);
  if (!normalized) {
    return "";
  }
  if (normalized.length <= maxLength) {
    return normalized;
  }
  const trimmed = normalized.slice(0, maxLength - 1);
  const cutAt = trimmed.lastIndexOf(" ");
  return `${(cutAt > 80 ? trimmed.slice(0, cutAt) : trimmed).trim()}…`;
};

const toTitleCase = value =>
  value
    .split("-")
    .filter(Boolean)
    .map(segment => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");

const buildFallbackTitle = (segments, defaultTitle, brandName) => {
  if (!segments.length) {
    return defaultTitle;
  }

  const label = segments.map(toTitleCase).join(" ");

  return `${label} | ${brandName}`;
};

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFallbackDescription = (segments, defaultDescription, brandName) => {
  if (!segments.length) {
    return defaultDescription;
  }

  const label = segments.map(toTitleCase).join(" ");

  return `Discover ${label} tours, guides, and outdoor experiences curated by ${brandName}.`;
};

const replaceTagAttribute = (tag, attrName, placeholder) => {
  const attributePattern = new RegExp(
    `${attrName}\\s*=\\s*["'][^"']*["']`,
    "i"
  );
  return tag.replace(attributePattern, `${attrName}="${placeholder}"`);
};

const ensureTemplatePlaceholders = template => {
  if (
    template.includes("__SEO_TITLE__") &&
    template.includes("__SEO_CANONICAL__")
  ) {
    return template;
  }

  let normalized = template.replace(
    /<title[^>]*>[\s\S]*?<\/title>/i,
    "<title>__SEO_TITLE__</title>"
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
        attrValue
      )}["'][^>]*>`,
      "i"
    );
    normalized = normalized.replace(tagPattern, tag =>
      replaceTagAttribute(tag, "content", placeholder)
    );
  });

  const canonicalPattern = new RegExp(
    `<link\\s+[^>]*rel\\s*=\\s*["']canonical["'][^>]*>`,
    "i"
  );
  normalized = normalized.replace(canonicalPattern, tag =>
    replaceTagAttribute(tag, "href", "__SEO_CANONICAL__")
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
        JSON.stringify(structuredData)
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

const buildOutputPath = pathname => {
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

const ensureDirectory = async dir => {
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

const ensurePrerenderedFile = async pathname => {
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
      entry => entry.startsWith("sitemap") && entry.endsWith(".xml")
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

const normalizePathname = pathname => {
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

const isHome = pathname => normalizePathname(pathname) === "/";

const isStatic = pathname => STATIC_PATHS.has(normalizePathname(pathname));

const isTour = pathname => {
  const normalized = normalizePathname(pathname);
  return (
    /^\/tours\/[^/]+\/[^/]+\/[^/]+$/.test(normalized) ||
    /^\/tours\/[^/]+$/.test(normalized) ||
    /^\/destinations\/[^/]+\/[^/]+\/tours\/[^/]+(\/book)?$/.test(normalized) ||
    /^\/destinations\/states\/[^/]+\/cities\/[^/]+\/tours\/[^/]+(\/book)?$/.test(
      normalized
    )
  );
};

const isDestination = pathname => {
  const normalized = normalizePathname(pathname);
  return (
    normalized.startsWith("/destinations") &&
    !/^\/destinations\/[^/]+\/[^/]+\/tours\/[^/]+(\/book)?$/.test(normalized) &&
    !/^\/destinations\/states\/[^/]+\/cities\/[^/]+\/tours\/[^/]+(\/book)?$/.test(
      normalized
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
      attrValue
    )}["'][^>]*>`,
    "i"
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

const buildTourBreadcrumbs = ({
  tour,
  detailUrl,
  countryHref,
  countryName,
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
  if (countryHref) {
    crumbs.push({ name: countryName || "United States", url: countryHref });
  }
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
  expectedRobots = "index,follow,max-image-preview:large",
  allowDefaultSeo = false,
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
      details: 'Missing <meta name="robots">.',
    });
    throw new Error("Prerender verification failed.");
  }
  const robotsContent = extractAttribute(robotsTag, "content");
  if (robotsContent !== expectedRobots) {
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
      details: 'Missing <meta name="googlebot">.',
    });
    throw new Error("Prerender verification failed.");
  }
  const googlebotContent = extractAttribute(googlebotTag, "content");
  if (googlebotContent !== expectedRobots) {
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
      details: 'Missing <link rel="canonical">.',
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
      details: 'Missing <meta name="description">.',
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
    "twitter:description"
  );
  const twitterDescriptionValue = extractAttribute(
    twitterDescriptionTag,
    "content"
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
};

const safeImport = async (importPath, label) => {
  try {
    return await tsImport(importPath, import.meta.url);
  } catch (error) {
    console.warn(
      `[prerender] Optional import failed${label ? ` (${label})` : ""}:`,
      error
    );
    return null;
  }
};

const main = async () => {
  const template = ensureTemplatePlaceholders(
    await readFile(templatePath, "utf8")
  );
  const [
    toursGeneratedModule,
    flagstaffModule,
    seoModule,
    siteModule,
    heroModule,
    destinationsModule,
    tourDescriptionModule,
  ] = await Promise.all([
    tsImport("../src/data/tours.generated.ts", import.meta.url),
    tsImport("../src/data/flagstaffTours.ts", import.meta.url),
    tsImport("../src/utils/seo.ts", import.meta.url),
    tsImport("../src/utils/site.ts", import.meta.url),
    tsImport("../src/utils/hero.ts", import.meta.url),
    tsImport("../src/data/destinations.ts", import.meta.url),
    tsImport("../src/utils/tourDescription.ts", import.meta.url),
  ]);
  const [
    structuredDataModule,
    tourPathsModule,
    guideImagesModule,
    engine2DataModule,
    engine2SeoModule,
    engine2SchemaModule,
    engine3RoutingModule,
    viatorProductCacheModule,
  ] = await Promise.all([
    safeImport("../src/utils/structuredData.ts", "structuredData"),
    safeImport("../src/data/tourPaths.ts", "tourPaths"),
    safeImport("../src/data/guideImages.ts", "guideImages"),
    safeImport("../src/engine2/data/loadEngine2.ts", "engine2Data"),
    safeImport("../src/engine2/seo/buildEngine2Seo.ts", "engine2Seo"),
    safeImport("../src/engine2/schema/buildSchemaGraph.ts", "engine2Schema"),
    safeImport("../src/engine3/routing.ts", "engine3Routing"),
    safeImport(
      "../src/engine3/data/viatorProductCache.ts",
      "viatorProductCache"
    ),
  ]);

  const tours = Array.isArray(toursGeneratedModule.toursGenerated)
    ? toursGeneratedModule.toursGenerated
    : [];
  const getTourBySlugs = (stateSlug, citySlug, tourSlug) =>
    tours.find(
      tour =>
        tour.destination.stateSlug === stateSlug &&
        tour.destination.citySlug === citySlug &&
        tour.slug === tourSlug
    );
  const getTourDetailPath = tour =>
    `/tours/${tour.destination.stateSlug}/${tour.destination.citySlug}/${tour.slug}`;
  const getCityTourDetailPath = tour =>
    `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;

  const { getFlagstaffTourBySlug, getFlagstaffTourDetailPath } =
    flagstaffModule;
  const {
    DEFAULT_SEO,
    buildMetaDescription,
    buildTourMetaDescription,
    buildCanonicalUrl,
    buildImageUrl,
    getStaticPageSeo,
  } = seoModule;
  const siteBrandName = siteModule?.SITE_BRAND_NAME ?? "Outdoor Adventures";
  const resolveHeroImageForRoute = heroModule?.resolveHeroImageForRoute ?? null;
  const getStateBySlug = destinationsModule?.getStateBySlug ?? null;
  const getCityBySlugs = destinationsModule?.getCityBySlugs ?? null;
  const normalizeDescriptionForDedupe =
    tourDescriptionModule?.normalizeDescriptionForDedupe ??
    (value =>
      String(value ?? "")
        .trim()
        .toLowerCase());
  const extractTourBaseDescription =
    tourDescriptionModule?.extractTourBaseDescription ??
    (tour =>
      tour.shortDescription ??
      tour.badges?.tagline ??
      tour.longDescription ??
      "");
  const buildBreadcrumbList = structuredDataModule?.buildBreadcrumbList ?? null;
  const buildTourProductStructuredData =
    structuredDataModule?.buildTourProductStructuredData ?? null;
  const buildTourTripStructuredData =
    structuredDataModule?.buildTourTripStructuredData ?? null;
  const buildReserveActionStructuredData =
    structuredDataModule?.buildReserveActionStructuredData ?? null;
  const buildWebPageStructuredData =
    structuredDataModule?.buildWebPageStructuredData ?? null;
  const getSiteStructuredDataNodes =
    structuredDataModule?.getSiteStructuredDataNodes ?? null;
  const normalizeStructuredData =
    structuredDataModule?.normalizeStructuredData ?? null;
  const getMissingGeoFallbackReport =
    structuredDataModule?.getMissingGeoFallbackReport ?? null;
  const resetMissingGeoFallbackReport =
    structuredDataModule?.resetMissingGeoFallbackReport ?? null;
  const getTourBookingPath = tourPathsModule?.getTourBookingPath ?? null;
  const getGuideImages = guideImagesModule?.getGuideImages ?? null;
  const getEngine2TourByPath = engine2DataModule?.getEngine2TourByPath ?? null;
  const buildEngine2Seo = engine2SeoModule?.buildEngine2Seo ?? null;
  const buildEngine2SchemaGraph = engine2SchemaModule?.buildSchemaGraph ?? null;
  const getEngine3TourBySlugs =
    engine3RoutingModule?.getEngine3TourBySlugs ?? null;
  const viatorProductCacheByCode =
    viatorProductCacheModule?.viatorProductCacheByCode ?? null;

  resetMissingGeoFallbackReport?.();

  const writeSchemaMissingGeoReport = async () => {
    const schemaMissingGeoReport = getMissingGeoFallbackReport
      ? getMissingGeoFallbackReport()
      : [];
    const reportPath = path.resolve(
      __dirname,
      "../reports/schema-country-fallbacks.json"
    );
    await mkdir(path.dirname(reportPath), { recursive: true });
    await writeFile(
      reportPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          total: schemaMissingGeoReport.length,
          items: schemaMissingGeoReport,
        },
        null,
        2
      ),
      "utf8"
    );
  };

  const urls = await readSitemapUrls();
  if (!urls.length) {
    await writeSchemaMissingGeoReport();
    return;
  }

  const tourDescriptionCounts = new Map();
  for (const url of urls) {
    const pathname = normalizePathname(new URL(url).pathname);
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] !== "tours" || segments.length !== 4) {
      continue;
    }

    const tour = getTourBySlugs(segments[1], segments[2], segments[3]);
    if (!tour) {
      continue;
    }

    const key = normalizeDescriptionForDedupe(extractTourBaseDescription(tour));
    if (!key) {
      continue;
    }

    tourDescriptionCounts.set(key, (tourDescriptionCounts.get(key) ?? 0) + 1);
  }

  const isTourDescriptionDuplicate = tour => {
    const key = normalizeDescriptionForDedupe(extractTourBaseDescription(tour));
    return key ? (tourDescriptionCounts.get(key) ?? 0) > 1 : false;
  };

  const routeFailures = [];

  for (const url of urls) {
    const pathname = new URL(url).pathname;
    try {
      const normalizedPathname = normalizePathname(pathname);
      const isBookingRoute = normalizedPathname.endsWith("/book");
      const basePathname = isBookingRoute
        ? normalizedPathname.replace(/\/book$/, "")
        : normalizedPathname;
      const segments = basePathname.split("/").filter(Boolean);
      const seo = {
        title: DEFAULT_SEO.title,
        description: DEFAULT_SEO.description,
        url: buildCanonicalUrl(normalizedPathname),
        type: DEFAULT_SEO.type,
        image: buildImageUrl(DEFAULT_SEO.image),
      };
      const engine2Tour = getEngine2TourByPath
        ? getEngine2TourByPath(basePathname)
        : null;
      const engine2Seo =
        engine2Tour && buildEngine2Seo ? buildEngine2Seo(engine2Tour) : null;

      let tourForSeo = null;
      let engine3TourForSeo = null;
      let stateForHero = null;
      let cityForHero = null;
      let guideForHero = null;
      let cityToursForHero = null;

      if (segments[0] === "tours" && segments.length === 4) {
        tourForSeo =
          getTourBySlugs(segments[1], segments[2], segments[3]) ?? null;
      } else if (segments[0] === "tours" && segments.length === 2) {
        tourForSeo = getFlagstaffTourBySlug(segments[1]) ?? null;
      } else if (
        segments[0] === "destinations" &&
        segments[3] === "tours" &&
        segments.length === 5
      ) {
        const [stateSlug, citySlug, , tourSlug] = segments.slice(1);
        const isFlagstaff = stateSlug === "arizona" && citySlug === "flagstaff";
        tourForSeo =
          (isFlagstaff
            ? getFlagstaffTourBySlug(tourSlug)
            : getTourBySlugs(stateSlug, citySlug, tourSlug)) ?? null;
        if (!tourForSeo && getEngine3TourBySlugs) {
          engine3TourForSeo = getEngine3TourBySlugs(
            stateSlug,
            citySlug,
            tourSlug
          );
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
        tourForSeo =
          (isFlagstaff
            ? getFlagstaffTourBySlug(tourSlug)
            : getTourBySlugs(stateSlug, citySlug, tourSlug)) ?? null;
      }

      if (engine2Seo) {
        seo.title = isBookingRoute
          ? `${engine2Seo.title} | Book`
          : engine2Seo.title;
        seo.description = isBookingRoute
          ? `Book ${engine2Tour.name} in ${engine2Tour.geo.city}, ${engine2Tour.geo.region}.`
          : engine2Seo.description;
        seo.url = isBookingRoute
          ? buildCanonicalUrl(normalizedPathname)
          : engine2Seo.canonical;
        seo.image = engine2Seo.og.image;
      } else if (engine3TourForSeo?.bookingProvider === "viator") {
        const productCode = engine3TourForSeo.id;
        const productData =
          productCode && viatorProductCacheByCode
            ? viatorProductCacheByCode[productCode]
            : null;
        const fallbackTitle =
          stripHtmlTags(engine3TourForSeo.seo?.title) ||
          stripHtmlTags(engine3TourForSeo.name) ||
          "Tour";
        const title = stripHtmlTags(productData?.title) || fallbackTitle;
        const fallbackDescription =
          stripHtmlTags(engine3TourForSeo.seo?.description) ||
          stripHtmlTags(engine3TourForSeo.content?.experienceText);
        const overviewExcerpt = trimExcerpt(
          productData?.description || fallbackDescription
        );

        seo.title = title;
        seo.description =
          stripHtmlTags(productData?.description) ||
          fallbackDescription ||
          `${title}. ${overviewExcerpt}`.trim();
        seo.url = buildCanonicalUrl(
          engine3TourForSeo.seo?.canonicalPath ?? basePathname
        );
        seo.image = buildImageUrl(
          productData?.supplierImage ||
            engine3TourForSeo.seo?.ogImage ||
            engine3TourForSeo.images?.hero
        );
      } else if (tourForSeo) {
        const regionLabel =
          tourForSeo.destination.state || tourForSeo.destination.country || "";
        const destinationLabel = regionLabel
          ? `${tourForSeo.destination.city}, ${regionLabel}`
          : tourForSeo.destination.city;
        if (isBookingRoute) {
          seo.title = `${tourForSeo.title} Booking | ${siteBrandName}`;
          seo.description = buildMetaDescription(
            `Reserve ${tourForSeo.title} in ${destinationLabel}.`,
            tourForSeo.shortDescription ??
              tourForSeo.badges?.tagline ??
              tourForSeo.longDescription
          );
          seo.url = buildCanonicalUrl(normalizedPathname);
        } else {
          seo.title = `${tourForSeo.title} | ${destinationLabel} Outdoor Tour`;
          seo.description = buildTourMetaDescription(tourForSeo, {
            isDuplicate: isTourDescriptionDuplicate(tourForSeo),
            diagnosticsLabel: `prerender:${tourForSeo.id}`,
          });
          seo.url = buildCanonicalUrl(basePathname);
        }
      } else {
        const staticSeo = getStaticPageSeo(pathname);
        if (staticSeo) {
          seo.title = staticSeo.title;
          seo.description = staticSeo.description;
          seo.url = staticSeo.url;
          seo.image = staticSeo.image;
        } else {
          seo.title = buildFallbackTitle(
            segments,
            DEFAULT_SEO.title,
            siteBrandName
          );
          seo.description = buildFallbackDescription(
            segments,
            DEFAULT_SEO.description,
            siteBrandName
          );
        }
      }

      if (segments[0] === "guides" && segments.length >= 3) {
        const guideScope = segments[1];
        if (guideScope === "us") {
          const stateSlug = segments[2];
          stateForHero = getStateBySlug ? getStateBySlug(stateSlug) : null;
          if (segments.length === 4) {
            const citySlug = segments[3];
            cityForHero = getCityBySlugs
              ? getCityBySlugs(stateSlug, citySlug)
              : null;
            guideForHero = getGuideImages
              ? {
                  type: "city",
                  guideImages: getGuideImages(citySlug, stateSlug),
                }
              : { type: "city" };
          } else {
            guideForHero = { type: "state" };
          }
        } else if (guideScope === "world") {
          const countrySlug = segments[2];
          if (segments.length === 4) {
            const citySlug = segments[3];
            guideForHero = getGuideImages
              ? {
                  type: "city",
                  guideImages: getGuideImages(citySlug, undefined, countrySlug),
                }
              : { type: "city" };
          } else {
            guideForHero = { type: "country" };
          }
        }
      }

      if (segments[0] === "destinations" && !tourForSeo) {
        if (segments[1] === "states" && segments[2]) {
          stateForHero = getStateBySlug ? getStateBySlug(segments[2]) : null;
          if (segments[3] === "cities" && segments[4]) {
            cityForHero = getCityBySlugs
              ? getCityBySlugs(segments[2], segments[4])
              : null;
          }
        } else if (
          segments[1] &&
          segments[1] !== "world" &&
          segments[1] !== "europe"
        ) {
          stateForHero = getStateBySlug ? getStateBySlug(segments[1]) : null;
          if (segments[2] && segments[2] !== "tours") {
            cityForHero = getCityBySlugs
              ? getCityBySlugs(segments[1], segments[2])
              : null;
          }
        }
      }

      if (cityForHero?.slug && stateForHero?.slug) {
        cityToursForHero = tours.filter(
          tour =>
            tour.destination.stateSlug === stateForHero.slug &&
            tour.destination.citySlug === cityForHero.slug
        );
      }

      const resolvedHeroImage = resolveHeroImageForRoute
        ? resolveHeroImageForRoute({
            route: normalizedPathname,
            tour: tourForSeo,
            guide: guideForHero,
            state: stateForHero,
            city: cityForHero,
            cityTours: cityToursForHero ?? undefined,
          })
        : null;

      if (resolvedHeroImage && !engine2Seo) {
        seo.image = resolvedHeroImage;
      }

      const canonicalUrl = seo.url;
      let structuredData = null;

      if (
        engine2Tour &&
        engine2Seo &&
        buildEngine2SchemaGraph &&
        normalizeStructuredData
      ) {
        const engine2Nodes = buildEngine2SchemaGraph(engine2Tour, engine2Seo);
        structuredData = normalizeStructuredData({
          "@context": "https://schema.org",
          "@graph": Array.isArray(engine2Nodes) ? engine2Nodes : [],
        });
      } else if (
        buildWebPageStructuredData &&
        getSiteStructuredDataNodes &&
        normalizeStructuredData
      ) {
        const baseStructuredDataNodes = getSiteStructuredDataNodes();
        const structuredDataNodes = [];
        let tourForStructuredData = null;
        let bookingUrl = null;
        let breadcrumbItems = null;
        const canBuildTourNodes =
          Boolean(buildTourProductStructuredData) &&
          Boolean(buildTourTripStructuredData) &&
          Boolean(getTourBookingPath);
        const canBuildBookingNodes = Boolean(buildReserveActionStructuredData);

        if (
          !isBookingRoute &&
          canBuildTourNodes &&
          segments[0] === "tours" &&
          segments.length === 4
        ) {
          tourForStructuredData = getTourBySlugs(
            segments[1],
            segments[2],
            segments[3]
          );
          if (tourForStructuredData) {
            bookingUrl = buildCanonicalUrl(
              getTourBookingPath(tourForStructuredData)
            );
            breadcrumbItems = buildTourBreadcrumbs({
              tour: tourForStructuredData,
              detailUrl: canonicalUrl,
              includeDestinations: false,
            });
          }
        } else if (
          !isBookingRoute &&
          canBuildTourNodes &&
          segments[0] === "tours" &&
          segments.length === 2
        ) {
          tourForStructuredData = getFlagstaffTourBySlug(segments[1]);
          if (tourForStructuredData) {
            bookingUrl = buildCanonicalUrl(
              getTourBookingPath(tourForStructuredData)
            );
            const stateSlug = tourForStructuredData.destination.stateSlug;
            const citySlug = tourForStructuredData.destination.citySlug;
            breadcrumbItems = buildTourBreadcrumbs({
              tour: tourForStructuredData,
              detailUrl: canonicalUrl,
              countryHref: "/destinations/united-states",
              countryName: "United States",
              stateHref: `/destinations/united-states/${stateSlug}`,
              cityHref: `/destinations/united-states/${stateSlug}/${citySlug}`,
              toursHref: `/destinations/united-states/${stateSlug}/${citySlug}/tours`,
              includeDestinations: true,
            });
          }
        } else if (
          !isBookingRoute &&
          canBuildTourNodes &&
          segments[0] === "destinations" &&
          segments[3] === "tours" &&
          segments.length === 5
        ) {
          const [stateSlug, citySlug, , tourSlug] = segments.slice(1);
          const isFlagstaff =
            stateSlug === "arizona" && citySlug === "flagstaff";
          tourForStructuredData = isFlagstaff
            ? getFlagstaffTourBySlug(tourSlug)
            : getTourBySlugs(stateSlug, citySlug, tourSlug);
          if (tourForStructuredData) {
            bookingUrl = buildCanonicalUrl(
              getTourBookingPath(tourForStructuredData)
            );
            breadcrumbItems = buildTourBreadcrumbs({
              tour: tourForStructuredData,
              detailUrl: canonicalUrl,
              countryHref: "/destinations/united-states",
              countryName: "United States",
              stateHref: `/destinations/united-states/${stateSlug}`,
              cityHref: `/destinations/united-states/${stateSlug}/${citySlug}`,
              toursHref: `/destinations/united-states/${stateSlug}/${citySlug}/tours`,
              includeDestinations: true,
            });
          }
        } else if (
          !isBookingRoute &&
          canBuildTourNodes &&
          segments[0] === "destinations" &&
          segments[1] === "states" &&
          segments[4] === "cities" &&
          segments[6] === "tours" &&
          segments.length === 8
        ) {
          const stateSlug = segments[2];
          const citySlug = segments[5];
          const tourSlug = segments[7];
          const isFlagstaff =
            stateSlug === "arizona" && citySlug === "flagstaff";
          tourForStructuredData = isFlagstaff
            ? getFlagstaffTourBySlug(tourSlug)
            : getTourBySlugs(stateSlug, citySlug, tourSlug);
          if (tourForStructuredData) {
            bookingUrl = buildCanonicalUrl(
              getTourBookingPath(tourForStructuredData)
            );
            breadcrumbItems = buildTourBreadcrumbs({
              tour: tourForStructuredData,
              detailUrl: canonicalUrl,
              countryHref: "/destinations/united-states",
              countryName: "United States",
              stateHref: `/destinations/united-states/${stateSlug}`,
              cityHref: `/destinations/united-states/${stateSlug}/${citySlug}`,
              toursHref: `/destinations/united-states/${stateSlug}/${citySlug}/tours`,
              includeDestinations: true,
            });
          }
        }

        if (isBookingRoute && tourForSeo && canBuildBookingNodes) {
          const bookingCanonicalUrl = buildCanonicalUrl(normalizedPathname);
          const detailCanonicalUrl = buildCanonicalUrl(basePathname);
          structuredDataNodes.push(
            buildWebPageStructuredData({
              url: bookingCanonicalUrl,
              name: seo.title,
              description: seo.description,
              image: resolvedHeroImage ?? undefined,
            }),
            buildReserveActionStructuredData({
              bookingUrl: bookingCanonicalUrl,
              tourDetailUrl: detailCanonicalUrl,
              tourName: tourForSeo.title,
            })
          );
        } else if (tourForStructuredData && bookingUrl && canBuildTourNodes) {
          const heroImage =
            resolvedHeroImage ?? buildImageUrl(tourForStructuredData.heroImage);
          const structuredImages = [
            heroImage,
            ...(tourForStructuredData.galleryImages ?? []),
          ].filter(Boolean);
          structuredDataNodes.push(
            buildWebPageStructuredData({
              url: canonicalUrl,
              name: seo.title,
              description: seo.description,
              image: heroImage,
            }),
            buildTourProductStructuredData({
              tour: tourForStructuredData,
              detailUrl: canonicalUrl,
              bookingUrl,
              description: seo.description,
              images: structuredImages.length ? structuredImages : undefined,
            }),
            buildTourTripStructuredData({
              tour: tourForStructuredData,
              detailUrl: canonicalUrl,
              bookingUrl,
              description: seo.description,
              images: structuredImages.length ? structuredImages : undefined,
            })
          );
          if (breadcrumbItems?.length && buildBreadcrumbList) {
            structuredDataNodes.push(buildBreadcrumbList(breadcrumbItems));
          }
        } else {
          structuredDataNodes.push(
            buildWebPageStructuredData({
              url: canonicalUrl,
              name: seo.title,
              description: seo.description,
            })
          );
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
        structuredData
      );
      await writeFile(outputPath, htmlWithStructuredData, "utf8");
    } catch (error) {
      routeFailures.push({
        route: pathname,
        error,
      });
      console.error(`[prerender] Route failed: ${pathname}`);
      if (error?.stack) {
        console.error(error.stack);
      } else {
        console.error(error);
      }
    }
  }

  const findUrl = predicate =>
    urls.find(url => predicate(normalizePathname(new URL(url).pathname)));

  const verificationTargets = [
    {
      label: "Homepage",
      url: findUrl(isHome),
    },
    {
      label: "Tour",
      url: findUrl(isTour),
    },
    {
      label: "Destination state",
      url: findUrl(pathname =>
        /^\/destinations\/states\/[^/]+$/.test(normalizePathname(pathname))
      ),
    },
    {
      label: "Destination city",
      url: findUrl(pathname =>
        /^\/destinations\/states\/[^/]+\/cities\/[^/]+$/.test(
          normalizePathname(pathname)
        )
      ),
    },
    {
      label: "Destination tour detail",
      url: findUrl(
        pathname =>
          /^\/destinations\/[^/]+\/[^/]+\/tours\/[^/]+$/.test(
            normalizePathname(pathname)
          ) ||
          /^\/destinations\/states\/[^/]+\/cities\/[^/]+\/tours\/[^/]+$/.test(
            normalizePathname(pathname)
          )
      ),
    },
    {
      label: "Destination tour booking",
      url: findUrl(
        pathname =>
          /^\/destinations\/[^/]+\/[^/]+\/tours\/[^/]+\/book$/.test(
            normalizePathname(pathname)
          ) ||
          /^\/destinations\/states\/[^/]+\/cities\/[^/]+\/tours\/[^/]+\/book$/.test(
            normalizePathname(pathname)
          )
      ),
      expectedRobots: "noindex,follow,max-image-preview:large",
    },
    {
      label: "Static",
      url: findUrl(
        pathname =>
          normalizePathname(pathname) === "/faqs" || isStatic(pathname)
      ),
    },
  ];

  verificationTargets.forEach(target => {
    if (!target.url) {
      logVerificationFailure({
        label: target.label,
        url: "unknown",
        assertion: "route",
        details: "No matching URL found in sitemap.",
      });
      routeFailures.push({
        route: `[verification-target:${target.label}]`,
        error: new Error("No matching URL found in sitemap."),
      });
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
    routeFailures.push({
      route: faqPath,
      error: new Error("Missing prerendered FAQ HTML output."),
    });
  }

  await writeSchemaMissingGeoReport();

  for (const target of verificationTargets) {
    if (!target.url) {
      continue;
    }
    const pathname = normalizePathname(new URL(target.url).pathname);
    const expectedUrl = buildCanonicalUrl(pathname);
    const allowDefaultSeo = isHome(pathname);

    try {
      await verifyPrerenderedPage({
        pathname,
        expectedUrl,
        defaultTitle: DEFAULT_SEO.title,
        defaultDescription: DEFAULT_SEO.description,
        label: target.label,
        expectedRobots: target.expectedRobots,
        allowDefaultSeo,
      });
    } catch (error) {
      routeFailures.push({
        route: pathname,
        error,
      });
      console.error(`[prerender] Verification failed for route: ${pathname}`);
      if (error?.stack) {
        console.error(error.stack);
      } else {
        console.error(error);
      }
    }
  }

  if (routeFailures.length) {
    const summary = routeFailures
      .map(
        ({ route, error }, index) =>
          `${index + 1}. ${route} :: ${error?.message ?? String(error)}`
      )
      .join("\n");
    throw new Error(
      `[prerender] Completed with ${routeFailures.length} failure(s):\n${summary}`,
      {
        cause: routeFailures[0]?.error,
      }
    );
  }
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
