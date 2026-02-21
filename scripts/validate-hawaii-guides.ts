import fs from "node:fs";
import path from "node:path";
import hawaiiAuthorityCities from "../data/guides/hawaiiAuthorityCities.json";

type HawaiiGuide = {
  slug: string;
  city?: string;
  hero?: { image?: string };
  overview?: string[];
  aboutCity?: {
    sections?: Array<{ paragraphs?: string[] }>;
  };
  thingsToDo?: Array<{
    title?: string;
    wikiUrl?: string;
    sourceUrl?: string;
    source_url?: string;
    imageUrl?: string | null;
  }>;
};

const HAWAII_DIR = path.resolve("src/data/guides/us/hawaii");
const HONOLULU = "honolulu";
const allowed = new Set<string>([...hawaiiAuthorityCities, HONOLULU]);

const bannedPhrases = [
  "vibrant destination",
  "offers something for everyone",
  "popular attractions",
  "rich culture",
  "unique charm",
  "strong base for travelers",
  "practical stop for understanding",
];

const defaultImageTokens = ["default", "placeholder", "/images/california/cities/hero.jpg"];

const isWikipediaUrl = (value?: string) =>
  Boolean(value && /^https?:\/\/(?:[a-z]+\.)?wikipedia\.org\//i.test(value));

const errors: string[] = [];

const files = fs
  .readdirSync(HAWAII_DIR)
  .filter(file => file.endsWith(".json"))
  .sort();

const missingAuthorityCities = [...hawaiiAuthorityCities].filter(city => !files.includes(`${city}.json`));
missingAuthorityCities.forEach(city => {
  errors.push(`Missing required Hawaii authority guide: ${city}.json.`);
});

for (const file of files) {
  const citySlug = file.replace(/\.json$/, "");

  if (!allowed.has(citySlug)) {
    errors.push(
      `Deleted city still generates: ${citySlug}. Add redirect and remove guide file.`
    );
    continue;
  }

  if (citySlug === HONOLULU) {
    continue;
  }

  const raw = fs.readFileSync(path.join(HAWAII_DIR, file), "utf8");
  const guide = JSON.parse(raw) as HawaiiGuide;

  const bodyText = [
    ...(guide.overview ?? []),
    ...((guide.aboutCity?.sections ?? []).flatMap(section => section.paragraphs ?? [])),
    ...((guide.thingsToDo ?? []).map(item => item.title ?? "")),
    ...((guide.thingsToDo ?? []).map(item => item.wikiUrl ?? "")),
  ]
    .join(" ")
    .toLowerCase();

  for (const phrase of bannedPhrases) {
    if (bodyText.includes(phrase)) {
      errors.push(`Boilerplate text detected in ${citySlug}: "${phrase}".`);
    }
  }

  const heroImage = guide.hero?.image ?? "";
  if (defaultImageTokens.some(token => heroImage.toLowerCase().includes(token))) {
    errors.push(`Default image used in ${citySlug} hero image.`);
  }

  (guide.thingsToDo ?? []).forEach((item, index) => {
    const source = item.sourceUrl ?? item.source_url ?? item.wikiUrl;
    if (!isWikipediaUrl(source) || !isWikipediaUrl(item.wikiUrl)) {
      errors.push(
        `Missing Wikipedia source in ${citySlug} thing #${index + 1} (${item.title ?? "untitled"}).`
      );
    }

    const imageUrl = item.imageUrl;
    if (
      typeof imageUrl === "string" &&
      defaultImageTokens.some(token => imageUrl.toLowerCase().includes(token))
    ) {
      errors.push(
        `Default image used in ${citySlug} thing #${index + 1} (${item.title ?? "untitled"}).`
      );
    }
  });
}

if (errors.length) {
  console.error("Hawaii guide validation failed:\n");
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Hawaii guide validation passed.");
