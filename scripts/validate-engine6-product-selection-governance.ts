import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  formatEngine6ProductSelectionGovernanceReport,
  selectEngine6DestinationPortfolio,
  type Engine6ProductSelectionSlot,
} from "../src/engine6/engine6ProductSelectionGovernance";
import { resolveEngine6ProductCodesChangedSinceRefSafe } from "../src/engine6/resolveEngine6ChangedProductCodes";

const REPORT_DIR = path.resolve("reports");
const JSON_PATH = path.join(
  REPORT_DIR,
  "engine6-product-selection-governance.json"
);
const MD_PATH = path.join(
  REPORT_DIR,
  "engine6-product-selection-governance.md"
);

const readMode = () => {
  if (process.argv.includes("--strict")) {
    return "strict" as const;
  }

  return "pr-scoped" as const;
};

const readDestinationLabel = () => {
  const flagIndex = process.argv.indexOf("--destination");
  if (flagIndex >= 0) {
    return process.argv[flagIndex + 1]?.trim() || "Engine6 Destination";
  }

  return process.env.ENGINE6_PRODUCT_SELECTION_DESTINATION?.trim() || "Engine6 Destination";
};

const readSlotsFromEnv = (): Engine6ProductSelectionSlot[] => {
  const configPath =
    process.env.ENGINE6_PRODUCT_SELECTION_SLOTS_PATH?.trim() ||
    process.argv.find(arg => arg.endsWith(".product-selection.json"));

  if (!configPath) {
    console.error(
      "Product selection governance requires ranked candidate slots. Provide ENGINE6_PRODUCT_SELECTION_SLOTS_PATH or pass a *.product-selection.json file path."
    );
    process.exit(2);
  }

  const parsed = JSON.parse(readFileSync(configPath, "utf8")) as {
    slots: Engine6ProductSelectionSlot[];
    targetPremiumShare?: number;
  };

  if (!Array.isArray(parsed.slots) || parsed.slots.length === 0) {
    throw new Error(
      `Invalid product selection config at ${configPath}: expected non-empty slots array`
    );
  }

  return parsed.slots;
};

const mode = readMode();
const destinationLabel = readDestinationLabel();
const slots = readSlotsFromEnv();
const headRef =
  process.env.ENGINE6_PRODUCT_SELECTION_HEAD_REF?.trim() || "HEAD";
const scopedResolution = resolveEngine6ProductCodesChangedSinceRefSafe({
  headRef,
});

if (scopedResolution.warning) {
  console.warn(
    "[engine6-product-selection-governance]",
    scopedResolution.warning
  );
}

const report = await selectEngine6DestinationPortfolio({
  destinationLabel,
  slots,
  mode,
  scopedProductCodes:
    mode === "pr-scoped" ? scopedResolution.productCodes : [],
  headRef,
});

const formatted = formatEngine6ProductSelectionGovernanceReport(report);

mkdirSync(REPORT_DIR, { recursive: true });
writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(MD_PATH, formatted);

console.log(formatted);
console.log(`Wrote ${JSON_PATH}`);
console.log(`Wrote ${MD_PATH}`);

if (!report.blockingPassed) {
  console.error(
    "\nEngine6 product selection governance rejected: one or more blocking selection failures remain."
  );
  process.exit(1);
}

console.log("\nEngine6 product selection governance passed.");
