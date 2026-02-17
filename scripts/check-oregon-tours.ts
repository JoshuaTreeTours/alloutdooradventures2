import { getAllEngine2Tours, getEngine2ToursByStateSlug } from "../src/engine2/data/loadEngine2";

const allTours = getAllEngine2Tours();
const oregonTours = allTours.filter(tour => tour.sourceDatasetKey === "oregon");

console.log(`Oregon dataset tours: ${oregonTours.length}`);

const samples = oregonTours.slice(0, 3).map(tour => tour.slug || tour.name);
console.log("Sample Oregon tours:");
for (const sample of samples) {
  console.log(`- ${sample}`);
}

const stateTours = getEngine2ToursByStateSlug("oregon");
const hasOregonStateAggregation = stateTours.some(tour => tour.sourceDatasetKey === "oregon");

console.log(
  `State aggregation includes Oregon dataset: ${hasOregonStateAggregation ? "yes" : "no"}`
);

const countryTours = allTours.filter(
  tour => tour.geo.country.toLowerCase() === "united states" && tour.sourceDatasetKey === "oregon"
);
console.log(`Country aggregation candidate tours (United States): ${countryTours.length}`);

if (!oregonTours.length || !hasOregonStateAggregation) {
  process.exitCode = 1;
}
