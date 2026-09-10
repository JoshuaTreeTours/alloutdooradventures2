import fs from "node:fs";
import path from "node:path";
import type { GuidePageData } from "../src/utils/loadGuide";
import { resolveGuidePlaceClassification } from "../src/data/resolveGuidePlaceClassification";
import { enhanceCaliforniaGuide } from "../src/data/californiaGuideEnhancements";
import { enhanceCaliforniaMajorCityGuide } from "../src/data/californiaMajorCityEnhancements";
import { enhanceSacramentoGuide } from "../src/data/californiaSacramentoEnhancement";
import { enhanceCaliforniaSoCalRegionalGuide } from "../src/data/californiaSoCalRegionalEnhancements";
import { enhanceCaliforniaParagonCityGuide } from "../src/data/californiaParagonCityEnhancements";
import { tours } from "../src/data/tours";

type RankedGuide = {
  route: string;
  state: string;
  city: string;
  placeType: string;
  verifiedClassification: boolean;
  tourCount: number;
  paragonControl: boolean;
  qualityRisk: number;
  commercialBoost: number;
  repairPriority: number;
  reasons: string[];
};

const ROOT = path.resolve("src/data/guides/us");
const REPORT_DIR = path.resolve("reports");

const PARAGON_CONTROLS = new Set([
  "california/santa-monica",
  "california/san-francisco",
  "california/san-diego",
  "california/sacramento",
]);

const boilerplatePatterns: Array<[string, RegExp]> = [
  ["generic strong-base prose", /is a strong base for travelers/i],
  ["generic prominent-landmark prose", /is a prominent landmark/i],
  ["generic physical-cultural-landscape prose", /physical and cultural landscape/i],
  ["traceability jargon", /validation and traceability/i],
  ["encyclopedic-signature jargon", /encyclopedic signature/i],
  ["lexical-anchor jargon", /lexical anchors/i],
  ["article-set jargon", /article set/i],
  ["legacy value template", /one of the most valuable things to do/i],
  ["generic checklist prose", /generic checklist item/i],
  ["generic visit-condition suffix", /check current hours, reservations, closures and transit conditions before visiting/i],
  ["generic build-stop prose", /build this stop into the day/i],
];

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
  );

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
const words = (value: string) => normalize(value).split(" ").filter(Boolean).length;

const tourCountByGuide = tours.reduce<Map<string, number>>((counts, tour) => {
  const stateSlug = tour.destination.stateSlug;
  const citySlug = tour.destination.citySlug;
  if (!stateSlug || !citySlug) return counts;
  const key = `${stateSlug}/${citySlug}`;
  counts.set(key, (counts.get(key) ?? 0) + 1);
  return counts;
}, new Map());

const scoreGuide = (
  stateSlug: string,
  citySlug: string,
  rawGuide: GuidePageData
): RankedGuide | null => {
  const guide = applyRuntimeEnhancements(stateSlug, citySlug, rawGuide);
  const city = guide.city?.trim() || citySlug;
  const classification = resolveGuidePlaceClassification(stateSlug, citySlug, city);

  // National parks were completed in the preceding guide phase. Phase I is the
  // city/town/community cleanup queue, so keep parks out of this ranking.
  if (classification.placeType === "national-park") return null;

  const reasons: string[] = [];
  let qualityRisk = 0;

  if (!classification.verified) {
    qualityRisk += 12;
    reasons.push("classification not verified");
  }

  const overview = guide.overview ?? [];
  const overviewWords = words(overview.join(" "));
  if (overviewWords < 45) {
    qualityRisk += 15;
    reasons.push(`thin overview (${overviewWords} words)`);
  } else if (overviewWords < 80) {
    qualityRisk += 8;
    reasons.push(`short overview (${overviewWords} words)`);
  }

  const things = guide.thingsToDo ?? [];
  if (things.length === 0) {
    qualityRisk += 30;
    reasons.push("no Things to Do entries");
  } else if (things.length < 6) {
    qualityRisk += 12;
    reasons.push(`only ${things.length} Things to Do entries`);
  }

  const descriptions = things
    .map(item => normalize(item.description ?? ""))
    .filter(Boolean);
  const averageDescriptionChars = descriptions.length
    ? Math.round(descriptions.reduce((sum, value) => sum + value.length, 0) / descriptions.length)
    : 0;
  if (descriptions.length && averageDescriptionChars < 140) {
    qualityRisk += 20;
    reasons.push(`very thin attraction copy (${averageDescriptionChars} avg chars)`);
  } else if (descriptions.length && averageDescriptionChars < 240) {
    qualityRisk += 10;
    reasons.push(`thin attraction copy (${averageDescriptionChars} avg chars)`);
  }

  const duplicateDescriptions = descriptions.length - new Set(descriptions.map(value => value.toLowerCase())).size;
  if (duplicateDescriptions > 0) {
    qualityRisk += Math.min(25, duplicateDescriptions * 8);
    reasons.push(`${duplicateDescriptions} duplicate attraction descriptions`);
  }

  const fullText = normalize(
    [
      guide.title,
      guide.hero?.headline,
      guide.hero?.subheadline,
      ...overview,
      ...(guide.highlights ?? []).flatMap(item => [item.title, item.description]),
      ...things.flatMap(item => [item.title, item.description]),
      guide.bestTimeToVisit?.title,
      ...(guide.bestTimeToVisit?.bullets ?? []),
      ...(guide.travelTips ?? []),
      ...(guide.faq ?? []).flatMap(item => [item.q, item.a]),
      guide.aboutCity?.wikiSummaryText,
      guide.aboutCity?.wikiExtractText,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const boilerplateHits = boilerplatePatterns.filter(([, pattern]) => pattern.test(fullText));
  if (boilerplateHits.length) {
    qualityRisk += Math.min(35, boilerplateHits.length * 9);
    reasons.push(`boilerplate: ${boilerplateHits.map(([label]) => label).join(", ")}`);
  }

  const serialized = JSON.stringify(guide);
  const wikipediaMentions = (serialized.match(/wikipedia/gi) ?? []).length;
  if (wikipediaMentions > 0) {
    qualityRisk += Math.min(30, 12 + wikipediaMentions * 3);
    reasons.push(`Wikipedia residue (${wikipediaMentions} mentions/fields)`);
  }

  if (guide.aboutCity?.wikiSummaryText || guide.aboutCity?.wikiExtractText) {
    qualityRisk += 12;
    reasons.push("legacy wiki-derived About content still active");
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

  const suspiciousTitles = things.filter(item => /^(hour visitor pass|visitor pass|day pass)$/i.test(item.title ?? ""));
  if (suspiciousTitles.length) {
    qualityRisk += 20;
    reasons.push(`suspicious attraction title: ${suspiciousTitles.map(item => item.title).join(", ")}`);
  }

  qualityRisk = Math.min(100, qualityRisk);
  const tourCount = tourCountByGuide.get(`${stateSlug}/${citySlug}`) ?? 0;
  const commercialBoost = Math.min(20, tourCount * 2);
  const repairPriority = Math.min(120, qualityRisk + commercialBoost);

  return {
    route: `/guides/us/${stateSlug}/${citySlug}`,
    state: guide.state || stateSlug,
    city,
    placeType: classification.placeType,
    verifiedClassification: classification.verified,
    tourCount,
    paragonControl: PARAGON_CONTROLS.has(`${stateSlug}/${citySlug}`),
    qualityRisk,
    commercialBoost,
    repairPriority,
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
  .filter((row): row is RankedGuide => Boolean(row));

const queue = rows
  .filter(row => !row.paragonControl)
  .sort((a, b) => b.repairPriority - a.repairPriority || b.qualityRisk - a.qualityRisk || a.city.localeCompare(b.city));
const controls = rows
  .filter(row => row.paragonControl)
  .sort((a, b) => a.city.localeCompare(b.city));

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(path.join(REPORT_DIR, "phase1-city-guide-ranking.json"), JSON.stringify({ generatedAt: new Date().toISOString(), totalScored: rows.length, queue, controls }, null, 2));

const csvEscape = (value: string | number | boolean) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const csvRows = [
  ["rank", "route", "state", "city", "placeType", "verifiedClassification", "tourCount", "qualityRisk", "commercialBoost", "repairPriority", "reasons"],
  ...queue.map((row, index) => [index + 1, row.route, row.state, row.city, row.placeType, row.verifiedClassification, row.tourCount, row.qualityRisk, row.commercialBoost, row.repairPriority, row.reasons.join("; ")]),
];
fs.writeFileSync(path.join(REPORT_DIR, "phase1-city-guide-ranking.csv"), csvRows.map(row => row.map(csvEscape).join(",")).join("\n") + "\n");

const top = queue.slice(0, 50);
const md = [
  "# Phase I — City Guide Repair Ranking",
  "",
  `Scored **${rows.length}** U.S. city/town/community guides after applying the same California enhancement layers used by the live guide registry. National-park guides are excluded because they were completed in the preceding phase.`,
  "",
  "`qualityRisk` measures stale/thin/boilerplate risk (0–100). `repairPriority` adds up to 20 points for live tour inventory so commercially important weak guides rise in the queue.",
  "",
  "## Top 50 repair queue",
  "",
  "| Rank | Guide | Type | Tours | Risk | Priority | Main reasons |",
  "|---:|---|---|---:|---:|---:|---|",
  ...top.map((row, index) => `| ${index + 1} | ${row.state} — ${row.city} | ${row.placeType} | ${row.tourCount} | ${row.qualityRisk} | ${row.repairPriority} | ${row.reasons.slice(0, 4).join("; ").replaceAll("|", "\\|")} |`),
  "",
  "## Paragon controls",
  "",
  "These guides are calibration controls and are not placed in the rewrite queue.",
  "",
  "| Guide | Tours | Risk | Priority | Notes |",
  "|---|---:|---:|---:|---|",
  ...controls.map(row => `| ${row.state} — ${row.city} | ${row.tourCount} | ${row.qualityRisk} | ${row.repairPriority} | ${row.reasons.length ? row.reasons.join("; ").replaceAll("|", "\\|") : "passes current risk checks"} |`),
  "",
].join("\n");
fs.writeFileSync(path.join(REPORT_DIR, "phase1-city-guide-ranking.md"), md);

console.log(md);
