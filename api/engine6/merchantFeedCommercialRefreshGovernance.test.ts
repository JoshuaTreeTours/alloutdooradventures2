import { describe, expect, it } from "vitest";

import {
  formatMerchantFeedCommercialRefreshAuditReport,
  merchantFeedCommercialRefreshOnlyFieldsChanged,
  MERCHANT_FEED_COMMERCIAL_REFRESH_FIELDS,
  MERCHANT_FEED_RATING_COUNT_SYNCHRONIZED_ALIAS_NOTE,
  refreshExistingMerchantFeedCommercialFields,
} from "./merchantFeedCommercialRefreshGovernance";
import {
  MERCHANT_FEED_ROW_HEADERS,
  type MerchantFeedCsvRow,
} from "./merchantFeedChangeScopeGovernance";
import type { Engine6ViatorProductCommercialDiagnostic } from "./resolveEngine6ViatorProductCommercialExtract";

const sampleRow = (
  overrides: Partial<MerchantFeedCsvRow> = {}
): MerchantFeedCsvRow => ({
  id: "191303P1",
  title: "Sample Tour",
  description: "Governed merchant description for the sample tour.",
  link: "https://www.alloutdooradventures.com/tours/sample",
  image_link: "https://example.com/image.jpg",
  availability: "in stock",
  price: "89.00 USD",
  condition: "new",
  brand: "Viator",
  average_rating: "5.0",
  rating_count: "54",
  review_count: "54",
  ...overrides,
});

const liveApiDiagnostic = (
  productCode: string,
  overrides: Partial<Engine6ViatorProductCommercialDiagnostic> = {}
): Engine6ViatorProductCommercialDiagnostic => ({
  productCode,
  commercial: {
    priceAmount: 99,
    priceFormatted: "From $99.00",
    aggregateRating: 4.8,
    reviewCount: 60,
    source: "live-api",
  },
  hasViatorApiKey: true,
  attemptedLiveFetch: true,
  upstreamStatus: 200,
  upstreamOk: true,
  failureReason: "live-api-success",
  pricingAvailable: true,
  ratingAvailable: true,
  reviewCountAvailable: true,
  ratingMetadataPresent: true,
  ...overrides,
});

const bundledFallbackDiagnostic = (
  productCode: string
): Engine6ViatorProductCommercialDiagnostic => ({
  productCode,
  commercial: {
    priceAmount: 99,
    priceFormatted: "From $99.00",
    aggregateRating: 4.8,
    reviewCount: 60,
    source: "bundled-fallback",
  },
  hasViatorApiKey: true,
  attemptedLiveFetch: true,
  upstreamStatus: 200,
  upstreamOk: true,
  failureReason: "live-price-missing-or-zero",
  pricingAvailable: true,
  ratingAvailable: true,
  reviewCountAvailable: true,
  ratingMetadataPresent: true,
});

describe("merchant feed commercial refresh governance", () => {
  it("declares only price, average_rating, and review_count as refresh fields", () => {
    expect(MERCHANT_FEED_COMMERCIAL_REFRESH_FIELDS).toEqual([
      "price",
      "average_rating",
      "review_count",
    ]);
  });

  it("refreshes live commercial fields for existing products while preserving non-commercial columns", async () => {
    const baseline = [
      sampleRow(),
      sampleRow({
        id: "63657P1",
        title: "Second Tour",
        link: "https://www.alloutdooradventures.com/tours/second",
      }),
    ];
    const proposed = [
      sampleRow({
        title: "Regenerated title drift",
        description: "Regenerated description drift.",
        link: "https://www.alloutdooradventures.com/tours/wrong",
        price: "12.00 USD",
      }),
      baseline[1]!,
    ];

    const diagnose = async (productCode: string) =>
      liveApiDiagnostic(productCode);

    const result = await refreshExistingMerchantFeedCommercialFields(
      proposed,
      baseline,
      diagnose
    );

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toMatchObject({
      title: "Regenerated title drift",
      description: "Regenerated description drift.",
      link: "https://www.alloutdooradventures.com/tours/wrong",
      price: "99 USD",
      average_rating: "4.8",
      rating_count: "60",
      review_count: "60",
    });
    expect(merchantFeedCommercialRefreshOnlyFieldsChanged(
      proposed[0]!,
      result.rows[0]!
    )).toBe(true);
    expect(result.audit.productsChecked).toBe(2);
    expect(result.audit.fieldsRefreshed.length).toBeGreaterThan(0);
  });

  it("preserves existing CSV row order", async () => {
    const baseline = [
      sampleRow({ id: "AAA111" }),
      sampleRow({ id: "BBB222" }),
      sampleRow({ id: "CCC333" }),
    ];
    const proposed = [...baseline];

    const result = await refreshExistingMerchantFeedCommercialFields(
      proposed,
      baseline,
      async productCode => liveApiDiagnostic(productCode)
    );

    expect(result.rows.map(row => row.id)).toEqual(["AAA111", "BBB222", "CCC333"]);
  });

  it("keeps existing CSV commercial values when the live source is unavailable", async () => {
    const baseline = [sampleRow()];
    const proposed = [
      sampleRow({
        price: "12.00 USD",
        average_rating: "1.0",
        rating_count: "1",
        review_count: "1",
      }),
    ];

    const result = await refreshExistingMerchantFeedCommercialFields(
      proposed,
      baseline,
      async productCode => bundledFallbackDiagnostic(productCode)
    );

    expect(result.rows[0]).toMatchObject({
      price: "89.00 USD",
      average_rating: "5.0",
      rating_count: "54",
      review_count: "54",
    });
    expect(result.audit.unavailableLiveValues).toHaveLength(3);
    expect(result.audit.fieldsRefreshed).toEqual([]);
  });

  it("preserves missing live commercial fields individually", async () => {
    const baseline = [sampleRow()];
    const proposed = [sampleRow()];

    const result = await refreshExistingMerchantFeedCommercialFields(
      proposed,
      baseline,
      async productCode =>
        liveApiDiagnostic(productCode, {
          ratingAvailable: false,
          reviewCountAvailable: false,
          commercial: {
            priceAmount: 99,
            priceFormatted: "From $99.00",
            aggregateRating: null,
            reviewCount: null,
            source: "live-api",
          },
        })
    );

    expect(result.rows[0]).toMatchObject({
      price: "99 USD",
      average_rating: "5.0",
      review_count: "54",
      rating_count: "54",
    });
    expect(
      result.audit.unavailableLiveValues.map(entry => entry.field).sort()
    ).toEqual(["average_rating", "review_count"]);
  });

  it("does not refresh appended products that were not in the existing CSV baseline", async () => {
    const baseline = [sampleRow()];
    const appended = sampleRow({
      id: "NEWTOUR1",
      price: "45.00 USD",
      average_rating: "4.5",
      rating_count: "10",
      review_count: "10",
    });

    const result = await refreshExistingMerchantFeedCommercialFields(
      [baseline[0]!, appended],
      baseline,
      async productCode => liveApiDiagnostic(productCode)
    );

    expect(result.audit.productsChecked).toBe(1);
    expect(result.rows[1]).toEqual(appended);
  });

  it("proves only commercial refresh fields may change for existing products", async () => {
    const baseline = [sampleRow()];
    const proposed = [
      sampleRow({
        title: "Changed title",
        description: "Changed description",
        link: "https://www.alloutdooradventures.com/tours/changed",
        image_link: "https://example.com/changed.jpg",
        availability: "out of stock",
        condition: "used",
        brand: "Other",
        price: "1.00 USD",
        average_rating: "1.0",
        rating_count: "1",
        review_count: "1",
      }),
    ];

    const result = await refreshExistingMerchantFeedCommercialFields(
      proposed,
      baseline,
      async productCode => liveApiDiagnostic(productCode)
    );

    for (const header of MERCHANT_FEED_ROW_HEADERS) {
      if (
        MERCHANT_FEED_COMMERCIAL_REFRESH_FIELDS.includes(
          header as (typeof MERCHANT_FEED_COMMERCIAL_REFRESH_FIELDS)[number]
        ) ||
        header === "rating_count"
      ) {
        continue;
      }

      expect(result.rows[0]![header]).toBe(proposed[0]![header]);
    }

    expect(merchantFeedCommercialRefreshOnlyFieldsChanged(
      proposed[0]!,
      result.rows[0]!
    )).toBe(true);
  });

  it("formats a final audit report with checked, refreshed, preserved, and unavailable counts", async () => {
    const baseline = [sampleRow()];
    const result = await refreshExistingMerchantFeedCommercialFields(
      baseline,
      baseline,
      async productCode => bundledFallbackDiagnostic(productCode)
    );

    const report = formatMerchantFeedCommercialRefreshAuditReport(result.audit);

    expect(report).toContain("products checked: 1");
    expect(report).toContain("fields refreshed: 0");
    expect(report).toContain("fields preserved: 3");
    expect(report).toContain("unavailable live values: 3");
    expect(report).toContain("Unavailable live values");
    expect(report).toContain(MERCHANT_FEED_RATING_COUNT_SYNCHRONIZED_ALIAS_NOTE);
  });
});
