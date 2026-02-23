import { getToursByCityUnified } from "../src/data/tours";
import {
  getAllEngine2Tours,
  getEngine2TourByPath,
} from "../src/engine2/data/loadEngine2";
import { buildSchemaGraph } from "../src/engine2/schema/buildSchemaGraph";
import { buildEngine2Seo } from "../src/engine2/seo/buildEngine2Seo";
import { getPalmSpringsOverrideContent } from "../src/utils/fh/palmSpringsPilotContent";

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

const engine2TourCandidate = getEngine2TourByPath(EXPECTED_PATH);
if (!engine2TourCandidate) {
  fail("getEngine2TourByPath returned null for the expected canonical path.");
}
const engine2Tour = engine2TourCandidate;

if (engine2Tour.images.hero !== EXPECTED_HERO_IMAGE) {
  fail(
    `Expected images.hero to be ${EXPECTED_HERO_IMAGE} but got ${engine2Tour.images.hero}.`
  );
}

const listingTourItem = listingTour;
if (listingTourItem.tour.heroImage !== engine2Tour.images.hero) {
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

const override = getPalmSpringsOverrideContent(engine2Tour);
if (!override?.enabled) {
  fail("Expected Palm Springs 34849 override to be enabled.");
}

const faqs = override.content.faqs ?? [];
if (faqs.length < 6) {
  fail(`Expected at least 6 FAQs in override content but got ${faqs.length}.`);
}

const hasFaqHeader = override.enabled && faqs.length > 0;
if (!hasFaqHeader) {
  fail(
    'Expected rendered FAQ section marker "Frequently asked questions" to be available when override is on.'
  );
}

const schemaNodes = buildSchemaGraph(
  engine2Tour,
  seo,
  null,
  true,
  override.content.schemaDescription,
  faqs,
  true
);
const faqPage = schemaNodes.find(node => node["@type"] === "FAQPage");
if (!faqPage) {
  fail('Expected JSON-LD to include "@type":"FAQPage" with override on.');
}

const controlTour = getAllEngine2Tours().find(
  item => item.sourceCitySlug === "palm-springs" && item.id !== "34849"
);
if (!controlTour) {
  fail(
    "Missing non-34849 Palm Springs control tour for override-off validation."
  );
}
const controlSeo = buildEngine2Seo(controlTour);
const controlSchema = buildSchemaGraph(controlTour, controlSeo, null, true);
if (controlSchema.some(node => node["@type"] === "FAQPage")) {
  fail("Override-off control tour unexpectedly emitted FAQPage schema.");
}

console.log("verify:palm-springs-34849 passed");
