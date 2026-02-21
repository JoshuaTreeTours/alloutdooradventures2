import fs from "node:fs";
import path from "node:path";
import { cleanWikiLanguage } from "../src/utils/cleanWikiLanguage";
import { buildWikiLandmarkDescription } from "../src/utils/guides/buildWikiLandmarkDescription";
import { assertNoBoilerplate, BANNED_PHRASES } from "../src/utils/guides/wikiNoBoilerplate";
import { fetchWikiSummary, flushWikiSummaryCache } from "../src/utils/wiki/wikiSummary";

const GUIDE_PATH = path.resolve("src/data/guides/us/california/palm-springs.json");

type Thing = {
  title: string;
  description: string;
  wikiUrl?: string;
};

type Guide = {
  city?: string;
  state?: string;
  thingsToDo: Thing[];
  thingsToDoDepth?: string;
};

const canonicalWikiUrl = (title: string) =>
  `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, "_")).replace(/%5F/g, "_")}`;

const fallbackFacts: Record<string, { wikiTitle: string; description: string }> = {
  "Palm Springs Aerial Tramway": {
    wikiTitle: "Palm Springs Aerial Tramway",
    description:
      "Palm Springs Aerial Tramway is the world’s largest rotating aerial tramway, carrying passengers from the Coachella Valley floor to Mount San Jacinto State Park. It opened in 1963 after years of engineering and financing work to create direct mountain access from Palm Springs. The ride climbs more than 8,000 vertical feet and crosses distinct climate zones from Sonoran Desert conditions to alpine forest. Its mountain station supports a state park visitor center, trail access, and winter snow conditions that contrast with the desert below. The tramway remains one of the defining infrastructure projects in the city’s tourism history.",
  },
  "Indian Canyons": {
    wikiTitle: "Indian Canyons",
    description:
      "Indian Canyons is a protected canyon system on Agua Caliente Band of Cahuilla Indians land at the south edge of Palm Springs. The area includes Palm Canyon, Andreas Canyon, and Murray Canyon, each shaped by faulted desert terrain and perennial water sources. It is historically significant as part of Cahuilla homelands and contains extensive California fan palm groves supported by spring-fed drainage. Trails follow rocky washes and narrow canyon walls, showing how water and geology formed one of the Coachella Valley’s most distinct landscapes. The canyons are central to understanding the region’s Indigenous history and desert ecology.",
  },
  "Tahquitz Canyon": {
    wikiTitle: "Tahquitz Canyon",
    description:
      "Tahquitz Canyon is a steep canyon preserve in Palm Springs managed by the Agua Caliente Band of Cahuilla Indians. It is known for a seasonal waterfall and a trail corridor that exposes layered rock formations shaped by tectonic and erosional processes. The canyon holds cultural significance in Cahuilla oral tradition, including stories connected to the spirit figure Tahquitz. Its visitor center and interpretive route focus on Native history, local plants, and the hydrology that sustains desert habitat. The site provides a compact view of how cultural heritage and geology overlap in the San Jacinto foothills.",
  },
  "Moorten Botanical Garden": {
    wikiTitle: "Moorten Botanical Garden and Cactarium",
    description:
      "Moorten Botanical Garden is a historic family-run botanical garden established in Palm Springs in 1938. The garden specializes in cacti and desert flora, with documented plant groups from the Mojave and Sonoran deserts as well as other arid regions. Its small scale reflects early twentieth-century private horticultural collections that later became public educational spaces in desert cities. The cactarium greenhouse and labeled outdoor beds make it a reference point for regional plant adaptation and water-efficient landscaping history. The site remains one of Palm Springs’ longest-operating botanical institutions.",
  },
  "Palm Springs": {
    wikiTitle: "Palm Springs, California",
    description:
      "Palm Springs is a city in Riverside County within California’s Coachella Valley, set against the San Jacinto Mountains. It developed from Native Cahuilla settlement areas into a twentieth-century resort city shaped by rail access, postwar growth, and modernist architecture. The city is geographically defined by desert climate, mountain alluvial fans, and hot mineral spring areas that influenced early tourism and health travel. It is widely associated with mid-century design, seasonal events, and entertainment history linked to greater Los Angeles. Palm Springs remains a core urban and cultural center in the inland Southern California desert.",
  },
  "Palm Springs Joshua Tree National Park": {
    wikiTitle: "Joshua Tree National Park",
    description:
      "Joshua Tree National Park lies east of Palm Springs where the Mojave and Colorado Desert ecosystems converge across protected federal land. The park’s designation evolved from national monument status to national park status in 1994, marking its ecological and geological importance. Its terrain includes granite monzogranite formations, dry washes, and broad basins that support Joshua tree habitat and high-desert biodiversity. For Palm Springs itineraries, it represents the region’s most prominent large-scale desert landscape and a key reference for conservation history in Southern California. The park’s geology and biomes explain much of the broader Coachella Valley environmental context.",
  },
};

const resolveWithWikiPipeline = async (item: Thing, city: string, state: string) => {
  const built = await buildWikiLandmarkDescription({
    landmarkName: item.title,
    cityName: city,
    stateName: state,
    existingDescriptions: [],
  });

  if (built.usedWiki && built.wikiUrl && built.description) {
    return {
      description: cleanWikiLanguage(built.description).replace(/\s+/g, " ").trim(),
      wikiUrl: built.wikiUrl,
      usedFallback: false,
    };
  }

  const fallback = fallbackFacts[item.title];
  if (!fallback) {
    return null;
  }

  const lookup = await fetchWikiSummary(fallback.wikiTitle);
  const wikiUrl = lookup.url || canonicalWikiUrl(fallback.wikiTitle);
  return {
    description: cleanWikiLanguage(fallback.description).replace(/\s+/g, " ").trim(),
    wikiUrl,
    usedFallback: true,
  };
};

const run = async () => {
  const guide = JSON.parse(fs.readFileSync(GUIDE_PATH, "utf8")) as Guide;
  if (guide.city !== "Palm Springs") {
    throw new Error("Expected Palm Springs guide file.");
  }

  let rewritten = 0;
  let withWikiUrl = 0;
  let fallbackCount = 0;
  const missing: string[] = [];

  guide.thingsToDo = await Promise.all(
    guide.thingsToDo.map(async item => {
      const result = await resolveWithWikiPipeline(item, guide.city ?? "Palm Springs", guide.state ?? "California");
      if (!result) {
        missing.push(item.title);
        return item;
      }

      assertNoBoilerplate(result.description);
      rewritten += 1;
      withWikiUrl += result.wikiUrl ? 1 : 0;
      fallbackCount += result.usedFallback ? 1 : 0;

      return {
        ...item,
        description: result.description,
        wikiUrl: result.wikiUrl,
      };
    })
  );

  guide.thingsToDoDepth = "extended";

  fs.writeFileSync(GUIDE_PATH, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
  flushWikiSummaryCache();

  console.log(`Palm Springs rewritten: ${rewritten}`);
  console.log(`Palm Springs with wikiUrl: ${withWikiUrl}`);
  console.log(`Palm Springs fallback descriptions used: ${fallbackCount}`);
  console.log(`Palm Springs banned list size: ${BANNED_PHRASES.length}`);
  if (missing.length) {
    console.log(`Palm Springs missing wiki facts (${missing.length}): ${missing.join(", ")}`);
  } else {
    console.log("Palm Springs missing wiki facts (0): none");
  }
};

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
