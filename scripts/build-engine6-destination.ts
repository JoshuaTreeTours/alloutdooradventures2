import { runEngine6ParagonDestinationBuildFromArgv } from "./lib/engine6DestinationBuildGovernance";
import { assertEngine6CommitPullRequestGate } from "../src/engine6/engine6ProductSelectionGovernance";

const build = await runEngine6ParagonDestinationBuildFromArgv();

console.log(
  `[engine6-paragon-governance] Running shared product-selection pipeline for ${build.config.destinationLabel}`
);
console.log(`[engine6-paragon-governance] Config: ${build.configPath}`);
console.log(build.reports.formatted);
console.log(`Wrote ${build.reports.jsonPath}`);
console.log(`Wrote ${build.reports.markdownPath}`);

if (build.reports.failureMarkdownPath) {
  console.log(`Wrote ${build.reports.failureMarkdownPath}`);
}

if (build.blocklist.persistedCount > 0) {
  console.log(
    `[engine6-paragon-governance] Persisted ${build.blocklist.persistedCount} permanent blocklist addition(s) to ${build.blocklist.blocklistPath}`
  );
}

assertEngine6CommitPullRequestGate(build.context.report);

console.log(
  "\nEngine6 Paragon governance passed live validation and portfolio gates."
);
console.log(
  "Validated product codes:",
  build.context.validatedProductCodes.join(", ") || "none"
);
console.log(
  "\nProceed with artifact generation only for validated product codes, preserving build order: fixtures -> merchant feed -> routes -> sitemap -> destination pages -> previews."
);
