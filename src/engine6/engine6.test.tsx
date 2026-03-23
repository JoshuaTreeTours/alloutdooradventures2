import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import TourCard from "../components/TourCard";
import {
  getCityTourDetailPath,
  getToursByCity,
  getToursByState,
} from "../data/tours";
import { getTopToursForPlace } from "../data/tourIndex";
import Engine6TourPage from "./components/Engine6TourPage";
import { buildEngine6ViatorBookingUrl } from "./buildEngine6ViatorBookingUrl";
import { normalizeEngine6AggregateRating } from "./rating";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { buildEngine6MetaDescription, buildMetaDescription } from "./seo";
import { toEngine6Card, buildEngine6CardSurfaces } from "./cards";
import { getBundledEngine6Tour } from "./bundledProducts";
import {
  ENGINE6_163873P16_CARD_IMAGE_URL,
  engine6SpecimenTour,
} from "./listing";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import {
  getEngine6RelatedTours,
  getEngine6RelatedToursResult,
} from "./relatedTours";
import { ENGINE6_SPECIMEN_ROUTE } from "./routes";
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
        url: "https://img.test/specimen-root-hero-large.jpg",
        width: 674,
        height: 446,
      },
      {
        url: "https://img.test/specimen-root-hero-small.jpg",
        width: 360,
        height: 240,
      },
    ],
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
  it("follows the Engine5-style precedence for generic hero, price, rating, review, and itinerary extraction", () => {
    const extracted = extractEngine6Product({
      product: {
        productCode: "GENERIC1",
        title: "Generic Jeep Tour",
        pricing: { summary: { fromPrice: 139 } },
        reviewSummary: { averageRating: "4.7 out of 5", totalReviews: "203" },
        media: {
          images: [
            {
              isCover: true,
              variants: {
                FULL: {
                  url: "https://img.test/generic-media-full.jpg",
                  width: 1200,
                  height: 800,
                },
              },
            },
          ],
        },
        itinerary: {
          itineraryItems: [
            {
              title: "Trailhead",
              summary: "Start here",
              durationText: "15 minutes",
            },
          ],
        },
      },
    });

    expect(extracted.extracted.heroImageUrl).toBe(
      "https://img.test/generic-media-full.jpg"
    );
    expect(extracted.extracted.priceAmount).toBe(139);
    expect(extracted.extracted.aggregateRating).toBe(4.7);
    expect(extracted.extracted.reviewCount).toBe(203);
    expect(extracted.extracted.itinerary).toEqual([
      {
        title: "Trailhead",
        description: "Start here",
        duration: "15 minutes",
      },
    ]);
    expect(extracted.diagnostics.heroImageFieldPath).toBe(
      "product.media.images[0].variants.FULL.url"
    );
    expect(extracted.diagnostics.commercialPriceFieldPath).toBe(
      "product.pricing.summary.fromPrice"
    );
    expect(extracted.diagnostics.ratingFieldPath).toBe(
      "product.reviewSummary.averageRating"
    );
    expect(extracted.diagnostics.reviewCountFieldPath).toBe(
      "product.reviewSummary.totalReviews"
    );
    expect(extracted.diagnostics.itineraryFieldPath).toBe(
      "product.itinerary.itineraryItems"
    );
  });

  it("hard-enforces the exact 163873P16 hero, price, and content section sources", () => {
    const extracted = extractEngine6Product(specimenProductPayload);

    expect(extracted.extracted.heroImageUrl).toBe(
      "https://img.test/specimen-root-hero-large.jpg"
    );
    expect(extracted.diagnostics.heroImageFieldPath).toBe(
      "product.images[0].url"
    );
    expect(extracted.diagnostics.heroVariantFieldPath).toBe(
      "product.images[0]"
    );
    expect(extracted.diagnostics.selectedHeroWidth).toBe(674);
    expect(extracted.diagnostics.selectedHeroHeight).toBe(446);
    expect(extracted.diagnostics.imageSourceUsed).toBe("viator-api-primary");
    expect(extracted.diagnostics.heroResolverName).toBe("product.images.cover");
    expect(extracted.diagnostics.apiPrimaryImageCandidate).toEqual({
      url: "https://img.test/specimen-root-hero-large.jpg",
      path: "product.images[0].url",
      variantPath: "product.images[0]",
      width: 674,
      height: 446,
      source: "viator-api-primary",
      resolver: "product.images.cover",
    });
    expect(extracted.diagnostics.apiGalleryImageCandidates).toEqual([
      {
        url: "https://img.test/specimen-root-hero-small.jpg",
        path: "product.images[1].url",
        variantPath: "product.images[1]",
        width: 360,
        height: 240,
        source: "viator-api-gallery",
        resolver: "product.images.gallery",
      },
    ]);
    expect(extracted.diagnostics.scrapedImageCandidates).toEqual([]);
    expect(extracted.diagnostics.fallbackImageCandidates).toEqual([]);
    expect(extracted.diagnostics.finalSelectedHero).toEqual({
      url: "https://img.test/specimen-root-hero-large.jpg",
      path: "product.images[0].url",
      variantPath: "product.images[0]",
      width: 674,
      height: 446,
      source: "viator-api-primary",
      resolver: "product.images.cover",
    });

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
      {
        question: "Is this tour wheelchair accessible?",
        answer: "No. This tour is not wheelchair accessible.",
      },
      {
        question:
          "Are there any health restrictions travelers should know about?",
        answer:
          "Yes. This tour is not recommended for travelers with back problems, pregnant travelers, or travelers with serious heart or medical conditions.",
      },
      {
        question: "Can most travelers participate?",
        answer: "Yes. Most travelers can participate.",
      },
    ]);
    expect(extracted.diagnostics.faqsFieldPath).toBe(
      "merged:product.qAndA.items+product.additionalInfo"
    );
    expect(extracted.diagnostics.faqFieldPath).toBe(
      "merged:product.qAndA.items+product.additionalInfo"
    );
    expect(extracted.diagnostics.faqCount).toBe(4);
    expect(extracted.diagnostics.faqSourceUsed).toBe(
      "merged:product.qAndA.items+product.additionalInfo"
    );

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

  it("keeps the API primary hero ahead of gallery, scraped, and fallback candidates", () => {
    const extracted = extractEngine6Product({
      product: {
        productCode: "PRIORITY1",
        title: "Priority Tour",
        images: [
          {
            isCover: true,
            url: "https://img.test/api-primary-cover.jpg",
            width: 674,
            height: 446,
          },
          {
            url: "https://img.test/api-gallery.jpg",
            width: 900,
            height: 600,
          },
        ],
        media: {
          images: [
            {
              variants: {
                FULL: {
                  url: "https://img.test/scraped-hero.jpg",
                  width: 1600,
                  height: 900,
                },
              },
            },
          ],
        },
        imageUrl: "https://img.test/fallback-direct.jpg",
      },
    });

    expect(extracted.extracted.heroImageUrl).toBe(
      "https://img.test/api-primary-cover.jpg"
    );
    expect(extracted.diagnostics.imageSourceUsed).toBe("viator-api-primary");
    expect(extracted.diagnostics.heroResolverName).toBe("product.images.cover");
    expect(extracted.diagnostics.apiGalleryImageCandidates).toEqual([
      {
        url: "https://img.test/api-gallery.jpg",
        path: "product.images[1].url",
        variantPath: "product.images[1]",
        width: 900,
        height: 600,
        source: "viator-api-gallery",
        resolver: "product.images.gallery",
      },
    ]);
    expect(extracted.diagnostics.scrapedImageCandidates).toEqual([
      {
        url: "https://img.test/scraped-hero.jpg",
        path: "product.media.images[0].variants.FULL.url",
        variantPath: "product.media.images[0].variants.FULL",
        width: 1600,
        height: 900,
        source: "trusted-scraped-page-hero",
        resolver: "product.media.images",
      },
    ]);
    expect(extracted.diagnostics.fallbackImageCandidates).toEqual([
      {
        url: "https://img.test/fallback-direct.jpg",
        path: "product.imageUrl",
        variantPath: "product.imageUrl",
        width: null,
        height: null,
        source: "fallback-image",
        resolver: "product.imageUrl",
      },
    ]);
  });
});

const specimenApiPayload = {
  source: "live-api" as const,
  diagnostics: {
    source: "live-api" as const,
    resolvedProductUrl: null,
    resolvedHeroImageUrl: null,
    hasViatorApiKey: true,
    attemptedLiveFetch: true,
    upstreamStatus: 200,
    upstreamContentType: "application/json",
    upstreamOk: true,
    usedBundledFallbackBecause: "",
    commercialPriceFieldPath: "product.priceFrom",
    commercialPriceRawValue: "$105.09",
    priceSourceUsed: "live-price" as const,
    heroImageFieldPath: "product.images[0].url",
    heroVariantFieldPath: "product.images[0]",
    selectedHeroWidth: 674,
    selectedHeroHeight: 446,
    imageSourceUsed: "viator-api-primary" as const,
    heroResolverName: "product.images.cover",
    apiPrimaryImageCandidate: {
      url: "https://img.test/specimen-root-hero-large.jpg",
      path: "product.images[0].url",
      variantPath: "product.images[0]",
      width: 674,
      height: 446,
      source: "viator-api-primary" as const,
      resolver: "product.images.cover",
    },
    apiGalleryImageCandidates: [
      {
        url: "https://img.test/specimen-root-hero-small.jpg",
        path: "product.images[1].url",
        variantPath: "product.images[1]",
        width: 360,
        height: 240,
        source: "viator-api-gallery" as const,
        resolver: "product.images.gallery",
      },
    ],
    scrapedImageCandidates: [],
    fallbackImageCandidates: [],
    finalSelectedHero: {
      url: "https://img.test/specimen-root-hero-large.jpg",
      path: "product.images[0].url",
      variantPath: "product.images[0]",
      width: 674,
      height: 446,
      source: "viator-api-primary" as const,
      resolver: "product.images.cover",
    },
    productUrlFieldPath: "product.productUrl",
    bookingUrlSource: "product.productUrl",
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
    faqsFieldPath: "merged:product.qAndA.items+product.additionalInfo",
    faqFieldPath: "merged:product.qAndA.items+product.additionalInfo",
    faqCount: 4,
    faqSourceUsed: "merged:product.qAndA.items+product.additionalInfo",
    requirementsFieldPath: "product.additionalInfo",
    classificationFieldPath: "inferred:title+overview+highlights",
    fieldLevelFallbackUsed: false,
    fallbackFieldNames: [],
  },
  rawProductCode: "163873P16",
  rawProduct: {
    title: "East Zion Top of the World Jeep Tour",
  },
  extracted: {
    title: "East Zion Top of the World Jeep Tour",
    seoTitle: "East Zion Top of the World Jeep Tour in Springdale",
    seoDescription:
      "Best tour in Springdale.. Rated 5/5. 154 reviews. Grab bird’s-eye views of Zion National Park on this Jeep tour.",
    city: "Springdale",
    state: "Utah",
    heroImageUrl: "https://img.test/specimen-root-hero-large.jpg",
    cardImageUrl: "https://img.test/specimen-root-hero-large.jpg",
    productUrl:
      "https://www.viator.com/tours/Utah/East-Zion-Top-of-the-World-Jeep-Tour/d785-163873P16",
    priceAmount: 105.09,
    priceFormatted: "From $105",
    aggregateRating: 5,
    reviewCount: 154,
    durationText: "1 hour 30 minutes",
    pickupOffered: false,
    mobileTicket: false,
    language: "English",
    operatorName: null,
    cancellationSummary: null,
    inclusionItems: [],
    exclusionItems: [],
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
      {
        question: "Is this tour wheelchair accessible?",
        answer: "No. This tour is not wheelchair accessible.",
      },
      {
        question:
          "Are there any health restrictions travelers should know about?",
        answer:
          "Yes. This tour is not recommended for travelers with back problems, pregnant travelers, or travelers with serious heart or medical conditions.",
      },
      {
        question: "Can most travelers participate?",
        answer: "Yes. Most travelers can participate.",
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

describe("engine6 meta descriptions", () => {
  it("clamps long descriptions at a word boundary with an ellipsis", () => {
    const metaDescription = buildEngine6MetaDescription(
      "Best tour in Springdale.. Rated 5/5. 154 reviews. Grab bird’s-eye views of Zion National Park on this Jeep tour with easy off-road access, scenic overlooks, geology context, and wide-open desert ridgelines for adventurous travelers."
    );

    expect(metaDescription).toBe(
      "Grab bird’s-eye views of Zion National Park on this Jeep tour with easy off-road access, scenic overlooks, geology context, and wide-open desert..."
    );
    expect(metaDescription.endsWith("mo")).toBe(false);
    expect(metaDescription.endsWith("...")).toBe(true);
  });

  it("returns shorter cleaned descriptions unchanged", () => {
    const metaDescription = buildEngine6MetaDescription(
      "Grab bird’s-eye views of Zion National Park on this Jeep tour with easy off-road access, scenic overlooks, and guide-led geology context."
    );

    expect(metaDescription).toBe(
      "Grab bird’s-eye views of Zion National Park on this Jeep tour with easy off-road access, scenic overlooks, and guide-led geology context."
    );
  });

  it("strips HTML before safely truncating at a word boundary", () => {
    const metaDescription = buildMetaDescription(
      "<p>Grab bird’s-eye views of Zion National Park on this Jeep tour with scenic climbs and incredible desert vistas plus guide-led geology context for adventurous families and first-time visitors.</p>"
    );

    expect(metaDescription).toBe(
      "Grab bird’s-eye views of Zion National Park on this Jeep tour with scenic climbs and incredible desert vistas plus guide-led geology context for..."
    );
    expect(metaDescription).not.toContain("<p>");
    expect(metaDescription.length).toBeLessThanOrEqual(160);
  });
});

describe("engine6 Viator booking URLs", () => {
  it("uses the canonical East Zion Viator detail URL when no preferred product URL is available", () => {
    expect(buildEngine6ViatorBookingUrl("163873P16")).toBe(
      "https://www.viator.com/tours/Utah/East-Zion-Top-of-the-World-Jeep-Tour/d785-163873P16?pid=P00290915&mcid=42383&medium=link"
    );
  });
});

describe("engine6 aggregate rating normalization", () => {
  it("rounds valid ratings to one decimal place and safely ignores invalid inputs", () => {
    expect(normalizeEngine6AggregateRating(5)).toBe(5);
    expect(normalizeEngine6AggregateRating(4.666)).toBe(4.7);
    expect(normalizeEngine6AggregateRating(null)).toBeNull();
    expect(normalizeEngine6AggregateRating(undefined)).toBeNull();
    expect(normalizeEngine6AggregateRating(Number.NaN)).toBeNull();
  });
});

describe("engine6 mapping/cards/page", () => {
  it("renders the enforced 163873P16 sections instead of fallback content", () => {
    const tour = mapViatorToEngine6Tour(specimenApiPayload);

    const card = toEngine6Card(tour);
    const surfaces = buildEngine6CardSurfaces(tour);
    const html = renderToString(<Engine6TourPage tour={tour} />);

    expect(tour.productCode).toBe("163873P16");
    expect(tour.priceFormatted).toBe("From $105");
    expect(tour.bookingUrl).toBe(
      "https://www.viator.com/tours/Utah/East-Zion-Top-of-the-World-Jeep-Tour/d785-163873P16?pid=P00290915&mcid=42383&medium=link"
    );
    expect(card.title).toContain("East Zion");
    expect(surfaces.city[0].priceLabel).toBe("From $105");
    expect(tour.primaryCategory).toBe("off-road-tour");
    expect(tour.categoryLabel).toBe("Jeep Tour");
    expect(tour.description).toContain("Springdale, Utah");
    expect(tour.description).toContain("Zion National Park");
    expect(tour.description).not.toContain(
      "Grab bird’s-eye views of Zion National Park on this Jeep tour"
    );
    expect(tour.description).not.toContain("Best tour");
    expect(tour.metaDescription).not.toContain("Rated 5/5");
    expect(tour.metaDescription.length).toBeLessThanOrEqual(160);
    expect(tour.canonicalPath).toBe(ENGINE6_SPECIMEN_ROUTE);
    expect(html).toContain('id="structured-data-engine6-viator"');
    expect(html).toContain('data-testid="engine6-hero-banner"');
    expect(html).toContain('aria-label="Destination breadcrumb"');
    expect(html).toContain('href="/destinations"');
    expect(html).toContain('href="/destinations/utah"');
    expect(html).toContain('href="/destinations/utah/springdale"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('data-hero-source="viator-api-primary"');
    expect(html).toContain('data-hero-resolver="product.images.cover"');
    expect(html).toContain('data-testid="engine6-commercial-facts"');
    expect(html).toContain(
      'src="https://img.test/specimen-root-hero-large.jpg"'
    );
    expect(html).toContain("From:</strong>");
    expect(html).toContain("From $105");
    expect(html).toContain("per person");
    expect(html).toContain("Meeting point:</strong>");
    expect(html).toContain("Meet us at Zion Mountain Ranch!");
    expect(html).toContain("Jeep Tour");
    expect(html).toContain("East Zion Top of the World Jeep Tour");
    expect(html).toContain("Jeep Tour");
    expect(html).not.toContain(">ENGINE6<");
    expect(html).toContain("Rated 5.0 out of 5 stars");
    expect(
      html.match(/data-testid=\"engine6-rating-star\"/g) ?? []
    ).toHaveLength(5);
    expect(html).toContain("5.0");
    expect(html).toContain("154");
    expect(html).toContain("rating •");
    expect(html).not.toContain("Important info");
    expect(html).toContain("Overview");
    expect(html).toContain("Highlights");
    expect(html).toContain("Itinerary");
    expect(html).not.toContain("Gallery");
    expect(html).not.toContain("gallery image");
    expect(html).toContain("not wheelchair accessible");
    expect(html).toContain("Is this tour wheelchair accessible?");
    expect(html).toContain("FAQs");
    expect(html).toContain("Is this tour good for families?");
    expect(html).not.toContain("Check latest price");
    expect(html).toContain('data-testid="engine6-bottom-cta"');
    expect(html).toContain("READY TO BOOK?");
    expect(html).toContain("Lock in your");
    expect(html).toContain(tour.city);
    expect(html).toContain("adventure today.");
    expect(html).toContain(
      "Secure your spot, confirm the latest availability, and review final departure details before checkout."
    );
    expect(html.match(/>Book now</g) ?? []).toHaveLength(2);
    expect(html).toContain(
      'href="https://www.viator.com/tours/Utah/East-Zion-Top-of-the-World-Jeep-Tour/d785-163873P16?pid=P00290915&amp;mcid=42383&amp;medium=link"'
    );
    expect(ENGINE6_SPECIMEN_ROUTE).toBe(
      "/destinations/utah/springdale/tours/east-zion-top-of-the-world-jeep-tour"
    );
  });

  it("renders a related-city slider below the final CTA for the Grand Canyon Vegas page", () => {
    const tour = getBundledEngine6Tour("132218P75");

    expect(tour).toBeDefined();

    const html = renderToString(<Engine6TourPage tour={tour!} />);
    const ctaIndex = html.indexOf('data-testid="engine6-bottom-cta"');
    const relatedIndex = html.indexOf('data-testid="engine6-related-tours"');

    expect(ctaIndex).toBeGreaterThan(-1);
    expect(relatedIndex).toBeGreaterThan(ctaIndex);
    expect(html).toContain("Other Tours in Las Vegas");
    expect(html).toContain('class="related-tours-slider mt-6 flex gap-5 overflow-x-auto pb-4"');
    expect(html).toContain('aria-label="Other Tours in Las Vegas"');
    expect(html).toContain('data-testid="engine6-related-tours-debug"');
    expect(html).toContain(
      'data-engine6-template="Engine6ProductRoute&gt;Engine6TourPage"'
    );
    expect(html).toContain('data-related-source="engine6ListingTours"');
    expect(html).toContain('data-related-current-slug="grand-canyon-skywalk-hoover-dam-day-trip-from-las-vegas"');
    expect(html).toContain('data-related-city-slug="las-vegas"');
    expect(html).toContain('data-related-state-slug="nevada"');
    expect(html).toContain('data-related-same-city-candidates="2"');
    expect(html).toContain('data-related-siblings-after-current-excluded="1"');
    expect(html).toContain('data-related-final-count="1"');
    expect(html).toContain('data-related-final-cards="73781P4"');
    expect(html).toContain("Red Rock Canyon and Seven Magic Mountains Tour");
    expect(html).toContain('class="tour-card min-w-[280px] max-w-[320px] flex-[0_0_280px] overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:min-w-[320px] md:flex-[0_0_320px]"');
    expect(html).toContain('src="https://media.tacdn.com/media/attractions-splice-spp-674x446/0d/9c/4d/7b.jpg"');
    expect(html).toContain(
      'href="/destinations/nevada/las-vegas/tours/red-rock-canyon-and-seven-magic-mountains-tour"'
    );
    expect(html).not.toContain(
      'href="/destinations/nevada/las-vegas/tours/grand-canyon-skywalk-hoover-dam-day-trip-from-las-vegas"></a>'
    );
  });

  it("suppresses the related-city slider when no Engine6 siblings exist in the city", () => {
    const html = renderToString(<Engine6TourPage tour={engine6SpecimenTour} />);

    expect(html).not.toContain('data-testid="engine6-related-tours"');
    expect(html).not.toContain("Other Tours in Springdale");
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
    expect(resolved.debug.imageSourceUsed).toBe("viator-api-primary");
    expect(resolved.debug.commercialPriceRawValue).toBe("$105.09");
    expect(resolved.debug.priceSourceUsed).toBe("live-price");
    expect(resolved.debug.overviewFieldPath).toBe("product.description.text");
    expect(resolved.debug.highlightsFieldPath).toBe("product.highlights");
    expect(resolved.debug.itineraryFieldPath).toBe("product.itineraryItems");
    expect(resolved.debug.itineraryItemCount).toBe(1);
    expect(resolved.debug.itinerarySourceUsed).toBe("product.itineraryItems");
    expect(resolved.debug.faqsFieldPath).toBe(
      "merged:product.qAndA.items+product.additionalInfo"
    );
    expect(resolved.debug.faqCount).toBe(4);
    expect(resolved.debug.faqSourceUsed).toBe(
      "merged:product.qAndA.items+product.additionalInfo"
    );
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
    expect(resolved.tour?.heroImageUrl).toBe("/hero.jpg");
    expect(html).not.toContain("Important info");
    expect(html).not.toContain("FAQs");
    expect(html).not.toContain("Important info");
  });

  it("handles non-200 JSON error envelopes from the specimen API gracefully", () => {
    const apiUrl = buildEngine6SpecimenApiUrl("163873P16");
    const resolved = resolveEngine6SpecimenResponse({
      payload: {
        error: "Viator API returned non-JSON payload",
        diagnostics: {
          overviewFieldPath: null,
        },
      },
      httpStatus: 502,
      productCode: "163873P16",
      apiUrl,
      responseContentType: "application/json; charset=utf-8",
      responseBodyPreview: '{"error":"Viator API returned non-JSON payload"}',
    });

    expect(resolved.tour).toBeNull();
    expect(resolved.error).toBe("Viator API returned non-JSON payload");
    expect(resolved.debug.httpStatus).toBe(502);
    expect(resolved.debug.responseContentType).toBe(
      "application/json; charset=utf-8"
    );
    expect(resolved.debug.failureReason).toBe("api-error-response");
  });
});

describe("engine6 related tours", () => {
  it("returns same-city Engine6 siblings only, excluding the current tour", () => {
    const grandCanyonTour = getBundledEngine6Tour("132218P75");
    const redRockTour = getBundledEngine6Tour("73781P4");

    expect(grandCanyonTour).toBeDefined();
    expect(redRockTour).toBeDefined();

    const grandCanyonRelated = getEngine6RelatedTours(grandCanyonTour!);
    const redRockRelated = getEngine6RelatedTours(redRockTour!);
    const specimenRelated = getEngine6RelatedTours(engine6SpecimenTour);
    const grandCanyonDebug = getEngine6RelatedToursResult(grandCanyonTour!);

    expect(grandCanyonRelated.map(tour => tour.productCode)).toEqual([
      "73781P4",
    ]);
    expect(redRockRelated.map(tour => tour.productCode)).toEqual([
      "132218P75",
    ]);
    expect(specimenRelated).toEqual([]);
    expect(grandCanyonDebug.debug).toEqual({
      templatePath: "Engine6ProductRoute>Engine6TourPage",
      sourceCollection: "engine6ListingTours",
      currentTourSlug: "grand-canyon-skywalk-hoover-dam-day-trip-from-las-vegas",
      currentCitySlug: "las-vegas",
      currentStateSlug: "nevada",
      siblingCandidateCountBeforeFiltering: 2,
      sameStateCandidateCount: 2,
      siblingCountAfterExcludingCurrent: 1,
      finalCardProductCodes: ["73781P4"],
      finalCardCount: 1,
    });
  });
});

describe("engine6 seo/schema", () => {
  it("builds a schema graph anchored to the specimen canonical path", () => {
    const tour = mapViatorToEngine6Tour(specimenApiPayload);
    const schema = buildEngine6SchemaGraph(tour);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const breadcrumb = graph.find(node => node["@type"] === "BreadcrumbList");
    const trip = graph.find(node => node["@type"] === "TouristTrip");
    const product = graph.find(node => node["@type"] === "Product");
    const faq = graph.find(node => node["@type"] === "FAQPage");
    const webpage = graph.find(node => node["@type"] === "WebPage");
    const offer = graph.find(node => node["@type"] === "Offer");
    const aggregateRating = graph.find(
      node => node["@type"] === "AggregateRating"
    );

    expect(schema["@context"]).toBe("https://schema.org");
    expect(breadcrumb).toBeDefined();
    expect(trip).toMatchObject({
      "@id": `https://www.alloutdooradventures.com${ENGINE6_SPECIMEN_ROUTE}#trip`,
      image: "https://img.test/specimen-root-hero-large.jpg",
      touristType: "Jeep Tour",
      url: `https://www.alloutdooradventures.com${ENGINE6_SPECIMEN_ROUTE}`,
    });
    expect(product).toMatchObject({
      category: "Jeep Tour",
      image: "https://img.test/specimen-root-hero-large.jpg",
      url: `https://www.alloutdooradventures.com${ENGINE6_SPECIMEN_ROUTE}`,
    });
    expect(webpage).toMatchObject({
      "@id": `https://www.alloutdooradventures.com${ENGINE6_SPECIMEN_ROUTE}#webpage`,
      description: tour.metaDescription,
      url: `https://www.alloutdooradventures.com${ENGINE6_SPECIMEN_ROUTE}`,
    });
    expect(offer).toMatchObject({
      url: tour.bookingUrl,
    });
    expect(aggregateRating).toMatchObject({
      ratingValue: 5,
      reviewCount: 154,
    });
    expect(faq).toBeDefined();
  });

  it("omits Offer.url when the booking link falls back to a Viator search URL", () => {
    const tour = {
      ...mapViatorToEngine6Tour(specimenApiPayload),
      bookingUrl: buildEngine6ViatorBookingUrl("MISSING1"),
    };
    const schema = buildEngine6SchemaGraph(tour);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const offer = graph.find(node => node["@type"] === "Offer");

    expect(tour.bookingUrl).toContain("/search/MISSING1");
    expect(offer).toBeDefined();
    expect(offer).not.toHaveProperty("url");
  });
});

describe("engine6 diagnostics visibility", () => {
  it("keeps diagnostics hidden by default and allows an explicit debug query", () => {
    expect(shouldShowEngine6Diagnostics("")).toBe(false);
    expect(shouldShowEngine6Diagnostics("?engine6Debug=1")).toBe(true);
    expect(shouldShowEngine6Diagnostics("", true)).toBe(true);
  });
});

describe("engine6 listing surfaces", () => {
  it("adds 163873P16 to Utah and Springdale listing sources", () => {
    const utahTours = getToursByState("utah");
    const springdaleTours = getToursByCity("utah", "springdale");
    const springdaleTopTours = getTopToursForPlace(
      {
        type: "city",
        slug: "springdale",
        name: "Springdale",
        parentSlug: "utah",
        parentName: "Utah",
        regionType: "state",
      },
      { min: 3, max: 12 }
    );

    expect(utahTours.some(tour => tour.productCode === "163873P16")).toBe(true);
    expect(springdaleTours.some(tour => tour.productCode === "163873P16")).toBe(
      true
    );
    expect(
      springdaleTopTours.some(tour => tour.productCode === "163873P16")
    ).toBe(true);
  });

  it("adds both Engine6 Vegas tours to Nevada and Las Vegas listing sources", () => {
    const nevadaTours = getToursByState("nevada");
    const lasVegasTours = getToursByCity("nevada", "las-vegas");

    expect(nevadaTours.some(tour => tour.productCode === "132218P75")).toBe(
      true
    );
    expect(nevadaTours.some(tour => tour.productCode === "73781P4")).toBe(
      true
    );
    expect(lasVegasTours.filter(tour => tour.engine === "engine6")).toHaveLength(
      2
    );
  });

  it("renders the listing card with the resolved Engine6 image and normalized content", () => {
    const listingTour = getToursByCity("utah", "springdale").find(
      tour => tour.productCode === "163873P16"
    );

    expect(listingTour).toBeDefined();
    expect(listingTour?.primaryImageUrl).toBe(ENGINE6_163873P16_CARD_IMAGE_URL);
    expect(listingTour?.heroImage).toBe(ENGINE6_163873P16_CARD_IMAGE_URL);

    const html = renderToString(
      <TourCard
        tour={listingTour!}
        href={getCityTourDetailPath(listingTour!)}
      />
    );

    expect(html).toContain(`src="${ENGINE6_163873P16_CARD_IMAGE_URL}"`);
    expect(html).toContain("Springdale, Utah");
    expect(html).toContain("East Zion Top of the World Jeep Tour");
    expect(html).toContain("Jeep Tour");
    expect(html).not.toContain(">ENGINE6<");
    expect(html).toContain("★");
    expect(html).toContain("5.0");
    expect(html).toContain("154");
    expect(html).toContain("reviews");
    expect(html).toContain("From");
    expect(html).toContain("$105");
    expect(html).toContain("Springdale, Utah");
    expect(html).toContain("Zion National Park");
    expect(html).toContain(
      'href="/destinations/utah/springdale/tours/east-zion-top-of-the-world-jeep-tour"'
    );
  });

  it("keeps the Engine6 specimen card helper aligned with the resolved hero image", () => {
    const card = toEngine6Card(engine6SpecimenTour);

    expect(card.imageUrl).toBe(ENGINE6_163873P16_CARD_IMAGE_URL);
    expect(card.locationLabel).toBe("Springdale, Utah");
    expect(card.priceLabel).toBe("From $105");
    expect(card.ratingLabel).toBe("5.0 (154)");
  });
});

describe("engine6 route wiring", () => {
  it("registers Engine6 routes before the generic city tour detail route", () => {
    const source = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
    const engine6RouteIndex = source.indexOf(
      "<Route path={ENGINE6_SPECIMEN_ROUTE} component={Engine6SpecimenRoute} />"
    );
    const productionRoutesIndex = source.indexOf("ENGINE6_PRODUCTION_ROUTE_SPECS.map");
    const genericRouteIndex = source.indexOf(
      'path="/destinations/:stateSlug/:citySlug/tours/:tourSlug"'
    );

    expect(engine6RouteIndex).toBeGreaterThan(-1);
    expect(productionRoutesIndex).toBeGreaterThan(-1);
    expect(genericRouteIndex).toBeGreaterThan(-1);
    expect(engine6RouteIndex).toBeLessThan(genericRouteIndex);
    expect(productionRoutesIndex).toBeLessThan(genericRouteIndex);
  });
});
