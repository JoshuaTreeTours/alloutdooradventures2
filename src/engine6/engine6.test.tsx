import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import { ENGINE6_APPROVED_PLACEHOLDER_IMAGE } from "../../api/engine6/heroResolver";
import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import TourCard from "../components/TourCard";
import {
  getCityTourDetailPath,
  getToursByCity,
  getToursByCityUnified,
  getToursByState,
} from "../data/tours";
import Engine6TourPage from "./components/Engine6TourPage";
import ToursLanding from "../pages/tours/ToursLanding";
import CityToursIndexRoute from "../pages/destinations/states/tours/CityToursIndexRoute";
import { buildEngine6ViatorBookingUrl } from "./buildEngine6ViatorBookingUrl";
import { normalizeEngine6AggregateRating } from "./rating";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { buildEngine6MetaDescription, buildMetaDescription } from "./seo";
import { buildEngine6CardSurfaces, toEngine6Card } from "./cards";
import { ENGINE6_63657P1_CARD_IMAGE_URL, engine6SpecimenTour } from "./listing";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import { engine6ResolvedTours } from "./registry";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";
import {
  ENGINE6_ANTELOPE_ROUTE,
  ENGINE6_CATALINA_ROUTE,
  ENGINE6_EMERALD_CAVE_ROUTE,
  ENGINE6_ANCHORAGE_PRIVATE_ROUTE,
  ENGINE6_ANCHORAGE_SUNSET_ROUTE,
  ENGINE6_ANCHORAGE_GREENBELT_ROUTE,
  ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE,
  ENGINE6_NYC_PEDICAB_ROUTE,
  ENGINE6_PARAGON_ROUTE,
  ENGINE6_SPECIMEN_ROUTE,
  ENGINE6_YOSEMITE_ROUTE,
  ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS,
} from "./routes";
import {
  buildEngine6SpecimenApiUrl,
  resolveEngine6SpecimenResponse,
  shouldShowEngine6Diagnostics,
} from "../pages/engine6/Engine6SpecimenRoute";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const specimenProductPayload = {
  product: {
    productCode: "63657P1",
    productUrl:
      "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
    title: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
    description: {
      text: "<p>Ride through the towns and vineyards of the Santa Ynez Valley wine region on this e-bike tour with transport from Santa Barbara. With a guide, you'll pedal a Rad Power E-bike to wineries, a lavendar farm, the town of Solvang, and other spots for wine and olive-oil tastings and lunch.</p>",
    },
    highlights: [
      "Bike and helmet provided for this tour through the Santa Ynez Valley wine region",
      "Stop for wine and olive-oil tastings and learn about lavendar oil production",
      "Enjoy a picnic lunch at a winery without packing food",
      "Hotel pickup and drop-off for transport to the riding location",
    ],
    additionalInfo: [
      "Confirmation will be received at time of booking",
      "Not wheelchair accessible",
      "A minimum of 2 people per booking is required",
      "Travelers should have a moderate physical fitness level",
      "This tour/activity will have a maximum of 8 travelers",
    ],
    location: { city: "Santa Barbara", state: "California" },
    priceFrom: "$199.00",
    media: {
      images: [
        {
          isCover: true,
          variants: {
            FULL: {
              url: ENGINE6_63657P1_CARD_IMAGE_URL,
              width: 674,
              height: 446,
            },
          },
        },
      ],
    },
    reviews: { combinedAverageRating: 4.9, totalReviews: 177 },
    logistics: {
      start: {
        description:
          "3850 State St, Santa Barbara, CA 93105, USA. Peppertree Inn with free parking.",
      },
    },
    itineraryItems: [
      {
        title: "I Bike Santa Barbara Wine Tours",
        description: "Admission Ticket Included",
        duration: "40 minutes",
      },
      {
        title: "Solvang",
        description: "Admission Ticket Free",
        duration: "20 minutes",
      },
    ],
  },
};

const ENGINE6_60136P1_EXPECTED_HERO_URL =
  "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/0b/eb/d1/48.jpg";

const ENGINE6_36001P1_EXPECTED_HERO_URL =
  "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/07/31/dd/5f.jpg";

const countStructuredSourceStops = (
  rawPayload: Record<string, unknown>
): number => {
  const payload = rawPayload as Record<string, unknown>;
  const itineraryItems = Array.isArray(payload.itineraryItems)
    ? (payload.itineraryItems as unknown[])
    : Array.isArray(
          (payload.itinerary as Record<string, unknown> | undefined)
            ?.itineraryItems
        )
      ? ((payload.itinerary as Record<string, unknown>)
          .itineraryItems as unknown[])
      : [];

  return itineraryItems.filter(item => {
    if (!item || typeof item !== "object") {
      return false;
    }
    const row = item as Record<string, unknown>;
    return typeof row.title === "string" || typeof row.name === "string";
  }).length;
};

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
    commercialPriceRawValue: "$199.00",
    priceSourceUsed: "live-price" as const,
    heroImageFieldPath: "product.media.images[0].variants.FULL.url",
    heroVariantFieldPath: "product.media.images[0].variants.FULL",
    selectedHeroWidth: 674,
    selectedHeroHeight: 446,
    imageSourceUsed: "api-primary" as const,
    heroSourceType: "api-primary" as const,
    finalHeroUrl: ENGINE6_63657P1_CARD_IMAGE_URL,
    heroFallbackTriggered: false,
    rejectedForeignHeroCandidates: [],
    productUrlFieldPath: "product.productUrl",
    bookingUrlSource: "product.productUrl",
    ratingFieldPath: "product.reviews.combinedAverageRating",
    reviewCountFieldPath: "product.reviews.totalReviews",
    overviewFieldPath: "product.description.text",
    highlightsFieldPath: "product.highlights",
    highlightClassificationReason:
      "selected product.highlights as highlight content",
    itineraryFieldPath: "product.itineraryItems",
    itineraryItemCount: 2,
    itinerarySourceUsed: "product.itineraryItems",
    meetingPointFieldPath: "product.logistics.start.description",
    faqsFieldPath: "merged:product.additionalInfo",
    faqFieldPath: "merged:product.additionalInfo",
    faqCount: 3,
    faqSourceUsed: "merged:product.additionalInfo",
    requirementsFieldPath: "product.additionalInfo",
    classificationFieldPath: "inferred:title+overview+highlights",
    fieldLevelFallbackUsed: false,
    fallbackFieldNames: [],
  },
  rawProductCode: "63657P1",
  rawProduct: {
    title: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
  },
  extracted: {
    title: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
    seoTitle:
      "Santa Barbara Vineyard to Table Taste Tour by E-Bike in Santa Barbara",
    seoDescription:
      "Ride through the towns and vineyards of the Santa Ynez Valley wine region on this e-bike tour with transport from Santa Barbara.",
    city: "Santa Barbara",
    state: "California",
    heroImageUrl: ENGINE6_63657P1_CARD_IMAGE_URL,
    productUrl:
      "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
    priceAmount: 199,
    priceFormatted: "From $199",
    aggregateRating: 4.9,
    reviewCount: 177,
    meetingPointText:
      "3850 State St, Santa Barbara, CA 93105, USA. Peppertree Inn with free parking.",
    overviewText:
      "Ride through the towns and vineyards of the Santa Ynez Valley wine region on this e-bike tour with transport from Santa Barbara. With a guide, you'll pedal a Rad Power E-bike to wineries, a lavendar farm, the town of Solvang, and other spots for wine and olive-oil tastings and lunch.",
    highlights: [
      "Bike and helmet provided for this tour through the Santa Ynez Valley wine region",
      "Stop for wine and olive-oil tastings and learn about lavendar oil production",
      "Enjoy a picnic lunch at a winery without packing food",
      "Hotel pickup and drop-off for transport to the riding location",
    ],
    itinerary: [
      {
        title: "I Bike Santa Barbara Wine Tours",
        description: "Admission Ticket Included",
        duration: "40 minutes",
      },
      {
        title: "Solvang",
        description: "Admission Ticket Free",
        duration: "20 minutes",
      },
    ],
    faqs: [
      {
        question: "Is this tour wheelchair accessible?",
        answer: "No. This tour is not wheelchair accessible.",
      },
      {
        question: "Do I need a minimum group size?",
        answer: "Yes. A minimum of 2 people per booking is required.",
      },
      {
        question: "What fitness level should travelers expect?",
        answer:
          "Travelers should have a moderate physical fitness level, and the tour will have a maximum of 8 travelers.",
      },
    ],
    requirements: [
      "Confirmation will be received at time of booking",
      "Not wheelchair accessible",
      "A minimum of 2 people per booking is required",
      "Travelers should have a moderate physical fitness level",
      "This tour/activity will have a maximum of 8 travelers",
    ],
    primaryCategory: "bike-tour",
    categories: ["bike-tour"],
  },
};

describe("engine6 extractor", () => {
  it("resolves a product-scoped API primary hero for the specimen tour", () => {
    const extracted = extractEngine6Product(specimenProductPayload);

    expect(extracted.extracted.heroImageUrl).toBe(
      ENGINE6_63657P1_CARD_IMAGE_URL
    );
    expect(extracted.diagnostics.heroImageFieldPath).toBe(
      "product.media.images[0].variants.FULL.url"
    );
    expect(extracted.diagnostics.heroVariantFieldPath).toBe(
      "product.media.images[0].variants.FULL"
    );
    expect(extracted.diagnostics.selectedHeroWidth).toBe(674);
    expect(extracted.diagnostics.selectedHeroHeight).toBe(446);
    expect(extracted.diagnostics.imageSourceUsed).toBe("api-primary");
    expect(extracted.diagnostics.heroSourceType).toBe("api-primary");
    expect(extracted.diagnostics.finalHeroUrl).toBe(
      ENGINE6_63657P1_CARD_IMAGE_URL
    );
    expect(extracted.diagnostics.heroFallbackTriggered).toBe(false);
    expect(extracted.diagnostics.rejectedForeignHeroCandidates).toEqual([]);
    expect(extracted.extracted.priceAmount).toBe(199);
    expect(extracted.extracted.priceFormatted).toBe("From $199");
    expect(extracted.diagnostics.commercialPriceFieldPath).toBe(
      "product.priceFrom"
    );
    expect(extracted.extracted.requirements).toContain(
      "A minimum of 2 people per booking is required"
    );
  });

  it("never uses /hero.jpg and falls back to the approved placeholder when API hero candidates are invalid", () => {
    const extracted = extractEngine6Product({
      product: {
        productCode: "STATIC1",
        productUrl:
          "https://www.viator.com/tours/Santa-Barbara/Static-Hero/d4372-STATIC1",
        title: "Static Hero Tour",
        description: { text: "Description" },
        location: { city: "Santa Barbara", state: "California" },
        priceFrom: "$10.00",
        imageUrl: "https://www.alloutdooradventures.com/hero.jpg",
      },
    });

    expect(extracted.extracted.heroImageUrl).toBe(
      ENGINE6_APPROVED_PLACEHOLDER_IMAGE
    );
    expect(extracted.extracted.heroImageUrl).not.toContain("/hero.jpg");
    expect(extracted.diagnostics.heroSourceType).toBe("approved-placeholder");
    expect(extracted.diagnostics.heroFallbackTriggered).toBe(true);
    expect(extracted.diagnostics.rejectedForeignHeroCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "https://www.alloutdooradventures.com/hero.jpg",
          reason: "static-hero-disallowed",
        }),
      ])
    );
  });

  it("uses the approved placeholder only when product API imagery is absent", () => {
    const extracted = extractEngine6Product({
      product: {
        productCode: "NOPHOTO1",
        productUrl:
          "https://www.viator.com/tours/Santa-Barbara/No-Photo/d4372-NOPHOTO1",
        title: "No Photo Tour",
        description: { text: "Description" },
        location: { city: "Santa Barbara", state: "California" },
        priceFrom: "$49.00",
      },
    });

    expect(extracted.extracted.heroImageUrl).toBe(
      ENGINE6_APPROVED_PLACEHOLDER_IMAGE
    );
    expect(extracted.diagnostics.heroSourceType).toBe("approved-placeholder");
    expect(extracted.diagnostics.heroFallbackTriggered).toBe(true);
    expect(extracted.diagnostics.rejectedForeignHeroCandidates).toEqual([]);
  });
});

describe("engine6 meta descriptions", () => {
  it("clamps long descriptions at a word boundary with an ellipsis", () => {
    const metaDescription = buildEngine6MetaDescription(
      "Ride through the towns and vineyards of the Santa Ynez Valley wine region on this e-bike tour with transport from Santa Barbara, wine tastings, picnic lunch, and countryside views for adventurous food-loving cyclists."
    );

    expect(metaDescription.endsWith("...")).toBe(true);
  });

  it("strips HTML before safely truncating at a word boundary", () => {
    const metaDescription = buildMetaDescription(
      "<p>Ride through the towns and vineyards of the Santa Ynez Valley wine region on this e-bike tour with transport from Santa Barbara and a guide-led tasting itinerary.</p>"
    );

    expect(metaDescription).not.toContain("<p>");
    expect(metaDescription.length).toBeLessThanOrEqual(160);
  });
});

describe("engine6 Viator booking URLs", () => {
  it("uses the canonical Santa Barbara Viator detail URL when no preferred product URL is available", () => {
    expect(buildEngine6ViatorBookingUrl("63657P1")).toBe(
      "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1?pid=P00290915&mcid=42383&medium=link"
    );
  });

  it("uses the canonical Anchorage product URL for 411138P3 with affiliate params", () => {
    expect(buildEngine6ViatorBookingUrl("411138P3", null)).toBe(
      "https://www.viator.com/tours/Anchorage/Private-Anchorage-Tour-and-Wilderness-Adventure/d4152-411138P3?pid=P00290915&mcid=42383&medium=link"
    );
  });
});

describe("engine6 aggregate rating normalization", () => {
  it("rounds valid ratings to one decimal place and safely ignores invalid inputs", () => {
    expect(normalizeEngine6AggregateRating(4.94)).toBe(4.9);
    expect(normalizeEngine6AggregateRating(4.666)).toBe(4.7);
    expect(normalizeEngine6AggregateRating(null)).toBeNull();
    expect(normalizeEngine6AggregateRating(undefined)).toBeNull();
  });
});

describe("engine6 mapping/cards/page", () => {
  it("renders the clean Santa Barbara specimen with the API-scoped hero", () => {
    const tour = mapViatorToEngine6Tour(specimenApiPayload);

    const card = toEngine6Card(tour);
    const surfaces = buildEngine6CardSurfaces(tour);
    const html = renderToString(<Engine6TourPage tour={tour} />);

    expect(tour.productCode).toBe("63657P1");
    expect(tour.priceFormatted).toBe("Starting at $199");
    expect(tour.bookingUrl).toBe(
      "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1?pid=P00290915&mcid=42383&medium=link"
    );
    expect(card.title).toContain("Santa Barbara Vineyard");
    expect(surfaces.city[0].priceLabel).toBe("Starting at $199");
    expect(tour.primaryCategory).toBe("bike-tour");
    expect(tour.categoryLabel).toBe("Bike Tour");
    expect(tour.metaDescription.length).toBeLessThanOrEqual(160);
    expect(tour.canonicalPath).toBe(ENGINE6_SPECIMEN_ROUTE);
    expect(html).toContain(`src="${ENGINE6_63657P1_CARD_IMAGE_URL}"`);
    expect(html).toContain('data-testid="engine6-hero-banner"');
    expect(html).toContain('data-testid="engine6-breadcrumbs"');
    expect(html).toContain('data-testid="engine6-tours-activities-label"');
    expect(html).toContain("Santa Barbara Tours &amp; Activities");
    expect(html).toContain('href="/destinations"');
    expect(html).toContain('href="/destinations/california"');
    expect(html).toContain(
      'href="/destinations/california/santa-barbara/tours"'
    );
    expect(html).toContain('aria-label="Santa Barbara Tours &amp; Activities"');
    const heroIndex = html.indexOf('data-testid="engine6-hero-banner"');
    const breadcrumbIndex = html.indexOf('data-testid="engine6-breadcrumbs"');
    const h1Index = html.indexOf("<h1");
    expect(heroIndex).toBeGreaterThan(-1);
    expect(breadcrumbIndex).toBeGreaterThan(heroIndex);
    expect(h1Index).toBeGreaterThan(breadcrumbIndex);
    expect(html).not.toContain("/hero.jpg");
    expect(html).toContain(
      "Santa Barbara Vineyard to Table Taste Tour by E-Bike"
    );
    expect(html).toContain("Bike Tour");
    expect(html).toContain('data-testid="engine6-bottom-cta"');
  });

  it("surfaces hero guardrail debug fields in specimen diagnostics", () => {
    const apiUrl = buildEngine6SpecimenApiUrl("63657P1");
    const resolved = resolveEngine6SpecimenResponse({
      payload: specimenApiPayload,
      httpStatus: 200,
      productCode: "63657P1",
      apiUrl,
    });

    expect(resolved.error).toBeNull();
    expect(resolved.debug.requestedProductCode).toBe("63657P1");
    expect(resolved.debug.sourceProductUrl).toBe(
      specimenApiPayload.extracted.productUrl
    );
    expect(resolved.debug.finalHeroUrl).toBe(ENGINE6_63657P1_CARD_IMAGE_URL);
    expect(resolved.debug.heroSourceType).toBe("api-primary");
    expect(resolved.debug.fallbackTriggered).toBe(false);
    expect(resolved.debug.rejectedForeignHeroCandidates).toEqual([]);
  });

  it("keeps rendering without an image when no valid product-owned hero exists", () => {
    const resolved = resolveEngine6SpecimenResponse({
      payload: {
        ...specimenApiPayload,
        diagnostics: {
          ...specimenApiPayload.diagnostics,
          imageSourceUsed: "approved-placeholder",
          heroSourceType: "approved-placeholder",
          finalHeroUrl: ENGINE6_APPROVED_PLACEHOLDER_IMAGE,
          heroFallbackTriggered: true,
        },
        extracted: {
          ...specimenApiPayload.extracted,
          heroImageUrl: ENGINE6_APPROVED_PLACEHOLDER_IMAGE,
        },
      },
      httpStatus: 200,
      productCode: "63657P1",
      apiUrl: buildEngine6SpecimenApiUrl("63657P1"),
    });

    const html = renderToString(<Engine6TourPage tour={resolved.tour!} />);

    expect(resolved.tour?.resolvedImageUrl).toBeNull();
    expect(html).not.toContain("/hero.jpg");
    expect(html).not.toContain("/images/hiking-hero.jpg");
  });
});

describe("engine6 seo/schema", () => {
  it("builds a schema graph anchored to the specimen canonical path with local/merchant constraints", () => {
    const tour = mapViatorToEngine6Tour(specimenApiPayload);
    const schema = buildEngine6SchemaGraph(tour);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const trip = graph.find(node => node["@type"] === "TouristTrip");
    const product = graph.find(node => node["@type"] === "Product");
    const offer = graph.find(node => node["@type"] === "Offer");
    const webpage = graph.find(node => node["@type"] === "WebPage");

    const breadcrumb = graph.find(node => node["@type"] === "BreadcrumbList");

    expect(trip).toMatchObject({
      name: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
      image: ENGINE6_63657P1_CARD_IMAGE_URL,
      url: `https://www.alloutdooradventures.com${ENGINE6_SPECIMEN_ROUTE}`,
      touristDestination: {
        "@id": `https://www.alloutdooradventures.com${ENGINE6_SPECIMEN_ROUTE}#destination`,
      },
    });
    expect(breadcrumb).toMatchObject({
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Destinations",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "California",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Santa Barbara",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
        },
      ],
    });
    expect(product).toMatchObject({
      name: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
      image: ENGINE6_63657P1_CARD_IMAGE_URL,
      category: "Bike Tour",
      url: `https://www.alloutdooradventures.com${ENGINE6_SPECIMEN_ROUTE}`,
    });
    expect(webpage).toMatchObject({
      name: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
      mainEntity: {
        "@id": `https://www.alloutdooradventures.com${ENGINE6_SPECIMEN_ROUTE}#trip`,
      },
    });
    expect(offer).toMatchObject({
      url: tour.bookingUrl,
      price: 199,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    });
    expect(
      String((offer as { priceValidUntil?: string }).priceValidUntil)
    ).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("engine6 diagnostics visibility", () => {
  it("keeps diagnostics hidden by default and allows an explicit debug query", () => {
    expect(shouldShowEngine6Diagnostics("")).toBe(false);
    expect(shouldShowEngine6Diagnostics("?engine6Debug=1")).toBe(true);
  });
});

describe("engine6 listing surfaces", () => {
  const getRelatedToursForSpecimen = (productCode: string) => {
    const tour = engine6ResolvedTours.find(
      entry => entry.productCode === productCode
    );
    expect(tour).toBeDefined();

    const [, stateSlug = "", citySlug = "", currentSlug = ""] =
      /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(
        tour!.canonicalPath
      ) ?? [];
    const relatedTours = getToursByCityUnified(stateSlug, citySlug).filter(
      entry => {
        const matchesProductCode =
          Boolean(tour!.productCode) &&
          Boolean(entry.tour.productCode) &&
          entry.tour.productCode?.toUpperCase() ===
            tour!.productCode.toUpperCase();
        const matchesSlug = entry.tour.slug === currentSlug;
        return !matchesProductCode && !matchesSlug;
      }
    );

    return {
      tour: tour!,
      relatedTours,
    };
  };

  it("adds 63657P1 to California and Santa Barbara listing sources", () => {
    const californiaTours = getToursByState("california");
    const santaBarbaraTours = getToursByCity("california", "santa-barbara");
    expect(californiaTours.some(tour => tour.productCode === "63657P1")).toBe(
      true
    );
    expect(santaBarbaraTours.some(tour => tour.productCode === "63657P1")).toBe(
      true
    );
  });

  it("adds 5119P13 to Nevada and Las Vegas listing sources", () => {
    const nevadaTours = getToursByState("nevada");
    const lasVegasTours = getToursByCity("nevada", "las-vegas");
    expect(nevadaTours.some(tour => tour.productCode === "5119P13")).toBe(true);
    expect(lasVegasTours.some(tour => tour.productCode === "5119P13")).toBe(
      true
    );
  });

  it("adds 32779P2 to California and Avalon listing sources (not Los Angeles listing)", () => {
    const californiaTours = getToursByState("california");
    const avalonTours = getToursByCity("california", "avalon");
    const losAngelesTours = getToursByCity("california", "los-angeles");
    expect(californiaTours.some(tour => tour.productCode === "32779P2")).toBe(
      true
    );
    expect(avalonTours.some(tour => tour.productCode === "32779P2")).toBe(true);
    expect(losAngelesTours.some(tour => tour.productCode === "32779P2")).toBe(
      false
    );
  });

  it("extracts and renders itinerary + faq content generically for the Las Vegas Engine6 tour", () => {
    const vegasTour = engine6ResolvedTours.find(
      tour => tour.productCode === "5119P13"
    );
    expect(vegasTour).toBeDefined();
    expect(vegasTour?.itinerary.length).toBe(4);
    expect(vegasTour?.faqs.length).toBe(2);
    expect(vegasTour?.included.length).toBe(4);
    expect(vegasTour?.requirements.length).toBe(4);

    const html = renderToString(<Engine6TourPage tour={vegasTour!} />);
    if ((vegasTour?.itinerary.length ?? 0) >= 2) {
      expect(html).toContain(">Itinerary<");
      expect(html).toContain('data-testid="engine6-itinerary-timeline"');
    } else if (vegasTour?.itinerarySummaryText) {
      expect(html).toContain(">Itinerary summary<");
      expect(html).toContain('data-testid="engine6-itinerary-summary-only"');
    } else {
      expect(html).not.toContain(">Itinerary<");
    }
    expect(html).toContain(">FAQs<");
    expect(html).toContain(">What’s included<");
    expect(html).toContain(">Additional info<");
    expect(html).toContain("Admission included");
    expect(html).toContain("Hoover Dam");
    expect(html).toContain("Grand Canyon West");
    expect(html).toContain("Eagle Point and Guano Point");
    expect(html).toContain("Colorado River Helicopter Landing");
    expect(html).toContain(
      "Is helicopter landing included in the standard tour option?"
    );
    expect(html).toContain("How long is the overall day from Las Vegas?");
    expect((html.match(/<details /g) ?? []).length).toBe(2);
  });

  it("renders itinerary, meeting point, included/additional info, and omits FAQs for 32779P2 when absent", () => {
    const catalinaTour = engine6ResolvedTours.find(
      tour => tour.productCode === "32779P2"
    );
    expect(catalinaTour).toBeDefined();
    expect(catalinaTour?.city).toBe("Avalon");
    expect(catalinaTour?.state).toBe("California");
    expect(catalinaTour?.itinerary.length).toBeGreaterThanOrEqual(0);
    expect(catalinaTour?.included.length).toBeGreaterThan(0);
    expect(catalinaTour?.requirements.length).toBeGreaterThan(0);
    expect(catalinaTour?.meetingPointText).toContain("Green Pleasure Pier");
    expect(catalinaTour?.faqs.length).toBe(0);

    const html = renderToString(<Engine6TourPage tour={catalinaTour!} />);
    if ((catalinaTour?.itinerary.length ?? 0) >= 2) {
      expect(html).toContain(">Itinerary<");
      expect(html).toContain('data-testid="engine6-itinerary-timeline"');
    } else if (catalinaTour?.itinerarySummaryText) {
      expect(html).toContain(">Itinerary summary<");
      expect(html).toContain('data-testid="engine6-itinerary-summary-only"');
    } else {
      expect(html).not.toContain(">Itinerary<");
    }
    expect(html).toContain(">What’s included<");
    expect(html).toContain(">Additional info<");
    expect(html).toContain("Meeting point:");
    expect(html).not.toContain(">FAQs<");
  });

  it("hides FAQ section gracefully when upstream FAQ data is absent", () => {
    expect(engine6SpecimenTour.faqs.length).toBe(0);
    const html = renderToString(<Engine6TourPage tour={engine6SpecimenTour} />);
    expect(html).not.toContain(">FAQs<");
  });

  it("automatically includes the Engine6 route in the city unified tours listing", () => {
    const unifiedTours = getToursByCityUnified("california", "santa-barbara");
    const engine6Entry = unifiedTours.find(
      entry =>
        entry.tour.engine === "engine6" && entry.tour.productCode === "63657P1"
    );

    expect(engine6Entry).toBeDefined();
    expect(engine6Entry?.href).toBe(ENGINE6_SPECIMEN_ROUTE);
    expect(engine6Entry?.tour.heroImage).toBe(ENGINE6_63657P1_CARD_IMAGE_URL);
    expect(engine6Entry?.tour.primaryImageUrl).toBe(
      ENGINE6_63657P1_CARD_IMAGE_URL
    );
    expect(engine6Entry?.tour.bookingUrl).toBe(
      "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1?pid=P00290915&mcid=42383&medium=link"
    );
  });

  it("exposes Engine6 entries to the /tours?state=...&city=... filtered datasource", () => {
    const unifiedTours = getToursByCityUnified("california", "santa-barbara");
    const engine6Entry = unifiedTours.find(
      entry =>
        entry.tour.engine === "engine6" && entry.tour.productCode === "63657P1"
    );

    expect(engine6Entry).toBeDefined();
    expect(engine6Entry?.href).toBe(ENGINE6_SPECIMEN_ROUTE);
    expect(engine6Entry?.tour.badges?.priceFrom).toBe("Starting at $199");
    expect(engine6Entry?.tour.badges?.rating).toBe(4.9);
    expect(engine6Entry?.tour.badges?.reviewCount).toBe(177);
  });

  it("renders the listing card with the resolved Engine6 image", () => {
    const listingTour = getToursByCity("california", "santa-barbara").find(
      tour => tour.productCode === "63657P1"
    );

    expect(listingTour?.primaryImageUrl).toBe(ENGINE6_63657P1_CARD_IMAGE_URL);
    expect(listingTour?.heroImage).toBe(ENGINE6_63657P1_CARD_IMAGE_URL);

    const html = renderToString(
      <TourCard
        tour={listingTour!}
        href={getCityTourDetailPath(listingTour!)}
      />
    );

    expect(html).toContain(`src="${ENGINE6_63657P1_CARD_IMAGE_URL}"`);
    expect(html).toContain("Santa Barbara, California");
    expect(html).toContain(
      "Santa Barbara Vineyard to Table Taste Tour by E-Bike"
    );
    expect(html).toContain("Bike Tour");
    expect(html).not.toContain("/hero.jpg");
  });

  it("routes and renders the 5119P13 listing card with detail-page hero parity", () => {
    const unifiedTours = getToursByCityUnified("nevada", "las-vegas");
    const engine6Entry = unifiedTours.find(
      entry => entry.tour.productCode === "5119P13"
    );

    expect(engine6Entry).toBeDefined();
    expect(engine6Entry?.href).toBe(ENGINE6_PARAGON_ROUTE);
    expect(engine6Entry?.tour.heroImage).toBe(
      engine6Entry?.tour.primaryImageUrl
    );
    expect(engine6Entry?.tour.badges?.priceFrom).toMatch(/^Starting at \$/);
    expect(engine6Entry?.tour.badges?.rating).toBeGreaterThan(4);
    expect(engine6Entry?.tour.badges?.reviewCount).toBeGreaterThan(100);
  });

  it("routes and renders 32779P2 in Avalon with detail-page hero parity", () => {
    const unifiedTours = getToursByCityUnified("california", "avalon");
    const engine6Entry = unifiedTours.find(
      entry => entry.tour.productCode === "32779P2"
    );

    expect(engine6Entry).toBeDefined();
    expect(engine6Entry?.href).toBe(ENGINE6_CATALINA_ROUTE);
    expect(engine6Entry?.tour.destination.city).toBe("Avalon");
    expect(engine6Entry?.tour.destination.state).toBe("California");
    expect(engine6Entry?.tour.heroImage).toBe(
      engine6Entry?.tour.primaryImageUrl
    );
    expect(engine6Entry?.tour.badges?.priceFrom).toBe("Starting at $53");
  });

  it("renders an Other Tours slider below bottom CTA with unified listing cards", () => {
    for (const productCode of ["63657P1", "5119P13", "32779P2"]) {
      const { tour, relatedTours } = getRelatedToursForSpecimen(productCode);
      expect(
        relatedTours.some(
          entry =>
            entry.tour.productCode?.toUpperCase() === productCode ||
            entry.tour.slug === tour.slug
        )
      ).toBe(false);

      const html = renderToString(<Engine6TourPage tour={tour} />);
      expect(html).toContain('data-testid="engine6-bottom-cta"');
      if (relatedTours.length >= 2) {
        expect(html).toContain(`Other Tours in ${tour.city}`);
        expect(html).toContain('data-testid="engine6-related-tours"');
        expect(
          html.indexOf('data-testid="engine6-related-tours"')
        ).toBeGreaterThan(html.indexOf('data-testid="engine6-bottom-cta"'));

        for (const related of relatedTours) {
          expect(html).toContain(related.href);
        }
      } else {
        expect(html).not.toContain('data-testid="engine6-related-tours"');
      }
    }
  });

  it("uses the exact same resolved hero for Vegas detail page, city listing card, and filtered tours card", () => {
    const vegasTour = engine6ResolvedTours.find(
      tour => tour.productCode === "5119P13"
    );
    const expectedHero = vegasTour?.heroImageUrl;
    expect(expectedHero).toContain("https://");

    const cityUnified = getToursByCityUnified("nevada", "las-vegas");
    const cityEntry = cityUnified.find(
      entry => entry.tour.productCode === "5119P13"
    );
    expect(cityEntry?.tour.heroImage).toBe(expectedHero);
    expect(cityEntry?.tour.primaryImageUrl).toBe(expectedHero);

    const previousWindow = (globalThis as { window?: Window }).window;
    const previousLocation = (
      globalThis as {
        location?: { pathname: string; search?: string };
      }
    ).location;
    (
      globalThis as {
        window?: {
          location: { pathname: string; search: string };
          history: { pushState: () => void };
        };
      }
    ).window = {
      location: {
        pathname: "/tours",
        search: "?state=nevada&city=las-vegas",
      },
      history: { pushState: () => {} },
    };
    (
      globalThis as { location?: { pathname: string; search: string } }
    ).location = {
      pathname: "/tours",
      search: "?state=nevada&city=las-vegas",
    };

    const filteredHtml = renderToString(<ToursLanding />);
    expect(filteredHtml).toContain(
      `src="${expectedHero?.replace(/&/g, "&amp;")}"`
    );
    expect(filteredHtml).toContain(
      `data-card-image-src="${expectedHero?.replace(/&/g, "&amp;")}"`
    );
    expect(filteredHtml).toContain(
      `data-hero-image-src="${expectedHero?.replace(/&/g, "&amp;")}"`
    );
    expect(filteredHtml.toLowerCase()).not.toContain("octopus");

    (globalThis as { window?: Window }).window = previousWindow;
    (
      globalThis as { location?: { pathname: string; search?: string } }
    ).location = previousLocation;
  });

  it("keeps Antelope hero parity across detail, city listing, and filtered tours without placeholder override", () => {
    const antelopeTour = engine6ResolvedTours.find(
      tour => tour.productCode === "60136P1"
    );
    expect(antelopeTour).toBeDefined();
    expect(antelopeTour?.heroImageUrl).toBe(ENGINE6_60136P1_EXPECTED_HERO_URL);

    const detailHtml = renderToString(<Engine6TourPage tour={antelopeTour!} />);
    const escapedHero = antelopeTour!.heroImageUrl.replace(/&/g, "&amp;");
    expect(detailHtml).toContain(`src="${escapedHero}"`);
    expect(antelopeTour!.heroImageUrl).not.toContain("/images/hiking-hero.jpg");

    const unified = getToursByCityUnified("nevada", "las-vegas");
    const entry = unified.find(tour => tour.tour.productCode === "60136P1");
    expect(entry).toBeDefined();
    expect(entry?.href).toBe(ENGINE6_ANTELOPE_ROUTE);
    expect(entry?.tour.heroImage).toBe(ENGINE6_60136P1_EXPECTED_HERO_URL);
    expect(entry?.tour.primaryImageUrl).toBe(ENGINE6_60136P1_EXPECTED_HERO_URL);

    const cardHtml = renderToString(
      <TourCard tour={entry!.tour} href={entry!.href} />
    );
    expect(cardHtml).toContain(`data-card-image-src="${escapedHero}"`);
    expect(cardHtml).toContain(`data-hero-image-src="${escapedHero}"`);
    expect(cardHtml).not.toContain("/images/hiking-hero.jpg");

    const previousWindow = (globalThis as { window?: Window }).window;
    const previousLocation = (
      globalThis as {
        location?: { pathname: string; search?: string };
      }
    ).location;
    (
      globalThis as {
        window?: {
          location: { pathname: string; search: string };
          history: { pushState: () => void };
        };
      }
    ).window = {
      location: { pathname: "/tours", search: "?state=nevada&city=las-vegas" },
      history: { pushState: () => {} },
    };
    (
      globalThis as { location?: { pathname: string; search: string } }
    ).location = {
      pathname: "/tours",
      search: "?state=nevada&city=las-vegas",
    };

    const filteredHtml = renderToString(<ToursLanding />);
    expect(filteredHtml).toContain(`data-card-image-src="${escapedHero}"`);
    expect(filteredHtml).toContain(`data-hero-image-src="${escapedHero}"`);
    expect(filteredHtml).toContain(
      ENGINE6_60136P1_EXPECTED_HERO_URL.replace(/&/g, "&amp;")
    );
    expect(filteredHtml).not.toContain("/images/hiking-hero.jpg");

    (globalThis as { window?: Window }).window = previousWindow;
    (
      globalThis as { location?: { pathname: string; search?: string } }
    ).location = previousLocation;
  });

  it("routes and renders 26719P8 in Las Vegas with itinerary, FAQs, and affiliate booking URL", () => {
    const emeraldTour = engine6ResolvedTours.find(
      tour => tour.productCode === "26719P8"
    );
    expect(emeraldTour).toBeDefined();
    expect(emeraldTour?.pagePath).toBe(ENGINE6_EMERALD_CAVE_ROUTE);
    expect(emeraldTour?.itinerary.length).toBeGreaterThan(0);
    expect(emeraldTour?.faqs.length).toBeGreaterThan(0);
    expect(emeraldTour?.included.length).toBeGreaterThan(0);
    expect(emeraldTour?.requirements.length).toBeGreaterThan(0);
    expect(emeraldTour?.bookingUrl).toBe(
      "https://www.viator.com/tours/Las-Vegas/Emerald-Cave-Kayaking-Tour/d684-26719P8?pid=P00290915&mcid=42383&medium=link"
    );

    const detailHtml = renderToString(<Engine6TourPage tour={emeraldTour!} />);
    const escapedHero = emeraldTour!.heroImageUrl.replace(/&/g, "&amp;");
    expect(detailHtml).toContain(">Itinerary<");
    expect(detailHtml).toContain(">FAQs<");
    expect(detailHtml).toContain(`src="${escapedHero}"`);

    const unified = getToursByCityUnified("nevada", "las-vegas");
    const entry = unified.find(item => item.tour.productCode === "26719P8");
    expect(entry).toBeDefined();
    expect(entry?.href).toBe(ENGINE6_EMERALD_CAVE_ROUTE);
    expect(entry?.tour.heroImage).toBe(emeraldTour?.heroImageUrl);
    expect(entry?.tour.primaryImageUrl).toBe(emeraldTour?.heroImageUrl);
    expect(entry?.tour.badges?.priceFrom).toBe("Starting at $109");
    expect(entry?.tour.badges?.rating).toBe(4.9);
    expect(entry?.tour.badges?.reviewCount).toBe(5060);
  });

  it("renders a non-empty Las Vegas city tours hero src (no alt-only fallback block)", () => {
    const html = renderToString(
      <CityToursIndexRoute
        params={{ stateSlug: "nevada", citySlug: "las-vegas" }}
      />
    );

    expect(html).toContain('alt="Las Vegas hero"');
    expect(html).toMatch(/<img[^>]+src="[^"]+"[^>]+alt="Las Vegas hero"/);
    expect(html).not.toContain('alt="Las Vegas hero" src=""');
    expect(html).not.toContain('src="undefined"');
  });

  it("regression: every Engine6 listing card image stays identical to its detail hero", () => {
    for (const tour of engine6ResolvedTours) {
      const card = toEngine6Card(tour);
      expect(card.imageUrl).toBe(tour.heroImageUrl);

      const [, stateSlug = "", citySlug = ""] =
        /^\/destinations\/([^/]+)\/([^/]+)\/tours\/[^/]+$/.exec(
          tour.pagePath
        ) ?? [];
      const unified = getToursByCityUnified(stateSlug, citySlug);
      const listingEntry = unified.find(
        entry =>
          entry.tour.engine === "engine6" &&
          entry.tour.productCode === tour.productCode
      );

      expect(listingEntry).toBeDefined();
      expect(listingEntry?.tour.heroImage).toBe(tour.heroImageUrl);
      expect(listingEntry?.tour.primaryImageUrl).toBe(tour.heroImageUrl);

      const listingHtml = renderToString(
        <TourCard tour={listingEntry!.tour} href={listingEntry!.href} />
      );
      const escapedHero = tour.heroImageUrl.replace(/&/g, "&amp;");
      expect(listingHtml).toContain(`src="${escapedHero}"`);
      expect(listingHtml).toContain(`data-card-image-src="${escapedHero}"`);
      expect(listingHtml).toContain(`data-hero-image-src="${escapedHero}"`);
    }
  });

  it("trace: specimen slug survives to the rendered card arrays and DOM for both listing pages", () => {
    const specimenSlug = "santa-barbara-vineyard-to-table-taste-tour-by-e-bike";
    const specimenTitle =
      "Santa Barbara Vineyard to Table Taste Tour by E-Bike";
    const slugFromPath = (path: string) =>
      path.split("/").filter(Boolean).pop();

    const registryIndex = engine6ResolvedTours.findIndex(
      tour => slugFromPath(tour.pagePath) === specimenSlug
    );
    // temporary trace output requested by review
    console.info("[engine6-trace] registry", {
      present: registryIndex > -1,
      index: registryIndex,
      total: engine6ResolvedTours.length,
      slug:
        registryIndex > -1
          ? slugFromPath(engine6ResolvedTours[registryIndex]!.pagePath)
          : null,
    });
    expect(registryIndex).toBeGreaterThan(-1);

    const unifiedTours = getToursByCityUnified("california", "santa-barbara");
    const unifiedIndex = unifiedTours.findIndex(
      entry => entry.tour.slug === specimenSlug
    );
    console.info("[engine6-trace] unified datasource", {
      present: unifiedIndex > -1,
      index: unifiedIndex,
      total: unifiedTours.length,
      href: unifiedIndex > -1 ? unifiedTours[unifiedIndex]!.href : null,
    });
    expect(unifiedIndex).toBeGreaterThan(-1);

    const cityListingHtml = renderToString(
      <TourCard
        tour={unifiedTours[unifiedIndex]!.tour}
        href={unifiedTours[unifiedIndex]!.href}
      />
    );
    console.info("[engine6-trace] city listing card DOM", {
      present: cityListingHtml.includes(specimenTitle),
      hrefPresent: cityListingHtml.includes(ENGINE6_SPECIMEN_ROUTE),
      totalCards: unifiedTours.length,
      index: unifiedIndex,
    });
    expect(cityListingHtml).toContain(specimenTitle);
    expect(cityListingHtml).toContain(ENGINE6_SPECIMEN_ROUTE);

    const previousWindow = (globalThis as { window?: Window }).window;
    const previousLocation = (
      globalThis as {
        location?: { pathname: string; search?: string };
      }
    ).location;
    (
      globalThis as {
        window?: {
          location: { pathname: string; search: string };
          history: { pushState: () => void };
        };
      }
    ).window = {
      location: {
        pathname: "/tours",
        search: "?state=california&city=santa-barbara",
      },
      history: { pushState: () => {} },
    };
    (
      globalThis as { location?: { pathname: string; search: string } }
    ).location = {
      pathname: "/tours",
      search: "?state=california&city=santa-barbara",
    };

    const filteredHtml = renderToString(<ToursLanding />);
    const filteredCardCount = (filteredHtml.match(/<article /g) ?? []).length;
    const filteredSlugIndex = filteredHtml.indexOf(ENGINE6_SPECIMEN_ROUTE);
    console.info("[engine6-trace] /tours filtered DOM", {
      present: filteredHtml.includes(specimenTitle),
      hrefPresent: filteredSlugIndex > -1,
      index: filteredSlugIndex,
      totalCards: filteredCardCount,
    });

    expect(filteredHtml).toContain(specimenTitle);
    expect(filteredHtml).toContain(ENGINE6_SPECIMEN_ROUTE);

    (globalThis as { window?: Window }).window = previousWindow;
    (
      globalThis as { location?: { pathname: string; search?: string } }
    ).location = previousLocation;
  });

  it("keeps the Engine6 specimen card helper aligned with the resolved hero image", () => {
    const card = toEngine6Card(engine6SpecimenTour);

    expect(card.imageUrl).toBe(ENGINE6_63657P1_CARD_IMAGE_URL);
    expect(card.locationLabel).toBe("Santa Barbara, California");
    expect(card.priceLabel).toBe("Starting at $199");
    expect(card.ratingLabel).toBe("4.9 (177)");
  });
});

describe("engine6 multi-tour contract", () => {
  it.each(engine6ResolvedTours)(
    "renders supported sections conditionally for %s",
    tour => {
      const html = renderToString(<Engine6TourPage tour={tour} />);
      const schema = buildEngine6SchemaGraph(tour);
      const graph = schema["@graph"] as Array<Record<string, unknown>>;
      const faqNode = graph.find(node => node["@type"] === "FAQPage");
      const offerNode = graph.find(node => node["@type"] === "Offer") as
        | Record<string, unknown>
        | undefined;
      const productNode = graph.find(node => node["@type"] === "Product") as
        | Record<string, unknown>
        | undefined;
      const tripNode = graph.find(node => node["@type"] === "TouristTrip") as
        | Record<string, unknown>
        | undefined;

      expect(tour.heroImageUrl).toContain("http");
      expect(tour.heroImageUrl).not.toContain("/hero.jpg");
      expect(html).toContain(
        `src="${tour.heroImageUrl.replace(/&/g, "&amp;")}"`
      );
      if (tour.bookingUrl.startsWith("/destinations/")) {
        expect(tour.bookingUrl).toContain("/book");
      } else {
        expect(tour.bookingUrl).toContain("pid=P00290915");
        expect(tour.bookingUrl).toContain("mcid=42383");
      }
      expect(html).toContain(tour.bookingUrl.replace(/&/g, "&amp;"));

      if (tour.overviewText) {
        expect(html).toContain(">Overview<");
      }
      if (tour.highlights.length > 0) {
        expect(html).toContain(">Highlights<");
      }
      if (tour.meetingPointText) {
        expect(html).toContain("Meeting point:");
      }
      if (tour.included.length > 0) {
        expect(html).toContain(">What’s included<");
      }
      if (tour.itinerary.length >= 2) {
        expect(html).toContain(">Itinerary<");
        expect(html).toContain('data-testid="engine6-itinerary-timeline"');
        expect(tripNode?.itinerary).toBeTruthy();
      } else if (tour.itinerarySummaryText) {
        expect(html).toContain(">Itinerary summary<");
        expect(html).toContain('data-testid="engine6-itinerary-summary-only"');
      }
      if (tour.requirements.length > 0) {
        expect(html).toContain(">Additional info<");
      }
      if (tour.faqs.length > 0) {
        expect(html).toContain(">FAQs<");
      }

      expect(Boolean(faqNode)).toBe(tour.faqs.length > 0);
      expect(productNode?.url).toBe(
        `https://www.alloutdooradventures.com${tour.canonicalPath}`
      );
      expect(offerNode?.url).toBe(tour.bookingUrl);
      expect(offerNode?.priceCurrency).toBe("USD");
      expect(offerNode?.price).toBe(tour.priceAmount ?? undefined);
      expect(productNode?.image).toBe(tour.heroImageUrl);
      expect(tripNode?.image).toBe(tour.heroImageUrl);
      if (tour.faqs.length > 0 && faqNode) {
        const mainEntity = (faqNode.mainEntity ?? []) as Array<{
          name?: string;
          acceptedAnswer?: { text?: string };
        }>;
        expect(mainEntity).toHaveLength(tour.faqs.length);
        expect(mainEntity.map(item => item.name)).toEqual(
          tour.faqs.map(item => item.question)
        );
      }
    }
  );
});

describe("engine6 specimen-specific coverage", () => {
  it("renders the Las Vegas paragon specimen with rich sections", () => {
    const vegasTour = engine6ResolvedTours.find(
      tour => tour.productCode === "5119P13"
    );
    expect(vegasTour).toBeDefined();

    const html = renderToString(<Engine6TourPage tour={vegasTour!} />);
    expect(html).toContain(">Overview<");
    expect(html).toContain(">Highlights<");
    expect(html).toContain("Meeting point:");
    expect(html).toContain(">What’s included<");
    expect(html).toContain(">Itinerary<");
    expect(html).toContain(">Additional info<");
    expect(html).toContain(">FAQs<");
    expect(html).toContain("Hoover Dam");
    expect(html).toContain("Grand Canyon West");
    expect(html).toContain(
      "Is helicopter landing included in the standard tour option?"
    );
    expect((html.match(/<details /g) ?? []).length).toBe(2);
  });
});

describe("engine6 image parity guardrails", () => {
  const parseStateCityFromCanonicalPath = (path: string) => {
    const [, stateSlug = "", citySlug = ""] =
      /^\/destinations\/([^/]+)\/([^/]+)\/tours\//.exec(path) ?? [];
    return { stateSlug, citySlug };
  };

  it.each(["63657P1", "5119P13", "32779P2", "60136P1", "411138P3", "414460P1"])(
    "keeps detail, city card, filtered card, and related slider engine6 cards aligned for %s",
    productCode => {
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      expect(tour).toBeDefined();
      const expectedHero = tour!.heroImageUrl;
      expect(expectedHero).toContain("https://");

      const detailHtml = renderToString(<Engine6TourPage tour={tour!} />);
      const escapedHero = expectedHero.replace(/&/g, "&amp;");
      expect(detailHtml).toContain(`src="${escapedHero}"`);
      expect(detailHtml).not.toContain("/images/hiking-hero.jpg");

      const { stateSlug, citySlug } = parseStateCityFromCanonicalPath(
        tour!.canonicalPath
      );
      const unified = getToursByCityUnified(stateSlug, citySlug);
      const cityEntry = unified.find(
        entry => entry.tour.productCode === productCode
      );
      expect(cityEntry).toBeDefined();
      expect(cityEntry?.tour.heroImage).toBe(expectedHero);
      expect(cityEntry?.tour.primaryImageUrl).toBe(expectedHero);

      const cityCardHtml = renderToString(
        <TourCard tour={cityEntry!.tour} href={cityEntry!.href} />
      );
      expect(cityCardHtml).toContain(`data-card-image-src="${escapedHero}"`);
      expect(cityCardHtml).toContain(`data-hero-image-src="${escapedHero}"`);
      expect(cityCardHtml).not.toContain("/images/hiking-hero.jpg");

      const previousWindow = (globalThis as { window?: Window }).window;
      const previousLocation = (
        globalThis as {
          location?: { pathname: string; search?: string };
        }
      ).location;
      (
        globalThis as {
          window?: {
            location: { pathname: string; search: string };
            history: { pushState: () => void };
          };
        }
      ).window = {
        location: {
          pathname: "/tours",
          search: `?state=${stateSlug}&city=${citySlug}`,
        },
        history: { pushState: () => {} },
      };
      (
        globalThis as { location?: { pathname: string; search: string } }
      ).location = {
        pathname: "/tours",
        search: `?state=${stateSlug}&city=${citySlug}`,
      };

      const filteredHtml = renderToString(<ToursLanding />);
      expect(filteredHtml).toContain(`data-card-image-src="${escapedHero}"`);
      expect(filteredHtml).toContain(`data-hero-image-src="${escapedHero}"`);

      (globalThis as { window?: Window }).window = previousWindow;
      (
        globalThis as { location?: { pathname: string; search?: string } }
      ).location = previousLocation;

      const relatedEngine6Entries = unified.filter(
        entry =>
          entry.tour.engine === "engine6" &&
          entry.tour.productCode !== productCode &&
          entry.tour.slug !== cityEntry?.tour.slug
      );

      if (relatedEngine6Entries.length > 0) {
        for (const related of relatedEngine6Entries) {
          const escapedRelatedHero = related.tour.heroImage.replace(
            /&/g,
            "&amp;"
          );
          expect(detailHtml).toContain(
            `data-card-image-src="${escapedRelatedHero}"`
          );
          expect(detailHtml).toContain(
            `data-hero-image-src="${escapedRelatedHero}"`
          );
        }
      }
    }
  );

  it("blocks legacy/alternate image fields from overriding Engine6 heroImage", () => {
    const tour = {
      id: "engine6-legacy-test",
      engine: "engine6",
      productCode: "LEGACY",
      slug: "legacy-image-override-test",
      title: "Legacy Override Test",
      destination: {
        country: "United States",
        state: "Nevada",
        stateSlug: "nevada",
        city: "Las Vegas",
        citySlug: "las-vegas",
      },
      resolvedImageUrl: "https://cdn.example.com/hero-canonical.jpg",
      heroImage: "https://cdn.example.com/hero-canonical.jpg",
      primaryImageUrl: "https://cdn.example.com/legacy-primary.jpg",
      galleryImages: ["https://cdn.example.com/gallery-first.jpg"],
      badges: {},
      activitySlugs: ["hiking"],
      bookingProvider: "viator",
      bookingUrl: "https://www.viator.com/search/LEGACY",
      longDescription: "Legacy override guardrail test",
    } as const;

    const html = renderToString(
      <TourCard
        tour={tour}
        href="/destinations/nevada/las-vegas/tours/legacy-image-override-test"
      />
    );
    expect(html).toContain(
      'data-card-image-src="https://cdn.example.com/hero-canonical.jpg"'
    );
    expect(html).toContain(
      'data-hero-image-src="https://cdn.example.com/hero-canonical.jpg"'
    );
    expect(html).not.toContain("legacy-primary.jpg");
    expect(html).not.toContain("gallery-first.jpg");
    expect(html).not.toContain("/images/hiking-hero.jpg");
  });

  it("renders no image when Engine6 resolvedImageUrl is absent", () => {
    const tour = {
      id: "engine6-placeholder-test",
      engine: "engine6",
      productCode: "NOPIC",
      slug: "engine6-placeholder-test",
      title: "Placeholder Fallback Test",
      destination: {
        country: "United States",
        state: "Nevada",
        stateSlug: "nevada",
        city: "Las Vegas",
        citySlug: "las-vegas",
      },
      heroImage: "",
      badges: {},
      activitySlugs: ["hiking"],
      bookingProvider: "viator",
      bookingUrl: "https://www.viator.com/search/NOPIC",
      longDescription: "Placeholder-only fallback test",
    } as const;

    const html = renderToString(
      <TourCard
        tour={tour}
        href="/destinations/nevada/las-vegas/tours/engine6-placeholder-test"
      />
    );
    expect(html).toContain('data-card-image-src=""');
  });

  it("regression: engine6 cards never emit blank or unusable image src", () => {
    const baseTour = {
      id: "engine6-invalid-image-test",
      engine: "engine6",
      productCode: "BADIMG",
      slug: "engine6-invalid-image-test",
      title: "Invalid Hero Guardrail",
      destination: {
        country: "United States",
        state: "Alaska",
        stateSlug: "alaska",
        city: "Anchorage",
        citySlug: "anchorage",
      },
      badges: {},
      activitySlugs: ["wildlife"],
      bookingProvider: "viator",
      bookingUrl: "https://www.viator.com/search/BADIMG",
      longDescription: "Card image guardrail test",
    } as const;

    for (const badHero of [
      "",
      "   ",
      "undefined",
      "about:blank",
      "javascript:void(0)",
    ]) {
      const html = renderToString(
        <TourCard
          tour={{ ...baseTour, heroImage: badHero }}
          href="/destinations/alaska/anchorage/tours/engine6-invalid-image-test"
        />
      );
      expect(html).toContain('data-card-image-src=""');
      expect(html).not.toContain('data-card-image-src="   "');
    }
  });
});

it("keeps Yosemite replacement hero parity across detail, city card, filtered card, and route wiring", () => {
  const yosemiteTour = engine6ResolvedTours.find(
    tour => tour.productCode === "36001P1"
  );
  expect(yosemiteTour).toBeDefined();
  expect(yosemiteTour?.heroImageUrl).toBe(ENGINE6_36001P1_EXPECTED_HERO_URL);
  expect(yosemiteTour?.canonicalPath).toBe(ENGINE6_YOSEMITE_ROUTE);

  const escapedHero = ENGINE6_36001P1_EXPECTED_HERO_URL.replace(/&/g, "&amp;");

  const detailHtml = renderToString(<Engine6TourPage tour={yosemiteTour!} />);
  expect(detailHtml).toContain(escapedHero);

  const cityUnified = getToursByCityUnified("california", "san-francisco");
  const cityEntry = cityUnified.find(
    entry =>
      entry.tour.engine === "engine6" && entry.tour.productCode === "36001P1"
  );
  expect(cityEntry).toBeDefined();
  const cityCardHtml = renderToString(
    <TourCard tour={cityEntry!.tour} href={cityEntry!.href} />
  );
  expect(cityCardHtml).toContain(`data-card-image-src="${escapedHero}"`);
  expect(cityCardHtml).toContain(`data-hero-image-src="${escapedHero}"`);

  const previousWindow = (globalThis as unknown as { window?: Window }).window;
  const nextWindow = {
    location: {
      pathname: "/tours",
      search: "?state=california&city=san-francisco",
    },
    history: {
      pushState: () => undefined,
    },
  } as unknown as Window;

  (globalThis as unknown as { window?: Window }).window = nextWindow;
  try {
    const filteredHtml = renderToString(<ToursLanding />);
    expect(filteredHtml).toContain(`data-card-image-src="${escapedHero}"`);
    expect(filteredHtml).toContain(`data-hero-image-src="${escapedHero}"`);
    expect(filteredHtml).toContain(ENGINE6_YOSEMITE_ROUTE);
  } finally {
    (globalThis as unknown as { window?: Window }).window = previousWindow;
  }

  expect(ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS.has(ENGINE6_YOSEMITE_ROUTE)).toBe(
    true
  );
});

describe("engine6 itinerary contract", () => {
  it("renders structured timeline when at least two itinerary stops are present", () => {
    const yosemite = engine6ResolvedTours.find(
      tour => tour.productCode === "36001P1"
    );
    expect(yosemite).toBeDefined();
    expect(yosemite?.itinerary.length).toBeGreaterThanOrEqual(6);

    const html = renderToString(<Engine6TourPage tour={yosemite!} />);
    expect(html).toContain('data-testid="engine6-itinerary-timeline"');
    expect(html).not.toContain('data-testid="engine6-itinerary-summary-only"');
    expect(html).toContain("Tunnel View");
    expect(html).toContain("Yosemite Valley");
    expect(html).toContain("Half Dome");
    expect(html).toContain("Yosemite Falls");
    expect(html).toContain("El Capitan");
    expect(html).toContain("Tuolumne Grove");
    expect(html).toContain("Bridalveil Fall");
  });

  it.each(["5119P13", "36001P1", "60136P1", "26719P8", "411138P3"])(
    "does not degrade structured itinerary rendering for %s when source has multiple stops",
    productCode => {
      const fixture = ENGINE6_VALIDATION_FIXTURES.find(
        entry => entry.productCode === productCode
      );
      const tour = engine6ResolvedTours.find(
        entry => entry.productCode === productCode
      );
      expect(fixture).toBeDefined();
      expect(tour).toBeDefined();

      const sourceStops = countStructuredSourceStops(
        fixture!.rawPayload as Record<string, unknown>
      );

      if (sourceStops >= 2) {
        expect(tour!.itinerary.length).toBeGreaterThanOrEqual(sourceStops);
        const html = renderToString(<Engine6TourPage tour={tour!} />);
        expect(html).toContain('data-testid="engine6-itinerary-timeline"');
      }
    }
  );

  it("renders Anchorage 411138P3 itinerary stops in source order with duration/admission details", () => {
    const anchorage = engine6ResolvedTours.find(
      tour => tour.productCode === "411138P3"
    );
    expect(anchorage).toBeDefined();
    expect(anchorage?.itinerary.map(item => item.title)).toEqual([
      "Anchorage",
      "Earthquake Park",
      "Beluga Point",
      "Alaska Wildlife Conservation Center",
      "Girdwood",
      "Turnagain Arm Drive",
    ]);

    const html = renderToString(<Engine6TourPage tour={anchorage!} />);
    expect(html).toContain('data-testid="engine6-itinerary-timeline"');
    expect(html).toContain("1 hour");
    expect(html).toContain("30 minutes");
    expect(html).toContain("Admission Ticket Included");
    expect(html).toContain("Admission Ticket Free");

    const schema = buildEngine6SchemaGraph(anchorage!);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const trip = graph.find(node => node["@type"] === "TouristTrip") as
      | {
          itinerary?: { itemListElement?: Array<{ item?: { name?: string } }> };
        }
      | undefined;
    const names = (trip?.itinerary?.itemListElement ?? []).map(
      item => item.item?.name
    );
    expect(names).toEqual([
      "Anchorage",
      "Earthquake Park",
      "Beluga Point",
      "Alaska Wildlife Conservation Center",
      "Girdwood",
      "Turnagain Arm Drive",
    ]);
  });

  it("renders summary-only itinerary style when structured stops are absent", () => {
    const tour = {
      ...engine6ResolvedTours[0]!,
      itinerary: [],
      itinerarySummaryText: "Overview schedule available at booking.",
    };

    const html = renderToString(<Engine6TourPage tour={tour} />);
    expect(html).toContain('data-testid="engine6-itinerary-summary-only"');
    expect(html).not.toContain('data-testid="engine6-itinerary-timeline"');
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

  it("registers the paragon route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "<Route path={ENGINE6_PARAGON_ROUTE} component={Engine6SpecimenRoute} />"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });

  it("registers the Anchorage private route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "path={ENGINE6_ANCHORAGE_PRIVATE_ROUTE}"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });

  it("registers the Anchorage SUNSET route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "path={ENGINE6_ANCHORAGE_SUNSET_ROUTE}"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });

  it("registers the Anchorage greenbelt route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "path={ENGINE6_ANCHORAGE_GREENBELT_ROUTE}"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });

  it("registers the New York replacement route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "path={ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE}"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });


  it("registers the New York pedicab replacement route before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "path={ENGINE6_NYC_PEDICAB_ROUTE}"
    );
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
  });

  it("keeps 411138P3 mapped to the Anchorage private canonical route", () => {
    const anchorageTour = engine6ResolvedTours.find(
      tour => tour.productCode === "411138P3"
    );
    expect(anchorageTour).toBeDefined();
    expect(anchorageTour?.canonicalPath).toBe(ENGINE6_ANCHORAGE_PRIVATE_ROUTE);
    expect(anchorageTour?.bookingUrl).toBe(
      "https://www.viator.com/tours/Anchorage/Private-Anchorage-Tour-and-Wilderness-Adventure/d4152-411138P3?pid=P00290915&mcid=42383&medium=link"
    );
  });

  it("registers the Anchorage greenbelt route before the united-states city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "path={ENGINE6_ANCHORAGE_GREENBELT_ROUTE}"
    );
    const unitedStatesRouteIndex = source.indexOf(
      'path="/destinations/united-states/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(unitedStatesRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(unitedStatesRouteIndex);
  });

  it("replaces 53474P8 in-place and keeps FareHarbor /book routing", () => {
    const anchorageTour = engine6ResolvedTours.find(
      tour => tour.productCode === "53474P8"
    );
    expect(anchorageTour).toBeDefined();
    expect(anchorageTour?.canonicalPath).toBe(
      "/destinations/alaska/anchorage/tours/anchorage-greenbelt-bike-tour-391155"
    );
    expect(anchorageTour?.bookingUrl).toBe(
      "/destinations/alaska/anchorage/tours/anchorage-greenbelt-bike-tour-391155/book"
    );
  });

  it("replaces 414460P1 in-place and keeps the existing /book endpoint CTA", () => {
    const nycPedicabTour = engine6ResolvedTours.find(
      tour => tour.productCode === "414460P1"
    );
    expect(nycPedicabTour).toBeDefined();
    expect(nycPedicabTour?.canonicalPath).toBe(
      "/destinations/new-york/new-york/tours/1-hour-central-park-pedicab-tour-27491"
    );
    expect(nycPedicabTour?.bookingUrl).toBe(
      "/destinations/new-york/new-york/tours/1-hour-central-park-pedicab-tour-27491/book"
    );
    expect(nycPedicabTour?.itinerary.length).toBeGreaterThanOrEqual(2);
    expect(ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS.has(ENGINE6_NYC_PEDICAB_ROUTE)).toBe(true);
  });

  it("replaces 233384P2 in-place and keeps the existing /book endpoint CTA", () => {
    const nycTour = engine6ResolvedTours.find(
      tour => tour.productCode === "233384P2"
    );
    expect(nycTour).toBeDefined();
    expect(nycTour?.canonicalPath).toBe(
      "/destinations/new-york/new-york/tours/brooklyn-bridge-and-waterfront-bike-tour-264853"
    );
    expect(nycTour?.bookingUrl).toBe(
      "/destinations/new-york/new-york/tours/brooklyn-bridge-and-waterfront-bike-tour-264853/book"
    );
    expect(
      ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS.has(ENGINE6_NYC_BROOKLYN_BRIDGE_ROUTE)
    ).toBe(true);
  });

  it("keeps 100569P5 mapped to the Anchorage SUNSET canonical route", () => {
    const anchorageTour = engine6ResolvedTours.find(
      tour => tour.productCode === "100569P5"
    );
    expect(anchorageTour).toBeDefined();
    expect(anchorageTour?.canonicalPath).toBe(ENGINE6_ANCHORAGE_SUNSET_ROUTE);
    expect(
      anchorageTour?.description.startsWith(
        "Join one of the best experiences in Anchorage..."
      )
    ).toBe(true);
  });
});
