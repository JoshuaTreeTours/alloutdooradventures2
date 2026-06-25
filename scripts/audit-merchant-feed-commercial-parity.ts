import { readFile } from "node:fs/promises";
import path from "node:path";

import { resolveEngine6ToursForProductSchema } from "../src/engine6/fetchEngine6LiveCommercialFieldsForSchema";
import {
  auditEngine6MerchantFeedCommercialParity,
  formatMerchantFeedCommercialParityAuditReport,
} from "../src/engine6/merchantFeedParity";
import { engine6ResolvedTours } from "../src/engine6/registry";
import {
  countMerchantFeedBlankFields,
  validateMerchantFeedRows,
} from "./generate-merchant-feed";

const OUTPUT_PATH = path.resolve(process.cwd(), "data/merchantFeed.csv");

const parseCsv = (content: string) => {
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
  return bodyRows.map(values => Object.fromEntries(
    headers.map((header, index) => [header, values[index] ?? ""])
  ));
};

const main = async () => {
  const csvContent = await readFile(OUTPUT_PATH, "utf8");
  const csvRows = parseCsv(csvContent);
  const validation = validateMerchantFeedRows(
    csvRows.map(row => ({
      id: row.id ?? "",
      title: row.title ?? "",
      description: row.description ?? "",
      link: row.link ?? "",
      image_link: row.image_link ?? "",
      availability: row.availability ?? "",
      price: row.price ?? "",
      condition: row.condition ?? "",
      brand: row.brand ?? "",
      average_rating: row.average_rating ?? "",
      rating_count: row.rating_count ?? "",
      review_count: row.review_count ?? "",
    }))
  );

  const schemaResolvedTours = await resolveEngine6ToursForProductSchema(
    engine6ResolvedTours
  );
  const audit = auditEngine6MerchantFeedCommercialParity(
    schemaResolvedTours,
    new Map(csvRows.map(row => [row.id ?? "", row]))
  );

  console.log(
    formatMerchantFeedCommercialParityAuditReport(
      audit,
      validation.report.blankRequiredFieldRows
    )
  );

  if (!validation.pass || !audit.pass) {
    for (const failure of [...validation.failures, ...audit.failures].slice(
      0,
      20
    )) {
      console.error(failure);
    }
    process.exit(1);
  }
};

if (process.argv[1]?.includes("audit-merchant-feed-commercial-parity")) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
