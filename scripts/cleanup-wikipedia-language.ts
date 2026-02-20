import fs from "node:fs";
import path from "node:path";
import {
  assertGuideHasNoWikiLanguage,
  cleanGuideTextContent,
} from "../src/utils/guides/wikiLanguageGuard";

type GuideJson = {
  city?: string;
  state?: string;
  tier?: "tier1" | "tier2";
  overview?: string[];
  travelTips?: string[];
  thingsToDo?: Array<{ title?: string; description?: string }>;
  highlights?: Array<{ title?: string; description?: string }>;
  faq?: Array<{ q?: string; a?: string }>;
  aboutCity?: {
    sourceUrl?: string;
    factGroups?: Array<{ label?: string; text?: string }>;
  };
};

const ROOT = path.resolve("src/data/guides");

const walk = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(full);
    }
  }

  return files;
};

const run = () => {
  const files = walk(ROOT);
  let updated = 0;

  for (const file of files) {
    const originalRaw = fs.readFileSync(file, "utf8");
    const json = JSON.parse(originalRaw) as GuideJson;

    cleanGuideTextContent(json);
    assertGuideHasNoWikiLanguage(json, file);

    const nextRaw = `${JSON.stringify(json, null, 2)}\n`;
    if (nextRaw !== originalRaw) {
      fs.writeFileSync(file, nextRaw, "utf8");
      updated += 1;
    }
  }

  console.log(`Scanned guide files: ${files.length}`);
  console.log(`Updated guide files: ${updated}`);
};

run();
