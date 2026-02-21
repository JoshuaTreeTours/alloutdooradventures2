import fs from "node:fs";

const FILES = [
  "src/data/guides/us/utah/bryce-canyon-city.json",
  "src/data/guides/us/utah/hurricane.json",
  "src/data/guides/us/utah/moab.json",
  "src/data/guides/us/utah/springdale.json",
  "src/data/guides/us/utah/st-george.json",
] as const;

const FORBIDDEN = ["default-tour.jpg", "default.jpg"];
const failures: string[] = [];

for (const file of FILES) {
  const guide = JSON.parse(fs.readFileSync(file, "utf8")) as {
    thingsToDo?: Array<{ image?: string | null; imageUrl?: string | null }>;
  };

  const items = guide.thingsToDo ?? [];
  if (items.length !== 5) {
    failures.push(`${file}: expected 5 thingsToDo items, found ${items.length}`);
    continue;
  }

  let coverage = 0;
  for (const item of items) {
    const image = (item.image ?? item.imageUrl ?? "").trim();
    if (image) {
      coverage += 1;
    }
    if (FORBIDDEN.some(token => image.includes(token))) {
      failures.push(`${file}: forbidden default image reference detected (${image})`);
    }
  }

  console.log(`${file}: image coverage ${coverage}/5`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Utah guide image verification passed");
