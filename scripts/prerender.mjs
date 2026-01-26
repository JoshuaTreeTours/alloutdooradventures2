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

  return `${label} | All Outdoor Adventures`;
};

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFallbackDescription = (segments, defaultDescription) => {
  if (!segments.length) {
    return defaultDescription;
  }

  const label = segments.map(toTitleCase).join(" ");

  return `Discover ${label} tours, guides, and outdoor experiences curated by All Outdoor Adventures.`;
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

const verifyPrerenderedPage = async ({
  pathname,
  expectedUrl,
  defaultTitle,
  defaultDescription,
  label,
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
};


const main = async () => {
  const template = ensureTemplatePlaceholders(
    await readFile(templatePath, "utf8"),
  );
  const [toursGeneratedModule, flagstaffModule, seoModule] = await Promise.all([
    tsImport("../src/data/tours.generated.ts", import.meta.url),
    tsImport("../src/data/flagstaffTours.ts", import.meta.url),
    tsImport("../src/utils/seo.ts", import.meta.url),
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
  } = seoModule;

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
      seo.title = buildFallbackTitle(segments, DEFAULT_SEO.title);
      seo.description = buildFallbackDescription(
        segments,
        DEFAULT_SEO.description,
      );
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
    await writeFile(outputPath, replaceMeta(template, seo), "utf8");
  }

  const findUrl = (predicate) =>
    urls.find((url) => predicate(normalizePathname(new URL(url).pathname)));

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
      label: "Destination tour",
      url: findUrl((pathname) =>
        /^\/destinations\/[^/]+\/[^/]+\/tours\/[^/]+(\/book)?$/.test(
          normalizePathname(pathname),
        ) ||
        /^\/destinations\/states\/[^/]+\/cities\/[^/]+\/tours\/[^/]+(\/book)?$/.test(
          normalizePathname(pathname),
        ),
      ),
    },
    {
      label: "Static",
      url: findUrl(isStatic),
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

  for (const target of verificationTargets) {
    const pathname = normalizePathname(new URL(target.url).pathname);
    const expectedUrl = buildCanonicalUrl(pathname);
    const allowDefaultSeo = isHome(pathname) || isStatic(pathname);

    await verifyPrerenderedPage({
      pathname,
      expectedUrl,
      defaultTitle: DEFAULT_SEO.title,
      defaultDescription: DEFAULT_SEO.description,
      label: target.label,
      allowDefaultSeo,
    });
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
