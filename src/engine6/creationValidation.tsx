import { renderToString } from "react-dom/server";

import { ENGINE6_APPROVED_PLACEHOLDER_IMAGE } from "../../api/engine6/heroResolver";
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
import { resolveEngine6PathForProductCode } from "./routes";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import type { Engine6Tour } from "./types";

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
}: {
  tour: Engine6Tour;
  rawPayload: Record<string, unknown>;
}) => {
  const violations: string[] = [];
  const { stateSlug, citySlug, slug } = parseStateCitySlug(tour.canonicalPath);
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
  const hasValidResolvedHero =
    typeof resolvedPrimaryHero === "string" &&
    resolvedPrimaryHero.startsWith("http") &&
    !resolvedPrimaryHero.includes("/hero.jpg");

  if (hasValidResolvedHero && tour.heroImageUrl !== resolvedPrimaryHero) {
    violations.push("resolved Engine6 hero is not used as winning hero");
  }
  if (
    hasValidResolvedHero &&
    tour.heroImageUrl === ENGINE6_APPROVED_PLACEHOLDER_IMAGE
  ) {
    violations.push(
      "placeholder hero used even though a valid resolved hero exists"
    );
  }

  if (card.imageUrl !== tour.heroImageUrl) {
    violations.push("detail hero and card hero diverged");
  }

  const expectedPath = resolveEngine6PathForProductCode(tour.productCode);
  if (expectedPath !== tour.canonicalPath) {
    violations.push("route ownership drifted from product-code contract");
  }

  if (
    !tour.bookingUrl.includes("pid=P00290915") ||
    !tour.bookingUrl.includes("mcid=42383")
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

  if (listingEntry) {
    if (!listingEntry.tour.heroImage?.trim()) {
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
    if (!filteredToursHtml.includes(tour.heroImageUrl.replace(/&/g, "&amp;"))) {
      violations.push("/tours filtered surface image differs from detail hero");
    }
    if (filteredToursHtml.includes('data-card-image-src=""')) {
      violations.push("/tours filtered surface emitted blank card image src");
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
  if (
    tour.itinerary.length < 2 &&
    structuredStopCount > 0 &&
    pageHtml.includes('data-testid="engine6-itinerary-timeline"')
  ) {
    violations.push(
      "timeline rendered without sufficient structured stop data"
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
  if (tour.priceFormatted && !tour.priceFormatted.startsWith("Starting at $")) {
    violations.push("visible price label lost Starting at minimum-price copy");
  }
  if (offerRecord?.priceCurrency !== "USD") {
    violations.push("Offer.priceCurrency missing or invalid");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(offerRecord?.priceValidUntil ?? ""))) {
    violations.push("Offer.priceValidUntil missing or invalid");
  }

  return { violations };
};
