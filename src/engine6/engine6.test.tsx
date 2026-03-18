import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import Engine6TourPage from "./components/Engine6TourPage";
import { toEngine6Card, buildEngine6CardSurfaces } from "./cards";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import { ENGINE6_SPECIMEN_ROUTE } from "./routes";
import {
  buildEngine6SpecimenApiUrl,
  resolveEngine6SpecimenResponse,
} from "../pages/engine6/Engine6SpecimenRoute";

describe("engine6 extractor", () => {
  it("resolves non-primary booking option pricing and hero", () => {
    const extracted = extractEngine6Product({
      product: {
        title: "East Zion Top of the World Jeep Tour",
        location: { city: "Springdale", state: "Utah" },
        bookingOptions: [
          { pricing: { summary: { fromPrice: 0 } } },
          { pricing: { summary: { fromPrice: 149 } } },
        ],
        media: {
          images: [{ variants: { LARGE: { url: "https://img.test/hero.jpg" } } }],
        },
        reviews: { combinedAverageRating: 5, totalReviews: 274 },
        logistics: { start: { description: "Meet at East Zion Adventures" } },
        itineraryItems: [{ title: "Top of the World", description: "Views" }],
      },
    });

    expect(extracted.extracted.priceAmount).toBe(149);
    expect(extracted.diagnostics.commercialPriceFieldPath).toBe(
      "product.bookingOptions[1].pricing.summary.fromPrice"
    );
    expect(extracted.extracted.heroImageUrl).toBe("https://img.test/hero.jpg");
    expect(extracted.diagnostics.heroImageFieldPath).toBe(
      "product.media.images[0].variants.LARGE.url"
    );
  });
});

const specimenApiPayload = {
  source: "live-api" as const,
  diagnostics: {
    hasViatorApiKey: true,
    attemptedLiveFetch: true,
    upstreamStatus: 200,
    upstreamContentType: "application/json",
    upstreamOk: true,
    usedBundledFallbackBecause: "",
    commercialPriceFieldPath: "product.pricing.summary.fromPrice",
    heroImageFieldPath: "product.media.images[0].variants.LARGE.url",
    ratingFieldPath: "product.reviews.combinedAverageRating",
    reviewCountFieldPath: "product.reviews.totalReviews",
    itineraryFieldPath: "product.itineraryItems",
    meetingPointFieldPath: "product.logistics.start.description",
  },
  rawProductCode: "163873P16",
  rawProduct: {
    title: "East Zion Top of the World Jeep Tour",
  },
  extracted: {
    title: "East Zion Top of the World Jeep Tour",
    seoTitle: "East Zion Top of the World Jeep Tour in Springdale",
    seoDescription: "Best tour in Springdale with off-road views.",
    city: "Springdale",
    state: "Utah",
    heroImageUrl: "https://img.test/hero.jpg",
    cardImageUrl: "https://img.test/hero.jpg",
    priceAmount: 129,
    priceFormatted: "From $129",
    aggregateRating: 4.9,
    reviewCount: 274,
    meetingPointText: "Meet at East Zion Adventures",
    itinerary: [{ title: "Stop 1" }],
  },
};

describe("engine6 mapping/cards/page", () => {
  it("maps normalized tour object stably", () => {
    const tour = mapViatorToEngine6Tour(specimenApiPayload);

    const card = toEngine6Card(tour);
    const surfaces = buildEngine6CardSurfaces(tour);
    const html = renderToString(<Engine6TourPage tour={tour} />);

    expect(tour.productCode).toBe("163873P16");
    expect(card.title).toContain("East Zion");
    expect(surfaces.city[0].priceLabel).toBe("From $129");
    expect(html).toContain("Tour itinerary");
    expect(ENGINE6_SPECIMEN_ROUTE).toBe(
      "/destinations/utah/springdale/tours/east-zion-top-of-the-world-jeep-tour"
    );
  });

  it("keeps the specimen renderable from the live Engine6 API envelope", () => {
    const apiUrl = buildEngine6SpecimenApiUrl("163873P16");
    const resolved = resolveEngine6SpecimenResponse({
      payload: specimenApiPayload,
      httpStatus: 200,
      productCode: "163873P16",
      apiUrl,
    });

    expect(resolved.error).toBeNull();
    expect(resolved.tour?.title).toBe("East Zion Top of the World Jeep Tour");
    expect(resolved.debug.requestedApiUrl).toBe(apiUrl);
    expect(resolved.debug.hasExtractedTitle).toBe(true);
    expect(resolved.debug.failureReason).toBeNull();
  });

  it("still renders a partial specimen instead of collapsing to not-found", () => {
    const resolved = resolveEngine6SpecimenResponse({
      payload: {
        ...specimenApiPayload,
        extracted: {
          ...specimenApiPayload.extracted,
          title: null,
          heroImageUrl: null,
          priceFormatted: null,
        },
      },
      httpStatus: 200,
      productCode: "163873P16",
      apiUrl: buildEngine6SpecimenApiUrl("163873P16"),
    });

    expect(resolved.error).toBeNull();
    expect(resolved.tour?.title).toBe("Utah Off-Road Adventure");
    expect(resolved.tour?.heroImageUrl).toContain("unsplash.com");
  });
});

describe("engine6 route wiring", () => {
  it("registers the specimen route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf('<Route path={ENGINE6_SPECIMEN_ROUTE} component={Engine6SpecimenRoute} />');
    const genericRouteIndex = source.indexOf('path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"');

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });
});
