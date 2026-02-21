import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const CITY_FILES = [
  "haleiwa.json",
  "hanalei.json",
  "hilo.json",
  "kahului.json",
  "kailua-kona.json",
  "kihei.json",
  "lahaina.json",
  "waikoloa-village.json",
  "wailea-makena.json",
] as const;

const HONOLULU_FILE = "src/data/guides/us/hawaii/honolulu.json";

const MIN_WORDS = 60;
const MAX_WORDS = 90;

const BANNED_PHRASES = [
  "practical stop",
  "orientation stop",
  "straightforward walking routes",
  "surrounding area usually offers",
];

type GuideThing = {
  title?: string;
  description?: string;
  wikiUrl?: string;
};

type GuideJson = {
  thingsToDo?: GuideThing[];
};

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

const hashFile = (filePath: string) =>
  crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");

const failures: string[] = [];

for (const file of CITY_FILES) {
  const fullPath = path.resolve("src/data/guides/us/hawaii", file);
  const guide = JSON.parse(fs.readFileSync(fullPath, "utf8")) as GuideJson;
  const things = guide.thingsToDo ?? [];

  if (things.length !== 5) {
    failures.push(`${file}: expected 5 thingsToDo entries, found ${things.length}`);
    continue;
  }

  things.forEach((thing, index) => {
    const label = `${file}#${index + 1}`;
    if (!thing.title?.trim()) {
      failures.push(`${label}: missing title`);
    }
    if (!thing.wikiUrl?.trim()) {
      failures.push(`${label}: missing wikiUrl`);
    }
    const description = thing.description?.trim() ?? "";
    const words = countWords(description);

    if (words < MIN_WORDS || words > MAX_WORDS) {
      failures.push(`${label}: description has ${words} words`);
    }

    const lowered = description.toLowerCase();
    const banned = BANNED_PHRASES.find(phrase => lowered.includes(phrase));
    if (banned) {
      failures.push(`${label}: contains banned phrase \"${banned}\"`);
    }

    if (/source\s*:\s*wikipedia\s*https?:\/\//i.test(description)) {
      failures.push(`${label}: description contains inline source URL`);
    }
  });
}

const honoluluHash = hashFile(HONOLULU_FILE);
let honoluluChanged = false;
try {
  execSync(`git diff --quiet -- ${HONOLULU_FILE}`);
} catch {
  honoluluChanged = true;
}
if (honoluluChanged) {
  failures.push("honolulu.json has local modifications");
}
if (!honoluluHash) {
  failures.push("unable to hash honolulu.json");
}

if (failures.length) {
  console.error("Hawaii authority guide verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Hawaii authority guides verified: ${CITY_FILES.length}/${CITY_FILES.length}`);
