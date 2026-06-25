import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  applyMerchantFeedLiveRuntimeParityBaselinePolicy,
  buildMerchantFeedPublishedBaselineCatalog,
  reconcileMerchantFeedRowsWithBaselineGovernance,
} from "../api/engine6/merchantFeedBaselineGovernance";
import {
  diagnoseEngine6ViatorProductCommercialExtract,
  resolveViatorApiConfig,
} from "../api/engine6/resolveEngine6ViatorProductCommercialExtract";
import { buildMerchantFeedRowFromProductSchema } from "../src/engine6/merchantFeedFromProductSchema";
import {
  auditEngine6MerchantFeedCommercialParity,
  auditEngine6MerchantFeedSchemaParity,
  formatMerchantFeedCommercialParityAuditReport,
} from "../src/engine6/merchantFeedParity";
import {
  fetchEngine6LiveCommercialFieldsForSchema,
  requireLiveMerchantCommercial,
  resolveEngine6ToursForProductSchema,
} from "../src/engine6/fetchEngine6LiveCommercialFieldsForSchema";
import { resolveEngine6TourForProductSchema } from "../src/engine6/resolveEngine6TourForProductSchema";
import { merchantFeedEligibleTours } from "../src/engine6/merchantFeedEligibility";
import { parsePrice } from "../src/utils/merchantPricing";
import { engine6ResolvedTours } from "../src/engine6/registry";
import type { Engine6Tour } from "../src/engine6/types";
import {
  auditMerchantFeedLiveRuntimeParity,
  formatMerchantFeedLiveRuntimeParityReport,
} from "./audit-merchant-feed-live-runtime-parity";

const OUTPUT_PATH = path.resolve(process.cwd(), "data/merchantFeed.csv");

const OUTPUT_HEADERS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "availability",
  "price",
  "condition",
  "brand",
  "average_rating",
  "rating_count",
  "review_count",
] as const;

const REQUIRED_MERCHANT_FIELDS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "availability",
  "price",
  "condition",
  "brand",
] as const satisfies readonly OutputHeader[];

type OutputHeader = (typeof OUTPUT_HEADERS)[number];
type MerchantRow = Record<OutputHeader, string>;

type MerchantFeedBlankCounts = {
  totalRows: number;
  blankPriceRows: number;
  blankAverageRatingRows: number;
  blankRatingCountRows: number;
  blankReviewCountRows: number;
  blankRequiredFieldRows: number;
};

const escapeCsv = (value: string) => {
  const escaped = (value ?? "").replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const toCsv = (rows: MerchantRow[]) => {
  const headerLine = OUTPUT_HEADERS.join(",");
  const body = rows
    .map(row => OUTPUT_HEADERS.map(header => escapeCsv(row[header])).join(","))
    .join("\n");
  return `${headerLine}\n${body}\n`;
};

const parseCsv = (content: string): MerchantRow[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const [headers = [], ...bodyRows] = rows.filter(
    candidate => candidate.length > 1
  );
  return bodyRows.map(values => {
    const record = {} as MerchantRow;
    OUTPUT_HEADERS.forEach(header => {
      const headerIndex = headers.indexOf(header);
      record[header] = headerIndex >= 0 ? (values[headerIndex] ?? "") : "";
    });
    return record;
  });
};

export const countMerchantFeedBlankFields = (
  rows: MerchantRow[]
): MerchantFeedBlankCounts => {
  const isBlank = (value: string | undefined) => !value?.trim();

  let blankRequiredFieldRows = 0;
  for (const row of rows) {
    if (REQUIRED_MERCHANT_FIELDS.some(field => isBlank(row[field]))) {
      blankRequiredFieldRows += 1;
    }
  }

  return {
    totalRows: rows.length,
    blankPriceRows: rows.filter(row => isBlank(row.price)).length,
    blankAverageRatingRows: rows.filter(row => isBlank(row.average_rating))
      .length,
    blankRatingCountRows: rows.filter(row => isBlank(row.rating_count)).length,
    blankReviewCountRows: rows.filter(row => isBlank(row.review_count)).length,
    blankRequiredFieldRows,
  };
};

export const validateMerchantFeedRows = (rows: MerchantRow[]) => {
  const report = countMerchantFeedBlankFields(rows);
  const failures: string[] = [];

  for (const row of rows) {
    for (const field of REQUIRED_MERCHANT_FIELDS) {
      if (!row[field]?.trim()) {
        failures.push(
          `Required field "${field}" is blank for product ${row.id || "(missing id)"}`
        );
      }
    }
  }

  if (report.blankPriceRows > 0) {
    failures.push(
      `Merchant feed validation failed: ${report.blankPriceRows} row(s) have blank price.`
    );
  }

  return {
    report,
    pass: failures.length === 0,
    failures,
  };
};

const logMerchantFeedReport = (
  label: string,
  report: MerchantFeedBlankCounts,
  pass?: boolean
) => {
  console.log(`\nMerchant Feed ${label}:`);
  console.log(`  Total rows: ${report.totalRows}`);
  console.log(`  Blank price rows: ${report.blankPriceRows}`);
  console.log(`  Blank average_rating rows: ${report.blankAverageRatingRows}`);
  console.log(`  Blank rating_count rows: ${report.blankRatingCountRows}`);
  console.log(`  Blank review_count rows: ${report.blankReviewCountRows}`);
  console.log(`  Blank required-field rows: ${report.blankRequiredFieldRows}`);
  if (typeof pass === "boolean") {
    console.log(`  Pass/Fail: ${pass ? "PASS" : "FAIL"}`);
  }
};

export const buildMerchantRow = (tour: Engine6Tour): MerchantRow =>
  buildMerchantFeedRowFromProductSchema(tour);

const resolveToursFromMerchantFeedRows = (
  tours: Engine6Tour[],
  rows: MerchantRow[]
): Engine6Tour[] => {
  const rowsById = new Map(rows.map(row => [row.id.trim().toUpperCase(), row]));

  return tours.map(tour => {
    const row = rowsById.get(tour.productCode.trim().toUpperCase());
    if (!row) {
      return tour;
    }

    const priceAmount = parsePrice(row.price);
    const aggregateRating = Number.parseFloat(row.average_rating);
    const reviewCount = Number.parseInt(row.review_count, 10);

    return resolveEngine6TourForProductSchema(tour, {
      priceAmount,
      priceFormatted:
        typeof priceAmount === "number"
          ? `From $${priceAmount.toFixed(2)}`
          : null,
      aggregateRating: Number.isFinite(aggregateRating) ? aggregateRating : null,
      reviewCount: Number.isFinite(reviewCount) ? reviewCount : null,
    });
  });
};

const readExistingMerchantFeedRows = async (): Promise<MerchantRow[]> => {
  try {
    const content = await readFile(OUTPUT_PATH, "utf8");
    return parseCsv(content);
  } catch {
    return [];
  }
};

const resolveRuntimeCommercialBaseUrl = () =>
  (
    process.env.MERCHANT_FEED_RUNTIME_BASE_URL ??
    process.env.ENGINE6_RUNTIME_BASE_URL ??
    ""
  ).replace(/\/$/, "");

const assertLiveCommercialExtracts = async (
  failures: string[]
) => {
  if (!requireLiveMerchantCommercial()) {
    return;
  }

  const { apiKey } = resolveViatorApiConfig();
  if (!apiKey) {
    if (resolveRuntimeCommercialBaseUrl()) {
      console.log(
        "Merchant feed live-commercial guard: using production runtime overlay (MERCHANT_FEED_RUNTIME_BASE_URL)."
      );
      return;
    }

    throw new Error(
      "Merchant feed production build requires VIATOR_API_KEY for live commercial resolution."
    );
  }

  if (failures.length > 0) {
    throw new Error(
      `Merchant feed live commercial validation failed for ${failures.length} product issue(s):\n${failures.join("\n")}`
    );
  }
};

const resolveToursForMerchantFeedGeneration = async (
  tours = merchantFeedEligibleTours
) => {
  const { apiKey } = resolveViatorApiConfig();
  const runtimeBaseUrl = resolveRuntimeCommercialBaseUrl();

  if (!apiKey && runtimeBaseUrl) {
    return Promise.all(
      tours.map(async tour => {
        const liveFields = await fetchEngine6LiveCommercialFieldsForSchema(
          tour.productCode
        );
        return resolveEngine6TourForProductSchema(tour, liveFields);
      })
    );
  }

  return resolveEngine6ToursForProductSchema(tours);
};

const main = async () => {
  const existingRows = await readExistingMerchantFeedRows();
  const publishedBaseline = buildMerchantFeedPublishedBaselineCatalog(existingRows);
  if (existingRows.length > 0) {
    logMerchantFeedReport("Before", countMerchantFeedBlankFields(existingRows));
  } else {
    console.log("\nMerchant Feed Before: no existing merchantFeed.csv rows.");
  }

  const schemaResolvedTours = await resolveToursForMerchantFeedGeneration(
    merchantFeedEligibleTours
  );

  const generatedRows: MerchantRow[] = schemaResolvedTours.map(tour =>
    buildMerchantRow(tour)
  );

  const reconciliation = await reconcileMerchantFeedRowsWithBaselineGovernance(
    generatedRows,
    publishedBaseline,
    diagnoseEngine6ViatorProductCommercialExtract
  );

  await assertLiveCommercialExtracts(reconciliation.liveCommercialFailures);

  const outputRows = reconciliation.rows;
  const schemaResolvedToursForParity = resolveToursFromMerchantFeedRows(
    schemaResolvedTours,
    outputRows
  );

  const validation = validateMerchantFeedRows(outputRows);
  logMerchantFeedReport("After", validation.report, validation.pass);

  if (!validation.pass) {
    for (const failure of validation.failures.slice(0, 20)) {
      console.error(failure);
    }
    if (validation.failures.length > 20) {
      console.error(
        `...and ${validation.failures.length - 20} additional validation failures.`
      );
    }
    throw new Error("Merchant feed validation failed before write.");
  }

  const parityAudit = auditEngine6MerchantFeedSchemaParity(
    schemaResolvedToursForParity,
    new Map(outputRows.map(row => [row.id, row]))
  );

  if (!parityAudit.pass) {
    for (const failure of parityAudit.failures.slice(0, 20)) {
      console.error(failure);
    }
    if (parityAudit.failures.length > 20) {
      console.error(
        `...and ${parityAudit.failures.length - 20} additional Product JSON-LD parity failures.`
      );
    }
    throw new Error(
      "Merchant feed Product JSON-LD parity validation failed before write."
    );
  }

  const commercialParityAudit = auditEngine6MerchantFeedCommercialParity(
    schemaResolvedToursForParity,
    new Map(outputRows.map(row => [row.id, row]))
  );

  if (!commercialParityAudit.pass) {
    for (const failure of commercialParityAudit.failures.slice(0, 20)) {
      console.error(failure);
    }
    if (commercialParityAudit.failures.length > 20) {
      console.error(
        `...and ${commercialParityAudit.failures.length - 20} additional commercial parity failures.`
      );
    }
    throw new Error(
      "Merchant feed commercial parity validation failed before write."
    );
  }

  const runtimeParityAudit = applyMerchantFeedLiveRuntimeParityBaselinePolicy(
    await auditMerchantFeedLiveRuntimeParity(outputRows),
    reconciliation.governanceByProductCode
  );

  if (!runtimeParityAudit.pass) {
    const blockingDrifts = runtimeParityAudit.drifts.filter(drift => {
      const tier =
        reconciliation.governanceByProductCode.get(
          drift.productCode.trim().toUpperCase()
        ) ?? "new-product";
      return tier !== "unchanged-legacy-baseline";
    });
    for (const drift of blockingDrifts.slice(0, 20)) {
      console.error(
        `${drift.productCode}: csv=${drift.csv.price}/${drift.csv.rating}/${drift.csv.reviews} live=${drift.liveJsonLd.price}/${drift.liveJsonLd.averageRating}/${drift.liveJsonLd.reviewCount}`
      );
    }
    throw new Error(
      "Merchant feed live runtime commercial parity validation failed before write."
    );
  }

  await writeFile(OUTPUT_PATH, toCsv(outputRows), "utf8");

  console.log(`Processed ${merchantFeedEligibleTours.length} Engine6 merchant-feed products (${engine6ResolvedTours.length - merchantFeedEligibleTours.length} excluded).`);
  console.log(
    `Wrote ${outputRows.length} merchant feed rows to ${OUTPUT_PATH}.`
  );
  console.log("Product JSON-LD parity: PASS");
  console.log(
    formatMerchantFeedCommercialParityAuditReport(
      commercialParityAudit,
      validation.report.blankRequiredFieldRows
    )
  );
  console.log(formatMerchantFeedLiveRuntimeParityReport(runtimeParityAudit));

  const unratedProducts = outputRows
    .filter(
      row =>
        !row.average_rating?.trim() ||
        !row.rating_count?.trim() ||
        !row.review_count?.trim()
    )
    .map(row => row.id);

  if (unratedProducts.length > 0) {
    console.log(
      `Legitimate unrated merchant feed rows (blank rating/review fields): ${unratedProducts.length}`
    );
    console.log(unratedProducts.join(", "));
  }
};

if (process.argv[1]?.includes("generate-merchant-feed")) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
