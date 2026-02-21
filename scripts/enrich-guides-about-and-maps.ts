import fs from "node:fs";
import path from "node:path";
import {
  assertGuideHasNoWikiLanguage,
  cleanGuideTextContent,
} from "../src/utils/guides/wikiLanguageGuard";
import {
  cleanCannedPhrases,
  isTier1ProtectedGuide,
  rewriteCityIntroFromWiki,
  rewriteOnlyForNonTier1,
} from "../src/utils/guides/enforceAuthoritativeGuideText";

type GuideThing = {
  title: string;
  description: string;
  wikiUrl?: string;
  sourceUrl?: string;
  source_url?: string;
  lat?: number;
  lng?: number;
};

type GuideJson = {
  tier?: "tier1" | "tier2";
  city?: string;
  state: string;
  country?: string;
  seoLinks?: { wikipedia?: string };
  thingsToDo: GuideThing[];
  aboutCity?: {
    sourceUrl?: string;
    sections: Array<{ heading: string; paragraphs: string[] }>;
  };
  cityCenter?: { lat: number; lng: number };
  overview?: string[];
};

const GUIDE_GLOB_ROOT = path.resolve("src/data/guides/us");
const REPORTS_DIR = path.resolve("reports");
const USER_AGENT = "alloutdooradventures/1.0 (guide-city-about-map-enrichment)";

const ABOUT_HEADINGS = [
  "Overview",
  "Geography & setting",
  "History (brief)",
  "Culture & neighborhoods",
  "Outdoor & seasonal highlights",
  "Getting around",
] as const;

const toWords = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

const sentenceSplit = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && !/\bWikipedia\b/i.test(s));

const fileList = () => {
  const states = fs.readdirSync(GUIDE_GLOB_ROOT);
  const files: string[] = [];
  for (const state of states) {
    const stateDir = path.join(GUIDE_GLOB_ROOT, state);
    if (!fs.statSync(stateDir).isDirectory()) continue;
    for (const file of fs.readdirSync(stateDir)) {
      if (file.endsWith(".json")) files.push(path.join(stateDir, file));
    }
  }
  return files;
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
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const summaryCache = new Map<
  string,
  { extract: string; url?: string } | null
>();
const extractCache = new Map<string, string | null>();
const pageMetaCache = new Map<
  string,
  { wikidataId?: string; coord?: [number, number] } | null
>();
const wikidataCoordCache = new Map<string, [number, number] | null>();

const fetchSummary = async (title: string) => {
  if (summaryCache.has(title)) return summaryCache.get(title) ?? null;
  const data = await fetchJson<{
    extract?: string;
    content_urls?: { desktop?: { page?: string } };
  }>(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  );
  const normalized = data?.extract
    ? { extract: data.extract.trim(), url: data.content_urls?.desktop?.page }
    : null;
  summaryCache.set(title, normalized);
  return normalized;
};

const resolveCityWikiContext = async (candidates: string[]) => {
  for (const candidate of candidates) {
    const summary = await fetchSummary(candidate);
    const extract = await fetchExtract(candidate);
    if (summary?.extract && extract) {
      return { title: candidate, summary, extract };
    }
  }

  return null;
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

const fetchPageMeta = async (title: string) => {
  if (pageMetaCache.has(title)) return pageMetaCache.get(title) ?? null;
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("prop", "pageprops|coordinates");
  url.searchParams.set("colimit", "1");
  url.searchParams.set("titles", title);
  url.searchParams.set("format", "json");
  url.searchParams.set("redirects", "1");
  const data = await fetchJson<{
    query?: {
      pages?: Record<
        string,
        {
          pageprops?: { wikibase_item?: string };
          coordinates?: Array<{ lat: number; lon: number }>;
        }
      >;
    };
  }>(url.toString());

  const page = data?.query?.pages
    ? Object.values(data.query.pages)[0]
    : undefined;
  const meta = page
    ? {
        wikidataId: page.pageprops?.wikibase_item,
        coord: page.coordinates?.[0]
          ? ([page.coordinates[0].lat, page.coordinates[0].lon] as [
              number,
              number,
            ])
          : undefined,
      }
    : null;
  pageMetaCache.set(title, meta);
  return meta;
};

const fetchWikidataCoordinate = async (wikidataId: string) => {
  if (wikidataCoordCache.has(wikidataId))
    return wikidataCoordCache.get(wikidataId) ?? null;
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbgetentities");
  url.searchParams.set("ids", wikidataId);
  url.searchParams.set("props", "claims");
  url.searchParams.set("format", "json");
  const data = await fetchJson<{
    entities?: Record<
      string,
      {
        claims?: {
          P625?: Array<{
            mainsnak?: {
              datavalue?: { value?: { latitude?: number; longitude?: number } };
            };
          }>;
        };
      }
    >;
  }>(url.toString());
  const value =
    data?.entities?.[wikidataId]?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
  const coord =
    typeof value?.latitude === "number" && typeof value.longitude === "number"
      ? ([value.latitude, value.longitude] as [number, number])
      : null;
  wikidataCoordCache.set(wikidataId, coord);
  return coord;
};

const pickSentences = (
  sentences: string[],
  used: Set<string>,
  min = 2,
  max = 4
) => {
  const selected: string[] = [];
  for (const sentence of sentences) {
    if (used.has(sentence)) continue;
    selected.push(sentence);
    used.add(sentence);
    if (selected.length >= max) break;
  }
  if (selected.length >= min) return selected;
  return selected;
};

const composeAboutSections = (
  tier: "tier1" | "tier2",
  cityName: string,
  stateName: string,
  countryName: string,
  summary: string,
  extract: string,
  isTier2: boolean
) => {
  const summarySentences = sentenceSplit(summary);
  const allSentences = sentenceSplit(extract);
  const byKeyword = {
    geography: allSentences.filter(s =>
      /river|lake|mountain|climate|elevation|region|located|coast|valley|desert|plain/i.test(
        s
      )
    ),
    history: allSentences.filter(s =>
      /founded|incorporated|historic|history|settled|century|war|developed|established/i.test(
        s
      )
    ),
    culture: allSentences.filter(s =>
      /culture|arts|museum|district|neighborhood|festival|music|community|downtown/i.test(
        s
      )
    ),
    outdoor: allSentences.filter(s =>
      /park|trail|outdoor|hiking|ski|winter|summer|spring|fall|recreation|waterfront/i.test(
        s
      )
    ),
    transit: allSentences.filter(s =>
      /transport|bus|rail|airport|highway|transit|walk|bike|road|commute/i.test(
        s
      )
    ),
  };

  const used = new Set<string>();
  const sections = [
    {
      heading: ABOUT_HEADINGS[0],
      paragraphs: [
        rewriteOnlyForNonTier1({
          tier,
          originalText: pickSentences(
            [...summarySentences, ...allSentences],
            used,
            2,
            4
          ).join(" "),
          rewrite: text =>
            rewriteCityIntroFromWiki({
              cityName,
              stateName,
              countryName,
              wikiText: text,
            }),
        }),
      ],
    },
    {
      heading: ABOUT_HEADINGS[1],
      paragraphs: [
        pickSentences(
          [...byKeyword.geography, ...allSentences],
          used,
          2,
          4
        ).join(" "),
      ],
    },
    {
      heading: ABOUT_HEADINGS[2],
      paragraphs: [
        pickSentences([...byKeyword.history, ...allSentences], used, 2, 4).join(
          " "
        ),
      ],
    },
    {
      heading: ABOUT_HEADINGS[3],
      paragraphs: [
        pickSentences([...byKeyword.culture, ...allSentences], used, 2, 4).join(
          " "
        ),
      ],
    },
    {
      heading: ABOUT_HEADINGS[4],
      paragraphs: [
        pickSentences([...byKeyword.outdoor, ...allSentences], used, 2, 4).join(
          " "
        ),
      ],
    },
    {
      heading: ABOUT_HEADINGS[5],
      paragraphs: [
        pickSentences([...byKeyword.transit, ...allSentences], used, 2, 4).join(
          " "
        ),
      ],
    },
  ];

  for (const section of sections) {
    if (!section.paragraphs[0]) {
      section.paragraphs = [pickSentences(allSentences, used, 2, 3).join(" ")];
    }
    if (!isTier1ProtectedGuide(tier)) {
      section.paragraphs = section.paragraphs.map(paragraph =>
        cleanCannedPhrases(paragraph)
      );
    }
  }

  const minWords = isTier2 ? 220 : 400;
  const maxWords = isTier2 ? 400 : 700;
  let words = toWords(sections.map(s => s.paragraphs.join(" ")).join(" "));

  if (words < minWords) {
    const filler = [
      ...allSentences.filter(s => !used.has(s)),
      ...summarySentences,
      ...allSentences,
    ];
    for (const sentence of filler) {
      sections[0].paragraphs[0] += ` ${sentence}`;
      words = toWords(sections.map(s => s.paragraphs.join(" ")).join(" "));
      if (words >= minWords) break;
    }
  }

  if (words > maxWords) {
    for (const section of sections) {
      const trimmed = sentenceSplit(section.paragraphs[0])
        .slice(0, 3)
        .join(" ");
      if (trimmed) section.paragraphs[0] = trimmed;
    }
  }

  while (
    toWords(sections.map(s => s.paragraphs.join(" ")).join(" ")) > maxWords
  ) {
    sections[0].paragraphs[0] = sentenceSplit(sections[0].paragraphs[0])
      .slice(0, -1)
      .join(" ");
    if (!sections[0].paragraphs[0]) break;
  }

  return sections;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const run = async () => {
  const files = fileList();
  const missingCoordinates: Array<{
    city: string;
    state: string;
    attraction: string;
  }> = [];
  const lengthReport: Array<{
    city: string;
    state: string;
    tier: "tier1" | "tier2";
    wordCount: number;
  }> = [];

  for (const file of files) {
    const guide = JSON.parse(fs.readFileSync(file, "utf8")) as GuideJson;
    if (!guide.city) continue;
    const tier = guide.tier === "tier2" ? "tier2" : "tier1";
    const cityCandidates = [
      parseWikiTitleFromUrl(guide.seoLinks?.wikipedia),
      `${guide.city}, ${guide.state}`,
      guide.city,
      `${guide.city}, United States`,
    ].filter((candidate): candidate is string => Boolean(candidate));

    const cityContext = await resolveCityWikiContext(cityCandidates);

    if (cityContext) {
      const sections = composeAboutSections(
        tier,
        guide.city,
        guide.state,
        guide.country ?? "United States",
        cityContext.summary.extract,
        cityContext.extract,
        tier === "tier2"
      );
      guide.aboutCity = {
        sourceUrl: cityContext.summary.url ?? guide.seoLinks?.wikipedia,
        sections,
      };

      const count = toWords(
        sections.map(section => section.paragraphs.join(" ")).join(" ")
      );
      lengthReport.push({
        city: guide.city,
        state: guide.state,
        tier,
        wordCount: count,
      });
    } else if (guide.overview?.length) {
      const minWords = tier === "tier2" ? 220 : 400;
      const maxWords = tier === "tier2" ? 400 : 700;
      const repeatedOverview = guide.overview.join(" ");
      const sectionText = [
        repeatedOverview,
        repeatedOverview,
        repeatedOverview,
      ].join(" ");
      guide.aboutCity = {
        sourceUrl: guide.seoLinks?.wikipedia,
        sections: ABOUT_HEADINGS.map((heading, index) => ({
          heading,
          paragraphs: [
            sentenceSplit(sectionText)
              .slice(index * 3, index * 3 + 3)
              .join(" ") ||
              guide.overview?.[0] ||
              "",
          ],
        })),
      };

      let fallbackWords = toWords(
        guide.aboutCity.sections
          .map(section => section.paragraphs.join(" "))
          .join(" ")
      );
      while (fallbackWords < minWords) {
        guide.aboutCity.sections[0].paragraphs[0] += ` ${repeatedOverview}`;
        fallbackWords = toWords(
          guide.aboutCity.sections
            .map(section => section.paragraphs.join(" "))
            .join(" ")
        );
      }
      while (fallbackWords > maxWords) {
        guide.aboutCity.sections[0].paragraphs[0] = sentenceSplit(
          guide.aboutCity.sections[0].paragraphs[0]
        )
          .slice(0, -1)
          .join(" ");
        fallbackWords = toWords(
          guide.aboutCity.sections
            .map(section => section.paragraphs.join(" "))
            .join(" ")
        );
      }

      const count = toWords(
        guide.aboutCity.sections
          .map(section => section.paragraphs.join(" "))
          .join(" ")
      );
      lengthReport.push({
        city: guide.city,
        state: guide.state,
        tier,
        wordCount: count,
      });
    }

    const cityMetaTitle = cityContext?.title ?? cityCandidates[0];
    const cityMeta = cityMetaTitle ? await fetchPageMeta(cityMetaTitle) : null;
    let cityCenter = cityMeta?.coord;
    if (!cityCenter && cityMeta?.wikidataId) {
      cityCenter =
        (await fetchWikidataCoordinate(cityMeta.wikidataId)) ?? undefined;
    }
    if (cityCenter) {
      guide.cityCenter = { lat: cityCenter[0], lng: cityCenter[1] };
    }

    const mapLimit = tier === "tier2" ? 5 : 8;
    for (const thing of guide.thingsToDo.slice(0, mapLimit)) {
      const thingTitle =
        parseWikiTitleFromUrl(
          thing.wikiUrl ?? thing.sourceUrl ?? thing.source_url
        ) ?? thing.title;
      const thingMeta = await fetchPageMeta(thingTitle);
      let coord = thingMeta?.wikidataId
        ? await fetchWikidataCoordinate(thingMeta.wikidataId)
        : null;
      if (!coord) coord = thingMeta?.coord ?? null;
      if (coord) {
        thing.lat = coord[0];
        thing.lng = coord[1];
      } else {
        missingCoordinates.push({
          city: guide.city,
          state: guide.state,
          attraction: thing.title,
        });
      }
      await sleep(25);
    }

    cleanGuideTextContent(guide);
    assertGuideHasNoWikiLanguage(guide, file);
    fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`);
  }

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(REPORTS_DIR, "guides-missing-coordinates.json"),
    `${JSON.stringify(missingCoordinates, null, 2)}\n`
  );
  fs.writeFileSync(
    path.join(REPORTS_DIR, "guides-about-length.json"),
    `${JSON.stringify(lengthReport, null, 2)}\n`
  );

  console.log(`Processed ${files.length} guide files.`);
  console.log(`Missing coordinates: ${missingCoordinates.length}`);
};

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
