import { getEngine4ViatorTourData } from "../../src/engine4/viator/viatorApi";

const productCode = process.argv[2]?.trim()?.toUpperCase();

if (!productCode) {
  console.error(
    "Usage: tsx scripts/engine4/printEngine4ViatorMapping.ts <VIATOR_PRODUCT_CODE>"
  );
  process.exit(1);
}

async function main() {
  const tour = await getEngine4ViatorTourData(productCode);

  if (!tour) {
    console.error(`No Engine4 Viator API/fallback data found for ${productCode}`);
    process.exit(2);
  }

  console.log(JSON.stringify(tour, null, 2));
}

void main();
