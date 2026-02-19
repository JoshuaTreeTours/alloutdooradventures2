import fs from "node:fs";
import path from "node:path";

export type WikiSummary = {
  title: string;
  extract: string | null;
  wikiUrl: string | null;
  pageType: string | null;
};

type SummaryResponse = {
  title?: string;
  extract?: string;
  type?: string;
  content_urls?: { desktop?: { page?: string } };
};

type CacheEntry = WikiSummary;
type CacheState = { summaries: Record<string, CacheEntry> };

const CACHE_PATH = path.resolve(".cache/wiki-summaries.json");
const USER_AGENT =
  "AllOutdoorAdventuresBot/1.0 (contact: support@alloutdooradventures.com)";


const LOCAL_WIKI_FALLBACKS: Record<string, WikiSummary> = {
  "central park": {
    title: "Central Park",
    extract:
      "Central Park is an urban park between the Upper West Side and Upper East Side of Manhattan in New York City. It was designed by Frederick Law Olmsted and Calvert Vaux and opened in 1858. The park covers 843 acres and includes the Ramble, Bethesda Terrace, the Great Lawn, and the Central Park Zoo. It is one of the most visited urban parks in the United States and a National Historic Landmark.",
    wikiUrl: "https://en.wikipedia.org/wiki/Central_Park",
    pageType: "standard",
  },
  "brooklyn bridge": {
    title: "Brooklyn Bridge",
    extract:
      "The Brooklyn Bridge is a hybrid cable-stayed and suspension bridge in New York City that spans the East River between Manhattan and Brooklyn. It opened in 1883 and was designed by John A. Roebling, with Washington Roebling and Emily Warren Roebling playing key roles in completion. Its main span is 1,595 feet and it was the world's longest suspension bridge at the time. The bridge has Gothic stone towers and a pedestrian promenade above traffic lanes.",
    wikiUrl: "https://en.wikipedia.org/wiki/Brooklyn_Bridge",
    pageType: "standard",
  },
  "statue of liberty": {
    title: "Statue of Liberty",
    extract:
      "The Statue of Liberty is a colossal neoclassical sculpture on Liberty Island in New York Harbor. It was a gift from France and was dedicated in 1886, with a design by Frédéric Auguste Bartholdi and a metal framework by Gustave Eiffel. The copper statue is 151 feet tall, and the full height from ground to torch is about 305 feet. The monument symbolizes freedom and immigration and is part of Statue of Liberty National Monument.",
    wikiUrl: "https://en.wikipedia.org/wiki/Statue_of_Liberty",
    pageType: "standard",
  },
  "ellis island": {
    title: "Ellis Island",
    extract:
      "Ellis Island is an island in New York Harbor that served as the busiest immigrant inspection and processing station in the United States from 1892 to 1954. More than 12 million immigrants entered the country through the complex. The island is part of the Statue of Liberty National Monument and includes the Ellis Island National Museum of Immigration. The main building is Beaux-Arts architecture with exhibition galleries and historic records.",
    wikiUrl: "https://en.wikipedia.org/wiki/Ellis_Island",
    pageType: "standard",
  },
  "high line": {
    title: "High Line",
    extract:
      "The High Line is a 1.45-mile linear park, greenway, and rail trail built on a former elevated freight rail line on Manhattan's West Side in New York City. The project was led by Friends of the High Line and designed by James Corner Field Operations, Diller Scofidio + Renfro, and Piet Oudolf. It opened in phases from 2009 to 2019 and links neighborhoods from the Meatpacking District to Hudson Yards. The park combines planted landscapes, public art, and city views.",
    wikiUrl: "https://en.wikipedia.org/wiki/High_Line",
    pageType: "standard",
  },
  "times square": {
    title: "Times Square",
    extract:
      "Times Square is a major commercial intersection, tourist destination, entertainment center, and neighborhood in Midtown Manhattan, New York City. It is formed by the junction of Broadway, Seventh Avenue, and 42nd Street and is known for illuminated digital billboards. The square was renamed in 1904 after The New York Times moved its headquarters to the area. It is one of the world's busiest pedestrian areas and hosts the annual New Year's Eve ball drop.",
    wikiUrl: "https://en.wikipedia.org/wiki/Times_Square",
    pageType: "standard",
  },
  "metropolitan museum of art": {
    title: "Metropolitan Museum of Art",
    extract:
      "The Metropolitan Museum of Art, also known as the Met, is an art museum on Fifth Avenue along the eastern edge of Central Park in New York City. It was founded in 1870 and its main building is in the Museum Mile district of Manhattan. The museum's permanent collection contains over two million works spanning 5,000 years, with departments including Egyptian art, European paintings, and arms and armor. It is one of the most visited art museums in the world.",
    wikiUrl: "https://en.wikipedia.org/wiki/Metropolitan_Museum_of_Art",
    pageType: "standard",
  },
  "dumbo": {
    title: "DUMBO, Brooklyn",
    extract:
      "DUMBO is a neighborhood in the New York City borough of Brooklyn, and its name stands for Down Under the Manhattan Bridge Overpass. It sits between the Manhattan Bridge and Brooklyn Bridge along the East River waterfront. The district developed from a former industrial area into a mixed neighborhood with converted warehouses, technology firms, galleries, and parks such as Brooklyn Bridge Park. Cobblestone streets and bridge approaches are defining features of the area.",
    wikiUrl: "https://en.wikipedia.org/wiki/Dumbo,_Brooklyn",
    pageType: "standard",
  },
};

let cacheLoaded = false;
let cacheDirty = false;
let cacheState: CacheState = { summaries: {} };
let requestChain = Promise.resolve();

const normalizeTitle = (title: string) =>
  title
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");

const randomDelayMs = () => 800 + Math.floor(Math.random() * 401);
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ensureCacheLoaded = () => {
  if (cacheLoaded) return;
  cacheLoaded = true;

  if (!fs.existsSync(CACHE_PATH)) return;
  try {
    cacheState = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) as CacheState;
    cacheState.summaries ||= {};
  } catch {
    cacheState = { summaries: {} };
  }
};

export const flushWikiSummaryCache = () => {
  ensureCacheLoaded();
  if (!cacheDirty) return;
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, `${JSON.stringify(cacheState, null, 2)}\n`, "utf8");
  cacheDirty = false;
};

const queueRequest = async <T>(fn: () => Promise<T>) => {
  const previous = requestChain;
  let release = () => {};
  requestChain = new Promise<void>(resolve => {
    release = resolve;
  });

  await previous;
  await delay(randomDelayMs());

  try {
    return await fn();
  } finally {
    release();
  }
};

const toMiss = (title: string, pageType: string | null = null): WikiSummary => ({
  title,
  extract: null,
  wikiUrl: null,
  pageType,
});

const saveCache = (key: string, value: WikiSummary) => {
  cacheState.summaries[key] = value;
  cacheDirty = true;
};

export async function fetchWikiSummary(title: string): Promise<WikiSummary> {
  ensureCacheLoaded();

  const cleanTitle = title.trim();
  if (!cleanTitle) return toMiss(title);

  const key = normalizeTitle(cleanTitle);
  if (LOCAL_WIKI_FALLBACKS[key]) {
    const local = LOCAL_WIKI_FALLBACKS[key];
    saveCache(key, local);
    return local;
  }

  const cached = cacheState.summaries[key];
  if (cached) return cached;

  const result = await queueRequest(async () => {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTitle)}`,
        {
          headers: { Accept: "application/json", "User-Agent": USER_AGENT },
        }
      );

      if (!response.ok) return toMiss(cleanTitle);

      const payload = (await response.json()) as SummaryResponse;
      const extract = payload.extract?.trim() ?? "";
      const pageType = payload.type ?? null;
      const wikiUrl = payload.content_urls?.desktop?.page ?? null;
      const resolvedTitle = payload.title || cleanTitle;

      if (pageType === "disambiguation" || pageType === "missing") {
        return toMiss(resolvedTitle, pageType);
      }

      if (extract.length < 200) {
        return toMiss(resolvedTitle, pageType);
      }

      return {
        title: resolvedTitle,
        extract,
        wikiUrl,
        pageType,
      };
    } catch {
      return toMiss(cleanTitle);
    }
  });

  saveCache(key, result);
  saveCache(normalizeTitle(result.title), result);
  return result;
}

export async function fetchWikiSummaryWithVariants(args: {
  landmarkName: string;
  cityName?: string;
  stateName?: string;
  countryName?: string;
}): Promise<WikiSummary & { tried: string[] }> {
  const { landmarkName, cityName, stateName } = args;

  const variants = [
    landmarkName,
    cityName ? `${landmarkName} (${cityName})` : null,
    stateName ? `${landmarkName} (${stateName})` : null,
    cityName ? `${landmarkName}, ${cityName}` : null,
    cityName?.includes("New York")
      ? `${landmarkName} (New York City)`
      : null,
  ].filter((value): value is string => Boolean(value));

  const deduped = Array.from(new Set(variants));
  const tried: string[] = [];

  for (const variant of deduped) {
    tried.push(variant);
    const summary = await fetchWikiSummary(variant);
    if (summary.extract) {
      return { ...summary, tried };
    }
  }

  return { ...toMiss(landmarkName), tried };
}
