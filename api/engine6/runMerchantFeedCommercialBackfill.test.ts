import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyMerchantFeedCommercialRefresh,
  applyMerchantFeedProductSchemaCommercialCanonicalFields,
  hasEngine6ViatorApiCredentials,
  MERCHANT_FEED_COMMERCIAL_REFRESH_SKIPPED_MESSAGE,
  resolveMerchantFeedCommercialRefreshPolicy,
  runMerchantFeedCommercialBackfill,
} from "./runMerchantFeedCommercialBackfill";
import type { MerchantFeedCsvRow } from "./merchantFeedChangeScopeGovernance";

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

describe("merchant feed commercial refresh policy", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    delete process.env.REQUIRE_LIVE_MERCHANT_COMMERCIAL;
    delete process.env.MERCHANT_FEED_RUNTIME_BASE_URL;
    delete process.env.VIATOR_API_KEY;
    delete process.env.ENGINE6_VIATOR_API_KEY;
    delete process.env.VIATOR_PARTNER_API_KEY;
  });

  it("skips generation refresh locally when credentials are unavailable", () => {
    expect(resolveMerchantFeedCommercialRefreshPolicy("generation")).toEqual({
      action: "skip",
      reason: MERCHANT_FEED_COMMERCIAL_REFRESH_SKIPPED_MESSAGE,
    });
  });

  it("fails generation refresh in production when credentials are unavailable", () => {
    vi.stubEnv("REQUIRE_LIVE_MERCHANT_COMMERCIAL", "1");

    expect(resolveMerchantFeedCommercialRefreshPolicy("generation")).toEqual({
      action: "fail",
      reason:
        "Merchant feed production build requires VIATOR_API_KEY for live commercial resolution.",
    });
  });

  it("preserves existing rows when generation refresh is skipped locally", async () => {
    const rows = [sampleRow()];
    const result = await applyMerchantFeedCommercialRefresh({
      rows,
      baselineRows: rows,
      mode: "generation",
    });

    expect(result.skipped).toBe(true);
    expect(result.rows).toEqual(rows);
    expect(result.report).toBe(
      MERCHANT_FEED_COMMERCIAL_REFRESH_SKIPPED_MESSAGE
    );
  });

  it("keeps generation commercial output canonical to Product JSON-LD rows", () => {
    const productSchemaRows = [
      sampleRow({
        id: "6740P7",
        price: "127.20 USD",
        average_rating: "4.7",
        rating_count: "575",
        review_count: "575",
      }),
    ];
    const refreshedRows = [
      sampleRow({
        id: "6740P7",
        price: "127.20 USD",
        average_rating: "4.7",
        rating_count: "573",
        review_count: "573",
      }),
    ];

    expect(
      applyMerchantFeedProductSchemaCommercialCanonicalFields(
        refreshedRows,
        productSchemaRows
      )[0]
    ).toMatchObject({
      price: "127.20 USD",
      average_rating: "4.7",
      rating_count: "575",
      review_count: "575",
    });
  });
});

describe("runMerchantFeedCommercialBackfill", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env.VERCEL;
    delete process.env.VIATOR_API_KEY;
    delete process.env.ENGINE6_VIATOR_API_KEY;
    delete process.env.VIATOR_PARTNER_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("reports credentials unavailable without throwing when no API key is configured locally", async () => {
    expect(hasEngine6ViatorApiCredentials()).toBe(false);

    const result = await runMerchantFeedCommercialBackfill();

    expect(result).toEqual({
      status: "skipped",
      reason: MERCHANT_FEED_COMMERCIAL_REFRESH_SKIPPED_MESSAGE,
      runtime: "local",
      viatorApiConfig: expect.objectContaining({
        resolvedApiKeyVisible: false,
      }),
    });
  });

  it("throws in Vercel when credentials are unavailable", async () => {
    vi.stubEnv("VERCEL", "1");

    await expect(runMerchantFeedCommercialBackfill()).rejects.toThrow(
      "Engine6 Viator API credentials are unavailable in the Vercel environment."
    );
  });
});
