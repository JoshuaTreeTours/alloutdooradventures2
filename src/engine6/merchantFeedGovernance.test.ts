import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { validateMerchantFeedRows } from "../../scripts/generate-merchant-feed";
import { ENGINE6_COMMERCIAL_SOURCE_LABEL } from "./commercialResolver";
import { resolveEngine6ToursForProductSchema } from "./fetchEngine6LiveCommercialFieldsForSchema";
import {
  buildMerchantFeedCommercialSnapshot,
  resolveToursWithMerchantFeedCommercialSnapshot,
} from "./merchantFeedCommercialSnapshot";
import {
  buildMerchantFeedRowFromProductSchema,
  resolveMerchantFeedProductSchemaSnapshot,
} from "./merchantFeedFromProductSchema";
import {
  auditEngine6CommercialFieldParity,
  auditEngine6MerchantFeedCommercialParity,
  auditEngine6MerchantFeedSchemaParity,
  compareMerchantFeedRowToProductSchema,
} from "./merchantFeedParity";
import { merchantFeedEligibleTours } from "./merchantFeedEligibility";
import { resolveMerchantDescription } from "./merchantDescriptions";
import { engine6ResolvedTours } from "./registry";
import {
  ENGINE6_LAS_VEGAS_VALLEY_OF_FIRE_OFFROAD_PRODUCT_CODE,
  ENGINE6_LAS_VEGAS_VALLEY_OF_FIRE_OFFROAD_ROUTE,
  ENGINE6_PORTLAND_MOUNT_HOOD_DAY_TRIP_PRODUCT_CODE,
  ENGINE6_NYC_ONE_DAY_SIGHTSEEING_PRODUCT_CODE,
  ENGINE6_NYC_ONE_DAY_SIGHTSEEING_ROUTE,
  ENGINE6_SANTA_BARBARA_TROLLEY_PRODUCT_CODE,
} from "./routes";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { resolveEngine6TourForProductSchema } from "./resolveEngine6TourForProductSchema";

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

  it("uses the same fixture commercial source for live page counts and merchant feed counts", () => {
    const fixtureSource = {
      priceAmount: 123.45,
      priceFormatted: "From $123.45",
      aggregateRating: 4.7,
      reviewCount: 321,
    };
    const livePageTour = resolveEngine6TourForProductSchema(
      getTourByProductCode(EXISTING_ENGINE6_PRODUCT_CODE),
      fixtureSource
    );
    const merchantRow = buildMerchantFeedRowFromProductSchema(livePageTour);
    const { aggregateRating } = buildEngine6SchemaGraph(livePageTour)[
      "@graph"
    ].reduce(
      (acc, node) =>
        node["@type"] === "AggregateRating" ? { aggregateRating: node } : acc,
      {} as { aggregateRating?: Record<string, unknown> }
    );

    expect(ENGINE6_COMMERCIAL_SOURCE_LABEL).toContain(
      "shared Engine6 commercial resolver"
    );
    expect(livePageTour.reviewCount).toBe(fixtureSource.reviewCount);
    expect(aggregateRating?.reviewCount).toBe(fixtureSource.reviewCount);
    expect(merchantRow.rating_count).toBe(String(fixtureSource.reviewCount));
    expect(merchantRow.review_count).toBe(String(fixtureSource.reviewCount));
    expect(merchantRow.average_rating).toBe("4.7");
  });

  it("audits merchant rows against the same generated commercial snapshot even if live counts drift later", () => {
    const productCode = EXISTING_ENGINE6_PRODUCT_CODE;
    const generatedSource = {
      priceAmount: 123.45,
      priceFormatted: "From $123.45",
      aggregateRating: 4.7,
      reviewCount: 321,
    };
    const laterLiveSource = {
      ...generatedSource,
      reviewCount: 322,
    };
    const generatedTour = resolveEngine6TourForProductSchema(
      getTourByProductCode(productCode),
      generatedSource
    );
    const merchantRow = buildMerchantFeedRowFromProductSchema(generatedTour);
    const snapshot = buildMerchantFeedCommercialSnapshot([merchantRow]);
    const [snapshotTour] = resolveToursWithMerchantFeedCommercialSnapshot(
      [getTourByProductCode(productCode)],
      snapshot
    );
    const laterLiveTour = resolveEngine6TourForProductSchema(
      getTourByProductCode(productCode),
      laterLiveSource
    );

    const snapshotAudit = auditEngine6MerchantFeedCommercialParity(
      [snapshotTour],
      new Map([[productCode, merchantRow]])
    );
    const laterLiveAudit = auditEngine6MerchantFeedCommercialParity(
      [laterLiveTour],
      new Map([[productCode, merchantRow]])
    );

    expect(snapshotAudit.pass, snapshotAudit.failures.join("; ")).toBe(true);
    expect(laterLiveAudit.pass).toBe(false);
    expect(laterLiveAudit.failures.join("; ")).toContain(
      `${productCode}.merchantFeed.review_count`
    );
  });

  it("audits every Engine6 merchant feed row against Product JSON-LD", async () => {
    const schemaResolvedTours = await resolveEngine6ToursForProductSchema(
      merchantFeedEligibleTours
    );
    const audit = auditEngine6MerchantFeedSchemaParity(
      schemaResolvedTours,
      merchantRowsById
    );

    expect(audit.pass, audit.failures.slice(0, 5).join("; ")).toBe(true);
    expect(merchantRowsById.size).toBe(merchantFeedEligibleTours.length);
    expect(merchantRowsById.has("5765P7")).toBe(false);
  });

  it("audits commercial parity across tour page, Product JSON-LD, and merchantFeed.csv", async () => {
    const schemaResolvedTours = await resolveEngine6ToursForProductSchema(
      merchantFeedEligibleTours
    );
    const audit = auditEngine6MerchantFeedCommercialParity(
      schemaResolvedTours,
      merchantRowsById
    );

    expect(audit.totalRowsAudited).toBe(merchantFeedEligibleTours.length);
    expect(audit.priceMismatches).toBe(0);
    expect(audit.ratingMismatches).toBe(0);
    expect(audit.reviewCountMismatches).toBe(0);
    expect(audit.pass, audit.failures.slice(0, 5).join("; ")).toBe(true);
  });

  it("keeps 163975P1 aligned with canonical commercial fields on page and JSON-LD", async () => {
    const { tour, offer, aggregateRating } = await getProductSchemaNodes(
      ENGINE6_SANTA_BARBARA_TROLLEY_PRODUCT_CODE
    );
    const merchantRow = merchantRowsById.get(
      ENGINE6_SANTA_BARBARA_TROLLEY_PRODUCT_CODE
    );
    const commercialParity = auditEngine6CommercialFieldParity(
      tour,
      merchantRow!
    );

    expect(commercialParity.pass, commercialParity.mismatches.join("; ")).toBe(
      true
    );
    expect(merchantRow?.price).toBe("37 USD");
    expect(merchantRow?.average_rating).toBe("4.6");
    expect(merchantRow?.review_count).toBe(String(tour.reviewCount));
    expect(tour.priceAmount).toBe(offer?.price);
    expect(tour.reviewCount).toBe(aggregateRating?.reviewCount);
  });

  it("keeps 191767P5 aligned with live page Product JSON-LD commercial fields", async () => {
    const { tour, offer, aggregateRating } = await getProductSchemaNodes(
      ENGINE6_LAS_VEGAS_VALLEY_OF_FIRE_OFFROAD_PRODUCT_CODE
    );
    const merchantRow = merchantRowsById.get(
      ENGINE6_LAS_VEGAS_VALLEY_OF_FIRE_OFFROAD_PRODUCT_CODE
    );
    const commercialParity = auditEngine6CommercialFieldParity(
      tour,
      merchantRow!
    );

    expect(commercialParity.pass, commercialParity.mismatches.join("; ")).toBe(
      true
    );
    expect(merchantRow?.price).toBe("432.50 USD");
    expect(merchantRow?.average_rating).toBe("4.5");
    expect(merchantRow?.review_count).toBe("16");
    expect(tour.priceAmount).toBe(offer?.price);
    expect(tour.reviewCount).toBe(aggregateRating?.reviewCount);
  });

  it("keeps 5765MTHOOD aligned with live page Product JSON-LD commercial fields", async () => {
    const { tour, offer, aggregateRating } = await getProductSchemaNodes(
      ENGINE6_PORTLAND_MOUNT_HOOD_DAY_TRIP_PRODUCT_CODE
    );
    const merchantRow = merchantRowsById.get(
      ENGINE6_PORTLAND_MOUNT_HOOD_DAY_TRIP_PRODUCT_CODE
    );
    const commercialParity = auditEngine6CommercialFieldParity(
      tour,
      merchantRow!
    );

    expect(commercialParity.pass, commercialParity.mismatches.join("; ")).toBe(
      true
    );
    expect(merchantRow?.price).toBe("126 USD");
    expect(merchantRow?.average_rating).toBe("4.9");
    expect(merchantRow?.review_count).toBe(String(tour.reviewCount));
    expect(tour.priceAmount).toBe(offer?.price);
    expect(tour.reviewCount).toBe(aggregateRating?.reviewCount);
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
    expect(merchantRow?.description).toBe(
      resolveMerchantDescription({
        productCode: tour.productCode,
        title: tour.title,
        city: tour.city,
        state: tour.state,
        categoryLabel: tour.categoryLabel,
        productOverviewDescription: tour.overviewText,
      })
    );
    expect(merchantRow?.link).toBe(product?.url);
    expect(merchantRow?.link).toBe(
      `https://www.alloutdooradventures.com${ENGINE6_NYC_ONE_DAY_SIGHTSEEING_ROUTE}`
    );
    expect(merchantRow?.price).toBe("99 USD");
    expect(merchantRow?.average_rating).toBe("4.8");
    expect(merchantRow?.rating_count).toBe(String(tour.reviewCount));
    expect(merchantRow?.review_count).toBe(String(tour.reviewCount));
    expect(merchantRow?.image_link).toBe(product?.image);
    expect(merchantRow?.availability).toBe("in stock");
    expect(snapshot.bookingUrl).toBe(offer?.url);
    expect(snapshot.offerPrice).toBe(offer?.price);
    expect(snapshot.aggregateRatingValue).toBe(aggregateRating?.ratingValue);
    expect(snapshot.aggregateReviewCount).toBe(aggregateRating?.reviewCount);
  });
});
