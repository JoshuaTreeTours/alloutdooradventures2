import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { toEngine6Card } from "./cards";
import { engine6ListingTours } from "./listing";
import { engine6ResolvedTours } from "./registry";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";

const APPENDED_SANTA_BARBARA_ENGINE6_PRODUCT_CODES = [
  "163975P1",
  "447486P2",
  "447486P4",
  "117409P1",
  "421920P3",
  "331438P1",
  "5603847P4",
  "5753P14",
  "7270P10",
] as const;

const APPENDED_SAN_FRANCISCO_ENGINE6_PRODUCT_CODES = [
  "36001P14",
  "6007GGB",
  "2630SUN",
  "6007P5",
  "3454P57",
  "23068P2",
  "415653P2",
  "72999P3",
  "2660SFOWIN",
  "304471P122",
  "333016P3",
  "3454YE3D",
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

const listingToursByProductCode = new Map(
  engine6ListingTours
    .filter(tour =>
      ["Santa Barbara", "San Francisco"].includes(tour.destination.city)
    )
    .map(tour => [tour.productCode, tour])
);

const formatMerchantPrice = (amount: number) =>
  `${Number.isInteger(amount) ? amount.toFixed(0) : String(amount)} USD`;

const formatMerchantRating = (rating: number) => rating.toFixed(1);

const getSchemaNode = <T extends Record<string, unknown>>(
  productCode: string,
  type: string
) => {
  const tour = engine6ResolvedTours.find(
    candidate => candidate.productCode === productCode
  );
  expect(tour).toBeDefined();
  const graph = buildEngine6SchemaGraph(tour!)["@graph"] as T[];
  return graph.find(node => node["@type"] === type);
};

describe("Santa Barbara and San Francisco Engine6 merchant live commercial parity", () => {
  it("keeps 72999P3 live price and rating visible across page, card, schema, listing, and feed", () => {
    const tour = engine6ResolvedTours.find(
      candidate => candidate.productCode === "72999P3"
    );
    const listingTour = listingToursByProductCode.get("72999P3");
    const merchantRow = merchantRowsById.get("72999P3");
    const offer = getSchemaNode("72999P3", "Offer");
    const aggregateRating = getSchemaNode("72999P3", "AggregateRating");

    expect(tour?.priceAmount).toBe(129);
    expect(tour?.aggregateRating).toBe(5);
    expect(tour?.reviewCount).toBe(861);
    expect(toEngine6Card(tour!).priceLabel).toBe("From $129.00");
    expect(toEngine6Card(tour!).ratingLabel).toContain("861");
    expect(listingTour?.startingPrice).toBe(129);
    expect(listingTour?.badges.rating).toBe(5);
    expect(listingTour?.badges.reviewCount).toBe(861);
    expect(offer?.price).toBe(129);
    expect(aggregateRating?.ratingValue).toBe(5);
    expect(aggregateRating?.reviewCount).toBe(861);
    expect(merchantRow?.price).toBe("129 USD");
    expect(merchantRow?.average_rating).toBe("5.0");
    expect(merchantRow?.rating_count).toBe("861");
    expect(merchantRow?.review_count).toBe("861");
  });

  it("exports every appended Santa Barbara and San Francisco live API commercial value without cross-product leakage", () => {
    const seenUrls = new Set<string>();
    const appendedProductCodes = [
      ...APPENDED_SANTA_BARBARA_ENGINE6_PRODUCT_CODES,
      ...APPENDED_SAN_FRANCISCO_ENGINE6_PRODUCT_CODES,
    ];

    for (const productCode of appendedProductCodes) {
      const tour = engine6ResolvedTours.find(
        candidate => candidate.productCode === productCode
      );
      const listingTour = listingToursByProductCode.get(productCode);
      const merchantRow = merchantRowsById.get(productCode);
      expect(tour, productCode).toBeDefined();
      expect(listingTour, productCode).toBeDefined();
      expect(merchantRow, productCode).toBeDefined();
      expect(["Santa Barbara", "San Francisco"]).toContain(tour?.city);
      expect(listingTour?.destination.city).toBe(tour?.city);
      expect(merchantRow?.link).toBe(
        `https://www.alloutdooradventures.com${tour?.canonicalPath}`
      );
      if (
        APPENDED_SAN_FRANCISCO_ENGINE6_PRODUCT_CODES.includes(
          productCode as never
        )
      ) {
        expect(merchantRow?.image_link).toBe(toEngine6Card(tour!).imageUrl);
      }
      expect(seenUrls.has(merchantRow!.link)).toBe(false);
      seenUrls.add(merchantRow!.link);

      if (typeof tour?.priceAmount === "number") {
        expect(listingTour?.startingPrice).toBe(tour.priceAmount);
        expect(merchantRow?.price).toBe(formatMerchantPrice(tour.priceAmount));
        expect(getSchemaNode(productCode, "Offer")?.price).toBe(
          tour.priceAmount
        );
      }

      if (
        typeof tour?.aggregateRating === "number" &&
        typeof tour.reviewCount === "number"
      ) {
        const aggregateRating = getSchemaNode(productCode, "AggregateRating");
        expect(listingTour?.badges.rating).toBe(tour.aggregateRating);
        expect(listingTour?.badges.reviewCount).toBe(tour.reviewCount);
        expect(merchantRow?.average_rating).toBe(
          formatMerchantRating(tour.aggregateRating)
        );
        expect(merchantRow?.rating_count).toBe(String(tour.reviewCount));
        expect(merchantRow?.review_count).toBe(String(tour.reviewCount));
        expect(aggregateRating?.ratingValue).toBe(tour.aggregateRating);
        expect(aggregateRating?.reviewCount).toBe(tour.reviewCount);
      } else {
        expect(merchantRow?.average_rating).toBe("");
        expect(merchantRow?.rating_count ?? "").toMatch(/^(?:0)?$/);
        expect(merchantRow?.review_count ?? "").toMatch(/^(?:0)?$/);
        expect(getSchemaNode(productCode, "AggregateRating")).toBeUndefined();
      }
    }
  });

  it("does not repeat the false 129 USD fallback across Santa Barbara rows", () => {
    const santaBarbaraPrices = APPENDED_SANTA_BARBARA_ENGINE6_PRODUCT_CODES.map(
      productCode => merchantRowsById.get(productCode)?.price
    );

    expect(santaBarbaraPrices).not.toEqual(
      expect.arrayContaining(["129 USD", "129.00 USD"])
    );
    expect(new Set(santaBarbaraPrices).size).toBeGreaterThan(1);
  });

  it("formats all merchant ratings to one decimal place maximum and review counts as integers", () => {
    for (const row of merchantRowsById.values()) {
      if (row.average_rating) {
        expect(row.average_rating).toMatch(/^\d+(?:\.\d)?$/);
      }
      if (row.rating_count) {
        expect(row.rating_count).toMatch(/^\d+$/);
      }
      if (row.review_count) {
        expect(row.review_count).toMatch(/^\d+$/);
      }
    }
  });
});
