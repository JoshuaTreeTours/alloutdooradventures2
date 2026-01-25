import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
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

const buildFallbackDescription = (segments, defaultDescription) => {
  if (!segments.length) {
    return defaultDescription;
  }

  const label = segments.map(toTitleCase).join(" ");

  return `Discover ${label} tours, guides, and outdoor experiences curated by All Outdoor Adventures.`;
};

const replaceMeta = (html, seo) => {
  const title = escapeAttribute(seo.title);
  const description = escapeAttribute(seo.description);
  const url = escapeAttribute(seo.url);
  const type = escapeAttribute(seo.type);

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${description}" />`,
    )
    .replace(
      /<meta property="og:title" content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${title}" />`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${description}" />`,
    )
    .replace(
      /<meta property="og:type" content="[^"]*"\s*\/?>/,
      `<meta property="og:type" content="${type}" />`,
    )
    .replace(
      /<meta property="og:url" content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${url}" />`,
    )
    .replace(
      /<link rel="canonical" href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${url}" />`,
    );
};

const buildOutputPath = (pathname) => {
  if (!pathname || pathname === "/") {
    return templatePath;
  }

  const normalized = pathname.replace(/^\/+|\/+$/g, "");
  return path.join(distDir, normalized, "index.html");
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
  const locPattern = /<loc>(.*?)<\/loc>/g;

  for (const file of files) {
    const contents = await readFile(path.join(distDir, file), "utf8");
    let match = locPattern.exec(contents);
    while (match) {
      urls.add(match[1]);
      match = locPattern.exec(contents);
    }
  }

  return Array.from(urls);
};

const main = async () => {
  const template = await readFile(templatePath, "utf8");
  const [
    toursModule,
    flagstaffModule,
    destinationsModule,
    fallbackModule,
    seoModule,
  ] = await Promise.all([
    tsImport("../src/data/tours.ts", import.meta.url),
    tsImport("../src/data/flagstaffTours.ts", import.meta.url),
    tsImport("../src/data/destinations.ts", import.meta.url),
    tsImport("../src/data/tourFallbacks.ts", import.meta.url),
    tsImport("../src/utils/seo.ts", import.meta.url),
  ]);

  const {
    getTourBySlugs,
    getTourDetailPath,
    getCityTourDetailPath,
  } = toursModule;
  const {
    getFlagstaffTourBySlug,
    getFlagstaffTourDetailPath,
  } = flagstaffModule;
  const { getCityBySlugs, getStateBySlug } = destinationsModule;
  const { getFallbackCityBySlugs, getFallbackStateBySlug } = fallbackModule;
  const {
    DEFAULT_SEO,
    buildMetaDescription,
    buildCanonicalUrl,
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
        seo.description = buildMetaDescription(
          tour.shortDescription ?? tour.badges.tagline ?? tour.longDescription,
          `Book ${tour.title} in ${destinationLabel} with curated outdoor tours and trusted local guides.`,
        );
        seo.url = buildCanonicalUrl(getTourDetailPath(tour));
      }
    } else if (segments[0] === "tours" && segments.length === 2) {
      const tour = getFlagstaffTourBySlug(segments[1]);
      if (tour) {
        const state =
          getStateBySlug("arizona") ?? getFallbackStateBySlug("arizona");
        const city =
          getCityBySlugs("arizona", "flagstaff") ??
          getFallbackCityBySlugs("arizona", "flagstaff");
        if (state && city) {
          seo.title = `${tour.title} | ${city.name}, ${state.name} Outdoor Tour`;
          seo.description = buildMetaDescription(
            tour.shortDescription ?? tour.badges.tagline ?? tour.longDescription,
            `Book ${tour.title} in ${city.name}, ${state.name} with trusted guides and curated outdoor experiences.`,
          );
          seo.url = buildCanonicalUrl(getFlagstaffTourDetailPath(tour));
        }
      }
    } else if (
      segments[0] === "destinations" &&
      segments[3] === "tours" &&
      segments.length === 5
    ) {
      const [stateSlug, citySlug, , tourSlug] = segments.slice(1);
      const state =
        getStateBySlug(stateSlug) ?? getFallbackStateBySlug(stateSlug);
      const city =
        getCityBySlugs(stateSlug, citySlug) ??
        getFallbackCityBySlugs(stateSlug, citySlug);
      const isFlagstaff = stateSlug === "arizona" && citySlug === "flagstaff";
      const tour = isFlagstaff
        ? getFlagstaffTourBySlug(tourSlug)
        : getTourBySlugs(stateSlug, citySlug, tourSlug);
      if (state && city && tour) {
        seo.title = `${tour.title} | ${city.name}, ${state.name} Outdoor Tour`;
        seo.description = buildMetaDescription(
          tour.shortDescription ?? tour.badges.tagline ?? tour.longDescription,
          `Book ${tour.title} in ${city.name}, ${state.name} with trusted guides and curated outdoor experiences.`,
        );
        seo.url = buildCanonicalUrl(
          isFlagstaff
            ? getFlagstaffTourDetailPath(tour)
            : getCityTourDetailPath(tour),
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
      const state =
        getStateBySlug(stateSlug) ?? getFallbackStateBySlug(stateSlug);
      const city =
        getCityBySlugs(stateSlug, citySlug) ??
        getFallbackCityBySlugs(stateSlug, citySlug);
      const isFlagstaff = stateSlug === "arizona" && citySlug === "flagstaff";
      const tour = isFlagstaff
        ? getFlagstaffTourBySlug(tourSlug)
        : getTourBySlugs(stateSlug, citySlug, tourSlug);
      if (state && city && tour) {
        seo.title = `${tour.title} | ${city.name}, ${state.name} Outdoor Tour`;
        seo.description = buildMetaDescription(
          tour.shortDescription ?? tour.badges.tagline ?? tour.longDescription,
          `Book ${tour.title} in ${city.name}, ${state.name} with trusted guides and curated outdoor experiences.`,
        );
        seo.url = buildCanonicalUrl(
          isFlagstaff
            ? getFlagstaffTourDetailPath(tour)
            : getCityTourDetailPath(tour),
        );
      }
    } else {
      seo.title = buildFallbackTitle(segments, DEFAULT_SEO.title);
      seo.description = buildFallbackDescription(
        segments,
        DEFAULT_SEO.description,
      );
    }

    const outputPath = buildOutputPath(pathname);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, replaceMeta(template, seo), "utf8");
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
