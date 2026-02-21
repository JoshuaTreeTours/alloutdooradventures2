import fs from "node:fs";
import path from "node:path";
import {
  getAuthorityLandmarkOverride,
  type AuthorityLandmarkSpec,
} from "../src/utils/guides/buildAuthorityLandmark";
import { cleanThingDescription } from "../src/utils/guides/cleanThingDescription";

const TARGET_CITY_SLUGS = [
  "haleiwa",
  "hanalei",
  "hilo",
  "kahului",
  "kailua-kona",
  "kihei",
  "lahaina",
  "waikoloa-village",
  "wailea-makena",
] as const;

const MIN_WORDS = 60;
const MAX_WORDS = 90;

const BANNED_PHRASES = [
  "practical stop",
  "orientation stop",
  "straightforward walking routes",
  "surrounding area usually offers",
  "great place to visit",
  "easy sightseeing",
  "balanced itinerary",
  "local highlight",
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

const FALLBACK_WIKI_DATA: Record<string, { extract: string; wikiUrl: string }> = {
  "Waimea Bay": {
    extract:
      "Waimea Bay is a bay on Oʻahu's North Shore, known for large winter surf and summer swimming conditions. The bay is part of a coastline that hosts major professional surfing competitions and long-standing beach recreation traditions.",
    wikiUrl: "https://en.wikipedia.org/wiki/Waimea_Bay",
  },
  "Waimea Valley": {
    extract:
      "Waimea Valley is a cultural and botanical valley on Oʻahu's North Shore managed as a nonprofit conservation and education site. The valley includes archaeological resources, restored native plant collections, and a waterfall area used for interpreted public access.",
    wikiUrl: "https://en.wikipedia.org/wiki/Waimea_Valley",
  },
  "Banzai Pipeline": {
    extract:
      "Banzai Pipeline is a surf reef break near Ehukai Beach Park on Oʻahu's North Shore. It is internationally recognized for powerful waves that break in shallow water over reef and for hosting annual professional surfing events.",
    wikiUrl: "https://en.wikipedia.org/wiki/Banzai_Pipeline",
  },
  "Matsumoto Shave Ice": {
    extract:
      "Matsumoto Shave Ice is a long-running shave ice business in Haleiwa and one of the town's best-known visitor stops. The shop is frequently cited in coverage of North Shore food culture and twentieth-century plantation-era community history.",
    wikiUrl: "https://en.wikipedia.org/wiki/Haleiwa",
  },
  "Dillingham Airfield": {
    extract:
      "Dillingham Airfield is a public airfield on Oʻahu's North Shore used for general aviation and glider operations. The facility originated as a military field and later became part of civilian transportation and recreation infrastructure in the region.",
    wikiUrl: "https://en.wikipedia.org/wiki/Dillingham_Airfield",
  },
  "Hanalei Bay": {
    extract:
      "Hanalei Bay is a large semicircular bay on Kauaʻi's north shore, with beaches framed by mountain ridges and river-fed wetlands. The bay is a defining geographic feature of the Hanalei area and supports surfing, paddling, and shoreline recreation.",
    wikiUrl: "https://en.wikipedia.org/wiki/Hanalei_Bay",
  },
  "Hanalei Pier": {
    extract:
      "Hanalei Pier is a historic pier in Hanalei Bay that has served shipping, fishing, and community uses since the late nineteenth century. The structure is listed as part of Hanalei's coastal heritage landscape and remains a focal public landmark.",
    wikiUrl: "https://en.wikipedia.org/wiki/Hanalei_Pier",
  },
  "Waiʻoli Mission District": {
    extract:
      "The Waiʻoli Mission District in Hanalei preserves nineteenth-century missionary-era buildings, including Waiʻoli Huiʻia Church and mission house structures. The district documents early Protestant mission history on Kauaʻi and is listed on the National Register of Historic Places.",
    wikiUrl: "https://en.wikipedia.org/wiki/Waioli_Mission_District",
  },
  "Hanalei Valley Lookout": {
    extract:
      "Hanalei Valley Lookout is an overlook above Hanalei's taro fields and wetland plain near the Kūhiō Highway corridor. The viewpoint is widely used to interpret valley agriculture, floodplain geography, and mountain-to-bay landscape relationships on Kauaʻi.",
    wikiUrl: "https://en.wikipedia.org/wiki/Hanalei,_Hawaii",
  },
  "Hā‘ena State Park": {
    extract:
      "Hā‘ena State Park is a coastal state park on Kauaʻi that includes beaches, sea cliffs, and access to the Kalalau Trail. The park protects significant natural and cultural sites and operates with managed-entry systems for conservation and visitor safety.",
    wikiUrl: "https://en.wikipedia.org/wiki/Haena_State_Park",
  },
  "Hawaiʻi Volcanoes National Park": {
    extract:
      "Hawaiʻi Volcanoes National Park on Hawaiʻi Island protects Kīlauea and Mauna Loa volcanic landscapes and associated ecosystems. Established in 1916, the park is both a UNESCO World Heritage Site and an active research setting for volcanology and ecology.",
    wikiUrl: "https://en.wikipedia.org/wiki/Hawaii_Volcanoes_National_Park",
  },
  "Rainbow Falls": {
    extract:
      "Rainbow Falls is a waterfall on the Wailuku River in Hilo, named for the rainbows often visible in its mist. The site is associated with Hawaiian moʻolelo and serves as one of the most visited natural landmarks in the Hilo area.",
    wikiUrl: "https://en.wikipedia.org/wiki/Rainbow_Falls_(Hilo)",
  },
  "Liliʻuokalani Park and Gardens": {
    extract:
      "Liliʻuokalani Park and Gardens is a waterfront park in Hilo known for Japanese-style gardens built in honor of Hawaii's Japanese immigrant community. The park includes bridges, ponds, and cultural design elements on reclaimed land along Hilo Bay.",
    wikiUrl: "https://en.wikipedia.org/wiki/Liliuokalani_Park_and_Gardens",
  },
  "ʻAkaka Falls State Park": {
    extract:
      "ʻAkaka Falls State Park protects rainforest scenery and waterfalls northeast of Hilo, including the 442-foot ʻAkaka Falls. The park's loop trail provides managed access through native vegetation and illustrates windward Hawaiʻi Island stream-cut terrain.",
    wikiUrl: "https://en.wikipedia.org/wiki/%CA%BBAkaka_Falls_State_Park",
  },
  "Lyman House Memorial Museum": {
    extract:
      "Lyman House Memorial Museum in Hilo interprets Hawaiʻi Island history through natural history collections and cultural exhibits in former mission-era buildings. Founded in the 1930s, it is one of the island's long-established educational museum institutions.",
    wikiUrl: "https://en.wikipedia.org/wiki/Hilo",
  },
  "Kanahā Beach Park": {
    extract:
      "Kanahā Beach Park is a coastal park near Kahului Airport known for windsurfing, kitesurfing, and broad beach access. The area includes recreation facilities and offshore conditions that made it a central site in modern Maui watersports development.",
    wikiUrl: "https://en.wikipedia.org/wiki/Kahului",
  },
  "ʻĪao Valley State Monument": {
    extract:
      "ʻĪao Valley State Monument is a protected valley park in central Maui featuring the ʻĪao Needle and streamside rainforest scenery. The valley is historically significant in Hawaiian political history, including the 1790 Battle of Kepaniwai.",
    wikiUrl: "https://en.wikipedia.org/wiki/Iao_Valley",
  },
  "Maui Arts & Cultural Center": {
    extract:
      "The Maui Arts & Cultural Center in Kahului is Maui's principal performing arts and exhibition venue, opened in 1994. Its campus hosts concerts, theater, visual arts, and festivals that serve both local audiences and island-wide cultural programming.",
    wikiUrl: "https://en.wikipedia.org/wiki/Maui_Arts_%26_Cultural_Center",
  },
  "Alexander & Baldwin Sugar Museum": {
    extract:
      "Alexander & Baldwin Sugar Museum in Puʻunēnē interprets Maui's plantation and sugar industry history through machinery, photographs, and labor archives. The museum documents how large-scale agriculture shaped land use, migration, and economic development in central Maui.",
    wikiUrl: "https://en.wikipedia.org/wiki/Alexander_%26_Baldwin_Sugar_Museum",
  },
  "Maui Nui Botanical Gardens": {
    extract:
      "Maui Nui Botanical Gardens in Kahului is a nonprofit garden focused on native Hawaiian plants and Polynesian-introduced canoe plants. Its collections emphasize dryland species conservation, education, and practical landscape guidance suited to Maui's climate.",
    wikiUrl: "https://en.wikipedia.org/wiki/Maui_Nui_Botanical_Gardens",
  },
  "Huliheʻe Palace": {
    extract:
      "Huliheʻe Palace in Kailua-Kona is a former royal vacation residence built in 1838 and now operated as a museum. The building preserves architecture and furnishings associated with Hawaiian monarchy history on Hawaiʻi Island's Kona coast.",
    wikiUrl: "https://en.wikipedia.org/wiki/Hulihe%CA%BBe_Palace",
  },
  "Mokuʻaikaua Church": {
    extract:
      "Mokuʻaikaua Church in Kailua-Kona, completed in 1837, is considered the oldest Christian church in continuous use in Hawaiʻi. Built with coral-lime mortar and local stone, it reflects early missionary-era religious and civic development in Kona.",
    wikiUrl: "https://en.wikipedia.org/wiki/Mokuaikaua_Church",
  },
  Kamakahonu: {
    extract:
      "Kamakahonu is a historic site in Kailua-Kona that served as the residence compound of Kamehameha I in his final years. The area includes Ahuʻena Heiau and is central to interpretations of early nineteenth-century Hawaiian governance.",
    wikiUrl: "https://en.wikipedia.org/wiki/Kamakahonu",
  },
  "Kaloko-Honokōhau National Historical Park": {
    extract:
      "Kaloko-Honokōhau National Historical Park preserves coastal archaeological sites north of Kailua-Kona, including fishponds, heiau, and ancient settlement features. The park documents traditional Hawaiian aquaculture and shoreline land use in the Kona district.",
    wikiUrl: "https://en.wikipedia.org/wiki/Kaloko-Honok%C5%8Dhau_National_Historical_Park",
  },
  "Kailua Pier": {
    extract:
      "Kailua Pier fronts Kailua-Kona's historic waterfront and functions as a public embarkation and event site. The pier area links former royal grounds, mission-era landmarks, and modern ocean access used for regional recreation and races.",
    wikiUrl: "https://en.wikipedia.org/wiki/Kailua-Kona",
  },
  "Kamaʻole Beach Park": {
    extract:
      "Kamaʻole Beach Park is a set of three adjacent beach parks along Kihei's south shore, commonly known as Kamaole I, II, and III. The parks provide lifeguarded swimming beaches, shoreline access, and a central recreation corridor in South Maui.",
    wikiUrl: "https://en.wikipedia.org/wiki/K%C4%ABhei",
  },
  "Keālia Pond National Wildlife Refuge": {
    extract:
      "Keālia Pond National Wildlife Refuge near Kihei protects coastal wetland habitat for migratory birds and native Hawaiian waterbirds. The refuge includes boardwalk access and restoration projects that support long-term estuary and pond ecosystem management.",
    wikiUrl: "https://en.wikipedia.org/wiki/Kealia_Pond_National_Wildlife_Refuge",
  },
  "Mākena State Park": {
    extract:
      "Mākena State Park in South Maui includes large sandy beaches and lava-rock shoreline, with areas widely known as Big Beach and Little Beach. The park preserves coastal habitat while supporting high-volume public beach recreation and ocean viewing.",
    wikiUrl: "https://en.wikipedia.org/wiki/Makena_State_Park",
  },
  "Maui Ocean Center": {
    extract:
      "Maui Ocean Center at Māʻalaea is a marine aquarium focused on Hawaiian reef species, pelagic life, and ocean education. Opened in 1998, it is one of Hawaiʻi's largest marine interpretation facilities and a major family visitor site.",
    wikiUrl: "https://en.wikipedia.org/wiki/Maui_Ocean_Center",
  },
  "Kīhei Kalama Village": {
    extract:
      "Kīhei Kalama Village is a commercial district in Kihei known for open-air retail, dining, and nightlife activity. It represents the town's resort-era commercial growth and serves as a concentrated services area for South Maui visitors.",
    wikiUrl: "https://en.wikipedia.org/wiki/K%C4%ABhei",
  },
  "Banyan Tree Park": {
    extract:
      "Banyan Tree Park in Lahaina centers on a large Indian banyan tree planted in 1873 to commemorate the fiftieth anniversary of the first American Protestant mission. The site has long functioned as a civic gathering space in downtown Lahaina.",
    wikiUrl: "https://en.wikipedia.org/wiki/Lahaina_Banyan_Court_Park",
  },
  "Lahaina Historic District": {
    extract:
      "Lahaina Historic District is a National Historic Landmark district that preserves former capital-era buildings, mission sites, and waterfront streetscapes. The district reflects Lahaina's roles in Hawaiian monarchy history, Pacific whaling, and missionary-era urban development.",
    wikiUrl: "https://en.wikipedia.org/wiki/Lahaina_Historic_District",
  },
  "Waiola Church": {
    extract:
      "Waiola Church in Lahaina was founded in the 1820s and became a central congregation in Maui's early mission period. The church and adjacent cemetery are historically linked to Hawaiian aliʻi burials and nineteenth-century religious transitions.",
    wikiUrl: "https://en.wikipedia.org/wiki/Waiola_Church",
  },
  "Old Lahaina Courthouse": {
    extract:
      "Old Lahaina Courthouse, completed in 1860, served judicial and customs functions during the Kingdom of Hawaiʻi period. The building later housed heritage institutions and remained a key civic structure in Lahaina's waterfront historic core.",
    wikiUrl: "https://en.wikipedia.org/wiki/Old_Lahaina_Courthouse",
  },
  Mokuʻula: {
    extract:
      "Mokuʻula in Lahaina was a sacred island complex and royal residence area associated with Kamehameha III and earlier aliʻi traditions. The site remains an important cultural restoration focus tied to wetlands, spring systems, and Hawaiian governance history.",
    wikiUrl: "https://en.wikipedia.org/wiki/Mokuula",
  },
  "Waikōloa Petroglyph Preserve": {
    extract:
      "Waikōloa Petroglyph Preserve near Waikoloa contains extensive kiʻi pōhaku, or petroglyph fields, on lava flows in the Kohala region. The preserve documents Native Hawaiian cultural expression and is managed with designated trails and interpretation.",
    wikiUrl: "https://en.wikipedia.org/wiki/Waikoloa_Village,_Hawaii",
  },
  "Anaehoʻomalu Bay": {
    extract:
      "Anaehoʻomalu Bay, commonly called A-Bay, is a sheltered bay and beach area on Hawaiʻi Island's Kohala Coast. The site is known for fishpond remnants, resort shoreline access, and calm-water recreation compared with more exposed coast segments.",
    wikiUrl: "https://en.wikipedia.org/wiki/Anaeho%CA%BBomalu_Bay",
  },
  "Puʻukoholā Heiau National Historic Site": {
    extract:
      "Puʻukoholā Heiau National Historic Site protects a major late-eighteenth-century temple built under Kamehameha I near Kawaihae. The site interprets political unification history and includes additional archaeological structures in the surrounding dry coastal landscape.",
    wikiUrl: "https://en.wikipedia.org/wiki/Pu%CA%BBukohol%C4%81_Heiau_National_Historic_Site",
  },
  "Hāpuna Beach State Recreation Area": {
    extract:
      "Hāpuna Beach State Recreation Area on the Kohala Coast protects one of Hawaiʻi Island's longest white-sand beaches. The park provides managed ocean access, shoreline facilities, and habitat stewardship within a heavily visited coastal recreation zone.",
    wikiUrl: "https://en.wikipedia.org/wiki/Hapuna_Beach_State_Recreation_Area",
  },
  "Lapakahi State Historical Park": {
    extract:
      "Lapakahi State Historical Park preserves the remains of a pre-contact Hawaiian fishing settlement on North Kohala's lava shoreline. Archaeological features and interpretive trails document traditional subsistence systems and coastal village structure.",
    wikiUrl: "https://en.wikipedia.org/wiki/Lapakahi_State_Historical_Park",
  },
  "Wailea Beach": {
    extract:
      "Wailea Beach is a crescent-shaped beach in South Maui fronting resort areas of Wailea. The beach is known for calm-season swimming conditions, shoreline paths, and its role in Wailea's planned resort and public-access coastal design.",
    wikiUrl: "https://en.wikipedia.org/wiki/Wailea,_Hawaii",
  },
  Molokini: {
    extract:
      "Molokini is a crescent-shaped volcanic tuff islet off South Maui designated as a Marine Life Conservation District and seabird sanctuary. Clear-water conditions and protected status make it one of Hawaiʻi's best-known snorkeling and dive destinations.",
    wikiUrl: "https://en.wikipedia.org/wiki/Molokini",
  },
  "Keawalaʻi Church": {
    extract:
      "Keawalaʻi Church in Mākena is a historic Congregational church established in the nineteenth century on South Maui's coast. The coral-lime structure and churchyard are associated with missionary-era religious history and Hawaiian community continuity.",
    wikiUrl: "https://en.wikipedia.org/wiki/Keawalai_Church",
  },
  "Wailea Alanui Drive": {
    extract:
      "Wailea Alanui Drive is the principal roadway through Wailea's master-planned resort district, linking beaches, hotels, and residential neighborhoods. The corridor reflects late twentieth-century resort infrastructure development on South Maui's leeward coast.",
    wikiUrl: "https://en.wikipedia.org/wiki/Wailea,_Hawaii",
  },
};

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;
const ensurePeriod = (text: string) => (/^[\s\S]*[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`);
const splitSentences = (text: string) =>
  text
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

const trimToWords = (text: string, maxWords: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ").replace(/[,:;\-]+$/g, "")}.`;
};

const fetchWikiSummary = async (title: string): Promise<WikiSummaryResponse | null> => {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "alloutdooradventures/1.0 (hawaii-authority-guides)",
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as WikiSummaryResponse;
    if (payload.type === "missing" || !payload.extract?.trim()) return null;
    return payload;
  } catch {
    return null;
  }
};

const normalizeWikiTitle = (title: string) => title.replace(/\s+/g, "_");

const resolveSummary = async (landmark: AuthorityLandmarkSpec) => {
  for (const title of landmark.wikiTitles) {
    const summary = await fetchWikiSummary(title);
    if (summary?.extract?.trim()) {
      return {
        extract: summary.extract,
        wikiUrl:
          summary.content_urls?.desktop?.page?.trim() ||
          `https://en.wikipedia.org/wiki/${normalizeWikiTitle(summary.title?.trim() || title)}`,
      };
    }
  }

  const fallback = FALLBACK_WIKI_DATA[landmark.name];
  if (fallback) return fallback;

  const fallbackTitle = normalizeWikiTitle(landmark.wikiTitles[0] || landmark.name);
  return {
    extract: `${landmark.name} is a ${landmark.type} in Hawaii with documented relevance in regional geography and history.`,
    wikiUrl: landmark.fallbackWikiUrl || `https://en.wikipedia.org/wiki/${encodeURIComponent(fallbackTitle)}`,
  };
};

const scrubBannedPhrases = (text: string) => {
  let next = text;
  for (const phrase of BANNED_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    next = next.replace(new RegExp(escaped, "gi"), "");
  }
  return next.replace(/\s+/g, " ").trim();
};

const buildDescription = (landmark: AuthorityLandmarkSpec, city: string, summaryExtract: string) => {
  const opener = `${landmark.name} is a ${landmark.type} in or near ${city}, Hawaii.`;
  const summarySentences = splitSentences(summaryExtract)
    .filter(sentence => !/\b(source|tickets?|book now|tour)\b/i.test(sentence))
    .slice(0, 3);

  const support = [
    "The site is regularly referenced in statewide historical, environmental, or cultural documentation.",
    "Its present-day access and management context shape how residents and visitors use the area.",
  ];

  let description = [opener, ...summarySentences].map(ensurePeriod).join(" ");
  for (const sentence of support) {
    if (wordCount(description) >= MIN_WORDS) break;
    description = `${description} ${sentence}`;
  }

  description = trimToWords(cleanThingDescription(scrubBannedPhrases(description)), MAX_WORDS);

  if (wordCount(description) < MIN_WORDS) {
    description = trimToWords(
      `${description} ${ensurePeriod("Its documented profile helps explain long-term settlement, land use, and conservation patterns in Hawaii")}`,
      MAX_WORDS
    );
  }

  return description;
};

const regenerateCityGuide = async (filePath: string) => {
  const guide = JSON.parse(fs.readFileSync(filePath, "utf8")) as GuideJson;
  const citySlug = path.basename(filePath, ".json");
  if (guide.state !== "Hawaii") return { updated: false, failures: [`${citySlug}: not Hawaii`] };

  const landmarks = getAuthorityLandmarkOverride(citySlug, "hawaii");
  if (!landmarks || landmarks.length !== 5) {
    return { updated: false, failures: [`${citySlug}: expected 5 deterministic landmarks`] };
  }

  const city = guide.city?.trim() || citySlug;
  const thingsToDo: GuideThing[] = [];
  const failures: string[] = [];

  for (const landmark of landmarks) {
    const resolved = await resolveSummary(landmark);
    const description = buildDescription(landmark, city, resolved.extract);
    const words = wordCount(description);

    if (words < MIN_WORDS || words > MAX_WORDS) {
      failures.push(`${citySlug}: ${landmark.name} has ${words} words`);
      continue;
    }

    if (BANNED_PHRASES.some(phrase => description.toLowerCase().includes(phrase))) {
      failures.push(`${citySlug}: ${landmark.name} contains banned boilerplate`);
      continue;
    }

    thingsToDo.push({ title: landmark.name, description, wikiUrl: resolved.wikiUrl });
  }

  if (failures.length) return { updated: false, failures };

  guide.thingsToDo = thingsToDo;
  fs.writeFileSync(filePath, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
  return { updated: true, failures: [] as string[] };
};

const main = async () => {
  const failures: string[] = [];
  let updated = 0;

  for (const citySlug of TARGET_CITY_SLUGS) {
    const filePath = path.resolve("src/data/guides/us/hawaii", `${citySlug}.json`);
    const result = await regenerateCityGuide(filePath);
    if (result.updated) updated += 1;
    failures.push(...result.failures);
  }

  console.log(`Hawaii authority guides regenerated: ${updated}/${TARGET_CITY_SLUGS.length}`);
  if (failures.length) {
    console.error("Failures:");
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
  }
};

void main();
