import { getTourBySlugs } from "../src/data/tours";
import { getExpandedTourDescription } from "../src/data/tourNarratives";
import { resolveHeroImageForRoute } from "../src/utils/hero";
import { buildTourProductStructuredData } from "../src/utils/structuredData";
import { resolveFareHarborUrlFromBookPage } from "../src/utils/fh/resolveFareHarborUrlFromBookPage";
import { fetchFareHarborHtml } from "../src/utils/fh/fetchFareHarborHtml";
import { extractFilestackImagesFromHtml } from "../src/utils/fareharbor/extractFilestackImagesFromHtml";

const EXPECTED_PATH =
  "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849";

const fail = (message: string): never => {
  throw new Error(message);
};

const tour = getTourBySlugs(
  "california",
  "palm-springs",
  "shared-san-andreas-fault-jeep-tour-34849"
);

if (!tour) {
  fail("Expected Engine1 Palm Springs 34849 tour to exist.");
}

const fareHarborUrl = resolveFareHarborUrlFromBookPage(`${EXPECTED_PATH}/book`);
if (!fareHarborUrl) {
  fail("Could not resolve FareHarbor URL for 34849 book path.");
}

const html = fetchFareHarborHtml(fareHarborUrl);
if (!html) {
  fail("Missing FareHarbor fixture HTML for 34849.");
}

const derivedImages = extractFilestackImagesFromHtml(html);
console.log("derivedImages:", derivedImages);

if (derivedImages.length < 2) {
  fail(`Expected at least 2 derived images, got ${derivedImages.length}.`);
}

if (
  derivedImages.some(
    image =>
      !image.startsWith("https://cdn.filestackcontent.com/") ||
      /resize,\/?$/i.test(image)
  )
) {
  fail("Derived images include invalid Filestack URLs.");
}

const existingHero = resolveHeroImageForRoute({ route: EXPECTED_PATH, tour });
const hero = derivedImages[0] ?? existingHero;
const gallery = derivedImages.length > 1 ? derivedImages.slice(1) : [];

const product = buildTourProductStructuredData({
  tour,
  detailUrl: EXPECTED_PATH,
  description: getExpandedTourDescription(tour)[0],
  images: [hero, ...gallery].filter((image): image is string => Boolean(image)),
}) as { image?: string[] };

if (!Array.isArray(product.image) || product.image.length < 2) {
  fail("Expected Product.image to be an array with at least 2 images.");
}

console.log("schema Product.image:", product.image);
console.log("verify:palm-springs-34849-images passed");
