import { getToursByCity, tours } from "../src/data/tours";
import { toursGenerated } from "../src/data/tours.generated";
import { manualTours } from "../src/data/tours.manual";
import { flagstaffTours } from "../src/data/flagstaffTours";
import { sedonaTours } from "../src/data/sedonaTours";
import { europeTours } from "../src/data/europeTours";
import { australiaTours } from "../src/data/australiaTours";
import { SANTA_BARBARA_TOURS } from "../src/data/locations/us/california/santa-barbara.tours";

const VALID_CATEGORIES = new Set(["Cycling", "Hiking", "Paddle Sports", "Day Tours"]);

const baseTourCount = [
  ...toursGenerated,
  ...manualTours,
  ...flagstaffTours,
  ...sedonaTours,
  ...europeTours,
  ...australiaTours,
].length;

const sbTours = getToursByCity("california", "santa-barbara");
if (sbTours.length < 1) {
  throw new Error("Expected at least one Santa Barbara tour from getToursByCity");
}

SANTA_BARBARA_TOURS.forEach((tour, index) => {
  const row = index + 1;
  if (!tour.id) throw new Error(`SB tour ${row} missing id`);
  if (!tour.slug) throw new Error(`SB tour ${row} missing slug`);
  if (tour.destination.stateSlug !== "california") {
    throw new Error(`SB tour ${row} has invalid state slug ${tour.destination.stateSlug}`);
  }
  if (tour.destination.citySlug !== "santa-barbara") {
    throw new Error(`SB tour ${row} has invalid city slug ${tour.destination.citySlug}`);
  }
  if (!tour.heroImageUrl) throw new Error(`SB tour ${row} missing hero image URL`);
  if (!tour.sourceDescription) throw new Error(`SB tour ${row} missing meta description snippet`);
  const category = tour.categories?.[0];
  if (!category || !VALID_CATEGORIES.has(category)) {
    throw new Error(`SB tour ${row} has invalid category ${category ?? "<none>"}`);
  }
});

if (tours.length < baseTourCount) {
  throw new Error(`Total tours dropped after merge (${tours.length} < ${baseTourCount})`);
}

console.log(
  `Santa Barbara import verification passed. getToursByCity count=${sbTours.length}, base=${baseTourCount}, total=${tours.length}`,
);
