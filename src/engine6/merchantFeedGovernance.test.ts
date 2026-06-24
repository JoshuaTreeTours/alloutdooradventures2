import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  buildMerchantRow,
  mergeFeedHydration,
  resolveCanonicalFeedHydrationFromTour,
  validateMerchantFeedRows,
} from "../../scripts/generate-merchant-feed";
import { engine6ResolvedTours } from "./registry";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";

const ORIGINAL_MERCHANT_APPROVED_PRODUCT_CODE = "63657P1";
const EXISTING_ENGINE6_PRODUCT_CODE = "411138P3";
const NEW_SEATTLE_ENGINE6_PRODUCT_CODE = "5396P10";

const KNOWN_VERIFICATION_PRODUCT_CODES = [
  "7081NYCDAY",
  "5396MTR",
  "2956PIKEPL",
  "411138P3",
  "5396P10",
  "2960HARBOR",
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
] as const;

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

const formatMerchantPrice = (amount: number) =>
  `${Number.isInteger(amount) ? amount.toFixed(0) : String(amount)} USD`;

const formatMerchantRating = (rating: number) => rating.toFixed(1);

const getTourByProductCode = (productCode: string) => {
  const tour = engine6ResolvedTours.find(
    candidate => candidate.productCode === productCode
  );
  expect(tour, productCode).toBeDefined();
  return tour!;
};

describe("Engine6 merchant feed governance", () => {
  it("builds compliant rows from canonical Engine6 fixture/product data", () => {
    const cohort = [
      {
        productCode: ORIGINAL_MERCHANT_APPROVED_PRODUCT_CODE,
        label: "original merchant-approved cohort",
      },
      {
        productCode: EXISTING_ENGINE6_PRODUCT_CODE,
        label: "existing Engine6 product",
      },
      {
        productCode: NEW_SEATTLE_ENGINE6_PRODUCT_CODE,
        label: "newly added Seattle Engine6 product",
      },
    ];

    for (const { productCode } of cohort) {
      const tour = getTourByProductCode(productCode);
      const row = buildMerchantRow(
        tour,
        resolveCanonicalFeedHydrationFromTour(tour)
      );

      for (const field of REQUIRED_MERCHANT_FIELDS) {
        expect(row[field], `${productCode}.${field}`).toBeTruthy();
      }

      expect(row.price).toBe(formatMerchantPrice(tour.priceAmount!));
      expect(row.link).toBe(
        `https://www.alloutdooradventures.com${tour.canonicalPath}`
      );
    }
  });

  it("prefers live commercial values without dropping canonical fixture fallbacks", () => {
    const tour = getTourByProductCode("7081NYCDAY");
    const canonical = resolveCanonicalFeedHydrationFromTour(tour);
    const merged = mergeFeedHydration(canonical, {
      priceAmount: 101,
      currency: "USD",
      averageRating: 4.9,
      ratingCount: 14000,
      reviewCount: 14000,
      viatorApiDescription: "Live overview",
    });

    expect(merged.priceAmount).toBe(101);
    expect(merged.averageRating).toBe(4.9);
    expect(merged.reviewCount).toBe(14000);
    expect(
      mergeFeedHydration(canonical, {
        priceAmount: null,
        currency: "USD",
        averageRating: null,
        ratingCount: null,
        reviewCount: null,
        viatorApiDescription: null,
      }).priceAmount
    ).toBe(canonical.priceAmount);
  });

  it("validates the generated merchantFeed.csv has no blank required fields or prices", () => {
    const rows = [...merchantRowsById.values()].map(row => ({
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
    }));

    const validation = validateMerchantFeedRows(rows);
    expect(validation.pass).toBe(true);
    expect(validation.report.blankPriceRows).toBe(0);
    expect(validation.report.blankRequiredFieldRows).toBe(0);
  });

  it("keeps known verification products aligned with canonical Engine6 product data", () => {
    for (const productCode of KNOWN_VERIFICATION_PRODUCT_CODES) {
      const tour = getTourByProductCode(productCode);
      const merchantRow = merchantRowsById.get(productCode);
      expect(merchantRow, productCode).toBeDefined();

      expect(merchantRow?.price).toBe(formatMerchantPrice(tour.priceAmount!));
      expect(merchantRow?.link).toBe(
        `https://www.alloutdooradventures.com${tour.canonicalPath}`
      );

      if (
        typeof tour.aggregateRating === "number" &&
        typeof tour.reviewCount === "number"
      ) {
        expect(merchantRow?.average_rating).toBe(
          formatMerchantRating(tour.aggregateRating)
        );
        expect(merchantRow?.rating_count).toBe(String(tour.reviewCount));
        expect(merchantRow?.review_count).toBe(String(tour.reviewCount));

        const aggregateRating = (
          buildEngine6SchemaGraph(tour)["@graph"] as Array<
            Record<string, unknown>
          >
        ).find(node => node["@type"] === "AggregateRating");
        expect(aggregateRating?.ratingValue).toBe(tour.aggregateRating);
        expect(aggregateRating?.reviewCount).toBe(tour.reviewCount);
      }
    }
  });
});
