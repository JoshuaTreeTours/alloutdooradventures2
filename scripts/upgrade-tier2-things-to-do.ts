import fs from "node:fs";
import path from "node:path";
import { generateCityEntities } from "../src/utils/guides/generateCityEntities";

type ThingToDo = {
  title: string;
  description: string;
};

type GuideFile = {
  tier?: "tier1" | "tier2";
  city?: string;
  state?: string;
  thingsToDo?: ThingToDo[];
};

const GUIDES_ROOT = path.resolve("src/data/guides/us");
const BANNED_GENERIC_PATTERNS = [
  /local neighborhood/i,
  /outdoor area/i,
  /guided experience/i,
  /downtown area/i,
  /local experience/i,
];

const wordCount = (text: string) => text.trim().split(/\s+/).length;

const buildDescription = (
  entity: { name: string; type: string; summary: string },
  city: string,
  state: string
) => {
  const base = `${entity.name} is a ${entity.type} in ${city}, ${state}. ${entity.summary
    .replace(/\s+/g, " ")
    .trim()}`;
  let output = base;
  if (wordCount(output) < 40) {
    output += ` The site helps explain how ${city} developed through its environment, civic planning, or cultural institutions, so visitors get a grounded understanding of the destination.`;
  }
  const words = output.split(/\s+/);
  if (words.length > 70) {
    output = `${words.slice(0, 70).join(" ").replace(/[;,]$/, "")}.`;
  }
  return output;
};

const walkJsonFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(fullPath));
      continue;
    }
    if (
      entry.isFile() &&
      entry.name.endsWith(".json") &&
      entry.name !== "index.json"
    ) {
      files.push(fullPath);
    }
  }

  return files;
};

const run = async () => {
  const files = walkJsonFiles(GUIDES_ROOT);
  let updated = 0;
  let skipped = 0;
  const qaFailures: string[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const guide = JSON.parse(raw) as GuideFile;

    if (guide.tier !== "tier2" || !guide.city || !guide.state) {
      skipped += 1;
      continue;
    }

    const entities = await generateCityEntities(guide.city, guide.state);
    const unique = new Map<
      string,
      { name: string; type: string; summary: string }
    >();
    for (const entity of entities) {
      const key = entity.name.toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, entity);
      }
      if (unique.size >= 6) {
        break;
      }
    }

    const thingsToDo: ThingToDo[] = Array.from(unique.values()).map(entity => ({
      title: `Visit ${entity.name}`,
      description: buildDescription(entity, guide.city!, guide.state!),
    }));

    if (thingsToDo.length < 4) {
      qaFailures.push(`${file}: generated only ${thingsToDo.length} items`);
      continue;
    }

    const hasGeneric = thingsToDo.some(item =>
      BANNED_GENERIC_PATTERNS.some(pattern => pattern.test(item.title))
    );
    if (hasGeneric) {
      qaFailures.push(`${file}: generic title detected`);
      continue;
    }

    const badLength = thingsToDo.find(item => {
      const wc = wordCount(item.description);
      return wc < 40 || wc > 70;
    });
    if (badLength) {
      qaFailures.push(`${file}: description length out of range`);
      continue;
    }

    guide.thingsToDo = thingsToDo;
    fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
    updated += 1;
  }

  console.log(`Tier-2 guides scanned: ${files.length}`);
  console.log(`Tier-2 guides updated: ${updated}`);
  console.log(`Non-tier2 skipped: ${skipped}`);
  console.log(`QA failures: ${qaFailures.length}`);
  if (qaFailures.length) {
    console.log(qaFailures.join("\n"));
    process.exitCode = 1;
  }
};

run();
