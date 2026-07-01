import { describe, expect, it } from "vitest";

import {
  ENGINE6_GLOBAL_FALLBACK_HERO_URL,
  ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL,
} from "./displayHero";
import {
  applyMerchantFeedImageGovernance,
  collectMerchantFeedImageFallbackCandidates,
  extractEngine6PoiLocationImageUrls,
  validateEngine6MerchantFeedImageUrl,
} from "./merchantFeedImageGovernance";
import type { Engine6Tour } from "./types";

const buildTour = (overrides: Partial<Engine6Tour> = {}): Engine6Tour =>
  ({
    productCode: "TESTP1",
    title: "Test Tour",
    seoTitle: "Test Tour",
    seoDescription: "Test description",
    description: "Test description",
    metaDescription: "Test description",
    city: "Monterey",
    state: "California",
    resolvedImageUrl: null,
    heroImageUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg",
    resolvedHero: null,
    priceAmount: 99,
    priceFormatted: "$99.00",
    aggregateRating: 4.8,
    reviewCount: 10,
    meetingPointText: "Meet at the pier",
    overviewText: "Overview",
    highlights: [],
    itinerary: [],
    faqs: [],
    included: [],
    requirements: [],
    primaryCategory: "adventure-tour",
    categories: ["adventure-tour"],
    primaryDisplayCategory: "Adventure",
    activityCategories: [],
    categoryLabel: "Adventure",
    pagePath: "/destinations/california/monterey/tours/test-tour",
    canonicalPath: "/destinations/california/monterey/tours/test-tour",
    bookingUrl: "https://example.com/book",
    ownership: {
      routeOwner: "viator",
      ctaOwner: "viator",
      presentationOwner: "engine6",
      commercialOwner: "viator",
      commercialFallbackReason: "none",
    },
    diagnostics: {} as Engine6Tour["diagnostics"],
    ...overrides,
  }) as Engine6Tour;

describe("collectMerchantFeedImageFallbackCandidates", () => {
  it("orders hero, curated, city canonical, and global fallback candidates", () => {
    const tour = buildTour({
      productCode: "53254P8",
      heroImageUrl:
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg",
    });
    const primaryImageUrl = tour.heroImageUrl;

    const candidates = collectMerchantFeedImageFallbackCandidates(tour, {
      primaryImageUrl,
      rawProductPayload: {
        product: {
          productCode: "53254P8",
          productUrl: "https://www.viator.com/tours/example/d1-53254P8",
          media: {
            images: [
              {
                isCover: true,
                variants: {
                  FULL: {
                    url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg",
                    width: 674,
                    height: 446,
                  },
                },
              },
              {
                variants: {
                  FULL: {
                    url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/22/33/44.jpg",
                    width: 674,
                    height: 446,
                  },
                },
              },
            ],
          },
        },
      },
    });

    expect(candidates[0]).toBe(primaryImageUrl);
    expect(candidates).toContain(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/22/33/44.jpg"
    );
    expect(candidates).toContain(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/7f/49/38.jpg"
    );
    expect(candidates).toContain(ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL);
    expect(candidates.at(-1)).toBe(ENGINE6_GLOBAL_FALLBACK_HERO_URL);
  });

  it("extracts POI and location image URLs from itinerary payloads", () => {
    const urls = extractEngine6PoiLocationImageUrls({
      itinerary: {
        itineraryItems: [
          {
            pointOfInterestLocation: {
              imageUrl:
                "https://media.tacdn.com/media/attractions-splice-spp-674x446/01/02/03/04.jpg",
            },
          },
        ],
      },
    });

    expect(urls).toEqual([
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/01/02/03/04.jpg",
    ]);
  });
});

describe("validateEngine6MerchantFeedImageUrl", () => {
  it("rejects placeholder and non-http URLs without fetching", async () => {
    await expect(
      validateEngine6MerchantFeedImageUrl("/hero.jpg")
    ).resolves.toMatchObject({
      valid: false,
      reason: "not-displayable",
    });
  });

  it("rejects 404, 403, and 5xx responses", async () => {
    const fetchImpl = async (_url: string, init?: RequestInit) => {
      if (init?.method === "HEAD") {
        return new Response(null, { status: 404 });
      }

      return new Response(null, { status: 404 });
    };

    await expect(
      validateEngine6MerchantFeedImageUrl(
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg",
        { fetchImpl }
      )
    ).resolves.toMatchObject({
      valid: false,
      reason: "http-error",
      status: 404,
    });
  });

  it("accepts successful image responses", async () => {
    const fetchImpl = async () =>
      new Response(null, {
        status: 200,
        headers: { "content-type": "image/jpeg" },
      });

    await expect(
      validateEngine6MerchantFeedImageUrl(
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg",
        { fetchImpl }
      )
    ).resolves.toMatchObject({
      valid: true,
      status: 200,
    });
  });
});

describe("applyMerchantFeedImageGovernance", () => {
  it("repairs invalid image_link values using the fallback hierarchy", async () => {
    const tour = buildTour({
      productCode: "53254P8",
      heroImageUrl:
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/2e/41/ec.jpg",
    });
    const invalidPrimary =
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/2e/41/ec.jpg";
    const fallback =
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/7f/49/38.jpg";

    const validateImageUrl = async (url: string) => ({
      valid: url === fallback,
      reason: url === fallback ? undefined : ("http-error" as const),
      status: url === fallback ? 200 : 404,
    });

    const result = await applyMerchantFeedImageGovernance({
      rows: [{ id: "53254P8", image_link: invalidPrimary }],
      toursByProductCode: new Map([["53254P8", tour]]),
      validateImageUrl,
      loadProductPayload: () => null,
    });

    expect(result.pass).toBe(true);
    expect(result.rows[0]?.image_link).toBe(fallback);
    expect(result.report.imagesValidated).toBe(1);
    expect(result.report.automaticallyRepaired).toBe(1);
    expect(result.report.requiringFallback).toBe(1);
    expect(result.report.unrecoverableFailures).toBe(0);
  });

  it("fails when no valid replacement image exists for strict Engine6 scope", async () => {
    const tour = buildTour({ productCode: "BADP1" });

    const result = await applyMerchantFeedImageGovernance({
      rows: [
        {
          id: "BADP1",
          image_link:
            "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg",
        },
      ],
      toursByProductCode: new Map([["BADP1", tour]]),
      validateImageUrl: async () => ({
        valid: false,
        reason: "http-error",
        status: 404,
      }),
      loadProductPayload: () => null,
    });

    expect(result.pass).toBe(false);
    expect(result.report.unrecoverableFailures).toBe(1);
  });

  it("reports legacy non-Engine6 invalid images without blocking production", async () => {
    const result = await applyMerchantFeedImageGovernance({
      rows: [
        {
          id: "LEGACY123",
          image_link: "https://example.com/broken-legacy.jpg",
        },
      ],
      governanceByProductCode: new Map([
        ["LEGACY123", "unchanged-legacy-baseline"],
      ]),
      validateImageUrl: async () => ({
        valid: false,
        reason: "http-error",
        status: 404,
      }),
    });

    expect(result.pass).toBe(true);
    expect(result.report.unrecoverableFailures).toBe(0);
    expect(result.report.informationalLegacyInvalidImages).toBe(1);
    expect(result.report.informationalLegacyProductCodes).toEqual(["LEGACY123"]);
  });

  it("blocks branch-modified Engine6 rows even when baseline tier is legacy", async () => {
    const tour = buildTour({ productCode: "MODP1" });

    const result = await applyMerchantFeedImageGovernance({
      rows: [
        {
          id: "MODP1",
          image_link:
            "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg",
        },
      ],
      toursByProductCode: new Map([["MODP1", tour]]),
      governanceByProductCode: new Map([
        ["MODP1", "unchanged-legacy-baseline"],
      ]),
      branchModifiedProductCodes: new Set(["MODP1"]),
      validateImageUrl: async () => ({
        valid: false,
        reason: "http-error",
        status: 404,
      }),
      loadProductPayload: () => null,
    });

    expect(result.pass).toBe(false);
    expect(result.report.unrecoverableFailures).toBe(1);
  });
});
