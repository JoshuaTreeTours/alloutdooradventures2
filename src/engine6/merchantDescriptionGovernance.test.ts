import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  buildMerchantDescriptionFromOverview,
  MERCHANT_DESCRIPTION_FORBIDDEN_PATTERNS,
} from "./buildMerchantDescriptionFromOverview";
import { buildMerchantFeedRowFromProductSchema } from "./merchantFeedFromProductSchema";
import { merchantFeedEligibleTours } from "./merchantFeedEligibility";
import { resolveEngine6GovernedProductDescription } from "./governedEditorialDescriptions";
import { engine6ResolvedTours } from "./registry";
import { resolveMerchantDescription } from "./merchantDescriptions";

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
  return bodyRows.map(values =>
    Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""])
    )
  );
};

const merchantRowsById = new Map(
  parseCsv(readFileSync("data/merchantFeed.csv", "utf8")).map(row => [
    row.id,
    row,
  ])
);

const assertNoForbiddenMerchantPhrases = (description: string, label: string) => {
  for (const pattern of MERCHANT_DESCRIPTION_FORBIDDEN_PATTERNS) {
    expect(description, `${label}: ${pattern}`).not.toMatch(pattern);
  }
};

describe("Engine6 merchant CSV description governance", () => {
  it("derives merchant descriptions from overview copy without itinerary metadata", () => {
    const tour = engine6ResolvedTours.find(
      candidate => candidate.productCode === "163975P1"
    );
    expect(tour?.overviewText).toBeTruthy();

    const description = buildMerchantDescriptionFromOverview({
      title: tour!.title,
      city: tour!.city,
      state: tour!.state,
      categoryLabel: tour!.categoryLabel,
      overviewText: tour!.overviewText,
    });

    expect(description).toContain("Stearns Wharf");
    expect(description).toContain("Santa Barbara");
    assertNoForbiddenMerchantPhrases(description, "163975P1");
  });

  it("replaces template-heavy overviews with editorial merchant copy", () => {
    const tour = engine6ResolvedTours.find(
      candidate => candidate.productCode === "6007GGB"
    );
    expect(tour?.overviewText).toMatch(/The route emphasizes/i);

    const description = resolveMerchantDescription({
      productCode: tour!.productCode,
      title: tour!.title,
      city: tour!.city,
      state: tour!.state,
      categoryLabel: tour!.categoryLabel,
      productOverviewDescription: tour!.overviewText,
    });

    expect(description).toMatch(/Golden Gate Bridge|Fisherman/i);
    assertNoForbiddenMerchantPhrases(description, "6007GGB");
  });

  it("keeps merchant feed rows aligned with governed editorial descriptions", () => {
    for (const tour of merchantFeedEligibleTours) {
      const expectedDescription = resolveEngine6GovernedProductDescription(tour);
      const merchantRow = merchantRowsById.get(tour.productCode);
      const generatedRow = buildMerchantFeedRowFromProductSchema(tour);

      expect(merchantRow, tour.productCode).toBeDefined();
      expect(generatedRow.description, tour.productCode).toBe(
        expectedDescription
      );
      expect(merchantRow?.description, tour.productCode).toBe(
        expectedDescription
      );
      expect(
        resolveMerchantDescription({
          productCode: tour.productCode,
          title: tour.title,
          city: tour.city,
          state: tour.state,
          categoryLabel: tour.categoryLabel,
          productOverviewDescription: tour.overviewText,
        }),
        tour.productCode
      ).toBe(expectedDescription);
      assertNoForbiddenMerchantPhrases(
        merchantRow?.description ?? "",
        tour.productCode
      );
    }
  });
});
