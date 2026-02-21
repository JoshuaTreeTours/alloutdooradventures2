import fs from "node:fs";
import path from "node:path";
import { resolveLandmarkImage } from "../src/utils/guides/resolveLandmarkImage";

const CITY_FILES = [
  "src/data/guides/us/utah/bryce-canyon-city.json",
  "src/data/guides/us/utah/hurricane.json",
  "src/data/guides/us/utah/moab.json",
  "src/data/guides/us/utah/springdale.json",
  "src/data/guides/us/utah/st-george.json",
] as const;

type GuideThing = {
  title: string;
  description: string;
  wikiUrl?: string;
  image?: string | null;
  imageUrl?: string | null;
};

type GuideJson = {
  state?: string;
  thingsToDo?: GuideThing[];
};

const toWikiTitle = (thing: GuideThing) => {
  if (thing.wikiUrl?.trim()) {
    const fromUrl = decodeURIComponent(
      thing.wikiUrl
        .trim()
        .replace(/^https?:\/\/en\.wikipedia\.org\/wiki\//i, "")
        .replace(/^\//, "")
        .split("#")[0]
    );
    if (fromUrl) {
      return fromUrl.replace(/_/g, " ");
    }
  }

  return thing.title;
};

const regenerateGuide = async (filePath: string) => {
  const raw = fs.readFileSync(filePath, "utf8");
  const guide = JSON.parse(raw) as GuideJson;
  const citySlug = path.basename(filePath, ".json");
  const stateSlug = (guide.state ?? "utah").toLowerCase().replace(/\s+/g, "-");

  if (guide.state !== "Utah") {
    return { updated: false, failures: [`Skipped ${filePath}: not a Utah guide`] };
  }

  const things = guide.thingsToDo ?? [];
  if (things.length !== 5) {
    return {
      updated: false,
      failures: [
        `${citySlug}: expected 5 landmarks before image injection, found ${things.length}`,
      ],
    };
  }

  const nextThings: GuideThing[] = [];

  for (const thing of things) {
    const wikiTitle = toWikiTitle(thing);
    const resolvedImage = await resolveLandmarkImage({
      wikiTitle,
      citySlug,
      stateSlug,
    });

    nextThings.push({
      title: thing.title,
      description: thing.description,
      wikiUrl: thing.wikiUrl,
      ...(resolvedImage ? { image: resolvedImage } : {}),
    });
  }

  guide.thingsToDo = nextThings;
  fs.writeFileSync(filePath, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
  return { updated: true, failures: [] };
};

const main = async () => {
  const allFailures: string[] = [];
  let updated = 0;

  for (const file of CITY_FILES) {
    const result = await regenerateGuide(path.resolve(file));
    if (result.updated) {
      updated += 1;
    }
    allFailures.push(...result.failures);
  }

  console.log(`Utah authority images injected: ${updated}/${CITY_FILES.length}`);

  if (allFailures.length) {
    console.log("Failures:");
    for (const failure of allFailures) {
      console.log(`- ${failure}`);
    }
    process.exitCode = 1;
  }
};

void main();
