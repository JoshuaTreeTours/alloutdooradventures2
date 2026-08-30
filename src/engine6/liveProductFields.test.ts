import { describe, it, expect } from "vitest";
import { mergeEngine6LiveFieldsIntoTour } from "./liveProductFields";
import type { Tour } from "../data/tours.types";

const makeEngine6Tour = (overrides: Partial<Tour> = {}): Tour => ({
  id: "engine6-2660SFOWIN",
  engine: "engine6",
  productCode: "2660SFOWIN",
  slug: "napa-and-sonoma-wine-country-tour-2660sfowin",
  title: "Napa and Sonoma Wine Country Tour",
  shortDescription: "Wine country day trip",
  categories: ["sightseeing-tour"],
  destination: {
    country: "United States",
    state: "California",
    stateSlug: "california",
    city: "San Francisco",
    citySlug: "san-francisco",
  },
  heroImage: "https://example.com/hero.jpg",
  badges: {
    rating: 4.5,
    reviewCount: 4200,
    priceFrom: "From $129.00",
  },
  startingPrice: 129,
  currency: "USD",
  activitySlugs: ["bike-tours"],
  bookingProvider: "viator",
  ...overrides,
});

describe("mergeEngine6LiveFieldsIntoTour", () => {
  it("applies live api parity for Napa/Sonoma city cards", () => {
    const merged = mergeEngine6LiveFieldsIntoTour(makeEngine6Tour(), {
      priceAmount: 156.75,
      priceFormatted: "From $156.75",
      aggregateRating: 4.3,
      reviewCount: 4512,
      durationText: "9 hours",
      meetingPointText: "Union Square",
    });

    expect(merged.startingPrice).toBe(156.75);
    expect(merged.badges.priceFrom).toBe("From $156.75");
    expect(merged.badges.rating).toBe(4.3);
    expect(merged.badges.reviewCount).toBe(4512);
  });

  it("preserves Joshua Tree fallback values when live fields are missing", () => {
    const merged = mergeEngine6LiveFieldsIntoTour(
      makeEngine6Tour({
        productCode: "445161P1",
        title: "Professional Stargazing in Joshua Tree",
        badges: {
          rating: 4.9,
          reviewCount: 310,
          priceFrom: "From $175.00",
        },
        startingPrice: 175,
      }),
      { priceAmount: null, reviewCount: null, aggregateRating: null }
    );

    expect(merged.startingPrice).toBe(175);
    expect(merged.badges.priceFrom).toBe("From $175.00");
    expect(merged.badges.rating).toBe(4.9);
    expect(merged.badges.reviewCount).toBe(310);
  });

  it("hydrates Santa Barbara trolley guide-card price from formatted live field when amount is null", () => {
    const merged = mergeEngine6LiveFieldsIntoTour(
      makeEngine6Tour({
        productCode: "163975P1",
        slug: "santa-barbara-trolley-tour",
        title: "Santa Barbara Trolley Tour",
        destination: {
          country: "United States",
          state: "California",
          stateSlug: "california",
          city: "Santa Barbara",
          citySlug: "santa-barbara",
        },
        badges: {
          rating: 4.6,
          reviewCount: 836,
          priceFrom: "Check latest price",
        },
        startingPrice: undefined,
      }),
      {
        priceAmount: null,
        priceFormatted: "From $74.00",
        aggregateRating: 4.6,
        reviewCount: 836,
        durationText: "1 hour 30 minutes",
      }
    );

    expect(merged.startingPrice).toBe(74);
    expect(merged.badges.priceFrom).toBe("From $74.00");
    expect(merged.badges.rating).toBe(4.6);
    expect(merged.badges.reviewCount).toBe(836);
  });

  it("keeps bundled USD From$ when live hydration returns yen-scale amounts", () => {
    const merged = mergeEngine6LiveFieldsIntoTour(
      makeEngine6Tour({
        productCode: "92136P55",
        title: "Kyoto 6hr Private Tour with Government-Licensed Guide",
        destination: {
          country: "Japan",
          countryCode: "JP",
          countrySlug: "japan",
          state: "Japan",
          stateSlug: "japan",
          city: "Kyoto",
          citySlug: "kyoto",
        },
        badges: {
          rating: 4.9,
          reviewCount: 1106,
          priceFrom: "From $156.60",
        },
        startingPrice: 156.6,
  it("does not overwrite a USD commercial listing price with a live JPY amount", () => {
    const merged = mergeEngine6LiveFieldsIntoTour(
      makeEngine6Tour({
        productCode: "33215P1",
        startingPrice: 106.77,
        currency: "USD",
        badges: {
          rating: 5,
          reviewCount: 1147,
          priceFrom: "From $106.77",
        },
      }),
      {
        priceAmount: 16500,
        priceCurrency: "JPY",
        priceFormatted: "From ¥16,500.00",
        aggregateRating: 5,
        reviewCount: 1147,
      }
    );

    expect(merged.startingPrice).toBe(106.77);
    expect(merged.currency).toBe("USD");
    expect(merged.badges.priceFrom).toBe("From $106.77");
  });

  it("rejects a live amount that is orders of magnitude above the USD commercial price", () => {
    const merged = mergeEngine6LiveFieldsIntoTour(
      makeEngine6Tour({
        productCode: "33215P1",
        startingPrice: 106.77,
        currency: "USD",
        badges: {
          rating: 5,
          reviewCount: 1147,
          priceFrom: "From $106.77",
        },
      }),
      {
        priceAmount: 16500,
        priceFormatted: "From $16,500.00",
        aggregateRating: 4.9,
        reviewCount: 1636,
      }
    );

    expect(merged.startingPrice).toBe(156.6);
    expect(merged.badges.priceFrom).toBe("From $156.60");
    expect(merged.badges.reviewCount).toBe(1636);
      }
    );

    expect(merged.startingPrice).toBe(106.77);
    expect(merged.badges.priceFrom).toBe("From $106.77");
  });
});
