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

const specimenProductPayload = {
  product: {
    productCode: "163873P16",
    title: "East Zion Top of the World Jeep Tour",
    description: {
      text: "<p>Grab bird’s-eye views of Zion National Park on this Jeep tour. After meeting up with your guide, you’ll spend the next 1.5 hours climbing up, up, up the mountains—all on private land—to incredible views of the Coral Pink Sand Dunes, Cedar Mountain, and beyond. With reasonably groomed trails, this trek is perfect for families with small kids, and anyone looking for easy, effortless adventure with plenty of reward.</p>",
    },
    shortDescription: "Short fallback that should not win for the specimen.",
    highlights: [
      "Easy meetup at at Zion Ponderosa Ranch Resort",
      "Your local guide adds valuable insight on the area's geology, flora, fauna, and more",
      "See Zion National Park and its environs from above",
      "Limited to 8 travelers, you'll get an intimate East Zion experience",
    ],
    additionalInfo: [
      "Confirmation will be received at time of booking",
      "Not wheelchair accessible",
      "Not recommended for travelers with back problems",
      "Not recommended for pregnant travelers",
      "No heart problems or other serious medical conditions",
      "Most travelers can participate",
      "This tour/activity will have a maximum of 8 travelers",
    ],
    location: { city: "Springdale", state: "Utah" },
    priceFrom: "$105.09",
    pricing: { summary: { fromPrice: 999 } },
    images: [
      {
        isCover: true,
        variants: [
          {
            url: "https://img.test/specimen-root-hero-small.jpg",
            width: 360,
            height: 240,
          },
          {
            url: "https://img.test/specimen-root-hero-large.jpg",
            width: 674,
            height: 446,
          },
        ],
      },
    ],
    media: {
      images: [
        {
          isCover: true,
          variants: {
            XXLARGE: { url: "https://img.test/incorrect-media-hero.jpg" },
          },
        },
      ],
    },
    reviews: { combinedAverageRating: 5, totalReviews: 154 },
    logistics: { start: { description: "Meet us at Zion Mountain Ranch!" } },
    itineraryItems: [
      {
        title: "Zion National Park",
        description: "Admission Ticket Free",
        duration: "30 minutes",
      },
    ],
    qAndA: {
      items: [
        {
          q: "Is this tour good for families?",
          a: "Yes. The reasonably groomed trails make it approachable for families with small kids.",
        },
      ],
    },
  },
};

describe("engine6 extractor", () => {
  it("hard-enforces the exact 163873P16 hero, price, and content section sources", () => {
    const extracted = extractEngine6Product(specimenProductPayload);

    expect(extracted.extracted.heroImageUrl).toBe(
      "https://img.test/specimen-root-hero-large.jpg"
    );
    expect(extracted.diagnostics.heroImageFieldPath).toBe(
      "product.images[0].variants[1].url"
    );
    expect(extracted.diagnostics.heroVariantFieldPath).toBe(
      "product.images[0].variants[1]"
    );
    expect(extracted.diagnostics.selectedHeroWidth).toBe(674);
    expect(extracted.diagnostics.selectedHeroHeight).toBe(446);
    expect(extracted.diagnostics.imageSourceUsed).toBe("live-product-image");

    expect(extracted.extracted.priceAmount).toBe(105.09);
    expect(extracted.extracted.priceFormatted).toBe("From $105");
    expect(extracted.diagnostics.commercialPriceFieldPath).toBe(
      "product.priceFrom"
    );
    expect(extracted.diagnostics.commercialPriceRawValue).toBe("$105.09");
    expect(extracted.diagnostics.priceSourceUsed).toBe("live-price");

    expect(extracted.extracted.overviewText).toContain(
      "Grab bird’s-eye views of Zion National Park on this Jeep tour"
    );
    expect(extracted.diagnostics.overviewFieldPath).toBe(
      "product.description.text"
    );

    expect(extracted.extracted.highlights).toEqual([
      "Easy meetup at at Zion Ponderosa Ranch Resort",
      "Your local guide adds valuable insight on the area's geology, flora, fauna, and more",
      "See Zion National Park and its environs from above",
      "Limited to 8 travelers, you'll get an intimate East Zion experience",
    ]);
    expect(extracted.diagnostics.highlightsFieldPath).toBe(
      "product.highlights"
    );
    expect(extracted.diagnostics.highlightClassificationReason).toContain(
      "product.highlights kept as selling-point bullets"
    );
    expect(extracted.extracted.highlights).not.toContain(
      "Not wheelchair accessible"
    );

    expect(extracted.extracted.itinerary).toEqual([
      {
        title: "Zion National Park",
        description: "Admission Ticket Free",
        duration: "30 minutes",
      },
    ]);
    expect(extracted.diagnostics.itineraryFieldPath).toBe(
      "product.itineraryItems"
    );
    expect(extracted.diagnostics.itineraryItemCount).toBe(1);
    expect(extracted.diagnostics.itinerarySourceUsed).toBe(
      "product.itineraryItems"
    );

    expect(extracted.extracted.faqs).toEqual([
      {
        question: "Is this tour good for families?",
        answer:
          "Yes. The reasonably groomed trails make it approachable for families with small kids.",
      },
    ]);
    expect(extracted.diagnostics.faqsFieldPath).toBe("product.qAndA.items");
    expect(extracted.diagnostics.faqFieldPath).toBe("product.qAndA.items");
    expect(extracted.diagnostics.faqCount).toBe(1);
    expect(extracted.diagnostics.faqSourceUsed).toBe("product.qAndA.items");

    expect(extracted.extracted.requirements).toEqual([
      "Confirmation will be received at time of booking",
      "Not wheelchair accessible",
      "Not recommended for travelers with back problems",
      "Not recommended for pregnant travelers",
      "No heart problems or other serious medical conditions",
      "Most travelers can participate",
      "This tour/activity will have a maximum of 8 travelers",
    ]);
    expect(extracted.diagnostics.requirementsFieldPath).toBe(
      "product.additionalInfo"
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
    commercialPriceFieldPath: "product.priceFrom",
    commercialPriceRawValue: "$105.09",
    priceSourceUsed: "live-price" as const,
    heroImageFieldPath: "product.images[0].variants[1].url",
    heroVariantFieldPath: "product.images[0].variants[1]",
    selectedHeroWidth: 674,
    selectedHeroHeight: 446,
    imageSourceUsed: "live-product-image" as const,
    ratingFieldPath: "product.reviews.combinedAverageRating",
    reviewCountFieldPath: "product.reviews.totalReviews",
    overviewFieldPath: "product.description.text",
    highlightsFieldPath: "product.highlights",
    highlightClassificationReason:
      "product.highlights kept as selling-point bullets; product.additionalInfo routed to requirements",
    itineraryFieldPath: "product.itineraryItems",
    itineraryItemCount: 1,
    itinerarySourceUsed: "product.itineraryItems",
    meetingPointFieldPath: "product.logistics.start.description",
    faqsFieldPath: "product.qAndA.items",
    faqFieldPath: "product.qAndA.items",
    faqCount: 1,
    faqSourceUsed: "product.qAndA.items",
    requirementsFieldPath: "product.additionalInfo",
    classificationFieldPath: "inferred:title+overview+highlights",
  },
  rawProductCode: "163873P16",
  rawProduct: {
    title: "East Zion Top of the World Jeep Tour",
  },
  extracted: {
    title: "East Zion Top of the World Jeep Tour",
    seoTitle: "East Zion Top of the World Jeep Tour in Springdale",
    seoDescription: "Best tour in Springdale. Rated 5/5. 154 reviews.",
    city: "Springdale",
    state: "Utah",
    heroImageUrl: "https://img.test/specimen-root-hero-large.jpg",
    cardImageUrl: "https://img.test/specimen-root-hero-large.jpg",
    priceAmount: 105.09,
    priceFormatted: "From $105",
    aggregateRating: 5,
    reviewCount: 154,
    meetingPointText: "Meet us at Zion Mountain Ranch!",
    overviewText:
      "Grab bird’s-eye views of Zion National Park on this Jeep tour. After meeting up with your guide, you’ll spend the next 1.5 hours climbing up, up, up the mountains—all on private land—to incredible views of the Coral Pink Sand Dunes, Cedar Mountain, and beyond.",
    highlights: [
      "Easy meetup at at Zion Ponderosa Ranch Resort",
      "Your local guide adds valuable insight on the area's geology, flora, fauna, and more",
      "See Zion National Park and its environs from above",
      "Limited to 8 travelers, you'll get an intimate East Zion experience",
    ],
    itinerary: [
      {
        title: "Zion National Park",
        description: "Admission Ticket Free",
        duration: "30 minutes",
      },
    ],
    faqs: [
      {
        question: "Is this tour good for families?",
        answer:
          "Yes. The reasonably groomed trails make it approachable for families with small kids.",
      },
    ],
    requirements: [
      "Confirmation will be received at time of booking",
      "Not wheelchair accessible",
    ],
    primaryCategory: "off-road-tour",
    categories: ["off-road-tour"],
  },
};

describe("engine6 mapping/cards/page", () => {
  it("renders the enforced 163873P16 sections instead of fallback content", () => {
    const tour = mapViatorToEngine6Tour(specimenApiPayload);

    const card = toEngine6Card(tour);
    const surfaces = buildEngine6CardSurfaces(tour);
    const html = renderToString(<Engine6TourPage tour={tour} />);

    expect(tour.productCode).toBe("163873P16");
    expect(tour.priceFormatted).toBe("From $105");
    expect(tour.bookingUrl).toContain("163873P16");
    expect(tour.bookingUrl).toContain("pid=P00290915");
    expect(tour.bookingUrl).toContain("mcid=42383");
    expect(tour.bookingUrl).toContain("medium=link");
    expect(card.title).toContain("East Zion");
    expect(surfaces.city[0].priceLabel).toBe("From $105");
    expect(tour.primaryCategory).toBe("off-road-tour");
    expect(html).toContain("Off Road Tour");
    expect(html).toContain("Important info");
    expect(html).toContain("Not wheelchair accessible");
    expect(html).toContain("FAQs");
    expect(html).toContain("Is this tour good for families?");
    expect(html).not.toContain("Check latest price");
    expect(ENGINE6_SPECIMEN_ROUTE).toBe(
      "/destinations/utah/springdale/tours/east-zion-top-of-the-world-jeep-tour"
    );
  });

  it("surfaces the exact enforced field paths in specimen diagnostics", () => {
    const apiUrl = buildEngine6SpecimenApiUrl("163873P16");
    const resolved = resolveEngine6SpecimenResponse({
      payload: specimenApiPayload,
      httpStatus: 200,
      productCode: "163873P16",
      apiUrl,
    });

    expect(resolved.error).toBeNull();
    expect(resolved.debug.requestedApiUrl).toBe(apiUrl);
    expect(resolved.debug.selectedHeroWidth).toBe(674);
    expect(resolved.debug.selectedHeroHeight).toBe(446);
    expect(resolved.debug.imageSourceUsed).toBe("live-product-image");
    expect(resolved.debug.commercialPriceRawValue).toBe("$105.09");
    expect(resolved.debug.priceSourceUsed).toBe("live-price");
    expect(resolved.debug.overviewFieldPath).toBe("product.description.text");
    expect(resolved.debug.highlightsFieldPath).toBe("product.highlights");
    expect(resolved.debug.itineraryFieldPath).toBe("product.itineraryItems");
    expect(resolved.debug.itineraryItemCount).toBe(1);
    expect(resolved.debug.itinerarySourceUsed).toBe("product.itineraryItems");
    expect(resolved.debug.faqsFieldPath).toBe("product.qAndA.items");
    expect(resolved.debug.faqCount).toBe(1);
    expect(resolved.debug.faqSourceUsed).toBe("product.qAndA.items");
    expect(resolved.debug.requirementsFieldPath).toBe("product.additionalInfo");
    expect(resolved.debug.highlightClassificationReason).toContain(
      "product.highlights kept as selling-point bullets"
    );
    expect(resolved.debug.primaryCategory).toBe("off-road-tour");
    expect(resolved.debug.failureReason).toBeNull();
  });

  it("still renders cleanly when optional sections beyond the enforced core are missing", () => {
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
          requirements: [],
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
    expect(html).not.toContain("Important info");
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
