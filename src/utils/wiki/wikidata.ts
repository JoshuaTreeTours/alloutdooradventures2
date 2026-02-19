type SearchEntity = {
  id: string;
  label?: string;
  description?: string;
};

type EntitySearchResponse = {
  search?: SearchEntity[];
};

type WikidataEntity = {
  id: string;
  labels?: { en?: { value?: string } };
  sitelinks?: { enwiki?: { title?: string } };
  claims?: Record<
    string,
    Array<{ mainsnak?: { datavalue?: { value?: { id?: string } } } }>
  >;
};

type GetEntitiesResponse = {
  entities?: Record<string, WikidataEntity>;
};

const USER_AGENT = "alloutdooradventures/1.0 (wiki-things-to-do script)";
const DEFAULT_PROPS = ["P527", "P150", "P131", "P706", "P361"];

const safeFetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export const searchWikidataEntity = async (
  search: string
): Promise<SearchEntity | null> => {
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbsearchentities");
  url.searchParams.set("search", search);
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("origin", "*");

  const data = await safeFetchJson<EntitySearchResponse>(url.toString());
  return data?.search?.[0] ?? null;
};

export const getWikidataEntity = async (
  id: string
): Promise<WikidataEntity | null> => {
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbgetentities");
  url.searchParams.set("ids", id);
  url.searchParams.set("languages", "en");
  url.searchParams.set("props", "labels|sitelinks|claims");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const data = await safeFetchJson<GetEntitiesResponse>(url.toString());
  return data?.entities?.[id] ?? null;
};

const getLinkedEntityIds = (entity: WikidataEntity): string[] => {
  const ids = new Set<string>();

  for (const property of DEFAULT_PROPS) {
    const claims = entity.claims?.[property] ?? [];
    for (const claim of claims) {
      const value = claim.mainsnak?.datavalue?.value;
      if (value?.id) ids.add(value.id);
    }
  }

  return Array.from(ids);
};

export const getLinkedWikidataCandidates = async (
  entity: WikidataEntity,
  limit = 12
): Promise<string[]> => {
  const ids = getLinkedEntityIds(entity).slice(0, 20);
  if (!ids.length) return [];

  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbgetentities");
  url.searchParams.set("ids", ids.join("|"));
  url.searchParams.set("languages", "en");
  url.searchParams.set("props", "labels|sitelinks");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const data = await safeFetchJson<GetEntitiesResponse>(url.toString());
  const entities = data?.entities ?? {};

  const titles: string[] = [];
  for (const candidate of Object.values(entities)) {
    const title =
      candidate.sitelinks?.enwiki?.title ?? candidate.labels?.en?.value;
    if (!title) continue;
    titles.push(title);
    if (titles.length >= limit) break;
  }

  return titles;
};
