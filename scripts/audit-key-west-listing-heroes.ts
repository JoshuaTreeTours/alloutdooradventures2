import { writeFileSync } from "node:fs";

import { ENGINE6_KEY_WEST_CANONICAL_CITY_HERO_URL } from "../src/engine6/displayHero";
import { engine6ListingTours } from "../src/engine6/listing";
import { KEY_WEST_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/keyWestViatorPublicRatings";

const listing = engine6ListingTours
  .filter(
    tour =>
      tour.destination.stateSlug === "florida" &&
      tour.destination.citySlug === "key-west" &&
      KEY_WEST_VIATOR_PUBLIC_PRODUCT_CODES.includes(tour.productCode)
  )
  .slice(0, 15);

const audit = listing.map((tour, index) => ({
  rank: index + 1,
  productCode: tour.productCode,
  title: tour.title,
  heroUrl: tour.heroImage,
  source:
    tour.heroImage === ENGINE6_KEY_WEST_CANONICAL_CITY_HERO_URL
      ? "canonical-city-fallback"
      : "product-specific",
}));

writeFileSync(
  "reports/key-west-listing-hero-audit.json",
  `${JSON.stringify({ canonicalCityHero: ENGINE6_KEY_WEST_CANONICAL_CITY_HERO_URL, cards: audit }, null, 2)}\n`
);

console.log(JSON.stringify(audit, null, 2));
const fallbacks = audit.filter(card => card.source === "canonical-city-fallback");
console.log(`\nFallback count in first 15: ${fallbacks.length}`);
