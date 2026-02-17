import { getHeartlandCsvFilenames } from "../src/engine2/data/heartlandTours";

const files = getHeartlandCsvFilenames();

console.log(`Discovered heartland CSV files: ${files.length}`);
for (const file of files) {
  console.log(file);
}
