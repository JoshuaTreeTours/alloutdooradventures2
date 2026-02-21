import fs from "node:fs";

const FILES = [
  "src/data/guides/us/utah/bryce-canyon-city.json",
  "src/data/guides/us/utah/hurricane.json",
  "src/data/guides/us/utah/moab.json",
  "src/data/guides/us/utah/springdale.json",
  "src/data/guides/us/utah/st-george.json",
] as const;

const DEFAULT_IMAGE_PATTERNS = ["default.jpg", "default-tour.jpg"];

let ok = 0;
const failures: string[] = [];

for (const file of FILES) {
  const guide = JSON.parse(fs.readFileSync(file, "utf8")) as {
    thingsToDo?: Array<{
      title?: string;
      image?: string | null;
      imageUrl?: string | null;
    }>;
  };

  const items = guide.thingsToDo ?? [];
  if (items.length !== 5) {
    failures.push(`${file}: expected 5 items, found ${items.length}`);
    continue;
  }

  const invalid = items.find(item => {
    if (!item.title) {
      return true;
    }

    const image = item.image ?? item.imageUrl ?? "";
    return DEFAULT_IMAGE_PATTERNS.some(pattern => image.includes(pattern));
  });

  if (invalid) {
    failures.push(`${file}: contains forbidden default image (${invalid.title ?? "unknown"})`);
    continue;
  }

  ok += 1;
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Utah authority images injected: ${ok}/${FILES.length}`);
