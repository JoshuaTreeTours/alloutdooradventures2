import fs from "node:fs";
import path from "node:path";

const HAWAII_DIR = path.resolve("src/data/guides/us/hawaii");
const EXCLUDED_CITY = "honolulu";

const BOILERPLATE = [
  "vibrant destination",
  "offers something for everyone",
  "popular attraction",
  "popular attractions",
  "rich culture",
  "unique charm",
  "must-see",
];

const isWikipediaUrl = (value?: string) =>
  Boolean(value && /^https?:\/\/(?:[a-z]+\.)?wikipedia\.org\//i.test(value));

const sentenceCount = (value: string) =>
  value
    .split(/(?<=[.!?])\s+/)
    .map(part => part.trim())
    .filter(Boolean).length;

const defaultImageTokens = ["default", "placeholder", "stock", "/images/"];
const errors: string[] = [];

for (const file of fs.readdirSync(HAWAII_DIR).filter(entry => entry.endsWith(".json"))) {
  const citySlug = file.replace(/\.json$/, "");
  if (citySlug === EXCLUDED_CITY) continue;

  const data = JSON.parse(
    fs.readFileSync(path.join(HAWAII_DIR, file), "utf8")
  ) as {
    thingsToDo?: Array<{
      title?: string;
      description?: string;
      wikiUrl?: string;
      sourceUrl?: string;
      source_url?: string;
      imageUrl?: string | null;
    }>;
  };

  for (const [index, thing] of (data.thingsToDo ?? []).entries()) {
    const context = `${citySlug}#${index + 1}${thing.title ? ` (${thing.title})` : ""}`;
    const description = thing.description ?? "";
    const source = thing.sourceUrl ?? thing.source_url ?? thing.wikiUrl;

    if (sentenceCount(description) < 3) {
      errors.push(`Description < 3 sentences in ${context}.`);
    }

    if (!isWikipediaUrl(source) || !isWikipediaUrl(thing.wikiUrl)) {
      errors.push(`Missing Wikipedia source in ${context}.`);
    }

    if (!thing.imageUrl) {
      errors.push(`Missing image in ${context}.`);
    } else {
      const lowered = thing.imageUrl.toLowerCase();
      if (defaultImageTokens.some(token => lowered.includes(token))) {
        errors.push(`Default image detected in ${context}: ${thing.imageUrl}`);
      }
    }

    const loweredDescription = description.toLowerCase();
    for (const phrase of BOILERPLATE) {
      if (loweredDescription.includes(phrase)) {
        errors.push(`Boilerplate phrase "${phrase}" found in ${context}.`);
      }
    }
  }
}

if (errors.length) {
  console.error("Hawaii authority validation failed:\n");
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Hawaii authority validation passed.");
