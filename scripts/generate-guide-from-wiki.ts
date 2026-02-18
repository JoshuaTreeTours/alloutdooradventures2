import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type RegistryEntry = {
  name: string;
  country: string;
  countrySlug: string;
  citySlug: string;
};

type WikidataValue = {
  mainsnak?: { datavalue?: { value?: unknown } };
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

type GeneratedGuide = {
  city: string;
  country: string;
  countrySlug: string;
  citySlug: string;
  wikidataId: string;
  wikipediaTitle: string;
  wikipediaUrl: string;
  leadImageUrl: string | null;
  facts: {
    population: number | null;
    coordinates: { lat: number; lon: number } | null;
    country: string;
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

const REGISTRY_PATH = path.resolve("src/content/guides/guideRegistry.top-cities.json");
const OUTPUT_BASE = path.resolve("src/content/guides/world");

const cli = {
  dryRun: process.argv.includes("--dry-run"),
  only: (() => {
    const idx = process.argv.indexOf("--only");
    return idx >= 0 ? process.argv[idx + 1] : undefined;
  })(),
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => isNonEmptyString(item));

function validateGeneratedGuide(guide: unknown): asserts guide is GeneratedGuide {
  if (!guide || typeof guide !== "object") throw new Error("guide must be object");
  const rec = guide as Record<string, unknown>;
  const required = [
    "city",
    "country",
    "countrySlug",
    "citySlug",
    "wikidataId",
    "wikipediaTitle",
    "wikipediaUrl",
    "intro",
    "seoTitle",
    "seoDescription",
    "generatedAt",
  ];

  for (const key of required) {
    if (!isNonEmptyString(rec[key])) throw new Error(`Missing/invalid: ${key}`);
  }

  if (rec.leadImageUrl !== null && !isNonEmptyString(rec.leadImageUrl)) {
    throw new Error("Missing/invalid: leadImageUrl");
  }

  if (!Array.isArray(rec.topThings) || rec.topThings.length !== 6) {
    throw new Error("Missing/invalid: topThings (must contain exactly 6)");
  }
  for (const [index, item] of rec.topThings.entries()) {
    if (!item || typeof item !== "object") throw new Error(`Invalid topThings[${index}]`);
    const row = item as Record<string, unknown>;
    if (!isNonEmptyString(row.title) || !isNonEmptyString(row.description)) {
      throw new Error(`Invalid topThings[${index}] fields`);
    }
  }

  if (rec.neighborhoods !== undefined && !isStringArray(rec.neighborhoods)) {
    throw new Error("Missing/invalid: neighborhoods");
  }
  if (!isStringArray(rec.whenToGo) || rec.whenToGo.length < 2) {
    throw new Error("Missing/invalid: whenToGo");
  }
  if (!isStringArray(rec.gettingAround) || rec.gettingAround.length < 2) {
    throw new Error("Missing/invalid: gettingAround");
  }
  if (!isStringArray(rec.dayTrips) || rec.dayTrips.length < 3) {
    throw new Error("Missing/invalid: dayTrips");
  }

  if (!rec.facts || typeof rec.facts !== "object") throw new Error("Missing/invalid: facts");
  const facts = rec.facts as Record<string, unknown>;
  if (facts.population !== null && typeof facts.population !== "number") {
    throw new Error("Missing/invalid: facts.population");
  }
  if (facts.coordinates !== null && typeof facts.coordinates !== "object") {
    throw new Error("Missing/invalid: facts.coordinates");
  }
  if (facts.coordinates && typeof facts.coordinates === "object") {
    const c = facts.coordinates as Record<string, unknown>;
    if (typeof c.lat !== "number" || typeof c.lon !== "number") {
      throw new Error("Missing/invalid: facts.coordinates.lat/lon");
    }
  }
  if (!isNonEmptyString(facts.country)) throw new Error("Missing/invalid: facts.country");
  if (
    facts.officialWebsite !== null &&
    facts.officialWebsite !== undefined &&
    !isNonEmptyString(facts.officialWebsite)
  ) {
    throw new Error("Missing/invalid: facts.officialWebsite");
  }
  if (!isStringArray(facts.sectionHeadings)) {
    throw new Error("Missing/invalid: facts.sectionHeadings");
  }
}

const selectBestClaim = (claims?: WikidataValue[]) => {
  if (!claims?.length) return null;
  return claims.find((claim) => claim.rank === "preferred") ?? claims[0];
};

const extractNumericAmount = (claim?: WikidataValue[]) => {
  const amount = (selectBestClaim(claim)?.mainsnak?.datavalue?.value as { amount?: string })?.amount;
  if (!amount) return null;
  const parsed = Number(amount);
  return Number.isFinite(parsed) ? Math.round(Math.abs(parsed)) : null;
};

const extractCoordinates = (claim?: WikidataValue[]) => {
  const value = selectBestClaim(claim)?.mainsnak?.datavalue?.value as
    | { latitude?: number; longitude?: number }
    | undefined;
  if (typeof value?.latitude !== "number" || typeof value?.longitude !== "number") {
    return null;
  }
  return { lat: value.latitude, lon: value.longitude };
};

const extractString = (claim?: WikidataValue[]) => {
  const value = selectBestClaim(claim)?.mainsnak?.datavalue?.value;
  return typeof value === "string" ? value : null;
};

async function resolveWikidataId(entry: RegistryEntry) {
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbsearchentities");
  url.searchParams.set("search", `${entry.name} ${entry.country}`);
  url.searchParams.set("language", "en");
  url.searchParams.set("type", "item");
  url.searchParams.set("limit", "8");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Wikidata search failed (${response.status})`);

  const payload = (await response.json()) as {
    search?: Array<{ id: string; label?: string; description?: string }>;
  };

  const best = (payload.search ?? []).find((item) => {
    const haystack = `${item.label ?? ""} ${item.description ?? ""}`.toLowerCase();
    return haystack.includes(entry.name.toLowerCase()) && haystack.includes(entry.country.toLowerCase());
  });

  if (best) return best.id;
  if (payload.search?.length) return payload.search[0].id;
  throw new Error(`Could not resolve Wikidata ID for ${entry.name}`);
}

async function fetchWikidataFacts(wikidataId: string) {
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbgetentities");
  url.searchParams.set("ids", wikidataId);
  url.searchParams.set("format", "json");
  url.searchParams.set("props", "claims|labels|sitelinks");
  url.searchParams.set("languages", "en");
  url.searchParams.set("sitefilter", "enwiki");
  url.searchParams.set("origin", "*");

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Wikidata facts failed (${response.status})`);

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

  const entity = payload.entities?.[wikidataId];
  if (!entity) throw new Error(`Wikidata entity ${wikidataId} missing`);

  return {
    cityName: entity.labels?.en?.value,
    population: extractNumericAmount(entity.claims?.P1082),
    coordinates: extractCoordinates(entity.claims?.P625),
    officialWebsite: extractString(entity.claims?.P856),
    wikipediaTitle: entity.sitelinks?.enwiki?.title,
  };
}

async function fetchWikipediaMetadata(title: string) {
  const summaryUrl = new URL(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
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
      `Wikipedia metadata failed: summary=${summaryResponse.status}, sections=${sectionsResponse.status}`,
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
    leadImageUrl: summary.originalimage?.source ?? summary.thumbnail?.source ?? null,
    sectionHeadings: (sectionsPayload.parse?.sections ?? [])
      .map((section) => section.line?.trim())
      .filter((line): line is string => Boolean(line)),
  };
}

async function generateGuideWithOpenAI(facts: Record<string, unknown>) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required.");

  const prompt = [
    "Write original travel copy from facts only.",
    "Do not quote or paraphrase Wikipedia prose.",
    "Output strict JSON only.",
    "Fields: intro (2-3 sentences), topThings (exactly 6 objects with title+description), neighborhoods (4-6 bullets optional), whenToGo (2-3), gettingAround (2-3), dayTrips (3-5), seoTitle, seoDescription.",
    `Facts: ${JSON.stringify(facts, null, 2)}`,
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: "gpt-5-mini", input: prompt }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed (${response.status}): ${await response.text()}`);
  }

  const payload = (await response.json()) as { output_text?: string };
  if (!payload.output_text) throw new Error("OpenAI output_text missing");
  return JSON.parse(payload.output_text) as OpenAiGuide;
}

const getOutputPath = (entry: RegistryEntry) =>
  path.resolve(OUTPUT_BASE, entry.countrySlug, `${entry.citySlug}.generated.json`);

async function generateCity(entry: RegistryEntry) {
  const wikidataId = await resolveWikidataId(entry);
  const wikidata = await fetchWikidataFacts(wikidataId);
  const wikipediaTitle = wikidata.wikipediaTitle ?? entry.name;
  const wikipedia = await fetchWikipediaMetadata(wikipediaTitle);

  const aiGuide = await generateGuideWithOpenAI({
    cityName: wikidata.cityName ?? entry.name,
    country: entry.country,
    population: wikidata.population,
    coordinates: wikidata.coordinates,
    officialWebsite: wikidata.officialWebsite,
    wikidataId,
    wikipediaTitle,
    wikipediaUrl: wikipedia.pageUrl,
    sectionHeadings: wikipedia.sectionHeadings,
  });

  const generated: GeneratedGuide = {
    city: entry.name,
    country: entry.country,
    countrySlug: entry.countrySlug,
    citySlug: entry.citySlug,
    wikidataId,
    wikipediaTitle,
    wikipediaUrl: wikipedia.pageUrl,
    leadImageUrl: wikipedia.leadImageUrl,
    facts: {
      population: wikidata.population,
      coordinates: wikidata.coordinates,
      country: entry.country,
      officialWebsite: wikidata.officialWebsite,
      sectionHeadings: wikipedia.sectionHeadings,
    },
    ...aiGuide,
    generatedAt: new Date().toISOString(),
  };

  validateGeneratedGuide(generated);

  const outputPath = getOutputPath(entry);
  if (cli.dryRun) {
    console.log(`[dry-run] ${entry.name} -> ${outputPath}`);
    return;
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(generated, null, 2)}\n`, "utf8");
  console.log(`Generated ${entry.name}: ${outputPath}`);
}

async function main() {
  const registry = JSON.parse(await readFile(REGISTRY_PATH, "utf8")) as RegistryEntry[];
  const selected = cli.only
    ? registry.filter((entry) => entry.citySlug === cli.only || entry.name.toLowerCase() === cli.only.toLowerCase())
    : registry;

  if (!selected.length) throw new Error("No matching city found for --only.");

  for (const entry of selected) {
    await generateCity(entry);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
