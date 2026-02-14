import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tsImport } from "tsx/esm/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const SITE_URL = "https://www.alloutdooradventures.com";
const STRUCTURED_DATA_SCRIPT_ID = "structured-data";

const PILOT_ROUTES = [
  "/destinations/oregon/portland/tours/gorge-ous-sunset-multnomah-falls-waterfall-tour-from-portland-462223",
  "/destinations/georgia/savannah/tours/historical-bike-tour-keep-your-bike-after-362767",
  "/destinations/california/palm-springs/tours/shared-indian-canyons-hiking-tour-by-jeep-574370",
];

const escapeAttribute = value =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/\"/g, "&quot;")
    .replace(/</g, "&lt;");

const escapeScriptJson = value => value.replace(/</g, "\\u003c");

const resolveOutDir = async () => {
  const preferredDirs = ["dist", "build", "public"];

  const hasBuildArtifacts = async dirPath => {
    try {
      const [indexStats, assetsStats] = await Promise.all([
        stat(path.join(dirPath, "index.html")),
        stat(path.join(dirPath, "assets")),
      ]);
      return indexStats.isFile() && assetsStats.isDirectory();
    } catch {
      return false;
    }
  };

  for (const dirName of preferredDirs) {
    const absoluteDir = path.join(repoRoot, dirName);
    if (await hasBuildArtifacts(absoluteDir)) {
      return absoluteDir;
    }
  }

  const ignoredRoots = new Set(["node_modules", ".git", ".vercel", "work"]);
  const queue = [repoRoot];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    if (await hasBuildArtifacts(current)) {
      return current;
    }

    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      if (entry.name.startsWith(".")) {
        continue;
      }
      if (ignoredRoots.has(entry.name)) {
        continue;
      }
      queue.push(path.join(current, entry.name));
    }
  }

  throw new Error(
    "Could not find a static output directory containing both index.html and assets/."
  );
};

const updateTagValue = (html, selectorPattern, attribute, value) => {
  const pattern = new RegExp(selectorPattern, "i");
  const escaped = escapeAttribute(value);

  return html.replace(pattern, tag => {
    const attributePattern = new RegExp(`${attribute}\\s*=\\s*[\"'][^\"']*[\"']`, "i");
    if (attributePattern.test(tag)) {
      return tag.replace(attributePattern, `${attribute}=\"${escaped}\"`);
    }
    const closeIndex = tag.lastIndexOf(">");
    return `${tag.slice(0, closeIndex)} ${attribute}=\"${escaped}\"${tag.slice(closeIndex)}`;
  });
};

const applySeoMeta = (html, seo) => {
  let next = html;

  next = next.replace(
    /<title[^>]*>[\s\S]*?<\/title>/i,
    `<title>${escapeAttribute(seo.title)}</title>`
  );
  next = updateTagValue(next, `<meta\\s+[^>]*name\\s*=\\s*[\"']description[\"'][^>]*>`, "content", seo.description);
  next = updateTagValue(next, `<link\\s+[^>]*rel\\s*=\\s*[\"']canonical[\"'][^>]*>`, "href", seo.canonical);
  next = updateTagValue(next, `<meta\\s+[^>]*property\\s*=\\s*[\"']og:title[\"'][^>]*>`, "content", seo.title);
  next = updateTagValue(next, `<meta\\s+[^>]*property\\s*=\\s*[\"']og:description[\"'][^>]*>`, "content", seo.description);
  next = updateTagValue(next, `<meta\\s+[^>]*property\\s*=\\s*[\"']og:url[\"'][^>]*>`, "content", seo.canonical);
  next = updateTagValue(next, `<meta\\s+[^>]*property\\s*=\\s*[\"']og:image[\"'][^>]*>`, "content", seo.image);
  next = updateTagValue(next, `<meta\\s+[^>]*name\\s*=\\s*[\"']twitter:title[\"'][^>]*>`, "content", seo.title);
  next = updateTagValue(next, `<meta\\s+[^>]*name\\s*=\\s*[\"']twitter:description[\"'][^>]*>`, "content", seo.description);
  next = updateTagValue(next, `<meta\\s+[^>]*name\\s*=\\s*[\"']twitter:image[\"'][^>]*>`, "content", seo.image);

  return next;
};

const buildTourDescription = tour => {
  const base =
    tour.shortDescription?.trim() ||
    tour.badges?.tagline?.trim() ||
    tour.longDescription?.trim() ||
    `Guided tour in ${tour.destination.city}, ${tour.destination.state}.`;

  const idValue = tour.id?.trim() || tour.partnerId?.trim();
  if (!idValue) {
    return base;
  }

  const hasIdAlready = new RegExp(idValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(base);
  return hasIdAlready ? base : `${base} ID ${idValue}`;
};

const replaceStructuredData = (html, value) => {
  const scriptTag = `<script id=\"${STRUCTURED_DATA_SCRIPT_ID}\" type=\"application/ld+json\">${escapeScriptJson(
    JSON.stringify(value)
  )}</script>`;
  const scriptPattern = new RegExp(
    `<script[^>]*id=[\"']${STRUCTURED_DATA_SCRIPT_ID}[\"'][^>]*type=[\"']application/ld\\+json[\"'][^>]*>[\\s\\S]*?<\\/script>`,
    "i"
  );

  if (scriptPattern.test(html)) {
    return html.replace(scriptPattern, scriptTag);
  }

  return html.replace("</head>", `${scriptTag}</head>`);
};

const readStructuredDataGraph = html => {
  const scriptPattern = new RegExp(
    `<script[^>]*id=[\"']${STRUCTURED_DATA_SCRIPT_ID}[\"'][^>]*type=[\"']application/ld\\+json[\"'][^>]*>([\\s\\S]*?)<\\/script>`,
    "i"
  );
  const match = html.match(scriptPattern);
  if (!match?.[1]) {
    return [];
  }

  try {
    const parsed = JSON.parse(match[1]);
    if (Array.isArray(parsed?.["@graph"])) {
      return parsed["@graph"];
    }
    return [];
  } catch {
    return [];
  }
};

const run = async () => {
  const outDir = await resolveOutDir();
  const baseHtmlPath = path.join(outDir, "index.html");
  const baseHtml = await readFile(baseHtmlPath, "utf8");

  const [toursModule, destinationModule, seoModule, structuredDataModule] =
    await Promise.all([
      tsImport(path.join(repoRoot, "src/data/tours.ts"), import.meta.url),
      tsImport(path.join(repoRoot, "src/data/destinations.ts"), import.meta.url),
      tsImport(path.join(repoRoot, "src/utils/seo.ts"), import.meta.url),
      tsImport(path.join(repoRoot, "src/utils/structuredData.ts"), import.meta.url),
    ]);

  const { getTourBySlugs } = toursModule;
  const { getStateBySlug, getCityBySlugs } = destinationModule;
  const { buildImageUrl } = seoModule;
  const {
    buildTourProductStructuredData,
    buildTourTripStructuredData,
    normalizeStructuredData,
  } = structuredDataModule;

  const baseGraphNodes = readStructuredDataGraph(baseHtml);

  for (const route of PILOT_ROUTES) {
    const segments = route.split("/").filter(Boolean);
    const [_, stateSlug, citySlug, __, tourSlug] = segments;

    const tour = getTourBySlugs(stateSlug, citySlug, tourSlug);
    if (!tour) {
      throw new Error(`Pilot route does not map to a tour: ${route}`);
    }

    const state = getStateBySlug(stateSlug);
    const city = getCityBySlugs(stateSlug, citySlug);
    if (!state || !city) {
      throw new Error(`Missing state/city data for route: ${route}`);
    }

    const title = `${tour.title} | ${city.name}, ${state.name} Outdoor Tour`;
    const description = buildTourDescription(tour);
    const canonical = `${SITE_URL}${route}`;
    const image = buildImageUrl(tour.heroImage);
    const bookingUrl = `${canonical}/book`;

    const productNode = buildTourProductStructuredData({
      tour,
      detailUrl: canonical,
      bookingUrl,
      description,
      images: [image, ...(tour.galleryImages ?? [])],
    });

    const tripNode = buildTourTripStructuredData({
      tour,
      detailUrl: canonical,
      bookingUrl,
      description,
      images: [image, ...(tour.galleryImages ?? [])],
    });

    const offerNode =
      productNode && typeof productNode === "object"
        ? productNode.offers
        : null;

    const normalizedStructuredData = normalizeStructuredData({
      "@context": "https://schema.org",
      "@graph": [...baseGraphNodes, productNode, tripNode, offerNode],
    });

    let routeHtml = applySeoMeta(baseHtml, {
      title,
      description,
      canonical,
      image,
    });

    routeHtml = replaceStructuredData(routeHtml, normalizedStructuredData);

    const outputPath = path.join(outDir, route.replace(/^\//, ""), "index.html");
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, routeHtml, "utf8");
  }

  console.log(`Pilot prerender completed in ${outDir}`);
};

run().catch(error => {
  console.error(error);
  process.exit(1);
});
