import { states } from "../../data/destinations";
import { getToursByCity } from "../../data/tours";
import { buildTopThingsToDo } from "../../data/cityTopThings";
import { slugify } from "../slugify";

export type CityEntity = {
  name: string;
  type: string;
  summary: string;
};

const TARGET_MIN = 6;
const TARGET_MAX = 12;

const SECTION_KEYWORDS = [
  "landmark",
  "attraction",
  "geography",
  "culture",
  "tourism",
  "park",
  "district",
  "neighborhood",
  "historic",
  "waterfront",
  "site",
];

const ENTITY_NAME_STOPWORDS = new Set([
  "tour",
  "cruise",
  "weekend",
  "weekday",
  "promo",
  "package",
  "rental",
  "experience",
  "city",
  "county",
  "history",
  "geography",
  "demographics",
  "culture",
  "education",
  "economy",
  "transportation",
  "government",
  "climate",
  "references",
  "external links",
]);

const normalizeEntityName = (value: string) =>
  value
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const detectEntityType = (name: string, summary: string): string => {
  const text = `${name} ${summary}`.toLowerCase();
  if (text.includes("district") || text.includes("neighborhood")) {
    return "district";
  }
  if (
    text.includes("park") ||
    text.includes("trail") ||
    text.includes("preserve")
  ) {
    return "park";
  }
  if (
    text.includes("museum") ||
    text.includes("gallery") ||
    text.includes("theater")
  ) {
    return "cultural attraction";
  }
  if (
    text.includes("harbor") ||
    text.includes("waterfront") ||
    text.includes("pier") ||
    text.includes("beach")
  ) {
    return "waterfront";
  }
  if (
    text.includes("historic") ||
    text.includes("fort") ||
    text.includes("monument")
  ) {
    return "historic site";
  }
  return "landmark";
};

const safeFetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "alloutdooradventures/guide-upgrade" },
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

type WikipediaSectionsResponse = {
  parse?: {
    sections?: Array<{ index: string; line: string }>;
  };
};

type WikipediaLinksResponse = {
  parse?: {
    links?: Array<{ ns: number; "*": string; exists?: string }>;
  };
};

type WikipediaSummaryResponse = {
  title?: string;
  extract?: string;
  description?: string;
};

type WikipediaGeoSearchResponse = {
  query?: {
    geosearch?: Array<{ title: string }>;
  };
};

const getWikipediaNearbyEntities = async (
  cityName: string,
  stateName: string,
  lat: number,
  lng: number
): Promise<CityEntity[]> => {
  const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=12000&gslimit=25&format=json&origin=*`;
  const geoData = await safeFetchJson<WikipediaGeoSearchResponse>(geoUrl);
  const geoTitles = geoData?.query?.geosearch?.map(item => item.title) ?? [];

  const entities: CityEntity[] = [];
  for (const title of geoTitles) {
    if (title.toLowerCase() === cityName.toLowerCase()) {
      continue;
    }
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title
    )}`;
    const summaryData =
      await safeFetchJson<WikipediaSummaryResponse>(summaryUrl);
    const extract = summaryData?.extract?.trim();
    if (!extract || extract.length < 40) {
      continue;
    }

    const type = detectEntityType(title, extract);
    if (
      type === "landmark" &&
      !/park|museum|district|historic|waterfront|harbor|beach|trail|monument|center|centre|garden|lake|river|bay/i.test(
        `${title} ${extract}`
      )
    ) {
      continue;
    }

    entities.push({
      name: summaryData?.title?.trim() || title,
      type,
      summary: extract,
    });

    if (entities.length >= TARGET_MAX) {
      break;
    }
  }

  return entities;
};

const wikipediaTitleCandidates = (cityName: string, stateName: string) =>
  [`${cityName}, ${stateName}`, cityName, `${cityName} (${stateName})`].map(
    candidate => candidate.replace(/\s+/g, " ").trim()
  );

const getWikipediaSectionEntities = async (
  cityName: string,
  stateName: string
): Promise<CityEntity[]> => {
  for (const title of wikipediaTitleCandidates(cityName, stateName)) {
    const sectionUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
      title
    )}&prop=sections&format=json&origin=*`;

    const sectionData =
      await safeFetchJson<WikipediaSectionsResponse>(sectionUrl);
    const sections = sectionData?.parse?.sections ?? [];
    if (!sections.length) {
      continue;
    }

    const matchingSections = sections.filter(section =>
      SECTION_KEYWORDS.some(keyword =>
        section.line.toLowerCase().includes(keyword)
      )
    );

    const links = new Map<string, string>();
    for (const section of matchingSections.slice(0, 10)) {
      const linksUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
        title
      )}&prop=links&section=${encodeURIComponent(
        section.index
      )}&format=json&origin=*`;
      const linksData = await safeFetchJson<WikipediaLinksResponse>(linksUrl);
      for (const link of linksData?.parse?.links ?? []) {
        if (link.ns !== 0 || !link.exists) {
          continue;
        }
        const cleaned = normalizeEntityName(link["*"] || "");
        if (
          !cleaned ||
          cleaned.length < 3 ||
          ENTITY_NAME_STOPWORDS.has(cleaned.toLowerCase())
        ) {
          continue;
        }
        if (/^[0-9]+$/.test(cleaned)) {
          continue;
        }
        links.set(cleaned.toLowerCase(), cleaned);
      }
    }

    const entities: CityEntity[] = [];
    for (const entityName of Array.from(links.values())) {
      if (entities.length >= TARGET_MAX) {
        break;
      }
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        entityName
      )}`;
      const summaryData =
        await safeFetchJson<WikipediaSummaryResponse>(summaryUrl);
      const extract = summaryData?.extract?.trim();
      if (!extract || extract.length < 40) {
        continue;
      }

      entities.push({
        name: summaryData?.title?.trim() || entityName,
        type: detectEntityType(entityName, extract),
        summary: extract,
      });
    }

    if (entities.length) {
      return entities;
    }
  }

  return [];
};

const extractTourEntities = (
  cityName: string,
  stateName: string,
  stateSlug: string,
  citySlug: string
): CityEntity[] => {
  const tours = getToursByCity(stateSlug, citySlug);
  const entities = new Map<string, CityEntity>();

  for (const tour of tours) {
    const text = `${tour.title}. ${tour.shortDescription ?? ""} ${tour.longDescription}`;
    const matches =
      text.match(
        /\b([A-Z][a-z]+(?:\s+(?:of|the|and|&|[A-Z][a-z]+|[0-9]+)){1,6})\b/g
      ) ?? [];

    for (const raw of matches) {
      const name = normalizeEntityName(raw);
      if (
        name.length < 5 ||
        name.toLowerCase().includes(cityName.toLowerCase()) ||
        ENTITY_NAME_STOPWORDS.has(name.toLowerCase()) ||
        /tour|cruise|weekend|weekday|promo|package|rental|experience/i.test(
          name
        )
      ) {
        continue;
      }

      if (
        !/(Park|Museum|Harbor|Pier|Beach|District|Trail|River|Lake|Canyon|Bridge|Square|Island|Center|Centre|Boulevard|Avenue|Falls|Bay|Mountain|Peak|Garden|Gardens|Fort|Monument)/i.test(
          name
        )
      ) {
        continue;
      }

      const key = name.toLowerCase();
      if (entities.has(key)) {
        continue;
      }

      entities.set(key, {
        name,
        type: detectEntityType(name, text),
        summary: `${name} is a recognized destination connected to tours operating in ${cityName}, ${stateName}, and appears frequently in local itineraries for its sightseeing value and geographic setting.`,
      });
      if (entities.size >= TARGET_MAX) {
        return Array.from(entities.values());
      }
    }
  }

  return Array.from(entities.values());
};

const buildNearbyFallbackEntities = (
  cityName: string,
  stateName: string,
  stateSlug: string,
  citySlug: string
): CityEntity[] => {
  const fallbackTopThings = buildTopThingsToDo(cityName, stateSlug, citySlug, {
    maxItems: TARGET_MAX,
    minItems: TARGET_MIN,
  });

  return fallbackTopThings.map(item => ({
    name: item.title,
    type: detectEntityType(item.title, item.description),
    summary: item.description,
  }));
};

const dedupeEntities = (entities: CityEntity[]): CityEntity[] => {
  const seen = new Set<string>();
  const output: CityEntity[] = [];

  for (const entity of entities) {
    const key = normalizeEntityName(entity.name).toLowerCase();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    output.push({
      name: normalizeEntityName(entity.name),
      type: entity.type,
      summary: entity.summary.trim(),
    });
    if (output.length >= TARGET_MAX) {
      break;
    }
  }

  return output;
};

export const generateCityEntities = async (
  cityName: string,
  stateName: string
): Promise<CityEntity[]> => {
  const state = states.find(entry => entry.name === stateName);
  const city = state?.cities.find(
    entry => entry.name.toLowerCase() === cityName.toLowerCase()
  );

  const stateSlug = state?.slug ?? slugify(stateName);
  const citySlug = city?.slug ?? slugify(cityName);

  const wikipediaEntities = await getWikipediaSectionEntities(
    cityName,
    stateName
  );
  const nearbyWikipediaEntities =
    wikipediaEntities.length >= TARGET_MIN ||
    typeof city?.lat !== "number" ||
    typeof city?.lng !== "number"
      ? []
      : await getWikipediaNearbyEntities(
          cityName,
          stateName,
          city.lat,
          city.lng
        );
  const tourEntities =
    wikipediaEntities.length + nearbyWikipediaEntities.length >= TARGET_MIN
      ? []
      : extractTourEntities(cityName, stateName, stateSlug, citySlug);
  const nearbyEntities =
    wikipediaEntities.length +
      nearbyWikipediaEntities.length +
      tourEntities.length >=
    TARGET_MIN
      ? []
      : buildNearbyFallbackEntities(cityName, stateName, stateSlug, citySlug);

  const all = dedupeEntities([
    ...wikipediaEntities,
    ...nearbyWikipediaEntities,
    ...tourEntities,
    ...nearbyEntities,
  ]);

  if (all.length >= TARGET_MIN) {
    return all.slice(0, TARGET_MAX);
  }

  return dedupeEntities([
    ...all,
    ...buildNearbyFallbackEntities(cityName, stateName, stateSlug, citySlug),
  ]).slice(0, TARGET_MAX);
};
