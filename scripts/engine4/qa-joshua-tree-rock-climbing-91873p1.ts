import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../../src/engine4/data/viatorTours";
import { getEngine4ListingEntries } from "../../src/engine4/listing/getEngine4ListingEntries";
import { getEngine4TourBySlugs } from "../../src/engine4/routing";
import { buildEngine4ViatorSchemaGraph } from "../../src/engine4/schema/buildEngine4ViatorSchemaGraph";
import { mapViatorToEngine4Tour } from "../../src/engine4/viator/mapViatorToEngine4Tour";

const PRODUCT_CODE = "91873P1";
const record = engine4ViatorTours.find(
  tour => tour.productCode === PRODUCT_CODE
);

if (!record) {
  throw new Error(`Missing Engine4 tour record for ${PRODUCT_CODE}`);
}

const vm = mapViatorToEngine4Tour({
  record,
  apiTour: engine4ViatorApiFallbackByProductCode[PRODUCT_CODE],
});

const listing = getEngine4ListingEntries("california", "joshua-tree").find(
  entry => entry.tour.productCode === PRODUCT_CODE
)?.tour;

if (!listing) {
  throw new Error("Missing Joshua Tree listing card for 91873P1");
}

const routeTour = getEngine4TourBySlugs(
  "california",
  "joshua-tree",
  "private-guided-rock-climbing-trip-in-joshua-tree-national-park-91873p1"
);

if (!routeTour) {
  throw new Error("Route lookup failed for Joshua Tree climbing tour");
}

const schema = buildEngine4ViatorSchemaGraph(vm);
const graph = schema["@graph"] as Array<Record<string, unknown>>;
const productNode = graph.find(node => node["@type"] === "Product") ?? {};
const tripNode = graph.find(node => node["@type"] === "TouristTrip") ?? {};

const assertions: Array<[string, boolean, unknown]> = [
  ["hero image exists", Boolean(vm.heroImage), vm.heroImage],
  [
    "hero image is API-derived TACDN/Viator",
    /https:\/\/(dynamic-media|media)\.tacdn\.com|https:\/\/[^/]*viator\.com/i.test(
      vm.heroImage ?? ""
    ),
    vm.heroImage,
  ],
  [
    "listing card image matches hero",
    listing.heroImage === vm.heroImage,
    listing.heroImage,
  ],
  ["not default mountain fallback", vm.heroImage !== "/hero.jpg", vm.heroImage],
  [
    "og image matches hero",
    routeTour.seo.ogImage === vm.heroImage,
    routeTour.seo.ogImage,
  ],
  [
    "schema product image matches hero",
    productNode.image === vm.heroImage,
    productNode.image,
  ],
  [
    "schema trip image matches hero",
    tripNode.image === vm.heroImage,
    tripNode.image,
  ],
  ["price present", Boolean(vm.facts.priceFrom), vm.facts.priceFrom],
  [
    "rating present",
    typeof vm.facts.ratingValue === "number",
    vm.facts.ratingValue,
  ],
  [
    "review count present",
    typeof vm.facts.reviewCount === "number",
    vm.facts.reviewCount,
  ],
  ["start time present", Boolean(vm.facts.startTime), vm.facts.startTime],
  [
    "meeting point present",
    Boolean(vm.facts.meetingPointFull),
    vm.facts.meetingPointFull,
  ],
];

const failures = assertions.filter(([, pass]) => !pass);
assertions.forEach(([name, pass, value]) => {
  console.info(`${pass ? "PASS" : "FAIL"} :: ${name} :: ${String(value)}`);
});

if (failures.length) {
  throw new Error(`QA failed with ${failures.length} failing assertions.`);
}
