import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";

const tours = getAllEngine2Tours().filter(tour => tour.sourceDatasetKey === "canoeing");

console.log(`[check:canoeing] loaded tours: ${tours.length}`);

const samples = tours.slice(0, 3).map(tour => ({
  slug: tour.slug,
  url: tour.seo.canonicalPath,
}));

for (const sample of samples) {
  console.log(`[check:canoeing] sample: ${sample.slug} -> ${sample.url}`);
}

const hasCanadaTour = tours.some(tour => tour.geo.country.toLowerCase() === "canada");
const hasUsTour = tours.some(
  tour =>
    tour.geo.country.toLowerCase() === "united states" ||
    tour.geo.country.toLowerCase() === "usa"
);

console.log(`[check:canoeing] has Canada tour: ${hasCanadaTour}`);
console.log(`[check:canoeing] has US tour: ${hasUsTour}`);

if (tours.length === 0) {
  console.error("[check:canoeing] No canoeing tours loaded.");
  process.exit(1);
}

if (!hasCanadaTour || !hasUsTour) {
  console.error("[check:canoeing] Missing expected Canada/US coverage.");
  process.exit(1);
}
