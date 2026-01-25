import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tsImport } from "tsx/esm/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, "../dist");

const expectedRoute = {
  stateSlug: "hawaii",
  citySlug: "paia",
  tourSlug: "haleakala-downhill-self-guided-bike-tour-181765",
};

const buildExpectedSeo = (tour, seo) => {
  const regionLabel = tour.destination.state || tour.destination.country || "";
  const destinationLabel = regionLabel
    ? `${tour.destination.city}, ${regionLabel}`
    : tour.destination.city;
  const title = `${tour.title} | ${destinationLabel} Outdoor Tour`;
  const description = seo.buildMetaDescription(
    tour.shortDescription ?? tour.badges.tagline ?? tour.longDescription,
    `Book ${tour.title} in ${destinationLabel} with curated outdoor tours and trusted local guides.`,
  );

  return { title, description };
};

const main = async () => {
  const [toursGeneratedModule, seoModule] = await Promise.all([
    tsImport("../src/data/tours.generated.ts", import.meta.url),
    tsImport("../src/utils/seo.ts", import.meta.url),
  ]);

  const tours = Array.isArray(toursGeneratedModule.toursGenerated)
    ? toursGeneratedModule.toursGenerated
    : [];
  const tour = tours.find(
    (entry) =>
      entry.destination.stateSlug === expectedRoute.stateSlug &&
      entry.destination.citySlug === expectedRoute.citySlug &&
      entry.slug === expectedRoute.tourSlug,
  );

  if (!tour) {
    throw new Error(
      `Unable to locate expected tour for verification: ${expectedRoute.stateSlug}/${expectedRoute.citySlug}/${expectedRoute.tourSlug}`,
    );
  }

  const { title, description } = buildExpectedSeo(tour, seoModule);
  const htmlPath = path.join(
    distDir,
    "tours",
    expectedRoute.stateSlug,
    expectedRoute.citySlug,
    expectedRoute.tourSlug,
    "index.html",
  );
  const html = await readFile(htmlPath, "utf8");

  if (!html.includes(`<title>${title}</title>`)) {
    throw new Error(`Prerendered HTML missing expected title: ${title}`);
  }

  if (
    !html.includes(
      `<meta name="description" content="${description}" />`,
    )
  ) {
    throw new Error(
      "Prerendered HTML missing expected meta description for tour route.",
    );
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
