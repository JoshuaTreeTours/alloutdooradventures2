import {
  getLinkedWikidataCandidates,
  getWikidataEntity,
  searchWikidataEntity,
} from "../wiki/wikidata";
import { getWikipediaSummary } from "../wiki/wikiRest";

const LANDMARK_TOKENS = [
  "park",
  "museum",
  "beach",
  "bridge",
  "garden",
  "district",
  "harbor",
  "bay",
  "pier",
  "island",
  "trail",
  "monument",
  "square",
  "market",
  "cathedral",
  "waterfront",
  "observatory",
  "zoo",
  "aquarium",
  "plaza",
  "fort",
  "center",
  "centre",
  "riverwalk",
  "falls",
];

const EXCLUDED_GENERIC = [
  "downtown",
  "historic walking routes",
  "regional park trails",
  "city center",
  "city centre",
];

const SECTION_KEYWORDS = [
  "park",
  "museum",
  "district",
  "beach",
  "bridge",
  "neighborhood",
  "waterfront",
  "harbor",
  "attraction",
  "landmark",
  "historic",
  "monument",
];

type ParseLinksResponse = {
  parse?: {
    links?: Array<{ ns: number; "*": string; exists?: string }>;
  };
};

const safeFetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "alloutdooradventures/1.0 (wiki-things-to-do script)",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/\s+/g, " ").trim();

const looksLandmarkLike = (title: string) => {
  const lower = normalize(title);
  if (!lower || EXCLUDED_GENERIC.some(item => lower === item)) return false;
  return LANDMARK_TOKENS.some(token => lower.includes(token));
};

const fetchCityPageTitle = async (city: string, state: string) => {
  const candidates = [`${city}, ${state}`, city];
  for (const candidate of candidates) {
    const summary = await getWikipediaSummary(candidate);
    if (summary?.extract) {
      return summary.title || candidate;
    }
  }
  return null;
};

const getWikipediaLandmarkLinks = async (
  cityPageTitle: string,
  limit: number
): Promise<string[]> => {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "parse");
  url.searchParams.set("page", cityPageTitle);
  url.searchParams.set("prop", "links");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const data = await safeFetchJson<ParseLinksResponse>(url.toString());
  const links = data?.parse?.links ?? [];

  const filtered = links
    .filter(link => link.ns === 0 && Boolean(link.exists))
    .map(link => link["*"]?.trim())
    .filter((title): title is string => Boolean(title && title.length > 2))
    .filter(title => {
      const lower = normalize(title);
      if (SECTION_KEYWORDS.some(k => lower.includes(k))) return true;
      return looksLandmarkLike(title);
    })
    .slice(0, limit * 2);

  return filtered;
};

export const getWikiLandmarkCandidates = async (
  city: string,
  state: string,
  limit = 12
): Promise<{ cityPageTitle: string | null; candidates: string[] }> => {
  const cityPageTitle = await fetchCityPageTitle(city, state);
  const combined = new Map<string, string>();

  if (cityPageTitle) {
    combined.set(normalize(cityPageTitle), cityPageTitle);

    const linkCandidates = await getWikipediaLandmarkLinks(
      cityPageTitle,
      limit
    );
    for (const title of linkCandidates) {
      if (looksLandmarkLike(title)) {
        combined.set(normalize(title), title);
      }
      if (combined.size >= limit + 2) break;
    }
  }

  const search =
    (await searchWikidataEntity(`${city} ${state}`)) ??
    (await searchWikidataEntity(city));
  if (search?.id) {
    const entity = await getWikidataEntity(search.id);
    if (entity?.sitelinks?.enwiki?.title) {
      combined.set(
        normalize(entity.sitelinks.enwiki.title),
        entity.sitelinks.enwiki.title
      );
    }

    if (entity) {
      const wikidataCandidates = await getLinkedWikidataCandidates(
        entity,
        limit
      );
      for (const title of wikidataCandidates) {
        if (!looksLandmarkLike(title)) continue;
        combined.set(normalize(title), title);
        if (combined.size >= limit + 2) break;
      }
    }
  }

  const deduped = Array.from(combined.values())
    .filter(title => title.toLowerCase() !== city.toLowerCase())
    .filter(looksLandmarkLike)
    .slice(0, limit);

  return { cityPageTitle, candidates: deduped };
};
