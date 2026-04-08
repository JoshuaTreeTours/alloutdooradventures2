import { renderToString } from "react-dom/server";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { getStateCityOptions } from "../data/stateCityOptions";
import {
  getToursByCity,
  getToursByCityUnified,
  getToursByState,
} from "../data/tours";
import ToursLanding from "../pages/tours/ToursLanding";
import { toEngine6Card } from "./cards";
import Engine6TourPage from "./components/Engine6TourPage";
import {
  buildEngine6ParentCityToursPath,
  validateEngine6CanonicalRouteIntegrity,
} from "./routeIntegrity";
import { resolveEngine6PathForProductCode } from "./routes";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { assertEngine6FixtureSourceOfTruth } from "./sourceOfTruthPolicy";
import type { Engine6Tour } from "./types";
import type { Engine6ValidationFixture } from "./validationFixtures";

const parseStateCitySlug = (canonicalPath: string) => {
  const [, stateSlug = "", citySlug = "", slug = ""] =
    /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(canonicalPath) ??
    [];

  return { stateSlug, citySlug, slug };
};

const structuredStopCountFromPayload = (
  rawPayload: Record<string, unknown>
) => {
  const product = (rawPayload.product ?? rawPayload) as Record<string, unknown>;
  const itineraryItems = Array.isArray(product.itineraryItems)
    ? (product.itineraryItems as unknown[])
    : Array.isArray(
          (product.itinerary as Record<string, unknown> | undefined)
            ?.itineraryItems
        )
      ? ((product.itinerary as Record<string, unknown>)
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

const withFilteredToursHtml = (stateSlug: string, citySlug: string) => {
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
  (globalThis as { location?: { pathname: string; search: string } }).location =
    {
      pathname: "/tours",
      search: `?state=${stateSlug}&city=${citySlug}`,
    };

  const html = renderToString(<ToursLanding />);

  (globalThis as { window?: Window }).window = previousWindow;
  (
    globalThis as { location?: { pathname: string; search?: string } }
  ).location = previousLocation;

  return html;
};

export const validateEngine6CreationContract = ({
  tour,
  rawPayload,
  fixture,
}: {
  tour: Engine6Tour;
  rawPayload: Record<string, unknown>;
  fixture?: Engine6ValidationFixture;
}) => {
  if (fixture) {
    assertEngine6FixtureSourceOfTruth(fixture);
  }
  const violations: string[] = [];
  const { stateSlug, citySlug, slug } = parseStateCitySlug(tour.canonicalPath);
  const { violations: canonicalRouteViolations, parentCityToursPath } =
    validateEngine6CanonicalRouteIntegrity(tour);
  const pageHtml = renderToString(<Engine6TourPage tour={tour} />);
  const filteredToursHtml = withFilteredToursHtml(stateSlug, citySlug);
  const schema = buildEngine6SchemaGraph(tour);
  const graph = schema["@graph"] as Array<Record<string, unknown>>;
  const offer = graph.find(node => node["@type"] === "Offer");
  const product = graph.find(node => node["@type"] === "Product");
  const faqPage = graph.find(node => node["@type"] === "FAQPage") as
    | {
        mainEntity?: Array<{
          name?: string;
          acceptedAnswer?: { text?: string };
        }>;
      }
    | undefined;
  const card = toEngine6Card(tour);

  const extracted = extractEngine6Product(rawPayload);
  const firstImage = ((
    (extracted.product as Record<string, unknown>)?.media as
      | {
          images?: Array<{
            variants?:
              | Record<string, { url?: string }>
              | Array<{ url?: string }>;
          }>;
        }
      | undefined
  )?.images?.[0] ?? null) as {
    variants?: Record<string, { url?: string }> | Array<{ url?: string }>;
  } | null;
  const variantRecord =
    firstImage && firstImage.variants && !Array.isArray(firstImage.variants)
      ? firstImage.variants
      : null;
  const variantList =
    firstImage && Array.isArray(firstImage.variants)
      ? firstImage.variants
      : null;
  const resolvedPrimaryHero =
    variantRecord?.FULL?.url ??
    variantRecord?.LARGE?.url ??
    variantRecord?.MEDIUM?.url ??
    variantList?.[0]?.url ??
    null;
  const renderedItineraryItemCount = (
    pageHtml.match(/data-testid="engine6-itinerary-item"/g) ?? []
  ).length;
  const hasValidResolvedHero =
    typeof resolvedPrimaryHero === "string" &&
    resolvedPrimaryHero.startsWith("http") &&
    !resolvedPrimaryHero.includes("/hero.jpg");

  violations.push(...canonicalRouteViolations);

  if (hasValidResolvedHero && tour.heroImageUrl !== resolvedPrimaryHero) {
    violations.push("resolved Engine6 hero is not used as winning hero");
  }
  if (!tour.heroImageUrl?.trim()) {
    violations.push("resolved Engine6 hero is missing");
  }
  if (!tour.diagnostics.heroSourceProductCode?.trim()) {
    violations.push("hero provenance missing sourceProductCode");
  }
  if (!tour.diagnostics.heroSourceProductUrl?.trim()) {
    violations.push("hero provenance missing sourceProductUrl");
  }
  if (!tour.diagnostics.heroSourceFieldPath?.trim()) {
    violations.push("hero provenance missing sourceFieldPath");
  }
  if (!tour.diagnostics.heroHost?.trim()) {
    violations.push("hero provenance missing host");
  }
  if (
    tour.diagnostics.heroSourceFieldPath &&
    !tour.diagnostics.heroSourceFieldPath.startsWith("product.media.images")
  ) {
    violations.push("hero provenance field path must be product.media.images");
  }

  if (card.imageUrl !== tour.heroImageUrl) {
    violations.push("detail hero and card hero diverged");
  }
  if (tour.resolvedHero?.url && tour.heroImageUrl !== tour.resolvedHero.url) {
    violations.push("page/card/schema must use the same resolved hero object");
  }

  const expectedPath = resolveEngine6PathForProductCode(tour.productCode);
  if (expectedPath !== tour.canonicalPath) {
    violations.push("route ownership drifted from product-code contract");
  }

  const expectedParentCityToursPath = buildEngine6ParentCityToursPath(
    tour.canonicalPath
  );
  if (!expectedParentCityToursPath) {
    violations.push(
      "parent city tours route could not be derived from canonical path"
    );
  }
  if (!parentCityToursPath) {
    violations.push("parent city tours route is missing");
  }

  const hasInternalBookingPath = tour.bookingUrl.startsWith("/destinations/");
  if (
    !hasInternalBookingPath &&
    (!tour.bookingUrl.includes("pid=P00290915") ||
      !tour.bookingUrl.includes("mcid=42383"))
  ) {
    violations.push("booking CTA lost required Viator monetization parameters");
  }

  if ((offer as { url?: string } | undefined)?.url !== tour.bookingUrl) {
    violations.push("schema Offer.url drifted from resolved booking target");
  }
  if (
    (product as { url?: string } | undefined)?.url !==
    `https://www.alloutdooradventures.com${tour.canonicalPath}`
  ) {
    violations.push("schema Product.url drifted from local canonical URL");
  }

  const cityTours = getToursByCity(stateSlug, citySlug);
  const stateTours = getToursByState(stateSlug);
  const unifiedTours = getToursByCityUnified(stateSlug, citySlug);
  const listingEntry = unifiedTours.find(
    entry => entry.tour.productCode === tour.productCode
  );

  if (!cityTours.some(entry => entry.productCode === tour.productCode)) {
    violations.push("city listing did not include Engine6 tour");
  }
  if (!stateTours.some(entry => entry.productCode === tour.productCode)) {
    violations.push("state listing did not include Engine6 tour");
  }
  if (!listingEntry) {
    violations.push("unified listing did not include Engine6 tour");
  }

  const cityOptions = getStateCityOptions(stateSlug);
  if (!cityOptions.some(option => option.slug === citySlug)) {
    violations.push("city selector omitted city with valid Engine6 inventory");
  }
  if (!stateSlug || !citySlug || !cityOptions.length) {
    violations.push("parent city tours route is broken or missing");
  }

  if (listingEntry) {
    if (tour.heroImageUrl && !listingEntry.tour.heroImage?.trim()) {
      violations.push("unified listing emitted blank card image");
    }
    if (listingEntry.tour.heroImage !== tour.heroImageUrl) {
      violations.push("unified listing hero differs from detail hero");
    }
    if (listingEntry.href !== tour.canonicalPath) {
      violations.push("unified listing href differs from canonical path");
    }
    if (!filteredToursHtml.includes(tour.canonicalPath)) {
      violations.push("/tours filtered surface omitted Engine6 tour");
    }
    if (
      tour.heroImageUrl &&
      !filteredToursHtml.includes(tour.heroImageUrl.replace(/&/g, "&amp;"))
    ) {
      violations.push("/tours filtered surface image differs from detail hero");
    }
  }

  const extractedFields = extracted.extracted;
  if (extractedFields.title?.trim() && !tour.title.trim()) {
    violations.push("title missing despite API title");
  }
  if (extractedFields.city?.trim() && !tour.city.trim()) {
    violations.push("city missing despite API city");
  }
  if (extractedFields.state?.trim() && !tour.state.trim()) {
    violations.push("state missing despite API state");
  }
  if (extractedFields.overviewText?.trim() && !tour.overviewText?.trim()) {
    violations.push("overview missing despite API overview");
  }
  if (extractedFields.highlights.length > 0 && tour.highlights.length === 0) {
    violations.push("highlights missing despite API highlights");
  }
  if (extractedFields.included.length > 0 && tour.included.length === 0) {
    violations.push("included section missing despite API included content");
  }
  if (
    extractedFields.requirements.length > 0 &&
    tour.requirements.length === 0
  ) {
    violations.push("requirements missing despite API requirements");
  }
  if (extractedFields.faqs.length > 0 && tour.faqs.length === 0) {
    violations.push("faqs missing despite API faqs");
  }
  if (extractedFields.priceFormatted?.trim() && !tour.priceFormatted.trim()) {
    violations.push("price missing despite API price");
  }
  if (
    extractedFields.meetingPointText?.trim() &&
    !tour.meetingPointText.trim()
  ) {
    violations.push("meeting point missing despite API meeting point");
  }

  if (
    extractedFields.priceFormatted?.trim() &&
    !pageHtml.includes("<strong>Price:</strong>")
  ) {
    violations.push("above-fold price missing despite API price");
  }
  if (
    typeof extractedFields.aggregateRating === "number" &&
    typeof extractedFields.reviewCount === "number" &&
    !pageHtml.includes('data-testid="engine6-rating-summary"')
  ) {
    violations.push("above-fold rating/review count missing despite API values");
  }
  if (
    extractedFields.meetingPointText?.trim() &&
    !pageHtml.includes("<strong>Meeting point:</strong>")
  ) {
    violations.push("above-fold meeting point missing despite API meeting point");
  }

  if (parentCityToursPath) {
    const parentRouteHref = `href=\"${parentCityToursPath}\"`;
    if (!pageHtml.includes('data-testid="engine6-breadcrumbs"')) {
      violations.push("breadcrumb route surface missing");
    }
    if (!pageHtml.includes(parentRouteHref)) {
      violations.push(
        "breadcrumb city link does not resolve to parent city tours route"
      );
    }
    if (
      !pageHtml.includes('data-testid="engine6-back-to-tours"') ||
      !pageHtml.includes(parentRouteHref)
    ) {
      violations.push(
        "back-to-tours link does not resolve to parent city tours route"
      );
    }
    if (parentCityToursPath.includes("/united-states/")) {
      violations.push(
        "parent city tours route leaked to non-canonical state-level path"
      );
    }
  }

  const breadcrumbList = graph.find(node => node["@type"] === "BreadcrumbList") as
    | {
        itemListElement?: Array<{ position?: number; item?: string }>;
      }
    | undefined;
  const schemaParentCityItem = breadcrumbList?.itemListElement?.find(
    entry => entry.position === 3
  )?.item;
  if (parentCityToursPath && schemaParentCityItem) {
    const expectedSchemaParentUrl = `https://www.alloutdooradventures.com${parentCityToursPath}`;
    if (schemaParentCityItem !== expectedSchemaParentUrl) {
      violations.push(
        "schema breadcrumb city item drifted from parent city tours route"
      );
    }
  }

  const relatedTours = unifiedTours.filter(entry => {
    const sameProductCode =
      Boolean(entry.tour.productCode) &&
      entry.tour.productCode?.toUpperCase() === tour.productCode.toUpperCase();
    return !sameProductCode && entry.tour.slug !== slug;
  });

  if (relatedTours.length >= 2) {
    if (!pageHtml.includes('data-testid="engine6-related-tours"')) {
      violations.push(
        "related tours section missing despite same-city inventory"
      );
    }
    if (
      relatedTours.some(entry => entry.tour.productCode === tour.productCode)
    ) {
      violations.push("related tours contains current tour");
    }
  }

  const structuredStopCount = structuredStopCountFromPayload(rawPayload);
  if (
    tour.itinerary.length >= 2 &&
    !pageHtml.includes('data-testid="engine6-itinerary-timeline"')
  ) {
    violations.push("structured itinerary degraded from timeline rendering");
  }
  if (structuredStopCount >= 2 && tour.itinerary.length < 2) {
    violations.push(
      "structured itinerary was dropped despite reliable source stop data"
    );
  }
  if (
    tour.itinerary.length < 2 &&
    structuredStopCount > 0 &&
    pageHtml.includes('data-testid="engine6-itinerary-timeline"')
  ) {
    violations.push(
      "timeline rendered without sufficient structured stop data"
    );
  }
  if (structuredStopCount > 0 && renderedItineraryItemCount !== tour.itinerary.length) {
    violations.push("itinerary length parity mismatch between mapped and rendered stops");
  }
  if (
    extractedFields.itinerary.length > 0 &&
    tour.itinerary.some(
      (item, index) =>
        extractedFields.itinerary[index] &&
        (Boolean(extractedFields.itinerary[index]?.stopType) !==
          Boolean(item.stopType) ||
          Boolean(extractedFields.itinerary[index]?.duration) !==
            Boolean(item.duration) ||
          Boolean(extractedFields.itinerary[index]?.admissionNote) !==
            Boolean(item.admissionNote))
    )
  ) {
    violations.push(
      "itinerary field depth mismatch (stopType/duration/admission) between API extraction and rendered tour object"
    );
  }
  if (
    tour.itinerary.length < 2 &&
    tour.itinerarySummaryText &&
    !pageHtml.includes('data-testid="engine6-itinerary-summary-only"')
  ) {
    violations.push(
      "summary-only itinerary missing explicit summary rendering"
    );
  }

  const tripNode = graph.find(node => node["@type"] === "TouristTrip") as
    | { itinerary?: unknown }
    | undefined;
  if (tour.itinerary.length >= 2 && !tripNode?.itinerary) {
    violations.push("schema itinerary missing while visible itinerary is present");
  }
  if (tour.itinerary.length < 2 && tripNode?.itinerary) {
    violations.push("schema itinerary present while visible itinerary is absent");
  }

  if (tour.faqs.length > 0) {
    if (!faqPage) {
      violations.push("FAQ schema missing while FAQs are visible");
    } else {
      const schemaQuestions = (faqPage.mainEntity ?? []).map(item => item.name);
      const visibleQuestions = tour.faqs.map(item => item.question);
      if (
        JSON.stringify(schemaQuestions) !== JSON.stringify(visibleQuestions)
      ) {
        violations.push("FAQ schema questions diverged from visible FAQs");
      }
    }
  }

  const offerRecord = offer as
    | { price?: number; priceCurrency?: string; priceValidUntil?: string }
    | undefined;
  if (tour.priceAmount != null && offerRecord?.price !== tour.priceAmount) {
    violations.push("Offer.price diverged from Starting at minimum price");
  }
  if (
    tour.priceFormatted &&
    !tour.priceFormatted.startsWith("Starting at $")
  ) {
    violations.push("visible price label lost Starting at minimum-price copy");
  }
  if (offerRecord?.priceCurrency !== "USD") {
    violations.push("Offer.priceCurrency missing or invalid");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(offerRecord?.priceValidUntil ?? ""))) {
    violations.push("Offer.priceValidUntil missing or invalid");
  }
  if (
    typeof tour.aggregateRating === "number" &&
    typeof tour.reviewCount === "number" &&
    !/^★\s+\d(?:\.\d)?\s+\(\d+\)$/.test(card.ratingLabel)
  ) {
    violations.push("city card rating label missing ★ rating (count) format");
  }
  if (
    typeof tour.priceAmount === "number" &&
    !/^Starting at \$/.test(card.priceLabel)
  ) {
    violations.push("city card price label missing Starting at $price format");
  }
  if (card.imageUrl !== tour.resolvedHero?.url) {
    violations.push("card hero did not use authoritative resolved hero");
  }
  if (
    (product as { image?: string } | undefined)?.image !== tour.resolvedHero?.url
  ) {
    violations.push("schema hero did not use authoritative resolved hero");
  }

  return { violations };
};
