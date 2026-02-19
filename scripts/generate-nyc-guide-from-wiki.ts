import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const WIKIDATA_ID = "Q60";
const WIKIPEDIA_TITLE = "New York City";
const OUTPUT_PATH = path.resolve(
  "src/content/guides/world/united-states/new-york-city.generated.json"
);

type WikidataValue = {
  mainsnak?: {
    datavalue?: {
      value?: unknown;
    };
  };
  rank?: string;
};

type OpenAiGuide = {
  intro: string;
  topThings: Array<{ title: string; description: string }>;
  neighborhoods?: string[];
  whenToGo: string[];
  gettingAround: string[];
  dayTrips: string[];
  seoTitle: string;
  seoDescription: string;
};

type GeneratedNycGuide = {
  city: "New York City";
  country: "United States";
  wikidataId: "Q60";
  wikipediaTitle: string;
  wikipediaUrl: string;
  leadImageUrl: string | null;
  facts: {
    population: number | null;
    coordinates: { lat: number; lon: number } | null;
    country: "United States";
    officialWebsite: string | null;
    sectionHeadings: string[];
  };
  intro: string;
  topThings: Array<{ title: string; description: string }>;
  neighborhoods?: string[];
  whenToGo: string[];
  gettingAround: string[];
  dayTrips: string[];
  seoTitle: string;
  seoDescription: string;
  generatedAt: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => isNonEmptyString(item));

function validateGeneratedGuide(
  guide: unknown
): asserts guide is GeneratedNycGuide {
  if (!guide || typeof guide !== "object") {
    throw new Error("Generated guide must be an object.");
  }

  const record = guide as Record<string, unknown>;

  if (!isNonEmptyString(record.city)) throw new Error("Missing/invalid: city");
  if (!isNonEmptyString(record.country)) {
    throw new Error("Missing/invalid: country");
  }
  if (!isNonEmptyString(record.wikidataId)) {
    throw new Error("Missing/invalid: wikidataId");
  }
  if (!isNonEmptyString(record.wikipediaTitle)) {
    throw new Error("Missing/invalid: wikipediaTitle");
  }
  if (!isNonEmptyString(record.wikipediaUrl)) {
    throw new Error("Missing/invalid: wikipediaUrl");
  }
  if (record.leadImageUrl !== null && !isNonEmptyString(record.leadImageUrl)) {
    throw new Error("Missing/invalid: leadImageUrl");
  }

  if (!isNonEmptyString(record.intro)) {
    throw new Error("Missing/invalid: intro");
  }
  if (!isNonEmptyString(record.seoTitle)) {
    throw new Error("Missing/invalid: seoTitle");
  }
  if (!isNonEmptyString(record.seoDescription)) {
    throw new Error("Missing/invalid: seoDescription");
  }
  if (!isNonEmptyString(record.generatedAt)) {
    throw new Error("Missing/invalid: generatedAt");
  }

  if (!Array.isArray(record.topThings) || record.topThings.length !== 6) {
    throw new Error(
      "Missing/invalid: topThings (must contain exactly 6 items)"
    );
  }

  for (let index = 0; index < record.topThings.length; index += 1) {
    const item = record.topThings[index];
    if (!item || typeof item !== "object") {
      throw new Error(`Missing/invalid: topThings[${index}]`);
    }
    const topThing = item as Record<string, unknown>;
    if (!isNonEmptyString(topThing.title)) {
      throw new Error(`Missing/invalid: topThings[${index}].title`);
    }
    if (!isNonEmptyString(topThing.description)) {
      throw new Error(`Missing/invalid: topThings[${index}].description`);
    }
  }

  if (
    record.neighborhoods !== undefined &&
    !isStringArray(record.neighborhoods)
  ) {
    throw new Error("Missing/invalid: neighborhoods");
  }

  if (!isStringArray(record.whenToGo) || record.whenToGo.length < 2) {
    throw new Error("Missing/invalid: whenToGo");
  }
  if (!isStringArray(record.gettingAround) || record.gettingAround.length < 2) {
    throw new Error("Missing/invalid: gettingAround");
  }
  if (!isStringArray(record.dayTrips) || record.dayTrips.length < 3) {
    throw new Error("Missing/invalid: dayTrips");
  }

  if (!record.facts || typeof record.facts !== "object") {
    throw new Error("Missing/invalid: facts");
  }

  const facts = record.facts as Record<string, unknown>;
  if (facts.population !== null && typeof facts.population !== "number") {
    throw new Error("Missing/invalid: facts.population");
  }
  if (facts.coordinates !== null && typeof facts.coordinates !== "object") {
    throw new Error("Missing/invalid: facts.coordinates");
  }
  if (facts.coordinates && typeof facts.coordinates === "object") {
    const coords = facts.coordinates as Record<string, unknown>;
    if (typeof coords.lat !== "number" || typeof coords.lon !== "number") {
      throw new Error("Missing/invalid: facts.coordinates.lat/lon");
    }
  }
  if (!isNonEmptyString(facts.country)) {
    throw new Error("Missing/invalid: facts.country");
  }
  if (
    facts.officialWebsite !== null &&
    !isNonEmptyString(facts.officialWebsite)
  ) {
    throw new Error("Missing/invalid: facts.officialWebsite");
  }
  if (!isStringArray(facts.sectionHeadings)) {
    throw new Error("Missing/invalid: facts.sectionHeadings");
  }
}

const selectBestClaim = (claims: WikidataValue[] | undefined) => {
  if (!claims?.length) {
    return null;
  }

  return (
    claims.find(claim => claim.rank === "preferred") ??
    claims.find(claim => claim.rank === "normal") ??
    claims[0]
  );
};

const extractNumericAmount = (claims: WikidataValue[] | undefined) => {
  const chosen = selectBestClaim(claims);
  const amount = (chosen?.mainsnak?.datavalue?.value as { amount?: string })
    ?.amount;
  if (!amount) {
    return null;
  }

  const parsed = Number(amount);
  return Number.isFinite(parsed) ? Math.round(Math.abs(parsed)) : null;
};

const extractCoordinates = (claims: WikidataValue[] | undefined) => {
  const chosen = selectBestClaim(claims);
  const value = chosen?.mainsnak?.datavalue?.value as
    | { latitude?: number; longitude?: number }
    | undefined;

  if (
    typeof value?.latitude !== "number" ||
    typeof value.longitude !== "number"
  ) {
    return null;
  }

  return { lat: value.latitude, lon: value.longitude };
};

const extractString = (claims: WikidataValue[] | undefined) => {
  const chosen = selectBestClaim(claims);
  const value = chosen?.mainsnak?.datavalue?.value;
  return typeof value === "string" ? value : null;
};

async function fetchWikidataFacts() {
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbgetentities");
  url.searchParams.set("ids", WIKIDATA_ID);
  url.searchParams.set("format", "json");
  url.searchParams.set("props", "claims|labels|sitelinks");
  url.searchParams.set("languages", "en");
  url.searchParams.set("sitefilter", "enwiki");
  url.searchParams.set("origin", "*");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Wikidata: ${response.status}`);
  }

  const payload = (await response.json()) as {
    entities?: Record<
      string,
      {
        claims?: Record<string, WikidataValue[]>;
        labels?: { en?: { value?: string } };
        sitelinks?: { enwiki?: { title?: string } };
      }
    >;
  };

  const entity = payload.entities?.[WIKIDATA_ID];
  if (!entity) {
    throw new Error("Wikidata entity Q60 not found.");
  }

  const claims = entity.claims ?? {};

  return {
    wikidataId: WIKIDATA_ID,
    cityName: entity.labels?.en?.value ?? WIKIPEDIA_TITLE,
    country: "United States" as const,
    population: extractNumericAmount(claims.P1082),
    coordinates: extractCoordinates(claims.P625),
    officialWebsite: extractString(claims.P856),
    wikipediaTitle: entity.sitelinks?.enwiki?.title ?? WIKIPEDIA_TITLE,
  };
}

async function fetchWikipediaMetadata(title: string) {
  const summaryUrl = new URL(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  );

  const sectionsUrl = new URL("https://en.wikipedia.org/w/api.php");
  sectionsUrl.searchParams.set("action", "parse");
  sectionsUrl.searchParams.set("page", title);
  sectionsUrl.searchParams.set("prop", "sections");
  sectionsUrl.searchParams.set("format", "json");
  sectionsUrl.searchParams.set("origin", "*");

  const [summaryResponse, sectionsResponse] = await Promise.all([
    fetch(summaryUrl),
    fetch(sectionsUrl),
  ]);

  if (!summaryResponse.ok || !sectionsResponse.ok) {
    throw new Error(
      `Failed to fetch Wikipedia metadata: summary=${summaryResponse.status}, sections=${sectionsResponse.status}`
    );
  }

  const summary = (await summaryResponse.json()) as {
    content_urls?: { desktop?: { page?: string } };
    originalimage?: { source?: string };
    thumbnail?: { source?: string };
  };

  const sectionsPayload = (await sectionsResponse.json()) as {
    parse?: { sections?: Array<{ line?: string }> };
  };

  return {
    pageUrl:
      summary.content_urls?.desktop?.page ??
      `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    leadImageUrl:
      summary.originalimage?.source ?? summary.thumbnail?.source ?? null,
    sectionHeadings: (sectionsPayload.parse?.sections ?? [])
      .map(section => section.line?.trim())
      .filter((line): line is string => Boolean(line)),
  };
}

async function generateGuideWithOpenAI(input: {
  facts: {
    cityName: string;
    country: "United States";
    population: number | null;
    coordinates: { lat: number; lon: number } | null;
    officialWebsite: string | null;
    wikidataId: string;
    wikipediaTitle: string;
    wikipediaUrl: string;
    sectionHeadings: string[];
  };
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to generate the NYC guide.");
  }

  const prompt = [
    "You are writing original travel copy.",
    "Use only facts provided.",
    "Do not quote/paraphrase Wikipedia prose.",
    "Output STRICT JSON only (no markdown).",
    "Return a JSON object with this exact schema:",
    JSON.stringify(
      {
        intro: "string (2-3 sentences)",
        topThings: [
          {
            title: "string",
            description: "string (exactly 1 sentence)",
          },
        ],
        neighborhoods: ["string (4-6 items)"],
        whenToGo: ["string (2-3 items)"],
        gettingAround: ["string (2-3 items)"],
        dayTrips: ["string (3-5 items)"],
        seoTitle: "string",
        seoDescription: "string",
      },
      null,
      2
    ),
    "Hard constraints:",
    "- topThings must contain exactly 6 items with non-empty title and description.",
    "- neighborhoods should contain 4-6 items.",
    "- whenToGo should contain 2-3 items.",
    "- gettingAround should contain 2-3 items.",
    "- dayTrips should contain 3-5 items.",
    `Facts: ${JSON.stringify(input.facts, null, 2)}`,
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
      input: prompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
  }

  const payload = (await response.json()) as { output_text?: string };
  if (!payload.output_text) {
    throw new Error("OpenAI response did not include output_text.");
  }

  try {
    return JSON.parse(payload.output_text) as OpenAiGuide;
  } catch (error) {
    throw new Error(
      `Failed to parse OpenAI JSON output: ${(error as Error).message}`
    );
  }
}

async function main() {
  const wikidata = await fetchWikidataFacts();
  const wikipedia = await fetchWikipediaMetadata(wikidata.wikipediaTitle);

  const aiGuide = await generateGuideWithOpenAI({
    facts: {
      cityName: wikidata.cityName,
      country: wikidata.country,
      population: wikidata.population,
      coordinates: wikidata.coordinates,
      officialWebsite: wikidata.officialWebsite,
      wikidataId: wikidata.wikidataId,
      wikipediaTitle: wikidata.wikipediaTitle,
      wikipediaUrl: wikipedia.pageUrl,
      sectionHeadings: wikipedia.sectionHeadings,
    },
  });

  const generated = {
    city: "New York City" as const,
    country: "United States" as const,
    wikidataId: "Q60" as const,
    wikipediaTitle: wikidata.wikipediaTitle,
    wikipediaUrl: wikipedia.pageUrl,
    leadImageUrl: wikipedia.leadImageUrl,
    facts: {
      population: wikidata.population,
      coordinates: wikidata.coordinates,
      country: "United States" as const,
      officialWebsite: wikidata.officialWebsite,
      sectionHeadings: wikipedia.sectionHeadings,
    },
    ...aiGuide,
    generatedAt: new Date().toISOString(),
  };

  validateGeneratedGuide(generated);

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(
    OUTPUT_PATH,
    `${JSON.stringify(generated, null, 2)}\n`,
    "utf8"
  );

  console.log(`Generated New York City guide at ${OUTPUT_PATH}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
