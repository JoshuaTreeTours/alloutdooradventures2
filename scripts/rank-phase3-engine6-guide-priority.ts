import fs from "node:fs";
import path from "node:path";
import type { GuidePageData } from "../src/utils/loadGuide";
import { resolveGuidePlaceClassification } from "../src/data/resolveGuidePlaceClassification";
import { enhanceCaliforniaGuide } from "../src/data/californiaGuideEnhancements";
import { enhanceCaliforniaMajorCityGuide } from "../src/data/californiaMajorCityEnhancements";
import { enhanceSacramentoGuide } from "../src/data/californiaSacramentoEnhancement";
import { enhanceCaliforniaSoCalRegionalGuide } from "../src/data/californiaSoCalRegionalEnhancements";
import { enhanceCaliforniaParagonCityGuide } from "../src/data/californiaParagonCityEnhancements";
import { enhancePhase1ParagonCityGuide, PHASE1_PARAGON_CITY_KEYS } from "../src/data/phase1ParagonCityEnhancements";
import { enhancePhase2ParagonCityGuide, PHASE2_PARAGON_CITY_KEYS } from "../src/data/phase2ParagonCityEnhancements";
import { enhancePhase3Engine6CityGuide, PHASE3_ENGINE6_CITY_KEYS } from "../src/data/phase3Engine6CityEnhancements";
import { engine6ListingTours } from "../src/engine6/listing";
import { tours } from "../src/data/tours";

const ROOT = path.resolve("src/data/guides/us");
const REPORT_DIR = path.resolve("reports");

const PARAGON_CONTROLS = new Set([
  "california/santa-monica",
  "california/san-francisco",
  "california/san-diego",
  "california/sacramento",
]);

const ALREADY_REBUILT = new Set([
  ...PHASE1_PARAGON_CITY_KEYS,
  ...PHASE2_PARAGON_CITY_KEYS,
]);

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
const words = (value: string) => normalize(value).split(" ").filter(Boolean).length;

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".json") && entry.name !== "index.json"
      ? [full]
      : [];
  });

const applyRuntimeEnhancements = (
  stateSlug: string,
  citySlug: string,
  guide: GuidePageData
): GuidePageData =>
  enhancePhase3Engine6CityGuide(
    stateSlug,
    citySlug,
    enhancePhase2ParagonCityGuide(
      stateSlug,
      citySlug,
      enhancePhase1ParagonCityGuide(
        stateSlug,
        citySlug,
        enhanceCaliforniaParagonCityGuide(
          stateSlug,
          citySlug,
          enhanceCaliforniaSoCalRegionalGuide(
            stateSlug,
            citySlug,
            enhanceSacramentoGuide(
              stateSlug,
              citySlug,
              enhanceCaliforniaMajorCityGuide(
                stateSlug,
                citySlug,
                enhanceCaliforniaGuide(stateSlug, citySlug, guide)
              )
            )
          )
        )
      )
    )
  );

const countByCity = <T extends { destination: { stateSlug?: string; citySlug?: string } }>(items: T[]) =>
  items.reduce<Map<string, number>>((counts, item) => {
    const stateSlug = item.destination.stateSlug;
    const citySlug = item.destination.citySlug;
    if (!stateSlug || !citySlug) return counts;
    const key = `${stateSlug}/${citySlug}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    return counts;
  }, new Map());

const engine6CountByCity = countByCity(engine6ListingTours);
const totalTourCountByCity = countByCity(tours);

const badPatterns: Array<[string, RegExp]> = [
  ["generic strong-base wrapper", /is a strong base for culture, food, and outdoor day plans/i],
  ["legacy value template", /one of the most valuable things to do/i],
  ["article-set jargon", /article set/i],
  ["lexical-anchor jargon", /lexical anchors/i],
  ["validation jargon", /validation and traceability/i],
  ["generic checklist prose", /generic checklist item/i],
  ["generic visitor-circuit padding", /part of the primary visitor circuit/i],
  ["generic ninety-minute padding", /reserve at least ninety minutes on site/i],
  ["generic source-page padding", /this listing links directly to the corresponding source page/i],
  ["synthetic coverage padding", /coverage for .* cites dated milestones/i],
  ["synthetic measurable-attributes padding", /same article set references measurable attributes/i],
];

type Row = {
  route: string;
  state: string;
  city: string;
  engine6Tours: number;
  totalTours: number;
  qualityRisk: number;
  phase3Priority: number;
  recommendation: "rebuild" | "surgical" | "leave";
  phase3Implemented: boolean;
  reasons: string[];
};

const scoreGuide = (stateSlug: string, citySlug: string, rawGuide: GuidePageData): Row | null => {
  const key = `${stateSlug}/${citySlug}`;
  if (ALREADY_REBUILT.has(key) || PARAGON_CONTROLS.has(key)) return null;

  const guide = applyRuntimeEnhancements(stateSlug, citySlug, rawGuide);
  const city = guide.city?.trim() || citySlug;
  const classification = resolveGuidePlaceClassification(stateSlug, citySlug, city);
  if (classification.placeType === "national-park") return null;

  const reasons: string[] = [];
  let qualityRisk = 0;

  const overviewWords = words((guide.overview ?? []).join(" "));
  if (overviewWords < 45) {
    qualityRisk += 18;
    reasons.push(`thin overview (${overviewWords} words)`);
  } else if (overviewWords < 80) {
    qualityRisk += 7;
    reasons.push(`short overview (${overviewWords} words)`);
  }

  const things = guide.thingsToDo ?? [];
  if (things.length < 6) {
    qualityRisk += 24;
    reasons.push(`only ${things.length} Things to Do entries`);
  } else if (things.length < 8) {
    qualityRisk += 8;
    reasons.push(`only ${things.length} Things to Do entries`);
  }

  const descriptions = things.map(item => normalize(item.description ?? "")).filter(Boolean);
  const avgChars = descriptions.length
    ? Math.round(descriptions.reduce((sum, text) => sum + text.length, 0) / descriptions.length)
    : 0;
  if (descriptions.length && avgChars < 180) {
    qualityRisk += 20;
    reasons.push(`thin attraction copy (${avgChars} avg chars)`);
  } else if (descriptions.length && avgChars < 260) {
    qualityRisk += 8;
    reasons.push(`moderately thin attraction copy (${avgChars} avg chars)`);
  }

  const duplicateDescriptions = descriptions.length - new Set(descriptions.map(value => value.toLowerCase())).size;
  if (duplicateDescriptions > 0) {
    qualityRisk += Math.min(24, duplicateDescriptions * 8);
    reasons.push(`${duplicateDescriptions} duplicate attraction descriptions`);
  }

  const proseOnly = normalize([
    guide.hero?.subheadline,
    ...(guide.overview ?? []),
    ...(guide.highlights ?? []).flatMap(item => [item.title, item.description]),
    ...things.flatMap(item => [item.title, item.description]),
    guide.bestTimeToVisit?.title,
    ...(guide.bestTimeToVisit?.bullets ?? []),
    ...(guide.travelTips ?? []),
    ...(guide.faq ?? []).flatMap(item => [item.q, item.a]),
    ...(guide.aboutCity?.sections ?? []).flatMap(section => [section.heading, ...(section.paragraphs ?? [])]),
    guide.aboutCity?.wikiSummaryText,
    guide.aboutCity?.wikiExtractText,
  ].filter(Boolean).join(" "));

  const patternHits = badPatterns.filter(([, pattern]) => pattern.test(proseOnly));
  if (patternHits.length) {
    qualityRisk += Math.min(42, patternHits.length * 10);
    reasons.push(`template/machine residue: ${patternHits.map(([label]) => label).join(", ")}`);
  }

  if ((guide.highlights?.length ?? 0) < 2) {
    qualityRisk += 5;
    reasons.push("weak highlights coverage");
  }
  if ((guide.travelTips?.length ?? 0) < 3) {
    qualityRisk += 7;
    reasons.push("thin travel tips");
  }
  if ((guide.bestTimeToVisit?.bullets?.length ?? 0) < 3) {
    qualityRisk += 5;
    reasons.push("thin seasonal guidance");
  }
  if ((guide.faq?.length ?? 0) < 2) {
    qualityRisk += 6;
    reasons.push("thin FAQ coverage");
  }

  // Wikipedia/source URLs are intentionally neutral. They are citations, not defects.
  qualityRisk = Math.min(100, qualityRisk);

  const engine6Tours = engine6CountByCity.get(key) ?? 0;
  const totalTours = totalTourCountByCity.get(key) ?? 0;
  const phase3Priority = Math.round(engine6Tours * 6 + Math.min(totalTours, 40) * 0.5 + qualityRisk);
  const recommendation = qualityRisk >= 45 ? "rebuild" : qualityRisk >= 20 ? "surgical" : "leave";

  return {
    route: `/guides/us/${stateSlug}/${citySlug}`,
    state: guide.state || stateSlug,
    city,
    engine6Tours,
    totalTours,
    qualityRisk,
    phase3Priority,
    recommendation,
    phase3Implemented: PHASE3_ENGINE6_CITY_KEYS.has(key),
    reasons,
  };
};

const rows = walk(ROOT)
  .map(file => {
    const relative = path.relative(ROOT, file).replaceAll("\\", "/");
    const [stateSlug = "", filename = ""] = relative.split("/");
    const citySlug = filename.replace(/\.json$/i, "");
    const rawGuide = JSON.parse(fs.readFileSync(file, "utf8")) as GuidePageData;
    return scoreGuide(stateSlug, citySlug, rawGuide);
  })
  .filter((row): row is Row => Boolean(row));

const ranked = rows
  .filter(row => row.engine6Tours > 0)
  .sort((a, b) => b.phase3Priority - a.phase3Priority || b.engine6Tours - a.engine6Tours || b.qualityRisk - a.qualityRisk);

const top = ranked.slice(0, 40);
const implemented = ranked
  .filter(row => row.phase3Implemented)
  .sort((a, b) => b.engine6Tours - a.engine6Tours);
const remainingActionable = ranked
  .filter(row => !row.phase3Implemented && row.recommendation !== "leave")
  .slice(0, 30);

fs.mkdirSync(REPORT_DIR, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  policy: "Wikipedia/source links are neutral; prioritize Engine6 inventory and genuine content defects.",
  totalRemainingEngine6Cities: ranked.length,
  implemented,
  top,
  remainingActionable,
};
fs.writeFileSync(path.join(REPORT_DIR, "phase3-engine6-guide-priority.json"), JSON.stringify(report, null, 2));

const md = [
  "# Phase III — Engine6-weighted City Guide Priority",
  "",
  "Wikipedia/source links are intentionally neutral. This audit prioritizes real guide defects in destinations with native Engine6 inventory.",
  "",
  "Phase I/II cities and national-park guides are excluded. The seven Phase III destinations are re-scored after their runtime enhancement so the report verifies the implemented result rather than hiding it.",
  "",
  "## Phase III implemented destinations",
  "",
  "| Guide | Engine6 | Total tours | Post-repair risk | Result |",
  "|---|---:|---:|---:|---|",
  ...implemented.map(row => `| ${row.state} — ${row.city} | ${row.engine6Tours} | ${row.totalTours} | ${row.qualityRisk} | ${row.recommendation} |`),
  "",
  "## Top remaining Engine6 destinations",
  "",
  "| Rank | Guide | Engine6 | Total tours | Risk | Priority | Recommendation | Main reasons |",
  "|---:|---|---:|---:|---:|---:|---|---|",
  ...top.map((row, index) => `| ${index + 1} | ${row.state} — ${row.city} | ${row.engine6Tours} | ${row.totalTours} | ${row.qualityRisk} | ${row.phase3Priority} | ${row.recommendation} | ${row.reasons.slice(0, 3).join("; ").replaceAll("|", "\\|") || "passes current quality checks"} |`),
  "",
  "## Remaining actionable candidates after Phase III",
  "",
  "| Rank | Guide | Engine6 | Risk | Recommendation |",
  "|---:|---|---:|---:|---|",
  ...remainingActionable.map((row, index) => `| ${index + 1} | ${row.state} — ${row.city} | ${row.engine6Tours} | ${row.qualityRisk} | ${row.recommendation} |`),
  "",
].join("\n");

fs.writeFileSync(path.join(REPORT_DIR, "phase3-engine6-guide-priority.md"), md);
console.log(md);
