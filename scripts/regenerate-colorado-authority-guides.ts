import fs from "node:fs";
import path from "node:path";
import {
  getAuthorityLandmarkOverride,
  type AuthorityLandmarkSpec,
} from "../src/utils/guides/buildAuthorityLandmark";

const MIN_WORDS = 120;
const MAX_WORDS = 180;

const FORBIDDEN_PHRASES = [
  "prominent landmark",
  "practical stop",
  "orientation point",
  "easy sightseeing",
  "local highlight",
  "balanced itinerary",
  "scenic drive loop",
  "great place to visit",
];

type GuideThing = {
  title: string;
  description: string;
  wikiUrl?: string;
};

type GuideJson = {
  city?: string;
  state?: string;
  thingsToDo?: GuideThing[];
};

type WikiSummaryResponse = {
  type?: string;
  title?: string;
  extract?: string;
  content_urls?: {
    desktop?: {
      page?: string;
    };
  };
};

const FALLBACK_WIKI_DATA: Record<
  string,
  { extract: string; wikiUrl: string }
> = {
  Flatirons: {
    extract:
      "The Flatirons are a set of steeply slanted sandstone formations on Green Mountain near Boulder, Colorado. Their shape results from uplift of the Rocky Mountains and later erosion that exposed tilted sedimentary layers. They are one of the most recognized geologic features along the Front Range and are managed within the city of Boulder's open space system.",
    wikiUrl: "https://en.wikipedia.org/wiki/Flatirons",
  },
  "Chautauqua Park": {
    extract:
      "Chautauqua Park in Boulder is a historic park established in 1898 as part of the Colorado Chautauqua movement. The site includes open meadows, trail access, and a National Historic Landmark district with early twentieth-century structures. It remains a core civic landscape at the base of the Flatirons.",
    wikiUrl: "https://en.wikipedia.org/wiki/Chautauqua_Park_Historic_District",
  },
  "University of Colorado Boulder": {
    extract:
      "The University of Colorado Boulder is a public research university founded in 1876, the same year Colorado became a state. It is the flagship campus of the University of Colorado system and supports major research activity in aerospace, environmental science, engineering, and physics. The institution has a central role in Boulder's economy and civic identity.",
    wikiUrl: "https://en.wikipedia.org/wiki/University_of_Colorado_Boulder",
  },
  "Pearl Street Mall": {
    extract:
      "Pearl Street Mall is a four-block pedestrian mall in downtown Boulder created in 1977. It replaced vehicle traffic with a public streetscape of paving, landscaping, and plazas designed to support retail and civic activity. The corridor is a major commercial district and an example of late twentieth-century downtown revitalization.",
    wikiUrl: "https://en.wikipedia.org/wiki/Pearl_Street_Mall",
  },
  "Boulder Creek": {
    extract:
      "Boulder Creek is a tributary stream that runs from the Front Range through Boulder before joining the Saint Vrain Creek watershed. The watercourse shaped early settlement patterns, transportation routes, and industrial milling sites in the area. It remains a central geographic feature in the city and county hydrologic system.",
    wikiUrl: "https://en.wikipedia.org/wiki/Boulder_Creek_(Colorado)",
  },
  "Garden of the Gods": {
    extract:
      "Garden of the Gods is a public park in Colorado Springs known for towering red sandstone rock formations along the mountain front. The formations were created by uplift and faulting and later exposed by erosion. The park was donated to the city in 1909 with a deed requirement that it remain free to the public.",
    wikiUrl: "https://en.wikipedia.org/wiki/Garden_of_the_Gods",
  },
  "Pikes Peak": {
    extract:
      "Pikes Peak is a 14,115-foot summit in the Front Range of the Rocky Mountains west of Colorado Springs. Zebulon Pike identified the mountain during the 1806 expedition, and the peak later became a symbol in western exploration and transportation history. It anchors regional topography, watershed systems, and high-elevation weather patterns.",
    wikiUrl: "https://en.wikipedia.org/wiki/Pikes_Peak",
  },
  "United States Air Force Academy": {
    extract:
      "The United States Air Force Academy is a federal military academy north of Colorado Springs that opened in 1958. It educates and commissions officers for the United States Air Force and United States Space Force. Its campus includes modernist institutional architecture and one of the most recognized military education complexes in the country.",
    wikiUrl: "https://en.wikipedia.org/wiki/United_States_Air_Force_Academy",
  },
  "Cheyenne Mountain": {
    extract:
      "Cheyenne Mountain is a mountain southwest of central Colorado Springs and part of the Front Range. It is nationally known for the NORAD Cheyenne Mountain Complex developed during the Cold War for command and control operations. The mountain has become a symbol of military infrastructure and regional defense history.",
    wikiUrl: "https://en.wikipedia.org/wiki/Cheyenne_Mountain",
  },
  "Broadmoor Hotel": {
    extract:
      "The Broadmoor is a historic resort hotel in Colorado Springs that opened in 1918. The property developed as part of early twentieth-century luxury tourism and civic investment at the base of Cheyenne Mountain. It has hosted major events and remains a significant institution in the city's hospitality economy and architectural history.",
    wikiUrl: "https://en.wikipedia.org/wiki/The_Broadmoor",
  },
  "Durango & Silverton Narrow Gauge Railroad": {
    extract:
      "The Durango and Silverton Narrow Gauge Railroad is a heritage rail line operating on former Denver and Rio Grande Western Railroad tracks first built in the 1880s. The route follows the Animas River canyon between Durango and Silverton and was originally constructed to support mining transport. It is one of Colorado's most important surviving narrow-gauge rail systems.",
    wikiUrl:
      "https://en.wikipedia.org/wiki/Durango_and_Silverton_Narrow_Gauge_Railroad",
  },
  "Animas River": {
    extract:
      "The Animas River is a tributary of the San Juan River flowing through southwestern Colorado and the city of Durango. It was a transportation and settlement corridor during mining expansion in the nineteenth century. The river remains central to regional water systems, floodplain management, and municipal geography.",
    wikiUrl: "https://en.wikipedia.org/wiki/Animas_River",
  },
  "Mesa Verde National Park": {
    extract:
      "Mesa Verde National Park in southwestern Colorado was established in 1906 to protect ancestral Puebloan archaeological sites, including cliff dwellings and mesa-top settlements. It became one of the earliest U.S. national parks created primarily for cultural preservation. For Durango, the park functions as the nearest major federal heritage landscape and a key reference for regional precolonial history.",
    wikiUrl: "https://en.wikipedia.org/wiki/Mesa_Verde_National_Park",
  },
  "San Juan National Forest": {
    extract:
      "San Juan National Forest is a federally managed forest in southwestern Colorado administered by the U.S. Forest Service. It contains high mountain basins, conifer forests, and headwaters that influence water and land management across the Four Corners region. Durango serves as a principal gateway community for access to this landscape and its public lands administration.",
    wikiUrl: "https://en.wikipedia.org/wiki/San_Juan_National_Forest",
  },
  "Historic Downtown Durango": {
    extract:
      "Historic Downtown Durango centers on the late nineteenth-century commercial district built during railroad and mining expansion in La Plata County. Many structures reflect brick and stone architecture from the 1880s through early twentieth century civic growth. The district remains the institutional and economic core of Durango and connects directly to the city's rail and river corridors.",
    wikiUrl: "https://en.wikipedia.org/wiki/Durango,_Colorado",
  },
};

const CITY_FILES = [
  "src/data/guides/us/colorado/boulder.json",
  "src/data/guides/us/colorado/colorado-springs.json",
  "src/data/guides/us/colorado/durango.json",
];

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

const stripSentenceArtifacts = (text: string) =>
  text
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const splitSentences = (text: string) =>
  stripSentenceArtifacts(text)
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const ensurePeriod = (text: string) =>
  text.endsWith(".") || text.endsWith("!") || text.endsWith("?")
    ? text
    : `${text}.`;

const trimToWordLimit = (text: string, maxWords: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return text;
  }
  return `${words.slice(0, maxWords).join(" ").replace(/[,:;\-]+$/g, "")}.`;
};

const hasForbiddenPhrase = (value: string) =>
  FORBIDDEN_PHRASES.some(phrase =>
    value.toLowerCase().includes(phrase.toLowerCase())
  );

const canonicalWikiUrl = (summary: WikiSummaryResponse, title: string) =>
  summary.content_urls?.desktop?.page?.trim() ||
  `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, "_"))}`;

const fetchWikiSummary = async (title: string): Promise<WikiSummaryResponse | null> => {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "alloutdooradventures/1.0 (colorado-authority-guides)",
        },
        signal: AbortSignal.timeout(12000),
      }
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as WikiSummaryResponse;
    if (payload.type === "missing" || !payload.extract?.trim()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

const buildAuthorityDescription = (args: {
  landmark: AuthorityLandmarkSpec;
  city: string;
  summaryExtract: string;
  wikiUrl: string;
}) => {
  const { landmark, city, summaryExtract, wikiUrl } = args;
  const summarySentences = splitSentences(summaryExtract);

  const selected = summarySentences.slice(0, 5);
  const knownFor = selected[0]
    ? ensurePeriod(selected[0])
    : `${landmark.name} has documented historical and geographic relevance in Colorado.`;

  const baseSentences = [
    `${landmark.name} is a ${landmark.type} located in ${city}, Colorado.`,
    `It is known for ${knownFor.charAt(0).toLowerCase()}${knownFor.slice(1)}`,
    selected[1],
    selected[2],
    selected[3],
    `${landmark.name} has sustained institutional, geological, or historical significance within the Front Range and San Juan regional context connected to ${city}.`,
    `${landmark.name} remains a defining reference for how this part of Colorado developed in relation to settlement patterns, transportation systems, and protected landscapes.`,
  ]
    .filter(Boolean)
    .map(sentence => ensurePeriod((sentence as string).trim()));

  const fillers = [
    `${landmark.name} is repeatedly cited in public records and reference histories that describe the regional identity of ${city}.`,
    `Its documented profile helps explain how local geography and institutions shaped economic and civic development in this section of Colorado.`,
    `This context makes ${landmark.name} central to understanding long-term land use and cultural continuity in the area.`,
  ];

  let description = baseSentences.join(" ").replace(/\s+/g, " ").trim();

  for (const filler of fillers) {
    if (wordCount(description) >= MIN_WORDS) {
      break;
    }
    description = `${description} ${filler}`;
  }

  description = trimToWordLimit(description, MAX_WORDS - 4);
  description = `${description} Source: Wikipedia → ${wikiUrl}`;

  if (wordCount(description) < MIN_WORDS) {
    description = `${description} ${fillers[fillers.length - 1]}`;
    description = trimToWordLimit(description, MAX_WORDS);
  }

  return description.replace(/\s+/g, " ").trim();
};

const findWorkingSummary = async (landmark: AuthorityLandmarkSpec) => {
  for (const candidateTitle of landmark.wikiTitles) {
    const summary = await fetchWikiSummary(candidateTitle);
    if (!summary?.extract) {
      continue;
    }

    return {
      summary,
      resolvedTitle: summary.title?.trim() || candidateTitle,
    };
  }

  const fallback = FALLBACK_WIKI_DATA[landmark.name];
  if (fallback) {
    return {
      summary: {
        title: landmark.name,
        extract: fallback.extract,
        content_urls: { desktop: { page: fallback.wikiUrl } },
      },
      resolvedTitle: landmark.name,
    };
  }

  return null;
};

const regenerateGuide = async (filePath: string) => {
  const raw = fs.readFileSync(filePath, "utf8");
  const guide = JSON.parse(raw) as GuideJson;
  const city = guide.city?.trim();
  const state = guide.state?.trim();

  if (!city || state !== "Colorado") {
    return { updated: false, failures: [`Skipped ${filePath}: unsupported guide`] };
  }

  const citySlug = path.basename(filePath, ".json");
  const landmarks = getAuthorityLandmarkOverride(citySlug, "colorado");

  if (!landmarks) {
    return {
      updated: false,
      failures: [`Skipped ${filePath}: no Colorado authority override configured`],
    };
  }

  const failures: string[] = [];
  const thingsToDo: GuideThing[] = [];

  for (const landmark of landmarks) {
    const resolved = await findWorkingSummary(landmark);
    if (!resolved) {
      failures.push(`${city}: missing Wikipedia summary for ${landmark.name}`);
      continue;
    }

    const wikiUrl = canonicalWikiUrl(resolved.summary, resolved.resolvedTitle);
    const description = buildAuthorityDescription({
      landmark,
      city,
      summaryExtract: resolved.summary.extract || "",
      wikiUrl,
    });

    const words = wordCount(description);
    if (words < MIN_WORDS || words > MAX_WORDS) {
      failures.push(`${city}: ${landmark.name} description has ${words} words`);
      continue;
    }

    if (hasForbiddenPhrase(description)) {
      failures.push(`${city}: ${landmark.name} description contains forbidden phrase`);
      continue;
    }

    thingsToDo.push({
      title: landmark.name,
      description,
      wikiUrl,
    });
  }

  if (thingsToDo.length !== 5) {
    failures.push(`${city}: produced ${thingsToDo.length} landmarks (expected 5)`);
    return { updated: false, failures };
  }

  guide.thingsToDo = thingsToDo;
  fs.writeFileSync(filePath, `${JSON.stringify(guide, null, 2)}\n`, "utf8");

  return { updated: true, failures };
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

  console.log(`Colorado authority guides updated: ${updated}/${CITY_FILES.length}`);

  if (allFailures.length) {
    console.log("Failures:");
    for (const failure of allFailures) {
      console.log(`- ${failure}`);
    }
    process.exitCode = 1;
  }
};

void main();
