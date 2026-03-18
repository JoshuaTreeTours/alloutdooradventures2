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

const liveShapedProduct = {
  product: {
    productCode: "163873P16",
    title: "East Zion Top of the World Jeep Tour",
    description: {
      text: "<p>Climb high above East Zion in an off-road Jeep with a guide who shares local canyon context.</p><p>Expect sweeping overlooks and a smoother way to cover rugged terrain.</p>",
    },
    highlights: [
      "Ride to elevated East Zion viewpoints by Jeep",
      "See broad desert and canyon panoramas",
      "Travel with a local guide who handles the rugged road",
    ],
    location: { city: "Springdale", state: "Utah" },
    bookingOptions: [
      { pricing: { summary: { fromPrice: 0 } } },
      {
        seasonalPricingRecords: [
          {
            pricingDetails: [
              {
                price: {
                  original: { recommendedRetailPrice: 149 },
                },
              },
            ],
          },
        ],
      },
    ],
    media: {
      images: [
        { variants: { LARGE: { url: "https://img.test/non-cover.jpg" } } },
        {
          isCover: true,
          variants: { XXLARGE: { url: "https://img.test/hero.jpg" } },
        },
      ],
    },
    reviews: { combinedAverageRating: 5, totalReviews: 274 },
    logistics: { start: { description: "Meet at East Zion Adventures" } },
    itineraryItems: [
      {
        title: "Top of the World",
        description:
          "Reach a high overlook with wide desert and Zion-area views.",
        duration: "30 minutes",
      },
      {
        title: "Backcountry trail",
        summary: "Ride rugged sections with your guide handling route choices.",
      },
    ],
    qAndA: {
      items: [
        {
          q: "Is this tour suitable for first-time visitors?",
          a: "Yes. It is a good way to get elevated views without hiking long distances.",
        },
      ],
    },
  },
};

describe("engine6 extractor", () => {
  it("resolves pricing, hero image, overview, highlights, itinerary, and faqs", () => {
    const extracted = extractEngine6Product(liveShapedProduct);

    expect(extracted.extracted.priceAmount).toBe(149);
    expect(extracted.diagnostics.commercialPriceFieldPath).toBe(
      "product.bookingOptions[1].seasonalPricingRecords[0].pricingDetails[0].price.original.recommendedRetailPrice"
    );
    expect(extracted.extracted.heroImageUrl).toBe("https://img.test/hero.jpg");
    expect(extracted.diagnostics.heroImageFieldPath).toBe(
      "product.media.images[1].variants.XXLARGE.url"
    );
    expect(extracted.extracted.overviewText).toContain(
      "Climb high above East Zion"
    );
    expect(extracted.diagnostics.overviewFieldPath).toBe(
      "product.description.text"
    );
    expect(extracted.extracted.highlights).toHaveLength(3);
    expect(extracted.diagnostics.highlightsFieldPath).toBe(
      "product.highlights"
    );
    expect(extracted.extracted.itinerary[0].duration).toBe("30 minutes");
    expect(extracted.diagnostics.itineraryFieldPath).toBe(
      "product.itineraryItems"
    );
    expect(extracted.extracted.faqs[0]).toEqual({
      question: "Is this tour suitable for first-time visitors?",
      answer:
        "Yes. It is a good way to get elevated views without hiking long distances.",
    });
    expect(extracted.diagnostics.faqsFieldPath).toBe("product.qAndA.items");
    expect(extracted.extracted.primaryCategory).toBe("off-road-tour");
    expect(extracted.extracted.categories).toContain("off-road-tour");
    expect(extracted.diagnostics.classificationFieldPath).toBe(
      "inferred:title+overview+highlights"
    );
  });
});

const specimenApiPayload = {
  source: "live-api" as const,
  diagnostics: {
    source: "live-api" as const,
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
    overviewFieldPath: "product.description.text",
    highlightsFieldPath: "product.highlights",
    itineraryFieldPath: "product.itineraryItems",
    meetingPointFieldPath: "product.logistics.start.description",
    faqsFieldPath: "product.qAndA.items",
    classificationFieldPath: "inferred:title+overview+highlights",
  },
  rawProductCode: "163873P16",
  rawProduct: {
    title: "East Zion Top of the World Jeep Tour",
  },
  extracted: {
    title: "East Zion Top of the World Jeep Tour",
    seoTitle: "East Zion Top of the World Jeep Tour in Springdale",
    seoDescription: "Best tour in Springdale. Rated 4.9/5. 274 reviews.",
    city: "Springdale",
    state: "Utah",
    heroImageUrl: "https://img.test/hero.jpg",
    cardImageUrl: "https://img.test/hero.jpg",
    priceAmount: 129,
    priceFormatted: "From $129",
    aggregateRating: 4.9,
    reviewCount: 274,
    meetingPointText: "Meet at East Zion Adventures",
    overviewText:
      "Climb high above East Zion in an off-road Jeep with a guide who shares local canyon context.",
    highlights: [
      "Ride to elevated East Zion viewpoints by Jeep",
      "See broad desert and canyon panoramas",
    ],
    itinerary: [
      {
        title: "Top of the World",
        description:
          "Reach a high overlook with wide desert and Zion-area views.",
        duration: "30 minutes",
      },
    ],
    faqs: [
      {
        question: "Is this tour suitable for first-time visitors?",
        answer:
          "Yes. It is a good way to get elevated views without hiking long distances.",
      },
    ],
    primaryCategory: "off-road-tour",
    categories: ["off-road-tour"],
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
    expect(tour.primaryCategory).toBe("off-road-tour");
    expect(html).toContain("Off Road Tour");
    expect(html).toContain("Overview");
    expect(html).toContain("Highlights");
    expect(html).toContain("Itinerary");
    expect(html).toContain("FAQs");
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
    expect(resolved.debug.overviewFieldPath).toBe("product.description.text");
    expect(resolved.debug.highlightsFieldPath).toBe("product.highlights");
    expect(resolved.debug.faqsFieldPath).toBe("product.qAndA.items");
    expect(resolved.debug.classificationFieldPath).toBe(
      "inferred:title+overview+highlights"
    );
    expect(resolved.debug.primaryCategory).toBe("off-road-tour");
    expect(resolved.debug.failureReason).toBeNull();
  });

  it("still renders cleanly when overview, highlights, itinerary, and faqs are missing", () => {
    const resolved = resolveEngine6SpecimenResponse({
      payload: {
        ...specimenApiPayload,
        extracted: {
          ...specimenApiPayload.extracted,
          title: null,
          heroImageUrl: null,
          overviewText: null,
          highlights: [],
          itinerary: [],
          faqs: [],
        },
      },
      httpStatus: 200,
      productCode: "163873P16",
      apiUrl: buildEngine6SpecimenApiUrl("163873P16"),
    });

    const html = renderToString(<Engine6TourPage tour={resolved.tour!} />);

    expect(resolved.error).toBeNull();
    expect(resolved.tour?.title).toBe("Utah Off-Road Adventure");
    expect(resolved.tour?.heroImageUrl).toContain("unsplash.com");
    expect(html).not.toContain("Overview");
    expect(html).not.toContain("FAQs");
  });
});

describe("engine6 route wiring", () => {
  it("registers the specimen route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "<Route path={ENGINE6_SPECIMEN_ROUTE} component={Engine6SpecimenRoute} />"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });
});
