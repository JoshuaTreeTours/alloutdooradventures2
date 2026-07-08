import { mkdirSync, writeFileSync } from "node:fs";

import {
  buildEngine6InventoryHealthReplacementReport,
  formatEngine6InventoryHealthReplacementReport,
} from "../src/engine6/inventoryHealthReplacementRecommendations";
import { engine6ListingTours } from "../src/engine6/listing";
import { engine6ResolvedTours } from "../src/engine6/registry";

const surfacedProductCodes = engine6ListingTours
  .map(tour => tour.productCode)
  .filter((productCode): productCode is string => Boolean(productCode));

const report = buildEngine6InventoryHealthReplacementReport({
  tours: engine6ResolvedTours,
  surfacedProductCodes,
});

mkdirSync("reports", { recursive: true });
writeFileSync(
  "reports/engine6-inventory-health-replacement-recommendations.json",
  `${JSON.stringify(report, null, 2)}\n`
);
writeFileSync(
  "reports/engine6-inventory-health-replacement-recommendations.md",
  formatEngine6InventoryHealthReplacementReport(report)
);

const summary = `Engine6 inventory health replacement recommendations: ${report.findings.length} unhealthy surfaced product(s).`;

if (report.findings.length > 0) {
  console.warn(summary);
  console.warn(
    "Warning-only: no Engine6 products were replaced automatically. Review the report before making route/feed changes."
  );
} else {
  console.log(summary);
}
