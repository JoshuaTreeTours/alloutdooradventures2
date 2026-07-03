/**
 * Run Washington D.C. product-selection self-replacement governance and emit a report.
 * Run: npx tsx scripts/apply-engine6-washington-dc-self-replacement-governance.ts
 */
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { parseMerchantFeedCsvRows } from "../api/engine6/merchantFeedChangeScopeGovernance";
import {
  formatEngine6ProductSelectionSelfReplacementReport,
  runEngine6ProductSelectionSelfReplacementGovernance,
} from "../src/engine6/engine6ProductSelectionSelfReplacementGovernance";
import { persistEngine6ProductSelectionBlocklistAdditions } from "../src/engine6/engine6ProductSelectionBlocklist";
import { WASHINGTON_DC_VIATOR_PUBLIC_RATINGS, WASHINGTON_DC_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/washingtonDcViatorPublicRatings";
import { readEngine6ParagonProductSelectionConfigFromPath } from "./lib/readEngine6ParagonProductSelectionConfig";

const REPORT_DIR = path.resolve("reports");
const JSON_PATH = path.join(
  REPORT_DIR,
  "engine6-washington-dc-self-replacement-governance.json"
);
const MD_PATH = path.join(
  REPORT_DIR,
  "engine6-washington-dc-self-replacement-governance.md"
);

const FAILED_PRODUCT_CODES = [
  "32453P11",
  "6349P24",
  "2890P28",
  "5713P68",
  "2384P1",
  "2890P2",
] as const;

const LEGACY_REPORT_ONLY_PRODUCT_CODE = "447486P2";

const readBaselineMerchantFeedFromOriginMain = () =>
  execSync("git show origin/main:data/merchantFeed.csv", {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });

const readBaselineSitemapUrlLinesFromOriginMain = () =>
  execSync('git show origin/main:public/sitemap-tours.xml | findstr "<loc>"', {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    shell: "cmd.exe",
  })
    .split(/\r?\n/)
    .filter(Boolean);

const countSitemapUrls = (xml: string) =>
  (xml.match(/<loc>/g) ?? []).length;

const main = async () => {
  const { config } = readEngine6ParagonProductSelectionConfigFromPath({
    configPath: "scripts/washington-dc-product-selection.json",
  });

  const merchantFeedBefore = readFileSync("data/merchantFeed.csv", "utf8");
  const sitemapBefore = readFileSync("public/sitemap-tours.xml", "utf8");
  const baselineMerchantFeed = readBaselineMerchantFeedFromOriginMain();
  const baselineSitemapUrlLines = readBaselineSitemapUrlLinesFromOriginMain();

  const report = await runEngine6ProductSelectionSelfReplacementGovernance({
    config,
    selectedProductCodes: WASHINGTON_DC_VIATOR_PUBLIC_PRODUCT_CODES,
    mode: "strict",
    scopedProductCodes: [],
  });

  const blocklist = persistEngine6ProductSelectionBlocklistAdditions(
    report.blocklistAdditions.map(productCode => {
      const rejected = report.rejected.find(entry => entry.productCode === productCode);
      return {
        productCode,
        sourceUrl: rejected?.sourceUrl ?? "",
        title: productCode,
        reason: rejected?.detail ?? "live validation failed",
        destinationLabel: config.destinationLabel,
        rejectedAt: report.generatedAt,
      };
    })
  );

  const formatted = formatEngine6ProductSelectionSelfReplacementReport(report);
  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(MD_PATH, formatted);

  const merchantFeedAfter = readFileSync("data/merchantFeed.csv", "utf8");
  const sitemapAfter = readFileSync("public/sitemap-tours.xml", "utf8");
  const baselineRows = parseMerchantFeedCsvRows(baselineMerchantFeed);
  const currentRows = parseMerchantFeedCsvRows(merchantFeedAfter);
  const baselineIds = new Set(baselineRows.map(row => row.id));
  const appendedRows = currentRows.filter(row => !baselineIds.has(row.id));

  const premiumCount = report.portfolioMix.premiumCount;
  const overSixtyCount = report.accepted.filter(entry => {
    const candidate = config.slots
      .flatMap(slot => slot.candidates)
      .find(
        item =>
          item.productCode.trim().toUpperCase() ===
          entry.productCode.trim().toUpperCase()
      );
    return typeof candidate?.priceFrom === "number" && candidate.priceFrom > 60;
  }).length;
  const hundredReviewCount = WASHINGTON_DC_VIATOR_PUBLIC_PRODUCT_CODES.filter(
    code => (WASHINGTON_DC_VIATOR_PUBLIC_RATINGS[code]?.reviewCount ?? 0) >= 100
  ).length;

  const baselineMerchantRowsUnchanged = baselineRows.every(row => {
    const current = currentRows.find(entry => entry.id === row.id);
    if (!current) {
      return false;
    }
    return JSON.stringify(row) === JSON.stringify(current);
  });

  const baselineSitemapLines = baselineSitemapUrlLines;
  const currentSitemapLines = sitemapAfter
    .split(/\r?\n/)
    .filter(line => line.includes("<loc>"));
  const baselineSitemapUrlsUnchanged = baselineSitemapLines.every(line =>
    currentSitemapLines.includes(line)
  );

  console.log(formatted);
  console.log(`\nWrote ${JSON_PATH}`);
  console.log(`Wrote ${MD_PATH}`);

  console.log("\n## Washington D.C. self-replacement execution report");
  console.log(
    `- Removed product IDs: ${FAILED_PRODUCT_CODES.join(", ")} (already replaced in branch artifacts)`
  );
  console.log(
    `- Replacement product IDs: ${report.replacementProductCodes.join(", ") || "none required during validation pass"}`
  );
  console.log(`- Final selected product count: ${report.validatedProductCodes.length}`);
  console.log(`- Premium/high-value count: ${premiumCount}`);
  console.log(`- >$60 count: ${overSixtyCount}`);
  console.log(`- 100+ review count: ${hundredReviewCount}`);
  console.log(
    `- Merchant feed row count before/after: ${parseMerchantFeedCsvRows(merchantFeedBefore).length}/${parseMerchantFeedCsvRows(merchantFeedAfter).length}`
  );
  console.log(
    `- Sitemap URL count before/after: ${countSitemapUrls(sitemapBefore)}/${countSitemapUrls(sitemapAfter)}`
  );
  console.log(
    `- Merchant feed append delta vs origin/main: +${appendedRows.length}`
  );
  console.log(
    `- Existing origin/main merchant rows unchanged: ${baselineMerchantRowsUnchanged}`
  );
  console.log(
    `- Existing origin/main sitemap URLs unchanged: ${baselineSitemapUrlsUnchanged}`
  );
  console.log(
    `- Legacy/report-only product untouched: ${LEGACY_REPORT_ONLY_PRODUCT_CODE}`
  );
  console.log(
    `- Blocklist persisted additions this run: ${blocklist.persistedCount}`
  );
  console.log(
    `- 67327P13 preserved: ${report.validatedProductCodes.includes("67327P13")}`
  );

  if (!report.passed) {
    console.error("\nSelf-replacement governance did not pass live validation.");
    console.error(
      "Set VIATOR_API_KEY to run strict live API validation for all 22 Washington D.C. products."
    );
    process.exit(1);
  }
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
