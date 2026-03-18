import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import Engine6TourPage from "./components/Engine6TourPage";
import { toEngine6Card, buildEngine6CardSurfaces } from "./cards";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import { ENGINE6_SPECIMEN_ROUTE } from "./routes";

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
          images: [
            { variants: { LARGE: { url: "https://img.test/hero.jpg" } } },
          ],
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

describe("engine6 mapping/cards/page", () => {
  it("maps normalized tour object stably", () => {
    const tour = mapViatorToEngine6Tour({
      source: "live-api",
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
      rawProduct: {},
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
    });

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
});
