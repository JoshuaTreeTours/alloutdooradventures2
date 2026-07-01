import { readFileSync, writeFileSync } from "node:fs";

import { enforceMerchantFeedImageGovernanceOnRows } from "../../src/engine6/merchantFeedImageGovernance";
import { buildMerchantFeedRowFromProductSchema } from "../../src/engine6/merchantFeedFromProductSchema";
import type { Engine6Tour } from "../../src/engine6/types";

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const appendMerchantFeedRowsWithImageGovernance = async (args: {
  outputPath: string;
  tours: Engine6Tour[];
  destinationLabel: string;
  optionalBlankFields?: readonly string[];
}) => {
  const existingCsv = readFileSync(args.outputPath, "utf8");
  const existingLines = existingCsv.split(/\r?\n/).filter(Boolean);
  const existingIds = new Set(
    existingLines.slice(1).map(line => line.split(",")[0])
  );

  for (const tour of args.tours) {
    if (existingIds.has(tour.productCode)) {
      throw new Error(
        `Refusing to overwrite existing merchant feed row ${tour.productCode}`
      );
    }
  }

  const newRows = args.tours.map(tour =>
    buildMerchantFeedRowFromProductSchema(tour)
  );
  const governedRows = await enforceMerchantFeedImageGovernanceOnRows({
    rows: newRows,
    tours: args.tours,
  });

  for (const row of governedRows) {
    const optionalBlankFields = new Set(args.optionalBlankFields ?? []);
    for (const [key, value] of Object.entries(row)) {
      if (optionalBlankFields.has(key)) {
        continue;
      }
      if (value == null || String(value).trim() === "") {
        throw new Error(`Blank merchant feed field ${key} for ${row.id}`);
      }
    }
  }

  const appendedLines = governedRows.map(row =>
    [
      row.id,
      row.title,
      row.description,
      row.link,
      row.image_link,
      row.availability,
      row.price,
      row.condition,
      row.brand,
      row.average_rating,
      row.rating_count,
      row.review_count,
    ]
      .map(value => escapeCsv(String(value)))
      .join(",")
  );

  const nextCsv = `${existingLines.join("\n")}\n${appendedLines.join("\n")}\n`;
  writeFileSync(args.outputPath, nextCsv, "utf8");

  console.log(
    `Appended ${governedRows.length} ${args.destinationLabel} merchant feed rows (${existingLines.length - 1} -> ${existingLines.length - 1 + governedRows.length}).`
  );
};
