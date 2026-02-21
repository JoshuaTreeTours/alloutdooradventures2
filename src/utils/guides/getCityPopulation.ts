type GetCityPopulationInput = {
  cityName: string;
  stateName?: string;
  countryName: string;
  wikidataId?: string;
};

export type CityPopulationResult = {
  value: number;
  year?: number;
};

type WikidataPopulationClaim = {
  rank?: "preferred" | "normal" | "deprecated";
  mainsnak?: {
    snaktype?: string;
    datavalue?: { value?: { amount?: string } };
  };
  qualifiers?: {
    P585?: Array<{
      datavalue?: { value?: { time?: string } };
    }>;
  };
};

type WikidataInstanceOfClaim = {
  mainsnak?: {
    datavalue?: { value?: { id?: string } };
  };
};

const USER_AGENT = "alloutdooradventures/1.0 (city-population)";
const WIKIDATA_CITY_ENTITY_ID = "Q515";
const cityPopulationCache = new Map<string, CityPopulationResult | null>();
const cityRegistryPopulationCache = new Map<string, CityPopulationResult>();
const wikidataPopulationCache = new Map<string, CityPopulationResult | null>();
const wikipediaPopulationCache = new Map<string, CityPopulationResult | null>();

const getCityKey = ({
  cityName,
  stateName,
  countryName,
  wikidataId,
}: GetCityPopulationInput) =>
  [cityName, stateName ?? "", countryName, wikidataId ?? ""]
    .join("|")
    .toLowerCase();

const asNumber = (amount?: string) => {
  if (!amount) return null;
  const parsed = Number(amount.replace(/^\+/, ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
};

const parseYear = (time?: string) => {
  if (!time) return undefined;
  const match = time.match(/[+-]?(\d{4})-/);
  if (!match) return undefined;
  const year = Number(match[1]);
  return Number.isFinite(year) ? year : undefined;
};

const getClaimYear = (claim: WikidataPopulationClaim) =>
  parseYear(claim.qualifiers?.P585?.[0]?.datavalue?.value?.time);

const parsePopulationText = (text?: string) => {
  if (!text) return null;

  const normalized = text.replace(/\s+/g, " ").trim();
  const sentence =
    normalized
      .split(/(?<=[.!?])\s+/)
      .find(item => /\bpopulation\b|\bcensus\b/i.test(item)) ?? normalized;

  const numberMatch = sentence.match(/\b(\d{1,3}(?:,\d{3})+)\b|\b(\d{4,})\b/);
  const value = Number((numberMatch?.[1] ?? numberMatch?.[2] ?? "").replace(/,/g, ""));
  if (!Number.isFinite(value)) return null;

  const yearMatch = sentence.match(/\b(19\d{2}|20\d{2})\b/);
  return {
    value,
    year: yearMatch ? Number(yearMatch[1]) : undefined,
  };
};

const fetchJson = async <T>(url: string): Promise<T | null> => {
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

export const cacheCityPopulation = (
  input: Omit<GetCityPopulationInput, "wikidataId">,
  populationText?: string
) => {
  const parsed = parsePopulationText(populationText);
  if (!parsed) return;
  cityRegistryPopulationCache.set(getCityKey({ ...input }), parsed);
};

const pickBestPopulationClaim = (claims: WikidataPopulationClaim[]) => {
  const usableClaims = claims
    .filter(claim => {
      if (claim.mainsnak?.snaktype && claim.mainsnak.snaktype !== "value") return false;
      return Boolean(asNumber(claim.mainsnak?.datavalue?.value?.amount));
    })
    .map(claim => ({ claim, year: getClaimYear(claim) }));

  if (!usableClaims.length) return null;

  const pickMostRecent = (
    candidates: Array<{ claim: WikidataPopulationClaim; year?: number }>
  ) =>
    [...candidates].sort((a, b) => {
      const aYear = a.year ?? -1;
      const bYear = b.year ?? -1;
      return bYear - aYear;
    })[0];

  const preferred = usableClaims.filter(item => item.claim.rank === "preferred");
  if (preferred.length) return pickMostRecent(preferred);

  const normal = usableClaims.filter(item => item.claim.rank === "normal");
  if (normal.length) return pickMostRecent(normal);

  return pickMostRecent(usableClaims);
};

const fromWikidata = async ({
  wikidataId,
  cityName,
  countryName,
}: {
  wikidataId: string;
  cityName: string;
  countryName: string;
}): Promise<CityPopulationResult | null> => {
  if (wikidataPopulationCache.has(wikidataId)) {
    return wikidataPopulationCache.get(wikidataId) ?? null;
  }

  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbgetentities");
  url.searchParams.set("ids", wikidataId);
  url.searchParams.set("props", "claims");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const data = await fetchJson<{
    entities?: Record<
      string,
      { claims?: { P1082?: WikidataPopulationClaim[]; P31?: WikidataInstanceOfClaim[] } }
    >;
  }>(url.toString());

  const entityClaims = data?.entities?.[wikidataId]?.claims;
  const instanceOfClaims = entityClaims?.P31 ?? [];
  const isCityEntity = instanceOfClaims.some(
    claim => claim.mainsnak?.datavalue?.value?.id === WIKIDATA_CITY_ENTITY_ID
  );

  if (!isCityEntity) {
    wikidataPopulationCache.set(wikidataId, null);
    return null;
  }

  const pickedClaim = pickBestPopulationClaim(entityClaims?.P1082 ?? []);
  if (!pickedClaim) {
    wikidataPopulationCache.set(wikidataId, null);
    return null;
  }

  const value = asNumber(pickedClaim.claim.mainsnak?.datavalue?.value?.amount);
  if (!value) {
    wikidataPopulationCache.set(wikidataId, null);
    return null;
  }

  if (countryName.toLowerCase() === "united states" && value < 5000) {
    console.warn(
      `[getCityPopulation] Skipping suspicious US city population for ${cityName} (${wikidataId}): ${value}`
    );
    wikidataPopulationCache.set(wikidataId, null);
    return null;
  }

  const result = { value, year: pickedClaim.year };
  wikidataPopulationCache.set(wikidataId, result);
  return result;
};

const fromWikipediaSummary = async (
  cityName: string,
  stateName?: string,
  countryName?: string
): Promise<CityPopulationResult | null> => {
  const candidates = [
    stateName ? `${cityName}, ${stateName}` : null,
    countryName ? `${cityName}, ${countryName}` : null,
    cityName,
  ].filter((item): item is string => Boolean(item));

  for (const title of candidates) {
    if (wikipediaPopulationCache.has(title)) {
      const cached = wikipediaPopulationCache.get(title) ?? null;
      if (cached) return cached;
      continue;
    }

    const summary = await fetchJson<{ extract?: string }>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    );
    const parsed = parsePopulationText(summary?.extract);
    wikipediaPopulationCache.set(title, parsed);
    if (parsed) return parsed;
  }

  return null;
};

export const getCityPopulation = async ({
  cityName,
  stateName,
  countryName,
  wikidataId,
}: GetCityPopulationInput): Promise<CityPopulationResult | null> => {
  const cacheKey = getCityKey({ cityName, stateName, countryName, wikidataId });
  if (cityPopulationCache.has(cacheKey)) {
    return cityPopulationCache.get(cacheKey) ?? null;
  }

  const fromRegistry =
    cityRegistryPopulationCache.get(
      getCityKey({ cityName, stateName, countryName })
    ) ?? null;
  if (fromRegistry) {
    cityPopulationCache.set(cacheKey, fromRegistry);
    return fromRegistry;
  }

  if (wikidataId) {
    const fromWikidataResult = await fromWikidata({
      wikidataId,
      cityName,
      countryName,
    });
    if (fromWikidataResult) {
      cityPopulationCache.set(cacheKey, fromWikidataResult);
      return fromWikidataResult;
    }
  }

  const fromWikipediaResult = await fromWikipediaSummary(cityName, stateName, countryName);
  cityPopulationCache.set(cacheKey, fromWikipediaResult);
  return fromWikipediaResult;
};

export const formatCityPopulation = ({ value, year }: CityPopulationResult) => {
  const formatted = value.toLocaleString("en-US");
  return year ? `${formatted} (${year})` : formatted;
};
