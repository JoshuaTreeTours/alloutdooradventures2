import fs from "node:fs";
import path from "node:path";
import { auditCityGuideContent, buildCityGuide } from "../src/data/guideData";
import { tours } from "../src/data/tours";
import { US_STATES, slugify } from "../src/data/tourCatalog";

type CityGuideEntry = {
  citySlug: string;
  cityName: string;
  parentSlug: string;
  parentName: string;
  regionType: "state" | "country";
  route: string;
};

const US_STATE_SLUGS = new Set(US_STATES.map((state) => slugify(state)));

const isUsStateTour = (tour: (typeof tours)[number]) => {
  if (US_STATE_SLUGS.has(tour.destination.stateSlug)) {
    return true;
  }

  return US_STATE_SLUGS.has(slugify(tour.destination.state));
};

const getCountryFromTour = (tour: (typeof tours)[number]) => {
  if (tour.destination.country) {
    return {
      name: tour.destination.country,
      slug: slugify(tour.destination.country),
    };
  }

  if (!isUsStateTour(tour) && tour.destination.state) {
    return {
      name: tour.destination.state,
      slug: tour.destination.stateSlug || slugify(tour.destination.state),
    };
  }

  return null;
};

const buildCityEntries = () => {
  const entries = new Map<string, CityGuideEntry>();

  tours.forEach((tour) => {
    if (!tour.destination.citySlug) {
      return;
    }

    if (isUsStateTour(tour)) {
      const parentSlug = tour.destination.stateSlug || slugify(tour.destination.state);
      const key = `state:${parentSlug}:${tour.destination.citySlug}`;
      if (entries.has(key)) {
        return;
      }
      entries.set(key, {
        citySlug: tour.destination.citySlug,
        cityName: tour.destination.city,
        parentSlug,
        parentName: tour.destination.state,
        regionType: "state",
        route: `/guides/us/${parentSlug}/${tour.destination.citySlug}`,
      });
      return;
    }

    const country = getCountryFromTour(tour);
    if (!country) {
      return;
    }
    const key = `country:${country.slug}:${tour.destination.citySlug}`;
    if (entries.has(key)) {
      return;
    }
    entries.set(key, {
      citySlug: tour.destination.citySlug,
      cityName: tour.destination.city,
      parentSlug: country.slug,
      parentName: country.name,
      regionType: "country",
      route: `/guides/world/${country.slug}/${tour.destination.citySlug}`,
    });
  });

  return Array.from(entries.values());
};

const toCsvValue = (value: string) => {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
};

const runAudit = () => {
  const entries = buildCityEntries();
  const findings = entries.flatMap((entry) => {
    const guide = buildCityGuide({
      parentSlug: entry.parentSlug,
      citySlug: entry.citySlug,
      regionType: entry.regionType,
      sanitize: false,
    });

    if (!guide) {
      return [];
    }

    const issues = auditCityGuideContent(guide, {
      cityName: entry.cityName,
      citySlug: entry.citySlug,
      parentSlug: entry.parentSlug,
      regionType: entry.regionType,
    });

    return issues.map((issue) => ({
      country: entry.regionType === "country" ? entry.parentName : "United States",
      state: entry.regionType === "state" ? entry.parentName : "",
      city: entry.cityName,
      route: entry.route,
      issueType: issue.issueType,
      matchedText: issue.matchedText,
      contextSnippet: issue.contextSnippet,
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
    "matchedText",
    "contextSnippet",
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
        finding.matchedText,
        finding.contextSnippet,
      ]
        .map((value) => toCsvValue(String(value ?? "")))
        .join(","),
    ),
  ];
  fs.writeFileSync(csvPath, csvLines.join("\n"), "utf8");

  console.log(`Audit complete. Findings: ${findings.length}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`CSV: ${csvPath}`);
};

runAudit();
