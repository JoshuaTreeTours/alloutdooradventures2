import fs from "node:fs";

const FILES = [
  "src/data/guides/us/utah/bryce-canyon-city.json",
  "src/data/guides/us/utah/hurricane.json",
  "src/data/guides/us/utah/moab.json",
  "src/data/guides/us/utah/springdale.json",
  "src/data/guides/us/utah/st-george.json",
] as const;

const FORBIDDEN = ["default.jpg", "default-tour.jpg"];
const failures: string[] = [];

for (const file of FILES) {
  const guide = JSON.parse(fs.readFileSync(file, "utf8")) as {
    thingsToDo?: Array<{ title?: string; image?: string | null; imageUrl?: string | null }>;
  };

  for (const item of guide.thingsToDo ?? []) {
    const image = item.image ?? item.imageUrl ?? "";
    if (FORBIDDEN.some(pattern => image.includes(pattern))) {
      failures.push(`${file}: ${item.title ?? "unknown"} uses forbidden fallback image ${image}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Utah default landmark image assertion passed");
