import fs from "node:fs";

const FILES = [
  "src/data/guides/us/utah/bryce-canyon-city.json",
  "src/data/guides/us/utah/hurricane.json",
  "src/data/guides/us/utah/moab.json",
  "src/data/guides/us/utah/springdale.json",
  "src/data/guides/us/utah/st-george.json",
] as const;

const BANNED = [
  "practical stop for understanding",
  "orientation stop",
  "surrounding area usually offers",
  "site gives visitors context",
  "identifiable design features",
];

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

let ok = 0;
const failures: string[] = [];

for (const file of FILES) {
  const guide = JSON.parse(fs.readFileSync(file, "utf8")) as {
    thingsToDo?: Array<{
      title?: string;
      description?: string;
      wikiUrl?: string;
      imageUrl?: string;
    }>;
  };

  const items = guide.thingsToDo ?? [];
  if (items.length !== 5) {
    failures.push(`${file}: expected 5 items, found ${items.length}`);
    continue;
  }

  const invalid = items.find(item => {
    const description = item.description ?? "";
    const words = wordCount(description);
    return (
      !item.title ||
      words < 60 ||
      words > 90 ||
      !item.wikiUrl ||
      !item.imageUrl ||
      BANNED.some(phrase => description.toLowerCase().includes(phrase))
    );
  });

  if (invalid) {
    failures.push(`${file}: invalid thing detected (${invalid.title ?? "unknown"})`);
    continue;
  }

  ok += 1;
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Utah authority guides updated: ${ok}/${FILES.length}`);
