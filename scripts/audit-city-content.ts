import fs from "node:fs";
import path from "node:path";
import {
  auditCityGuideContent,
  buildTopThingsAuditMetrics,
  type CityGuideIssue,
  type CityGuideTextContent,
} from "../src/data/cityGuideContent";
import { isTier1IntlCity } from "../src/data/cityTier1Intl";
import { isTier1City } from "../src/data/cityTier1";
import {
  buildCityOverrideRoute,
  cityOverrides,
} from "../src/data/cityOverrides";
import { buildTopThingsToDo } from "../src/data/cityTopThings";
import { allCityGuideRecords } from "../src/data/cityGuideRegistry.node";
import { buildCityGuideFacts } from "../src/lib/cityGuideFacts";
import { tours } from "../src/data/tours";
import { US_STATES, slugify } from "../src/data/tourCatalog";

const BOILERPLATE_SENTENCE_MIN_LENGTH = 80;
const BOILERPLATE_REPEAT_THRESHOLD = 8;

const getTopUsCityRoutesByTourCount = (limit = 50) => {
  const usStateSlugs = new Set(US_STATES.map(state => slugify(state)));
  const cityCounts = new Map<
    string,
    { count: number; city: string; state: string }
  >();

  tours.forEach(tour => {
    const stateSlug = tour.destination.stateSlug;
    const citySlug = tour.destination.citySlug;
    if (!stateSlug || !citySlug || !usStateSlugs.has(stateSlug)) {
      return;
    }
    const route = `${stateSlug}/${citySlug}`;
    const existing = cityCounts.get(route);
    if (existing) {
      existing.count += 1;
      return;
    }
    cityCounts.set(route, {
      count: 1,
      city: tour.destination.city,
      state: tour.destination.state,
    });
  });

  return new Set(
    Array.from(cityCounts.entries())
      .sort((a, b) => {
        if (b[1].count !== a[1].count) {
          return b[1].count - a[1].count;
        }
        return a[0].localeCompare(b[0]);
      })
      .slice(0, limit)
      .map(([route]) => route)
  );
};

const toCsvValue = (value: string) => {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
};

const runAudit = () => {
  const strict = process.argv.includes("--strict");
  const records = allCityGuideRecords.map(record => {
    const cityFacts = buildCityGuideFacts({
      cityName: record.city,
      citySlug: record.citySlug,
      parentName: record.state,
      parentSlug: record.stateSlug,
      regionType: record.regionType,
      tours: [],
      landmarks: null,
      metadata: null,
    });

    const cityData = record.cityData;
    const baseContent: CityGuideTextContent = {
      intro: cityData?.intro,
      topThingsToDo: buildTopThingsToDo(
        record.city,
        record.stateSlug,
        record.citySlug,
        {
          parentName: record.state,
          regionType: record.regionType,
          cityFacts,
        }
      ),
      extraText: [
        cityData?.shortDescription,
        cityData?.intro,
        ...(cityData?.whereItIs ?? []),
        ...(cityData?.thingsToDo ?? []),
        ...(cityData?.toursCopy ?? []),
        ...Object.values(cityData?.experiences ?? {}),
        ...(cityData?.weekendItinerary?.dayOne ?? []),
        ...(cityData?.weekendItinerary?.dayTwo ?? []),
        ...(cityData?.gettingThere ?? []),
        ...(cityData?.faq?.map(item => item.answer) ?? []),
        ...cityFacts.anchors,
        ...cityFacts.outdoors,
        ...cityFacts.nearby,
      ].filter(Boolean),
    };

    const overrideRoute = buildCityOverrideRoute({
      regionType: record.regionType,
      parentSlug: record.stateSlug,
      citySlug: record.citySlug,
    });
    const override = cityOverrides[overrideRoute];
    const overrideContent: CityGuideTextContent | null = override
      ? {
          intro: override.intro,
          bestTimeToVisit: override.bestTimeToVisit,
          whatToPack: override.whatToPack,
          itineraries: override.itineraries?.map(itinerary => ({
            title: itinerary.title,
            description: itinerary.description,
          })),
          thingsToDoSections: override.thingsToDoSections?.map(section => ({
            title: section.title,
            paragraphs: section.paragraphs,
          })),
          topThingsToDo: override.topThingsToDo?.map(item => ({
            title: item.title,
            description: item.description,
            activityType: item.activityType,
          })),
        }
      : null;

    const content: CityGuideTextContent = {
      ...baseContent,
      ...overrideContent,
      topThingsToDo:
        overrideContent?.topThingsToDo ?? baseContent.topThingsToDo,
    };

    const tier =
      record.regionType === "country" &&
      isTier1IntlCity(record.stateSlug, record.citySlug)
        ? 1
        : isTier1City(record.citySlug)
          ? 1
          : 2;
    const issues = auditCityGuideContent(content, {
      cityName: record.city,
      citySlug: record.citySlug,
      parentSlug: record.stateSlug,
      regionType: record.regionType,
      tier,
      cityFacts,
    });

    const topThingsMetrics = buildTopThingsAuditMetrics(content, {
      cityName: record.city,
      citySlug: record.citySlug,
      parentSlug: record.stateSlug,
      regionType: record.regionType,
      tier,
    });

    return {
      record,
      content,
      issues,
      topThingsMetrics,
      tier,
    };
  });

  const topUsCityRoutes = getTopUsCityRoutesByTourCount();
  const boilerplateIndex = new Map<string, { sentence: string; routes: Set<string> }>();

  records.forEach(entry => {
    entry.content.topThingsToDo?.forEach(item => {
      if (!item.description) {
        return;
      }
      const sentences = item.description.split(/(?<=[.!?])\s+/);
      sentences.forEach(sentence => {
        const normalized = sentence.replace(/\s+/g, " ").trim();
        if (normalized.length < BOILERPLATE_SENTENCE_MIN_LENGTH) {
          return;
        }
        const key = normalized.toLowerCase();
        const existing = boilerplateIndex.get(key) ?? {
          sentence: normalized,
          routes: new Set<string>(),
        };
        existing.routes.add(entry.record.route);
        boilerplateIndex.set(key, existing);
      });
    });
  });

  const boilerplateIssuesByRoute = new Map<string, CityGuideIssue[]>();
  boilerplateIndex.forEach(entry => {
    if (entry.routes.size < BOILERPLATE_REPEAT_THRESHOLD) {
      return;
    }
    entry.routes.forEach(route => {
      const issues = boilerplateIssuesByRoute.get(route) ?? [];
      issues.push({
        issueType: "Top things boilerplate (global)",
        matchedText: entry.sentence,
        contextSnippet: `Repeated in ${entry.routes.size} cities`,
        severity: topUsCityRoutes.has(route) ? "error" : "warn",
        suggestedFix: "Replace with city-specific copy.",
      });
      boilerplateIssuesByRoute.set(route, issues);
    });
  });

  const findings = records.flatMap(entry => {
    const { record, issues, topThingsMetrics, tier } = entry;
    const boilerplateIssues = boilerplateIssuesByRoute.get(record.route) ?? [];

    return [...issues, ...boilerplateIssues].map(issue => ({
      country: record.country,
      state: record.state,
      city: record.city,
      tier,
      route: record.route,
      issueType: issue.issueType,
      severity: issue.severity,
      matchedText: issue.matchedText,
      contextSnippet: issue.contextSnippet,
      suggestedFix: issue.suggestedFix ?? "",
      topThingsPoiBackedPct: topThingsMetrics.topThingsPoiBackedPct,
      topThingsAvgDescriptionLength:
        topThingsMetrics.topThingsAvgDescriptionLength,
      hasGenericPlaceholders: topThingsMetrics.hasGenericPlaceholders,
      hasFarAwayTrips: topThingsMetrics.hasFarAwayTrips,
    }));
  });

  const reportsDir = path.resolve("reports");
  fs.mkdirSync(reportsDir, { recursive: true });

  const jsonPath = path.join(reportsDir, "city-content-audit.json");
  fs.writeFileSync(jsonPath, JSON.stringify(findings, null, 2), "utf8");

  const csvPath = path.join(reportsDir, "city-content-audit.csv");
  const header = [
    "country",
    "state",
    "city",
    "tier",
    "route",
    "issueType",
    "severity",
    "matchedText",
    "contextSnippet",
    "suggestedFix",
    "topThingsPoiBackedPct",
    "topThingsAvgDescriptionLength",
    "hasGenericPlaceholders",
    "hasFarAwayTrips",
  ];
  const csvLines = [
    header.join(","),
    ...findings.map(finding =>
      [
        finding.country,
        finding.state,
        finding.city,
        finding.tier,
        finding.route,
        finding.issueType,
        finding.severity,
        finding.matchedText,
        finding.contextSnippet,
        finding.suggestedFix,
        finding.topThingsPoiBackedPct,
        finding.topThingsAvgDescriptionLength,
        finding.hasGenericPlaceholders,
        finding.hasFarAwayTrips,
      ]
        .map(value => toCsvValue(String(value ?? "")))
        .join(",")
    ),
  ];
  fs.writeFileSync(csvPath, csvLines.join("\n"), "utf8");

  const failingFindings = findings.filter(finding => {
    if (finding.severity === "error") {
      return true;
    }
    if (strict && finding.severity === "warn" && finding.tier === 1) {
      return true;
    }
    return false;
  });
  const errorCount = failingFindings.length;

  console.log(`Audit complete. Findings: ${findings.length}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`CSV: ${csvPath}`);

  if (failingFindings.length) {
    const byRoute = new Map<string, typeof failingFindings>();
    failingFindings.forEach(finding => {
      const routeFindings = byRoute.get(finding.route) ?? [];
      routeFindings.push(finding);
      byRoute.set(finding.route, routeFindings);
    });

    const topRoutes = Array.from(byRoute.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);

    console.log("Top failing routes:");
    topRoutes.forEach(([route, routeFindings]) => {
      const samples = routeFindings
        .slice(0, 3)
        .map(finding => `${finding.issueType}: ${finding.matchedText}`)
        .join(" | ");
      console.log(`- ${route} (${routeFindings.length} issues) -> ${samples}`);
    });
  }

  if (strict && errorCount > 0) {
    process.exitCode = 1;
  }
};

runAudit();
