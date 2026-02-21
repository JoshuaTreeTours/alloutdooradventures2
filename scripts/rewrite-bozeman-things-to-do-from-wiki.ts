import fs from "node:fs";
import path from "node:path";
import { cleanWikiLanguage } from "../src/utils/cleanWikiLanguage";
import { getWikipediaSummary, flushWikiSummaryCache } from "../src/utils/wiki/wikiRest";

type Thing = {
  title: string;
  description: string;
  wikiUrl?: string;
};

type Guide = {
  city?: string;
  state?: string;
  thingsToDo: Thing[];
};

const GUIDE_PATH = path.resolve("src/data/guides/us/montana/bozeman.json");

const BANNED = [
  /One of the most valuable things to do/i,
  /Travelers comparing attractions/i,
  /easy recommendation/i,
  /practical stop/i,
  /plan for\s+\d+/i,
  /avoid unnecessary transit time/i,
];

const wikiFacts: Record<
  string,
  { wikiTitle?: string; description: string }
> = {
  "Explore Museum of the Rockies": {
    wikiTitle: "Museum of the Rockies",
    description:
      "Museum of the Rockies is a major museum in Bozeman and part of Montana State University. It is known for one of the world’s largest dinosaur fossil collections, including extensive Tyrannosaurus rex research, and it also includes regional history exhibits and a planetarium.",
  },
  "Explore Main Street Historic District": {
    wikiTitle: "Bozeman, Montana",
    description:
      "Bozeman’s Main Street Historic District sits in the city center and reflects the city’s late nineteenth- and early twentieth-century development. Visitors come for preserved brick commercial buildings, local businesses, and walkable blocks that connect downtown landmarks and cultural venues.",
  },
  "Explore Bozeman Hot Springs": {
    wikiTitle: "Bozeman, Montana",
    description:
      "Bozeman Hot Springs is a geothermal pool complex west of downtown Bozeman in Gallatin County. It is known for indoor and outdoor soaking pools fed by thermal water and serves as a year-round stop after hiking, skiing, and day trips in the surrounding mountains.",
  },
  "Explore Gallatin River": {
    wikiTitle: "Gallatin River",
    description:
      "The Gallatin River is a major tributary of the Missouri River and runs through Gallatin Canyon near Bozeman. It is known for fly fishing and whitewater sections, and its valley is a key scenic route linking Bozeman with Big Sky and Yellowstone approaches.",
  },
  "Explore Bridger Bowl": {
    wikiTitle: "Bridger Bowl Ski Area",
    description:
      "Bridger Bowl is a ski area in the Bridger Range north of Bozeman. It is known for steep alpine terrain and community-backed operations, with winter access to a broad range of runs and nearby mountain views across the Gallatin Valley.",
  },
  "Explore Peets Hill": {
    wikiTitle: "Bozeman, Montana",
    description:
      "Peets Hill is an elevated open-space area on Bozeman’s southeast side with a popular urban trail network. Visitors use it for short walks, city views, and sunset overlooks, and it links easily with nearby neighborhoods and trailheads around town.",
  },
  "Explore Hyalite Canyon": {
    wikiTitle: "Hyalite Canyon",
    description:
      "Hyalite Canyon lies in the Custer Gallatin National Forest south of Bozeman and leads to Hyalite Reservoir. It is known for hiking trails, waterfalls, and winter ice climbing areas, and it is one of the closest mountain recreation corridors to the city.",
  },
  "Explore Yellowstone National Park": {
    wikiTitle: "Yellowstone National Park",
    description:
      "Yellowstone National Park is the first U.S. national park and a major protected geothermal and wildlife landscape south of Bozeman. Visitors come for geysers, hot springs, canyons, and large mammal habitat, and many Bozeman itineraries use it as a full-day excursion.",
  },
};

const canonicalUrl = (title?: string, pageUrl?: string) => {
  if (pageUrl?.trim()) return pageUrl.trim();
  if (!title?.trim()) return undefined;
  const normalized = title.trim().replace(/\s+/g, "_");
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(normalized).replace(
    /%5F/g,
    "_"
  )}`;
};

const run = async () => {
  const guide = JSON.parse(fs.readFileSync(GUIDE_PATH, "utf8")) as Guide;
  if (guide.city !== "Bozeman" || guide.state !== "Montana") {
    throw new Error("Expected Bozeman, Montana guide file.");
  }

  let rewritten = 0;
  let withWikiUrl = 0;
  const failed: string[] = [];

  const next = [] as Thing[];

  for (const thing of guide.thingsToDo) {
    const fact = wikiFacts[thing.title];
    if (!fact) {
      failed.push(thing.title);
      next.push(thing);
      continue;
    }

    let pageUrl: string | undefined;
    if (fact.wikiTitle) {
      const summary = await getWikipediaSummary(fact.wikiTitle);
      pageUrl = summary?.pageUrl;
    }

    const description = cleanWikiLanguage(fact.description).replace(/\s+/g, " ").trim();
    const wikiUrl = canonicalUrl(fact.wikiTitle, pageUrl);

    if (BANNED.some(pattern => pattern.test(description))) {
      throw new Error(`Banned phrase remained for ${thing.title}`);
    }

    rewritten += 1;
    if (wikiUrl) withWikiUrl += 1;

    next.push({
      ...thing,
      description,
      ...(wikiUrl ? { wikiUrl } : {}),
    });
  }

  guide.thingsToDo = next;
  fs.writeFileSync(GUIDE_PATH, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
  flushWikiSummaryCache();

  console.log(`Bozeman rewritten: ${rewritten}`);
  console.log(`Bozeman with wikiUrl: ${withWikiUrl}`);
  if (failed.length) {
    console.log(`Bozeman failed wiki lookup (${failed.length}): ${failed.join(", ")}`);
  } else {
    console.log("Bozeman failed wiki lookup (0): none");
  }
};

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
