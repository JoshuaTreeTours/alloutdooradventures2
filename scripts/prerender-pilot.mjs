import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tsImport } from "tsx/esm/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, "../dist");
const templatePath = path.join(distDir, "index.html");
const STRUCTURED_DATA_SCRIPT_ID = "structured-data";

const escapeAttribute = value =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

const escapeScriptJson = value => value.replace(/</g, "\\u003c");

const replaceMeta = (template, seo) => {
  const title = escapeAttribute(seo.title);
  const description = escapeAttribute(seo.description);
  const canonical = escapeAttribute(seo.canonicalUrl);
  const image = escapeAttribute(seo.ogImage);

  return template
    .replaceAll("__SEO_TITLE__", title)
    .replaceAll("__SEO_DESCRIPTION__", description)
    .replaceAll("__SEO_CANONICAL__", canonical)
    .replaceAll("__SEO_OG_TITLE__", title)
    .replaceAll("__SEO_OG_DESCRIPTION__", description)
    .replaceAll("__SEO_OG_URL__", canonical)
    .replaceAll("__SEO_OG_IMAGE__", image)
    .replaceAll("__SEO_TWITTER_TITLE__", title)
    .replaceAll("__SEO_TWITTER_DESCRIPTION__", description)
    .replaceAll("__SEO_TWITTER_IMAGE__", image);
};

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

  return scriptTag ? html.replace("</head>", `${scriptTag}</head>`) : html;
};

const getOutputPath = route =>
  route === "/"
    ? templatePath
    : path.join(distDir, route.replace(/^\/+/, ""), "index.html");

const parseDestinationTourRoute = route => {
  const match = route.match(
    /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)(\/book)?$/
  );

  if (!match) {
    return null;
  }

  return {
    stateSlug: match[1],
    citySlug: match[2],
    tourSlug: match[3],
    isBooking: Boolean(match[4]),
  };
};

const buildTouristTripJsonLd = ({
  tour,
  detailUrl,
  bookingUrl,
  description,
  image,
  siteBrandName,
}) => {
  const offer = {
    "@type": "Offer",
    url: bookingUrl,
    ...(tour.currency ? { priceCurrency: tour.currency } : {}),
    ...(typeof tour.startingPrice === "number"
      ? { price: String(tour.startingPrice) }
      : {}),
  };

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description,
    url: detailUrl,
    ...(image ? { image: [image] } : {}),
    provider: {
      "@type": "Organization",
      name: siteBrandName,
    },
    offers: offer,
  };
};

const main = async () => {
  const template = await readFile(templatePath, "utf8");
  const [
    { PILOT_PRERENDER_ROUTES },
    toursModule,
    seoModule,
    siteModule,
    seoHelperModule,
  ] = await Promise.all([
    tsImport("../src/config/pilotPrerenderRoutes.ts", import.meta.url),
    tsImport("../src/data/tours.ts", import.meta.url),
    tsImport("../src/utils/seo.ts", import.meta.url),
    tsImport("../src/utils/site.ts", import.meta.url),
    tsImport("../src/lib/seo/getTourSeo.ts", import.meta.url),
  ]);

  for (const route of PILOT_PRERENDER_ROUTES) {
    const parsed = parseDestinationTourRoute(route);
    if (!parsed) {
      continue;
    }

    const tour = toursModule.getTourBySlugs(
      parsed.stateSlug,
      parsed.citySlug,
      parsed.tourSlug
    );

    if (!tour) {
      throw new Error(`Tour not found for pilot route: ${route}`);
    }

    const detailPath = `/destinations/${parsed.stateSlug}/${parsed.citySlug}/tours/${parsed.tourSlug}`;
    const bookingPath = `${detailPath}/book`;

    const seo = seoHelperModule.getTourSeo({
      tour,
      pathname: parsed.isBooking ? bookingPath : detailPath,
      bookingPage: parsed.isBooking,
    });

    const htmlWithMeta = replaceMeta(template, seo);

    const structuredData = parsed.isBooking
      ? null
      : buildTouristTripJsonLd({
          tour,
          detailUrl: seoModule.buildCanonicalUrl(detailPath),
          bookingUrl: seoModule.buildCanonicalUrl(bookingPath),
          description: seo.description,
          image: seo.ogImage,
          siteBrandName: siteModule.SITE_BRAND_NAME,
        });

    const finalHtml = replaceStructuredData(htmlWithMeta, structuredData);
    const outputPath = getOutputPath(route);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, finalHtml, "utf8");
    console.log(`[prerender-pilot] wrote ${route}`);
  }
};

main().catch(error => {
  console.error("[prerender-pilot] failed", error);
  process.exitCode = 1;
});
