import fs from "node:fs";
import path from "node:path";
import {
  buildCityAboutSection,
  type CityFacts,
} from "../src/utils/guides/buildCityAboutSection";
import {
  hasBlockedPhrases,
  hasRepeatedSentencesAcrossSections,
} from "../src/utils/guides/validateNoBoilerplate";

type GuideJson = {
  city?: string;
  state?: string;
  country?: string;
  seoLinks?: { wikipedia?: string };
  overview?: string[];
  highlights?: Array<{ title?: string; description?: string }>;
  thingsToDo?: Array<{ title?: string; description?: string }>;
  aboutCity?: {
    sourceUrl?: string;
    sections?: Array<{ heading: string; paragraphs: string[] }>;
  };
};

type WikiContext = {
  summaryText?: string;
  extractText?: string;
  sourceUrl?: string;
  wikidataId?: string;
};

const GUIDE_ROOT = path.resolve("src/data/guides");
const USER_AGENT =
  "alloutdooradventures/1.0 (enrich-guides-about-authoritative-factsfirst)";

const ABOUT_SECTIONS = [
  "Overview",
  "Geography & setting",
  "History (brief)",
  "Culture & identity",
  "Outdoor / natural context",
] as const;

const listGuideFiles = (dir: string): string[] => {
  const output: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "overrides") continue;
      output.push(...listGuideFiles(full));
      continue;
    }
    if (entry.name.endsWith(".json") && entry.name !== "index.json") {
      output.push(full);
    }
  }
  return output;
};

const parseWikiTitleFromUrl = (url?: string) => {
  if (!url) return null;
  const match = url.match(/\/wiki\/([^?#]+)/);
  if (!match) return null;
  return decodeURIComponent(match[1]).replace(/_/g, " ");
};

const fetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const summaryCache = new Map<
  string,
  { extract?: string; url?: string; wikidataId?: string } | null
>();
const extractCache = new Map<string, string | null>();
const wikidataFactsCache = new Map<string, CityFacts | null>();

const fetchSummary = async (title: string) => {
  if (summaryCache.has(title)) return summaryCache.get(title) ?? null;
  const data = await fetchJson<{
    extract?: string;
    wikibase_item?: string;
    content_urls?: { desktop?: { page?: string } };
  }>(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  );
  const value = data?.extract
    ? {
        extract: data.extract.trim(),
        url: data.content_urls?.desktop?.page,
        wikidataId: data.wikibase_item,
      }
    : null;
  summaryCache.set(title, value);
  return value;
};

const fetchExtract = async (title: string) => {
  if (extractCache.has(title)) return extractCache.get(title) ?? null;
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("prop", "extracts");
  url.searchParams.set("titles", title);
  url.searchParams.set("explaintext", "1");
  url.searchParams.set("format", "json");
  url.searchParams.set("redirects", "1");

  const data = await fetchJson<{
    query?: { pages?: Record<string, { extract?: string }> };
  }>(url.toString());
  const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
  const extract = pages[0]?.extract?.trim() || null;
  extractCache.set(title, extract);
  return extract;
};

const getClaimValue = (claim: unknown) =>
  (claim as { mainsnak?: { datavalue?: { value?: unknown } } })?.mainsnak
    ?.datavalue?.value;

const readQuantity = (value: unknown) => {
  const amount = (value as { amount?: string })?.amount;
  if (!amount) return undefined;
  const parsed = Number(amount);
  return Number.isFinite(parsed) ? Math.abs(parsed) : undefined;
};

const readYear = (value: unknown) => {
  const time = (value as { time?: string })?.time;
  if (!time) return undefined;
  const match = time.match(/([0-9]{4})/);
  return match ? Number(match[1]) : undefined;
};

const readCoordinates = (value: unknown) => {
  const latitude = (value as { latitude?: number })?.latitude;
  const longitude = (value as { longitude?: number })?.longitude;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return undefined;
  }
  return { latitude, longitude };
};

const toEntityIds = (claims: unknown[] | undefined) =>
  (claims ?? [])
    .map(claim => getClaimValue(claim))
    .map(value => (value as { id?: string })?.id)
    .filter((value): value is string => Boolean(value));

const fetchEntityLabels = async (ids: string[]) => {
  if (!ids.length) return {} as Record<string, string>;
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbgetentities");
  url.searchParams.set("ids", ids.join("|"));
  url.searchParams.set("props", "labels");
  url.searchParams.set("languages", "en");
  url.searchParams.set("format", "json");
  const data = await fetchJson<{
    entities?: Record<string, { labels?: { en?: { value?: string } } }>;
  }>(url.toString());

  const labels: Record<string, string> = {};
  Object.entries(data?.entities ?? {}).forEach(([id, value]) => {
    const label = value.labels?.en?.value;
    if (label) labels[id] = label;
  });
  return labels;
};

const fetchWikidataFacts = async (wikidataId?: string): Promise<CityFacts> => {
  if (!wikidataId) return {};
  if (wikidataFactsCache.has(wikidataId))
    return wikidataFactsCache.get(wikidataId) ?? {};

  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbgetentities");
  url.searchParams.set("ids", wikidataId);
  url.searchParams.set("props", "claims");
  url.searchParams.set("format", "json");

  const data = await fetchJson<{
    entities?: Record<string, { claims?: Record<string, unknown[]> }>;
  }>(url.toString());
  const claims = data?.entities?.[wikidataId]?.claims ?? {};

  const locationIds = toEntityIds(claims.P131);
  const waterIds = toEntityIds(claims.P206);
  const mountainIds = toEntityIds(claims.P4552);
  const metroIds = toEntityIds(claims.P3527);

  const labels = await fetchEntityLabels([
    ...locationIds.slice(0, 2),
    ...waterIds.slice(0, 2),
    ...mountainIds.slice(0, 2),
    ...metroIds.slice(0, 1),
  ]);

  const coordinates = readCoordinates(getClaimValue(claims.P625?.[0]));
  const facts: CityFacts = {
    population:
      Math.round(readQuantity(getClaimValue(claims.P1082?.[0])) ?? 0) ||
      undefined,
    areaKm2: readQuantity(getClaimValue(claims.P2046?.[0])),
    elevationM: readQuantity(getClaimValue(claims.P2044?.[0])),
    latitude: coordinates?.latitude,
    longitude: coordinates?.longitude,
    inceptionYear: readYear(getClaimValue(claims.P571?.[0])),
    locatedIn: locationIds
      .slice(0, 2)
      .map(id => labels[id])
      .filter(Boolean),
    waterBodies: waterIds
      .slice(0, 2)
      .map(id => labels[id])
      .filter(Boolean),
    mountainRanges: mountainIds
      .slice(0, 2)
      .map(id => labels[id])
      .filter(Boolean),
    metroArea: metroIds[0] ? labels[metroIds[0]] : undefined,
    nickname: (getClaimValue(claims.P1448?.[0]) as { text?: string })?.text,
  };

  wikidataFactsCache.set(wikidataId, facts);
  return facts;
};

const resolveWikiContext = async (
  candidates: string[]
): Promise<WikiContext | null> => {
  for (const candidate of candidates) {
    const summary = await fetchSummary(candidate);
    const extract = await fetchExtract(candidate);
    if (summary?.extract || extract) {
      return {
        summaryText: summary?.extract,
        extractText: extract ?? undefined,
        sourceUrl: summary?.url,
        wikidataId: summary?.wikidataId,
      };
    }
  }
  return null;
};

const run = async () => {
  const files = listGuideFiles(GUIDE_ROOT);
  let updated = 0;
  let warnings = 0;

  for (const file of files) {
    const guide = JSON.parse(fs.readFileSync(file, "utf8")) as GuideJson;
    if (!guide.city) continue;

    const candidates = [
      parseWikiTitleFromUrl(guide.seoLinks?.wikipedia),
      parseWikiTitleFromUrl(guide.aboutCity?.sourceUrl),
      guide.state ? `${guide.city}, ${guide.state}` : undefined,
      `${guide.city}, ${guide.country ?? "United States"}`,
      guide.city,
    ].filter((value): value is string => Boolean(value));

    const wikiContext = await resolveWikiContext(candidates);
    const facts = await fetchWikidataFacts(wikiContext?.wikidataId);

    const localEvidence = [
      ...(guide.overview ?? []),
      ...(guide.highlights ?? []).map(item => item.description ?? ""),
      ...(guide.thingsToDo ?? [])
        .slice(0, 8)
        .map(item => item.description ?? ""),
    ]
      .filter(Boolean)
      .join(" ");

    const built = buildCityAboutSection({
      cityName: guide.city,
      stateName: guide.state,
      countryName: guide.country ?? "United States",
      wikiSummaryText: wikiContext?.summaryText,
      wikiExtractText:
        `${wikiContext?.extractText ?? ""} ${localEvidence}`.trim(),
      facts: {
        ...facts,
        landmarks: (guide.thingsToDo ?? [])
          .map(item => item.title)
          .filter((value): value is string => Boolean(value))
          .slice(0, 4),
      },
    });

    const sections = [
      { heading: ABOUT_SECTIONS[0], paragraphs: [built.overview] },
      { heading: ABOUT_SECTIONS[1], paragraphs: [built.geography] },
      { heading: ABOUT_SECTIONS[2], paragraphs: [built.history] },
      { heading: ABOUT_SECTIONS[3], paragraphs: [built.culture] },
      { heading: ABOUT_SECTIONS[4], paragraphs: [built.outdoors] },
    ];

    const sectionBodies = sections.map(section => section.paragraphs.join(" "));
    if (
      sectionBodies.some(hasBlockedPhrases) ||
      hasRepeatedSentencesAcrossSections(sectionBodies)
    ) {
      warnings += 1;
      console.warn(`Warning: about section quality issue for ${file}`);
    }

    guide.aboutCity = {
      sourceUrl:
        wikiContext?.sourceUrl ??
        guide.seoLinks?.wikipedia ??
        guide.aboutCity?.sourceUrl,
      sections,
    };

    fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`);
    updated += 1;
  }

  console.log(`Updated about sections for ${updated} guides.`);
  console.log(`Validation warnings: ${warnings}.`);
};

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
