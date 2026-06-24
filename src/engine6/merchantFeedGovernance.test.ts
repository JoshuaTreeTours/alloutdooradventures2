import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { validateMerchantFeedRows } from "../../scripts/generate-merchant-feed";
import { resolveEngine6ToursForProductSchema } from "./fetchEngine6LiveCommercialFieldsForSchema";
import {
  buildMerchantFeedRowFromProductSchema,
  resolveMerchantFeedProductSchemaSnapshot,
} from "./merchantFeedFromProductSchema";
import {
  auditEngine6MerchantFeedSchemaParity,
  compareMerchantFeedRowToProductSchema,
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

const getTourByProductCode = (productCode: string) => {
  const tour = engine6ResolvedTours.find(
    candidate => candidate.productCode === productCode
  );
  expect(tour, productCode).toBeDefined();
  return tour!;
};

const getProductSchemaNodes = async (productCode: string) => {
  const tour = getTourByProductCode(productCode);
  const [resolvedTour] = await resolveEngine6ToursForProductSchema([tour]);
  const graph = buildEngine6SchemaGraph(resolvedTour)["@graph"] as Array<
    Record<string, unknown>
  >;

  return {
    tour: resolvedTour,
    product: graph.find(node => node["@type"] === "Product"),
    offer: graph.find(node => node["@type"] === "Offer"),
    aggregateRating: graph.find(node => node["@type"] === "AggregateRating"),
  };
};

describe("Engine6 merchant feed Product JSON-LD governance", () => {
  it("builds merchant rows directly from the resolved Product JSON-LD graph", async () => {
    for (const productCode of [
      ORIGINAL_MERCHANT_APPROVED_PRODUCT_CODE,
      EXISTING_ENGINE6_PRODUCT_CODE,
      NEW_SEATTLE_ENGINE6_PRODUCT_CODE,
    ]) {
      const tour = getTourByProductCode(productCode);
      const [resolvedTour] = await resolveEngine6ToursForProductSchema([tour]);
      const row = buildMerchantFeedRowFromProductSchema(resolvedTour);
      const parity = compareMerchantFeedRowToProductSchema(resolvedTour, row);

      for (const field of REQUIRED_MERCHANT_FIELDS) {
        expect(row[field], `${productCode}.${field}`).toBeTruthy();
      }

      expect(parity.pass, parity.mismatches.join("; ")).toBe(true);
    }
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

  it("audits every Engine6 merchant feed row against Product JSON-LD", async () => {
    const schemaResolvedTours = await resolveEngine6ToursForProductSchema(
      engine6ResolvedTours
    );
    const audit = auditEngine6MerchantFeedSchemaParity(
      schemaResolvedTours,
      merchantRowsById
    );

    expect(audit.pass, audit.failures.slice(0, 5).join("; ")).toBe(true);
    expect(merchantRowsById.size).toBe(engine6ResolvedTours.length);
  });

  it("keeps 7081NYCDAY aligned with live page Product JSON-LD commercial fields", async () => {
    const { tour, product, offer, aggregateRating } =
      await getProductSchemaNodes(ENGINE6_NYC_ONE_DAY_SIGHTSEEING_PRODUCT_CODE);
    const merchantRow = merchantRowsById.get(
      ENGINE6_NYC_ONE_DAY_SIGHTSEEING_PRODUCT_CODE
    );
    const snapshot = resolveMerchantFeedProductSchemaSnapshot(tour);
    const parity = compareMerchantFeedRowToProductSchema(tour, merchantRow!);

    expect(product).toBeDefined();
    expect(offer).toBeDefined();
    expect(aggregateRating).toBeDefined();
    expect(parity.pass, parity.mismatches.join("; ")).toBe(true);

    expect(merchantRow?.title).toBe(product?.name);
    expect(merchantRow?.description).toBe(product?.description);
    expect(merchantRow?.link).toBe(product?.url);
    expect(merchantRow?.link).toBe(
      `https://www.alloutdooradventures.com${ENGINE6_NYC_ONE_DAY_SIGHTSEEING_ROUTE}`
    );
    expect(merchantRow?.price).toBe("99 USD");
    expect(merchantRow?.average_rating).toBe("4.8");
    expect(merchantRow?.rating_count).toBe("13580");
    expect(merchantRow?.review_count).toBe("13580");
    expect(merchantRow?.image_link).toBe(product?.image);
    expect(merchantRow?.availability).toBe("in stock");
    expect(snapshot.bookingUrl).toBe(offer?.url);
    expect(snapshot.offerPrice).toBe(offer?.price);
    expect(snapshot.aggregateRatingValue).toBe(aggregateRating?.ratingValue);
    expect(snapshot.aggregateReviewCount).toBe(aggregateRating?.reviewCount);
  });
});
