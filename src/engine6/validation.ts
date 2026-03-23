import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import Engine6TourPage from "./components/Engine6TourPage";
import { toEngine6Card } from "./cards";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import { formatEngine6AggregateRating } from "./rating";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import type { Engine6ApiResponse } from "./types";
import type { Engine6ValidationFixture } from "./validationFixtures";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

export type Engine6ValidationReport = {
  productCode: string;
  route: string;
  liveApiFetchSucceeded: boolean;
  pageRenderSucceeded: boolean;
  cardRenderSucceeded: boolean;
  heroResult: string;
  priceResult: string;
  ratingReviewResult: string;
  seoTitleResult: string;
  metaDescriptionResult: string;
  jsonLdEntityCoverage: string[];
  bookingAttributionResult: string;
  diagnostics: {
    source: string;
    heroSource: string;
    heroImageFieldPath: string | null;
    priceSource: string;
    commercialPriceFieldPath: string | null;
    ratingFieldPath: string | null;
    reviewCountFieldPath: string | null;
    overviewFieldPath: string | null;
    highlightsFieldPath: string | null;
    itineraryFieldPath: string | null;
    faqsFieldPath: string | null;
    bookingUrlSource: string;
    fieldLevelFallbackUsed: boolean;
    fallbackFieldNames: string[];
  };
  remainingEngineWideIssue: string | null;
};

export const buildEngine6ValidationReport = (
  fixture: Engine6ValidationFixture
): Engine6ValidationReport => {
  const extraction = extractEngine6Product(fixture.rawPayload);
  const payload: Engine6ApiResponse = {
    source: "live-api",
    rawProductCode: fixture.productCode,
    rawProduct: extraction.product,
    diagnostics: {
      source: "live-api",
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: "text/html fixture derived from public viator page",
      upstreamOk: null,
      usedBundledFallbackBecause: "validation-fixture-from-public-page",
      ...extraction.diagnostics,
      bookingUrlSource:
        extraction.diagnostics.productUrlFieldPath ??
        "generated:viator-search-product-code",
      fieldLevelFallbackUsed: false,
      fallbackFieldNames: [],
    },
    extracted: extraction.extracted,
  };

  const tour = mapViatorToEngine6Tour(payload);
  const card = toEngine6Card(tour);
  const html = renderToString(createElement(Engine6TourPage, { tour }));
  const schema = buildEngine6SchemaGraph(tour);
  const graph = schema["@graph"] as Array<Record<string, unknown>>;
  const entityCoverage = [
    "BreadcrumbList",
    "WebPage",
    "Product",
    "TouristTrip",
    "Offer",
    ...(graph.some(node => node["@type"] === "AggregateRating")
      ? ["AggregateRating"]
      : []),
    ...(graph.some(node => node["@type"] === "FAQPage") ? ["FAQPage"] : []),
  ];

  const pageRenderSucceeded =
    html.includes(tour.title) &&
    html.includes(tour.bookingUrl) &&
    !html.includes("img.test") &&
    !html.includes("viator.test") &&
    !html.includes(">ENGINE6<");
  const cardRenderSucceeded =
    card.href === tour.pagePath &&
    card.imageUrl === tour.cardImageUrl &&
    !card.href.includes("east-zion-top-of-the-world-jeep-tour") &&
    !card.imageUrl.includes("img.test");
  const bookingAttributionIsValid =
    tour.bookingUrl.startsWith(fixture.publicUrl) &&
    tour.bookingUrl.includes("pid=P00290915") &&
    tour.bookingUrl.includes("mcid=42383") &&
    tour.bookingUrl.includes("medium=link");

  return {
    productCode: fixture.productCode,
    route: tour.pagePath,
    liveApiFetchSucceeded: false,
    pageRenderSucceeded,
    cardRenderSucceeded,
    heroResult: `${tour.heroImageUrl} (${tour.diagnostics.heroImageFieldPath ?? "no-field-path"})`,
    priceResult: `${tour.priceFormatted} via ${tour.diagnostics.commercialPriceFieldPath ?? "no-price-field"}`,
    ratingReviewResult: `${formatEngine6AggregateRating(tour.aggregateRating) ?? "n/a"} / ${tour.reviewCount ?? "n/a"}`,
    seoTitleResult: tour.seoTitle,
    metaDescriptionResult: tour.metaDescription,
    jsonLdEntityCoverage: entityCoverage,
    bookingAttributionResult: bookingAttributionIsValid
      ? tour.bookingUrl
      : `INVALID: ${tour.bookingUrl}`,
    diagnostics: {
      source: payload.source,
      heroSource: tour.diagnostics.imageSourceUsed,
      heroImageFieldPath: tour.diagnostics.heroImageFieldPath,
      priceSource: tour.diagnostics.priceSourceUsed,
      commercialPriceFieldPath: tour.diagnostics.commercialPriceFieldPath,
      ratingFieldPath: tour.diagnostics.ratingFieldPath,
      reviewCountFieldPath: tour.diagnostics.reviewCountFieldPath,
      overviewFieldPath: tour.diagnostics.overviewFieldPath,
      highlightsFieldPath: tour.diagnostics.highlightsFieldPath,
      itineraryFieldPath: tour.diagnostics.itineraryFieldPath,
      faqsFieldPath: tour.diagnostics.faqsFieldPath,
      bookingUrlSource: tour.diagnostics.bookingUrlSource,
      fieldLevelFallbackUsed: tour.diagnostics.fieldLevelFallbackUsed,
      fallbackFieldNames: tour.diagnostics.fallbackFieldNames,
    },
    remainingEngineWideIssue:
      bookingAttributionIsValid && cardRenderSucceeded && pageRenderSucceeded
        ? null
        : "Engine6 still has route/booking/render generalization issues.",
  };
};
