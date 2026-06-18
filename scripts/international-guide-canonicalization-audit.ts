import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildInternationalGuideCanonicalizationAudit,
  type InternationalGuideAuditReport,
  type InternationalGuideCandidate,
} from "./international-guide-canonicalization-audit-core";

export {
  buildInternationalGuideCanonicalizationAudit,
  normalizeDestinationName,
  normalizeSlugAsName,
  type InternationalGuideAuditCluster,
  type InternationalGuideAuditMember,
  type InternationalGuideAuditReport,
  type InternationalGuideCandidate,
} from "./international-guide-canonicalization-audit-core";

const withSilencedInventoryLogs = async <T>(callback: () => Promise<T>) => {
  if (process.argv.includes("--verbose")) {
    return callback();
  }

  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  console.log = () => undefined;
  console.warn = () => undefined;
  console.error = () => undefined;

  try {
    return await callback();
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  }
};

export const getGeneratedInternationalGuideCandidates = async (): Promise<
  InternationalGuideCandidate[]
> =>
  withSilencedInventoryLogs(async () => {
    const { getGuideCountries } = await import("../src/data/guideData");

    return getGuideCountries().flatMap(country =>
      country.cities.map(city => ({
        country: country.name,
        countrySlug: country.slug,
        cityName: city.name,
        citySlug: city.slug,
        tourCount: city.tourCount,
        sourceLabel: "generated international guide country/city index",
        guideUrl: `/guides/world/${country.slug}/${city.slug}`,
        destinationUrl: `/destinations/world/${country.slug}/cities/${city.slug}`,
      }))
    );
  });

const formatReport = (report: InternationalGuideAuditReport) => {
  const lines = [
    "# International Guide Canonicalization Audit",
    "",
    `Generated at: ${report.generatedAt}`,
    `Countries scanned: ${report.countriesScanned}`,
    `City route candidates scanned: ${report.totalCandidates}`,
    `Suspect duplicate/variant clusters: ${report.clusters.length}`,
    "",
  ];

  if (!report.clusters.length) {
    lines.push(
      "No duplicate or suspicious international guide city clusters were detected with the current conservative rules."
    );
    return lines.join("\n");
  }

  let activeCountry = "";
  report.clusters.forEach(cluster => {
    if (cluster.country !== activeCountry) {
      activeCountry = cluster.country;
      lines.push(`## ${cluster.country} (${cluster.countrySlug})`, "");
    }

    lines.push(
      `### Suspected canonical destination: ${cluster.suspectedCanonicalDestination}`,
      `- Duplicate/variant slugs: ${cluster.duplicateVariantSlugs.join(", ")}`,
      `- Match reasons: ${cluster.matchReasons.join("; ")}`,
      "- Source labels/names and URLs:"
    );

    cluster.members.forEach(member => {
      const tourCount =
        member.tourCount === null ? "unknown" : String(member.tourCount);
      const guideUrls = member.guideUrls.length
        ? member.guideUrls.join(", ")
        : "n/a";
      const destinationUrls = member.destinationUrls.length
        ? member.destinationUrls.join(", ")
        : "n/a";
      lines.push(
        `  - ${member.cityName} (${member.citySlug}) — tours: ${tourCount}; sources: ${member.sourceLabels.join(", ")}; guides: ${guideUrls}; destinations: ${destinationUrls}`
      );
    });

    lines.push(`- Recommendation: ${cluster.recommendation}`, "");
  });

  return lines.join("\n");
};

const isDirectRun = () => {
  const invokedPath = process.argv[1]
    ? fileURLToPath(new URL(`file://${resolve(process.argv[1])}`))
    : "";
  return invokedPath === fileURLToPath(import.meta.url);
};

const runCli = async () => {
  const outputArg = process.argv.find(arg => arg.startsWith("--output="));
  const report = buildInternationalGuideCanonicalizationAudit(
    await getGeneratedInternationalGuideCandidates()
  );
  const markdown = formatReport(report);

  if (outputArg) {
    const outputPath = resolve(outputArg.replace("--output=", ""));
    writeFileSync(outputPath, `${markdown}\n`);
    console.log(
      `International guide canonicalization audit written to ${outputPath}`
    );
  } else {
    console.log(markdown);
  }
};

if (isDirectRun()) {
  runCli().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
