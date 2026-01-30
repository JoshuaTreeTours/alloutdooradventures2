import fs from "node:fs";
import path from "node:path";
import { auditCityGuideContent, type CityGuideTextContent } from "../src/data/cityGuideContent";
import { buildCityOverrideRoute, cityOverrides } from "../src/data/cityOverrides";
import { buildTopThingsToDo } from "../src/data/cityTopThings";
import { allCityGuideRecords } from "../src/data/cityGuideRegistry.node";
import { buildCityGuideFacts } from "../src/lib/cityGuideFacts";

const toCsvValue = (value: string) => {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
};

const runAudit = () => {
  const strict = process.argv.includes("--strict");
  const findings = allCityGuideRecords.flatMap((record) => {
    const cityFacts = buildCityGuideFacts({
      cityName: record.city,
      citySlug: record.citySlug,
      parentName: record.state,
      parentSlug: record.stateSlug,
      regionType: "state",
      tours: [],
      landmarks: null,
      metadata: null,
    });

    const baseContent: CityGuideTextContent = {
      intro: record.cityData.intro,
      topThingsToDo: buildTopThingsToDo(
        record.city,
        record.stateSlug,
        record.citySlug,
        {
          parentName: record.state,
          regionType: record.regionType,
          cityFacts,
        },
      ),
      extraText: [
        record.cityData.shortDescription,
        record.cityData.intro,
        ...record.cityData.whereItIs,
        ...record.cityData.thingsToDo,
        ...record.cityData.toursCopy,
        ...Object.values(record.cityData.experiences ?? {}),
        ...record.cityData.weekendItinerary.dayOne,
        ...record.cityData.weekendItinerary.dayTwo,
        ...record.cityData.gettingThere,
        ...record.cityData.faq.map((item) => item.answer),
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
          itineraries: override.itineraries?.map((itinerary) => ({
            title: itinerary.title,
            description: itinerary.description,
          })),
          thingsToDoSections: override.thingsToDoSections?.map((section) => ({
            title: section.title,
            paragraphs: section.paragraphs,
          })),
          topThingsToDo: override.topThingsToDo?.map((item) => ({
            title: item.title,
            description: item.description,
            activityType: item.activityType,
          })),
        }
      : null;

    const content: CityGuideTextContent = {
      ...baseContent,
      ...overrideContent,
      topThingsToDo: overrideContent?.topThingsToDo ?? baseContent.topThingsToDo,
    };

    const issues = auditCityGuideContent(content, {
      citySlug: record.citySlug,
      parentSlug: record.stateSlug,
      regionType: record.regionType,
    });

    return issues.map((issue) => ({
      country: record.country,
      state: record.state,
      city: record.city,
      route: record.route,
      issueType: issue.issueType,
      severity: issue.severity,
      matchedText: issue.matchedText,
      contextSnippet: issue.contextSnippet,
      suggestedFix: issue.suggestedFix ?? "",
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
    "route",
    "issueType",
    "severity",
    "matchedText",
    "contextSnippet",
    "suggestedFix",
  ];
  const csvLines = [
    header.join(","),
    ...findings.map((finding) =>
      [
        finding.country,
        finding.state,
        finding.city,
        finding.route,
        finding.issueType,
        finding.severity,
        finding.matchedText,
        finding.contextSnippet,
        finding.suggestedFix,
      ]
        .map((value) => toCsvValue(String(value ?? "")))
        .join(","),
    ),
  ];
  fs.writeFileSync(csvPath, csvLines.join("\n"), "utf8");

  const errorCount = findings.filter((finding) => finding.severity === "error").length;

  console.log(`Audit complete. Findings: ${findings.length}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`CSV: ${csvPath}`);

  if (strict && errorCount > 0) {
    process.exitCode = 1;
  }
};

runAudit();
