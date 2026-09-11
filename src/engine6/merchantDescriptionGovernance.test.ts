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
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { SITE_BRAND_NAME } from "../utils/site";

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

const schemaNode = (
  tour: (typeof merchantFeedEligibleTours)[number],
  type: string
) =>
  (buildEngine6SchemaGraph(tour)["@graph"] as Array<Record<string, unknown>>).find(
    node => node["@type"] === type
  );

const brandNameFromProduct = (productNode?: Record<string, unknown>) => {
  const brand = productNode?.brand;
  if (!brand || typeof brand !== "object" || Array.isArray(brand)) return "";
  const name = (brand as Record<string, unknown>).name;
  return typeof name === "string" ? name : "";
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

  it("keeps Merchant CSV, Product, TouristTrip, and WebPage descriptions on one governed source", () => {
    const failures: string[] = [];

    for (const tour of merchantFeedEligibleTours) {
      const expectedDescription = resolveEngine6GovernedProductDescription(tour);
      const merchantRow = merchantRowsById.get(tour.productCode);
      const generatedRow = buildMerchantFeedRowFromProductSchema(tour);
      const productNode = schemaNode(tour, "Product");
      const tripNode = schemaNode(tour, "TouristTrip");
      const webPageNode = schemaNode(tour, "WebPage");
      const resolvedMerchantDescription = resolveMerchantDescription({
        productCode: tour.productCode,
        title: tour.title,
        city: tour.city,
        state: tour.state,
        categoryLabel: tour.categoryLabel,
        productOverviewDescription: tour.overviewText,
      });

      if (!merchantRow) {
        failures.push(`${tour.productCode}: missing Merchant CSV row`);
        continue;
      }

      const descriptionChecks: Array<[string, unknown]> = [
        ["generated Merchant row", generatedRow.description],
        ["Merchant CSV", merchantRow.description],
        ["Product", productNode?.description],
        ["TouristTrip", tripNode?.description],
        ["WebPage", webPageNode?.description],
        ["Merchant resolver", resolvedMerchantDescription],
      ];

      for (const [surface, value] of descriptionChecks) {
        if (value !== expectedDescription) {
          failures.push(
            `${tour.productCode}: ${surface} description differs from governed source`
          );
        }
      }

      if (productNode?.description !== merchantRow.description) {
        failures.push(
          `${tour.productCode}: Product description differs from Merchant CSV`
        );
      }

      if (generatedRow.brand !== SITE_BRAND_NAME) {
        failures.push(
          `${tour.productCode}: generated Merchant brand expected "${SITE_BRAND_NAME}", got "${generatedRow.brand}"`
        );
      }
      const productBrand = brandNameFromProduct(productNode);
      if (productBrand !== SITE_BRAND_NAME) {
        failures.push(
          `${tour.productCode}: Product brand expected "${SITE_BRAND_NAME}", got "${productBrand}"`
        );
      }

      assertNoForbiddenMerchantPhrases(
        merchantRow.description ?? "",
        tour.productCode
      );
    }

    expect(failures, failures.join("\n")).toEqual([]);
  });
});
