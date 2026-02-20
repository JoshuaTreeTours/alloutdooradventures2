import fs from "node:fs";
import path from "node:path";
import { buildCityFactsCard } from "../src/utils/guides/buildCityFactsCard";
import {
  assertGuideHasNoWikiLanguage,
  cleanGuideTextContent,
} from "../src/utils/guides/wikiLanguageGuard";
import { validateNoBoilerplate } from "../src/utils/guides/validateNoBoilerplate";

type GuideThing = { title: string; description?: string };
type GuideJson = {
  city?: string;
  state: string;
  country?: string;
  overview?: string[];
  seoLinks?: { wikipedia?: string };
  thingsToDo: GuideThing[];
  aboutCity?: {
    sourceUrl?: string;
    sections?: Array<{ paragraphs?: string[] }>;
    wikiSummaryText?: string;
    wikiExtractText?: string;
    factsCard?: {
      title: string;
      bullets: Array<{ label: string; value: string }>;
    };
  };
};

const GUIDE_GLOB_ROOT = path.resolve("src/data/guides/us");
const USER_AGENT = "alloutdooradventures/1.0 (guide-city-facts-enrichment)";

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

const fetchSummary = async (title: string) => {
  const data = await fetchJson<{
    extract?: string;
    content_urls?: { desktop?: { page?: string } };
  }>(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  );
  return data?.extract
    ? { extract: data.extract.trim(), url: data.content_urls?.desktop?.page }
    : null;
};

const fetchExtract = async (title: string) => {
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
  return pages[0]?.extract?.trim();
};

const resolveCityWikiContext = async (candidates: string[]) => {
  for (const candidate of candidates) {
    const summary = await fetchSummary(candidate);
    const extract = await fetchExtract(candidate);
    if (summary?.extract || extract) {
      return { title: candidate, summary, extract };
    }
  }
  return null;
};

const run = async () => {
  const files = fileList();
  let warnings = 0;

  const cityFilter = new Set(
    process.argv
      .find(arg => arg.startsWith("--cities="))
      ?.replace("--cities=", "")
      .split(",")
      .map(item => item.trim().toLowerCase())
      .filter(Boolean) ?? []
  );

  for (const file of files) {
    try {
      const guide = JSON.parse(fs.readFileSync(file, "utf8")) as GuideJson;
      if (!guide.city) continue;
      if (cityFilter.size && !cityFilter.has(guide.city.toLowerCase()))
        continue;

      const cityCandidates = [
        parseWikiTitleFromUrl(guide.seoLinks?.wikipedia),
        `${guide.city}, ${guide.state}`,
        guide.city,
      ].filter((candidate): candidate is string => Boolean(candidate));

      const cityContext = await resolveCityWikiContext(cityCandidates);
      const factsCard = buildCityFactsCard({
        cityName: guide.city,
        stateName: guide.state,
        countryName: guide.country ?? "United States",
        wikiSummaryText: cityContext?.summary?.extract ?? guide.overview?.[0],
        wikiExtractText:
          cityContext?.extract ??
          guide.aboutCity?.sections
            ?.flatMap(section => section.paragraphs ?? [])
            .join(" "),
        thingsToDoItems: guide.thingsToDo,
      });

      if (factsCard.bullets.length < 3) {
        warnings += 1;
        console.warn(
          `[warn] ${guide.city}, ${guide.state}: only ${factsCard.bullets.length} About bullets generated.`
        );
      }

      const hasBoilerplate = factsCard.bullets.some(
        bullet => !validateNoBoilerplate(`${bullet.label}: ${bullet.value}`)
      );
      if (hasBoilerplate) {
        warnings += 1;
        console.warn(
          `[warn] ${guide.city}, ${guide.state}: About card contains banned phrase.`
        );
      }

      guide.aboutCity = {
        sourceUrl: cityContext?.summary?.url ?? guide.seoLinks?.wikipedia,
        wikiSummaryText: cityContext?.summary?.extract,
        wikiExtractText: cityContext?.extract,
        factsCard,
      };

      cleanGuideTextContent(guide);
      assertGuideHasNoWikiLanguage(guide, file);
      fs.writeFileSync(file, `${JSON.stringify(guide, null, 2)}\n`);
    } catch (error) {
      warnings += 1;
      console.warn(`[warn] Failed enriching ${file}:`, error);
    }
  }

  console.log(`Processed ${files.length} guides with ${warnings} warnings.`);
};

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
