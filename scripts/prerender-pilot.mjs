import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tsImport } from "tsx/esm/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const templatePath = path.join(distDir, "index.html");

const escapeAttribute = value =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/\"/g, "&quot;")
    .replace(/</g, "&lt;");

const escapeScriptJson = value => value.replace(/</g, "\\u003c");

const replaceMeta = (html, seo) => {
  const title = escapeAttribute(seo.title);
  const description = escapeAttribute(seo.description);
  const url = escapeAttribute(seo.url);
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

const injectJsonLd = (html, data) => {
  if (!data) {
    return html;
  }
  const script = `<script id=\"structured-data\" type=\"application/ld+json\">${escapeScriptJson(JSON.stringify(data))}</script>`;
  return html.replace("</head>", `${script}</head>`);
};

const outputPathForRoute = route => {
  const normalized = route.replace(/^\/+|\/+$/g, "");
  return normalized
    ? path.join(distDir, normalized, "index.html")
    : path.join(distDir, "index.html");
};

const routeFromTour = tour =>
  `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;

const main = async () => {
  const template = await readFile(templatePath, "utf8");
  const [{ PRERENDER_ROUTES }, toursModule, seoModule, tourMetaModule, tourJsonLdModule] =
    await Promise.all([
      tsImport(path.join(rootDir, "src/ssg/prerenderRoutes.ts"), import.meta.url),
      tsImport(path.join(rootDir, "src/data/tours.ts"), import.meta.url),
      tsImport(path.join(rootDir, "src/utils/seo.ts"), import.meta.url),
      tsImport(path.join(rootDir, "src/lib/tourMeta.ts"), import.meta.url),
      tsImport(path.join(rootDir, "src/lib/buildTourJsonLd.ts"), import.meta.url),
    ]);

  const { tours, getTourBySlugs } = toursModule;
  const { getStaticPageSeo, buildCanonicalUrl, buildImageUrl, DEFAULT_SEO } = seoModule;
  const { buildTourMeta } = tourMetaModule;
  const { buildTourJsonLd } = tourJsonLdModule;

  const cityTour = getTourBySlugs("california", "joshua-tree", "desert-nature-walk-soundbath-meditation-cacao-ceremony-568118");
  const detailTour = getTourBySlugs("georgia", "savannah", "historical-bike-tour-keep-your-bike-after-362767");

  const seoByRoute = new Map();
  const jsonLdByRoute = new Map();

  const toursSeo = getStaticPageSeo("/tours");
  if (toursSeo) {
    seoByRoute.set("/tours", toursSeo);
    jsonLdByRoute.set("/tours", {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Tours",
      url: buildCanonicalUrl("/tours"),
    });
  }

  if (cityTour) {
    const cityRoute = `/destinations/${cityTour.destination.stateSlug}/${cityTour.destination.citySlug}/tours`;
    seoByRoute.set(cityRoute, {
      title: `Tours in ${cityTour.destination.city} | All Outdoor Adventures`,
      description: `Browse guided experiences in ${cityTour.destination.city} with live booking links and activity filters.`,
      url: buildCanonicalUrl(cityRoute),
      type: DEFAULT_SEO.type,
      image: buildImageUrl(cityTour.heroImage),
    });
    jsonLdByRoute.set(cityRoute, {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Tours in ${cityTour.destination.city}`,
      url: buildCanonicalUrl(cityRoute),
    });
  }

  if (detailTour) {
    const detailRoute = routeFromTour(detailTour);
    const seo = buildTourMeta(detailTour, detailRoute);
    seoByRoute.set(detailRoute, {
      title: seo.title,
      description: seo.description,
      url: seo.canonical,
      type: DEFAULT_SEO.type,
      image: buildImageUrl(detailTour.heroImage),
    });
    jsonLdByRoute.set(
      detailRoute,
      buildTourJsonLd({
        name: detailTour.title,
        description: seo.description,
        url: seo.canonical,
        image: buildImageUrl(detailTour.heroImage),
        price: detailTour.startingPrice,
        priceCurrency: detailTour.currency,
      }),
    );
  }

  for (const route of PRERENDER_ROUTES) {
    const seo = seoByRoute.get(route);
    if (!seo) {
      continue;
    }
    const htmlWithSeo = replaceMeta(template, seo);
    const html = injectJsonLd(htmlWithSeo, jsonLdByRoute.get(route));
    const outputPath = outputPathForRoute(route);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html, "utf8");
  }

  console.log(`Pilot prerender complete for ${PRERENDER_ROUTES.length} routes (from ${tours.length} tours)`);
};

main();
