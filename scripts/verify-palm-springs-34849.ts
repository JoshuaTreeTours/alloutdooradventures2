import { getToursByCityUnified } from "../src/data/tours";
import { getEngine2TourByPath } from "../src/engine2/data/loadEngine2";
import { buildEngine2Seo } from "../src/engine2/seo/buildEngine2Seo";

const EXPECTED_PATH =
  "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849";
const EXPECTED_HERO_IMAGE =
  "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa";

const fail = (message: string): never => {
  throw new Error(message);
};

const listingTour = getToursByCityUnified("california", "palm-springs").find(
  item => item.href === EXPECTED_PATH
);
if (!listingTour) {
  fail("Palm Springs listing is missing the expected 34849 tour link.");
}

const engine2Tour = getEngine2TourByPath(EXPECTED_PATH);
if (!engine2Tour) {
  fail("getEngine2TourByPath returned null for the expected canonical path.");
}

if (engine2Tour.images.hero !== EXPECTED_HERO_IMAGE) {
  fail(
    `Expected images.hero to be ${EXPECTED_HERO_IMAGE} but got ${engine2Tour.images.hero}.`
  );
}

if (listingTour.tour.heroImage !== engine2Tour.images.hero) {
  fail(
    "Listing card image source does not match engine2 tour images.hero (tour.heroImage mismatch)."
  );
}

const seo = buildEngine2Seo(engine2Tour);
if (seo.og.image !== engine2Tour.images.hero) {
  fail(
    `Expected tour page OG image to be ${engine2Tour.images.hero} but got ${seo.og.image}.`
  );
}

console.log("verify:palm-springs-34849 passed");
