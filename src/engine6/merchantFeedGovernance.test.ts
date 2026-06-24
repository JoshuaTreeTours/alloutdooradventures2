import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  buildMerchantRow,
  mergeFeedHydration,
  resolveCanonicalFeedHydration,
  resolveCanonicalFeedHydrationFromTour,
  validateMerchantFeedRows,
} from "../../scripts/generate-merchant-feed";
import {
  auditEngine6MerchantFeedParity,
  buildMerchantFeedCanonicalCommercialExpectation,
  compareMerchantFeedRowToCanonical,
} from "./merchantFeedParity";
import { engine6ResolvedTours } from "./registry";
import {
  ENGINE6_NYC_ONE_DAY_SIGHTSEEING_PRODUCT_CODE,
  ENGINE6_NYC_ONE_DAY_SIGHTSEEING_ROUTE,
} from "./routes";
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

      const parity = compareMerchantFeedRowToCanonical(tour, row);
      expect(parity.pass, parity.mismatches.join("; ")).toBe(true);
    }
  });

  it("preserves canonical commercial values when live Viator data differs", () => {
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

    expect(merged.priceAmount).toBe(canonical.priceAmount);
    expect(merged.averageRating).toBe(canonical.averageRating);
    expect(merged.reviewCount).toBe(canonical.reviewCount);
    expect(
      buildMerchantRow(tour, merged).price
    ).toBe(formatMerchantPrice(tour.priceAmount!));
    expect(buildMerchantRow(tour, merged).review_count).toBe(
      String(tour.reviewCount)
    );
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

  it("audits every Engine6 merchant feed row against canonical tour commercial data", async () => {
    const resolvedPriceByProductCode = new Map(
      await Promise.all(
        engine6ResolvedTours.map(async tour => [
          tour.productCode,
          (await resolveCanonicalFeedHydration(tour)).priceAmount,
        ] as const)
      )
    );
    const audit = auditEngine6MerchantFeedParity(
      engine6ResolvedTours,
      merchantRowsById,
      tour => resolvedPriceByProductCode.get(tour.productCode) ?? tour.priceAmount
    );

    expect(audit.pass, audit.failures.slice(0, 5).join("; ")).toBe(true);
    expect(merchantRowsById.size).toBe(engine6ResolvedTours.length);
  });

  it("keeps the NY one-day sightseeing tour aligned with canonical route, schema, and commercial fields", () => {
    const tour = getTourByProductCode(ENGINE6_NYC_ONE_DAY_SIGHTSEEING_PRODUCT_CODE);
    const merchantRow = merchantRowsById.get(
      ENGINE6_NYC_ONE_DAY_SIGHTSEEING_PRODUCT_CODE
    );
    expect(merchantRow).toBeDefined();

    const expected = buildMerchantFeedCanonicalCommercialExpectation(tour);
    const parity = compareMerchantFeedRowToCanonical(tour, merchantRow!);

    expect(parity.pass, parity.mismatches.join("; ")).toBe(true);
    expect(expected.link).toBe(
      `https://www.alloutdooradventures.com${ENGINE6_NYC_ONE_DAY_SIGHTSEEING_ROUTE}`
    );
    expect(expected.bookingUrl).toContain("/d687-7081NYCDAY");
    expect(expected.price).toBe(formatMerchantPrice(99));
    expect(expected.average_rating).toBe(formatMerchantRating(4.8));
    expect(expected.rating_count).toBe("13313");
    expect(expected.review_count).toBe("13313");
    expect(expected.schemaOfferPrice).toBe(99);
    expect(expected.schemaRatingValue).toBe(4.8);
    expect(expected.schemaReviewCount).toBe(13313);

    const aggregateRating = (
      buildEngine6SchemaGraph(tour)["@graph"] as Array<Record<string, unknown>>
    ).find(node => node["@type"] === "AggregateRating");
    expect(merchantRow?.average_rating).toBe(
      formatMerchantRating(Number(aggregateRating?.ratingValue))
    );
    expect(merchantRow?.rating_count).toBe(String(aggregateRating?.reviewCount));
    expect(merchantRow?.review_count).toBe(String(aggregateRating?.reviewCount));
  });

  it("keeps known verification products aligned with canonical Engine6 product data", () => {
    for (const productCode of KNOWN_VERIFICATION_PRODUCT_CODES) {
      const tour = getTourByProductCode(productCode);
      const merchantRow = merchantRowsById.get(productCode);
      expect(merchantRow, productCode).toBeDefined();

      const parity = compareMerchantFeedRowToCanonical(tour, merchantRow!);
      expect(parity.pass, parity.mismatches.join("; ")).toBe(true);
    }
  });
});
