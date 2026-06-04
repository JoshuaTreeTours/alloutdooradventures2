import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

import Image from "../../../../components/Image";
import Seo from "../../../../components/Seo";
import TourCard from "../../../../components/TourCard";
import { useStructuredData } from "../../../../components/StructuredDataProvider";
import { getCityBySlugs, getStateBySlug } from "../../../../data/destinations";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../../../data/tourFallbacks";
import {
  getAffiliateDisclosure,
  getCityTourDetailPath,
  getTourBookingPath,
  getToursByCity,
  getTourBySlugs,
} from "../../../../data/tours";
import {
  flagstaffTours,
  getFlagstaffTourBySlug,
  getFlagstaffTourDetailPath,
  getFlagstaffTourSlug,
} from "../../../../data/flagstaffTours";
import { getExpandedTourDescription } from "../../../../data/tourNarratives";
import { resolveHeroImageForRoute } from "../../../../utils/hero";
import { buildTourMeta } from "../../../../lib/tourMeta";
import {
  buildBreadcrumbList,
  buildTourProductNodeId,
  buildTourProductStructuredData,
  buildTourTripStructuredData,
  buildWebPageStructuredData,
  getSiteStructuredDataNodes,
  resolveCanonicalProductUrl,
  resolveOfferUrl,
  SITE_BRAND_ID,
  SITE_ORGANIZATION_ID,
  SITE_WEBSITE_ID,
} from "../../../../utils/structuredData";
import {
  buildTourSchemaGraph,
  ENABLE_TOUR_SCHEMA_V1,
} from "../../../../schema/buildTourSchemaGraph";
import { getEngine2TourBySlug } from "../../../../engine2/data/loadEngine2";
import Engine2TourPage from "../../../../engine2/pages/Engine2TourPage";
import Engine3TourPage from "../../../../engine3/components/Engine3TourPage";
import { mapViatorToEngine3ViewModel } from "../../../../engine3/viator/mapViatorToEngine3ViewModel";
import { viatorProductCacheByCode } from "../../../../engine3/data/viatorProductCache";
import { getEngine3TourBySlugs } from "../../../../engine3/routing";
import { getEngine4TourBySlugs } from "../../../../engine4/routing";
import { getLegacyFhMigratedTourBySlugs } from "../../../../engine6/legacyFh/registry";
import Engine6TourPage from "../../../../engine6/components/Engine6TourPage";
import { getEngine6NativeTourByCanonicalPath } from "../../../../engine6/registry";
import type {
  Engine6ApiResponse,
  Engine6Tour,
} from "../../../../engine6/types";
import { isExcludedProductCode } from "../../../../data/excludedProductCodes";
import { isEngine6CanonicalPath } from "../../../../engine6/routes";
import { buildEngine6SchemaGraph } from "../../../../engine6/schema/buildEngine6SchemaGraph";
import { mergeEngine6LiveFieldsIntoTour } from "../../../../engine6/liveProductFields";
import { isEngine6ItinerarySectionSuppressed } from "../../../../engine6/mapViatorToEngine6Tour";
import {
  assertEngine6CtaIntegrity,
  assertEngine6DataSource,
  assertEngine6ImageDeterminism,
  assertEngine6NoFallbackContamination,
  assertEngine6RendererSupremacy,
} from "../../../../engine6/hardening";
import { mapViatorToEngine4Tour } from "../../../../engine4/viator/mapViatorToEngine4Tour";
import Engine4TourPage from "../../../../engine4/components/Engine4TourPage";
import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../../../../engine4/data/viatorTours";
import {
  ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE,
  hasViatorNonZeroPrice,
  mapEngine5ProductPayloadToEngine4ApiTour,
  resolve421920P2BridgeApiTour,
  type Engine4BridgeRuntimeSource,
} from "../../../../engine4/viator/engine5Bridge421920P2";
import type { Engine4ViatorApiTour } from "../../../../engine4/types";
import { isPalmSpringsTour } from "../../../../utils/fh/palmSpringsPilotContent";
import { isRemovedTourSlug } from "../../../../utils/tours/isTourRemoved";
import { applyEngine1Template } from "../../../../utils/tours/applyEngine1HardenedTemplate";
import { fetchFareHarborHtml } from "../../../../utils/fh/fetchFareHarborHtml";
import { parseFareHarborHtml } from "../../../../utils/fh/parseFareHarborHtml";
import { formatStartingPrice } from "../../../../lib/pricing";
import RemovedTourGone from "../../../RemovedTourGone";
import { extractViatorProductCode } from "../../../../utils/viator/extractViatorProductCode";
import {
  getViatorFromPrice,
  peekViatorFromPriceCache,
} from "../../../../server/viator/getViatorFromPrice";

type CityTourDetailRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
    tourSlug: string;
  };
};

export default function CityTourDetailRoute({
  params,
}: CityTourDetailRouteProps) {
  const synthesizeItinerarySentence = (args: {
    title: string;
    duration: string | null;
    stopType: "stop" | "pass-by";
  }) => {
    const { title, duration, stopType } = args;
    const normalizedTitle = title.toLowerCase();
    const durationClause = duration ? ` in about ${duration}` : "";

    if (/tunnel view/i.test(normalizedTitle)) {
      return "Tunnel View frames Yosemite Valley with broad granite and waterfall vistas from a classic overlook.";
    }
    if (/glacier point/i.test(normalizedTitle)) {
      return "Glacier Point overlooks Yosemite Valley from a high granite promontory with wide alpine panoramas.";
    }
    if (/el capitan/i.test(normalizedTitle)) {
      return "El Capitan towers above Yosemite Valley as a sheer granite wall central to the park’s climbing heritage.";
    }
    if (/half dome/i.test(normalizedTitle)) {
      return "Half Dome stands out as Yosemite’s most recognizable granite summit above the valley skyline.";
    }
    if (
      /bridalveil/i.test(normalizedTitle) ||
      /waterfall|fall trail/i.test(normalizedTitle)
    ) {
      return `${title} highlights Yosemite’s glacially carved valley and cascading water features${durationClause}.`;
    }
    if (/valley view/i.test(normalizedTitle)) {
      return "Valley View captures a broad river-level perspective of Yosemite’s granite cliffs and forested valley floor.";
    }
    if (/sequoia|grove/i.test(normalizedTitle)) {
      return `${title} features giant sequoia habitat and classic Sierra Nevada forest terrain${durationClause}.`;
    }
    if (/village|store|historic building|picnic area/i.test(normalizedTitle)) {
      return `${title} adds local park context with a practical stop inside Yosemite Valley${durationClause}.`;
    }

    return stopType === "pass-by"
      ? `${title} is viewed along the route with destination context${durationClause}.`
      : `${title} provides a focused Yosemite stop with landscape context${durationClause}.`;
  };

  const [strictBridgeApiTour, setStrictBridgeApiTour] =
    useState<Engine4ViatorApiTour>();
  const [strictBridgeSource, setStrictBridgeSource] =
    useState<Engine4BridgeRuntimeSource>();
  const [liveEngine6DynamicByProductCode, setLiveEngine6DynamicByProductCode] =
    useState<
      Record<
        string,
        {
          priceAmount: number | null;
          priceFormatted: string | null;
          aggregateRating: number | null;
          reviewCount: number | null;
          durationText: string | null;
          meetingPointText: string | null;
          overviewText: string | null;
          itinerary: Engine6Tour["itinerary"] | null;
          itinerarySummaryText: string | null;
          included: string[] | null;
          requirements: string[] | null;
        }
      >
    >({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const engine4RouteTour = getEngine4TourBySlugs(
      params.stateSlug,
      params.citySlug,
      params.tourSlug
    );
    if (
      !engine4RouteTour ||
      engine4RouteTour.bookingProvider !== "viator" ||
      engine4RouteTour.id.toUpperCase() !==
        ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE
    ) {
      return;
    }

    let isDisposed = false;
    const productCode = engine4RouteTour.id.toUpperCase();

    (async () => {
      try {
        const response = await fetch(
          `/api/engine5/viator-product?productCode=${encodeURIComponent(productCode)}`
        );
        const payload = (await response.json()) as Record<string, unknown>;

        if (!response.ok) {
          if (!isDisposed) {
            setStrictBridgeSource("cached-engine4-fallback");
          }
          return;
        }

        const mapped = mapEngine5ProductPayloadToEngine4ApiTour({
          productCode,
          payload,
        });
        const runtimeSource = response.headers
          .get("X-Engine5-Source")
          ?.includes("bundled")
          ? "bundled-fallback"
          : "live-api";

        if (!mapped) {
          if (!isDisposed) {
            setStrictBridgeSource("cached-engine4-fallback");
          }
          return;
        }

        if (!isDisposed) {
          setStrictBridgeApiTour(mapped);
          setStrictBridgeSource(runtimeSource);
        }
      } catch (error: any) {
        if (!isDisposed) {
          setStrictBridgeSource("cached-engine4-fallback");
        }
      }
    })();

    return () => {
      isDisposed = true;
    };
  }, [params.citySlug, params.stateSlug, params.tourSlug]);

  const isFHPilotEnabled =
    typeof process !== "undefined" &&
    process.env.ENABLE_FH_CONTENT_PILOT_PALM_SPRINGS === "true";

  const routeProductCode =
    params.tourSlug.split("-").at(-1)?.toUpperCase() ?? null;

  if (isExcludedProductCode(routeProductCode)) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tour not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that tour. Head back to the tours list to keep
          exploring.
        </p>
      </main>
    );
  }

  if (isRemovedTourSlug(params.tourSlug)) {
    return (
      <RemovedTourGone
        cityToursPath={`/destinations/${params.stateSlug}/${params.citySlug}/tours`}
      />
    );
  }

  const requestedPath = `/destinations/${params.stateSlug}/${params.citySlug}/tours/${params.tourSlug}`;

  const migratedLegacyEngine6Tour = getLegacyFhMigratedTourBySlugs(
    params.stateSlug,
    params.citySlug,
    params.tourSlug
  );

  const nativeEngine6Tour = getEngine6NativeTourByCanonicalPath(requestedPath);
  const nativeTourListingEntry = getTourBySlugs(
    params.stateSlug,
    params.citySlug,
    params.tourSlug
  );

  useEffect(() => {
    if (typeof window === "undefined" || !nativeEngine6Tour?.productCode) {
      return;
    }

    let cancelled = false;
    const productCode = nativeEngine6Tour.productCode;
    const suppressLiveContentFields =
      isEngine6ItinerarySectionSuppressed(productCode);

    fetch(
      `/api/engine6/viator-product?productCode=${encodeURIComponent(productCode)}`
    )
      .then(async response => {
        if (!response.ok) {
          return null;
        }
        const payload = (await response.json()) as Partial<Engine6ApiResponse>;
        const extracted = payload?.extracted;
        if (!extracted) return null;
        return {
          priceAmount:
            typeof extracted.priceAmount === "number"
              ? extracted.priceAmount
              : null,
          priceFormatted:
            typeof extracted.priceFormatted === "string"
              ? extracted.priceFormatted
              : null,
          aggregateRating:
            typeof extracted.aggregateRating === "number"
              ? extracted.aggregateRating
              : null,
          reviewCount:
            typeof extracted.reviewCount === "number"
              ? extracted.reviewCount
              : null,
          durationText:
            typeof extracted.durationText === "string"
              ? extracted.durationText
              : null,
          meetingPointText:
            typeof extracted.meetingPointText === "string"
              ? extracted.meetingPointText
              : null,
          overviewText:
            !suppressLiveContentFields &&
            typeof extracted.overviewText === "string"
              ? extracted.overviewText
              : null,
          itinerary:
            !suppressLiveContentFields && Array.isArray(extracted.itinerary)
              ? (extracted.itinerary
                  .map(item => {
                    if (!item || typeof item !== "object") return null;
                    const record = item as Record<string, unknown>;
                    const title =
                      typeof record.title === "string" &&
                      record.title.trim().length > 0
                        ? record.title.trim()
                        : "This stop";
                    const duration =
                      typeof record.duration === "string" &&
                      record.duration.trim().length > 0
                        ? record.duration.trim()
                        : null;
                    const stopType =
                      record.stopType === "pass-by" ? "pass-by" : "stop";
                    const sourceDescription =
                      typeof record.description === "string"
                        ? record.description.trim()
                        : "";
                    const oneSentenceDescription =
                      sourceDescription.length > 0
                        ? sourceDescription
                        : synthesizeItinerarySentence({
                            title,
                            duration,
                            stopType,
                          });

                    return {
                      ...record,
                      title,
                      ...(duration ? { duration } : {}),
                      stopType,
                      description: oneSentenceDescription
                        .replace(/\s+/g, " ")
                        .replace(/\.\./g, ".")
                        .trim(),
                    };
                  })
                  .filter((item): item is Engine6Tour["itinerary"][number] =>
                    Boolean(item)
                  ) as Engine6Tour["itinerary"])
              : null,
          itinerarySummaryText:
            !suppressLiveContentFields &&
            typeof extracted.itinerarySummaryText === "string"
              ? extracted.itinerarySummaryText
              : null,
          included: Array.isArray(extracted.included)
            ? extracted.included.filter(
                (item): item is string =>
                  typeof item === "string" && item.trim().length > 0
              )
            : null,
          requirements: Array.isArray(extracted.requirements)
            ? extracted.requirements.filter(
                (item): item is string =>
                  typeof item === "string" && item.trim().length > 0
              )
            : null,
        };
      })
      .then(dynamicFields => {
        if (cancelled || !dynamicFields) return;
        setLiveEngine6DynamicByProductCode(previous => ({
          ...previous,
          [productCode]: dynamicFields,
        }));
      })
      .catch(() => {
        // Keep fixture values when live API enrichment is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [nativeEngine6Tour?.productCode]);

  if (nativeEngine6Tour) {
    const liveDynamic =
      liveEngine6DynamicByProductCode[nativeEngine6Tour.productCode];
    const suppressLiveContentFields = isEngine6ItinerarySectionSuppressed(
      nativeEngine6Tour.productCode
    );
    const resolvedEngine6Tour: Engine6Tour = liveDynamic
      ? {
          ...nativeEngine6Tour,
          priceAmount:
            liveDynamic.priceAmount !== null
              ? liveDynamic.priceAmount
              : nativeEngine6Tour.priceAmount,
          priceFormatted:
            liveDynamic.priceFormatted ?? nativeEngine6Tour.priceFormatted,
          aggregateRating:
            liveDynamic.aggregateRating !== null
              ? liveDynamic.aggregateRating
              : nativeEngine6Tour.aggregateRating,
          reviewCount:
            liveDynamic.reviewCount !== null
              ? liveDynamic.reviewCount
              : nativeEngine6Tour.reviewCount,
          durationText:
            liveDynamic.durationText ?? nativeEngine6Tour.durationText,
          meetingPointText:
            liveDynamic.meetingPointText ?? nativeEngine6Tour.meetingPointText,
          overviewText: suppressLiveContentFields
            ? nativeEngine6Tour.overviewText
            : (liveDynamic.overviewText ?? nativeEngine6Tour.overviewText),
          itinerary: suppressLiveContentFields
            ? nativeEngine6Tour.itinerary
            : (liveDynamic.itinerary ?? nativeEngine6Tour.itinerary),
          itinerarySummaryText: suppressLiveContentFields
            ? nativeEngine6Tour.itinerarySummaryText
            : (liveDynamic.itinerarySummaryText ??
              nativeEngine6Tour.itinerarySummaryText),
          included: liveDynamic.included ?? nativeEngine6Tour.included,
          requirements:
            liveDynamic.requirements ?? nativeEngine6Tour.requirements,
        }
      : nativeEngine6Tour;

    assertEngine6RendererSupremacy({
      tourEngine: "engine6",
      renderer: "engine6",
    });
    assertEngine6DataSource("engine6-native");
    assertEngine6NoFallbackContamination({
      heroUrl: nativeEngine6Tour.heroImageUrl,
      usesLegacyGallery: false,
      usesLegacyRenderer: false,
    });
    assertEngine6CtaIntegrity({
      ctaOwner: nativeEngine6Tour.ownership.ctaOwner,
      ctaUrl: nativeEngine6Tour.bookingUrl,
    });

    const schema = buildEngine6SchemaGraph(resolvedEngine6Tour);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const product = graph.find(node => node["@type"] === "Product");
    const schemaImage = (product as { image?: string | string[] } | undefined)
      ?.image;
    const primarySchemaImage = Array.isArray(schemaImage)
      ? schemaImage[0]
      : schemaImage;

    assertEngine6ImageDeterminism({
      heroImage: nativeEngine6Tour.heroImageUrl,
      cardImage:
        nativeTourListingEntry?.engine === "engine6"
          ? nativeTourListingEntry.heroImage
          : resolvedEngine6Tour.heroImageUrl,
      schemaImage: primarySchemaImage,
    });

    return <Engine6TourPage tour={resolvedEngine6Tour} />;
  }

  if (migratedLegacyEngine6Tour) {
    assertEngine6RendererSupremacy({
      tourEngine: "legacy-fh-migrated",
      renderer: "engine6",
    });
    assertEngine6CtaIntegrity({
      ctaOwner: migratedLegacyEngine6Tour.ownership.ctaOwner,
      ctaUrl: migratedLegacyEngine6Tour.bookingUrl,
    });
    return <Engine6TourPage tour={migratedLegacyEngine6Tour} />;
  }

  if (isEngine6CanonicalPath(requestedPath)) {
    throw new Error(
      `Engine6 canonical route must resolve natively and must not fall through: ${requestedPath}`
    );
  }

  const engine2Tour =
    getEngine2TourBySlug(params.stateSlug, params.citySlug, params.tourSlug) ??
    getEngine3TourBySlugs(params.stateSlug, params.citySlug, params.tourSlug) ??
    getEngine4TourBySlugs(params.stateSlug, params.citySlug, params.tourSlug);

  if (engine2Tour) {
    if (
      engine2Tour.engine === "engine4" &&
      engine2Tour.bookingProvider === "viator"
    ) {
      const productCode = engine2Tour.id.toUpperCase();
      const tourRecord = engine4ViatorTours.find(
        entry => entry.productCode.toUpperCase() === productCode
      );

      if (!tourRecord) {
        return null;
      }

      return (() => {
        const cachedFallback =
          engine4ViatorApiFallbackByProductCode[productCode];
        const resolvedBridge = resolve421920P2BridgeApiTour({
          productCode,
          runtimeApiTour: strictBridgeApiTour,
          runtimeSource: strictBridgeSource,
          cachedFallbackApiTour: cachedFallback,
        });

        const hasPrice = hasViatorNonZeroPrice(
          resolvedBridge.apiTour?.fromPrice
        );

        if (
          productCode === ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE &&
          !hasPrice
        ) {
          return (
            <main className="mx-auto max-w-4xl px-6 py-16">
              <h1 className="text-2xl font-semibold text-[#1f2a1f]">
                Pricing temporarily unavailable
              </h1>
              <p className="mt-4 text-[#334433]">
                We couldn&apos;t load valid pricing for this tour right now.
                Please try again shortly.
              </p>
            </main>
          );
        }

        const mappedTour = mapViatorToEngine4Tour({
          record: tourRecord,
          apiTour: resolvedBridge.apiTour,
        });

        if (
          productCode === ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE &&
          !hasViatorNonZeroPrice(mappedTour.facts.priceFrom)
        ) {
          return (
            <main className="mx-auto max-w-4xl px-6 py-16">
              <h1 className="text-2xl font-semibold text-[#1f2a1f]">
                Pricing temporarily unavailable
              </h1>
              <p className="mt-4 text-[#334433]">
                Tour details loaded, but a valid non-zero price is not currently
                available.
              </p>
            </main>
          );
        }

        return <Engine4TourPage tour={mappedTour} />;
      })();
    }

    if (
      engine2Tour.engine === "engine3" &&
      engine2Tour.bookingProvider === "viator"
    ) {
      const productData = viatorProductCacheByCode[engine2Tour.id];
      return (
        <Engine3TourPage
          tour={mapViatorToEngine3ViewModel(engine2Tour, productData)}
        />
      );
    }

    const isPsp = isPalmSpringsTour(engine2Tour);
    if (isPsp && typeof window === "undefined") {
      console.info(
        `[FHPilot] enabled=${isFHPilotEnabled ? "enabled" : "disabled"} eligible=${isPsp ? "eligible" : "not eligible"} bookingUrl=${engine2Tour.bookingUrl ? "found" : "missing"}`
      );
    }
    return (
      <Engine2TourPage tour={engine2Tour} isFHPilotEnabled={isFHPilotEnabled} />
    );
  }

  const state =
    getStateBySlug(params.stateSlug) ??
    getFallbackStateBySlug(params.stateSlug);
  const city =
    getCityBySlugs(params.stateSlug, params.citySlug) ??
    getFallbackCityBySlugs(params.stateSlug, params.citySlug);

  const isFlagstaff = Boolean(
    state && city && state.slug === "arizona" && city.slug === "flagstaff"
  );
  const tour =
    state && city
      ? isFlagstaff
        ? getFlagstaffTourBySlug(params.tourSlug)
        : getTourBySlugs(state.slug, city.slug, params.tourSlug)
      : null;
  const canonicalUrl =
    tour && isFlagstaff
      ? getFlagstaffTourDetailPath(tour)
      : tour
        ? getCityTourDetailPath(tour)
        : "";
  const heroImage =
    resolveHeroImageForRoute({
      route: canonicalUrl,
      tour,
    }) ?? undefined;
  const baseStructuredImages = heroImage ? [heroImage] : [];
  const bookingUrl = tour ? getTourBookingPath(tour) : "";
  const seoDescription = tour
    ? buildTourMeta(tour, canonicalUrl).description
    : undefined;
  const productDescription = tour
    ? getExpandedTourDescription(tour)[0]
    : undefined;
  const cityHref =
    state && city
      ? state.isFallback
        ? `/destinations/${state.slug}/${city.slug}`
        : `/destinations/states/${state.slug}/cities/${city.slug}`
      : "";
  const stateHref = state
    ? state.isFallback
      ? `/destinations/${state.slug}`
      : `/destinations/states/${state.slug}`
    : "";
  const toursHref =
    state && city ? `/destinations/${state.slug}/${city.slug}/tours` : "";
  const fareHarborParsed = useMemo(() => {
    if (!tour || tour.bookingProvider !== "fareharbor") {
      return null;
    }
    const fareHarborHtml = fetchFareHarborHtml(tour.bookingUrl);
    return fareHarborHtml ? parseFareHarborHtml(fareHarborHtml) : null;
  }, [tour]);

  const viatorProductCode = extractViatorProductCode(tour?.bookingUrl);
  const viatorFromPrice = viatorProductCode
    ? peekViatorFromPriceCache(viatorProductCode, "USD")
    : null;

  if (typeof window === "undefined" && viatorProductCode) {
    void getViatorFromPrice(viatorProductCode, "USD");
  }

  const hardenedTemplate = tour
    ? applyEngine1Template(tour, {
        parsedFareHarbor: fareHarborParsed ?? undefined,
      })
    : null;

  const structuredImages = baseStructuredImages;

  const structuredDataNodes = useMemo(() => {
    if (!tour || !canonicalUrl) {
      return null;
    }
    const canonicalProductUrl = resolveCanonicalProductUrl(canonicalUrl);
    const productNodeId = buildTourProductNodeId(tour.id);
    const offerUrl = resolveOfferUrl({
      canonicalUrl: canonicalProductUrl,
      partnerBookingUrl: bookingUrl,
    });

    const tourSchemaNodes = ENABLE_TOUR_SCHEMA_V1
      ? (buildTourSchemaGraph({
          url: canonicalUrl,
          pageName: tour.title,
          pageDescription: seoDescription ?? productDescription ?? "",
          heroImage,
          derivedImages: structuredImages,
          place: {
            city: tour.destination.city,
            region: tour.destination.state,
            regionCode: undefined,
            countryCode: tour.destination.countryCode ?? "US",
            lat: tour.destination.lat,
            lng: tour.destination.lng,
          },
          product: {
            id: productNodeId,
            name: tour.title,
            description:
              hardenedTemplate?.schemaDescription ??
              productDescription ??
              seoDescription ??
              "",
            category: tour.primaryCategory,
          },
          trip: {
            id: `${canonicalUrl}#trip`,
            name: tour.title,
            description:
              hardenedTemplate?.schemaDescription ??
              productDescription ??
              seoDescription ??
              "",
            duration: hardenedTemplate?.durationISO ?? tour.badges.duration,
            touristType: "Adventure travelers",
            departureLocation: null,
            itinerary: hardenedTemplate
              ? {
                  "@type": "ItemList",
                  itemListElement: hardenedTemplate.itinerary.map(
                    (step, index) => ({
                      "@type": "ListItem",
                      position: index + 1,
                      name: step,
                    })
                  ),
                }
              : null,
          },
          offers: {
            url: offerUrl,
            lowPrice: undefined,
            highPrice: undefined,
            price:
              viatorProductCode && tour.bookingProvider === "viator"
                ? viatorFromPrice && Number.isFinite(viatorFromPrice.price)
                  ? viatorFromPrice.price
                  : undefined
                : tour.startingPrice,
            priceCurrency:
              viatorProductCode && tour.bookingProvider === "viator"
                ? "USD"
                : (tour.currency ?? "USD"),
            availability: "https://schema.org/InStock",
            offerCount: null,
          },
          brandOrgIds: {
            orgId: SITE_ORGANIZATION_ID,
            brandId: SITE_BRAND_ID,
            websiteId: SITE_WEBSITE_ID,
          },
        })["@graph"] as Record<string, unknown>[])
      : [
          buildWebPageStructuredData({
            url: canonicalUrl,
            name: tour.title,
            description: seoDescription,
            image: heroImage,
            mainEntityId: productNodeId,
          }),
          buildTourProductStructuredData({
            tour,
            detailUrl: canonicalUrl,
            productNodeId,
            description: productDescription,
            images: structuredImages.length ? structuredImages : undefined,
          }),
          buildTourTripStructuredData({
            tour,
            detailUrl: canonicalUrl,
            productNodeId,
            description: productDescription,
            images: structuredImages.length ? structuredImages : undefined,
          }),
        ];

    const faqNode = hardenedTemplate?.faqs?.length
      ? {
          "@type": "FAQPage",
          "@id": `${canonicalUrl}#faqpage`,
          mainEntityOfPage: canonicalProductUrl,
          mainEntity: hardenedTemplate.faqs.map(item => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

    return [
      ...getSiteStructuredDataNodes(),
      ...tourSchemaNodes,
      ...(faqNode ? [faqNode] : []),
      buildBreadcrumbList([
        { name: "Destinations", url: "/destinations" },
        ...(stateHref ? [{ name: state?.name ?? "", url: stateHref }] : []),
        ...(cityHref ? [{ name: city?.name ?? "", url: cityHref }] : []),
        ...(toursHref ? [{ name: "Tours", url: toursHref }] : []),
        { name: tour.title, url: canonicalUrl },
      ]),
    ];
  }, [
    bookingUrl,
    canonicalUrl,
    city?.name,
    cityHref,
    heroImage,
    seoDescription,
    productDescription,
    state?.name,
    stateHref,
    structuredImages,
    hardenedTemplate,
    viatorProductCode,
    viatorFromPrice,
    tour,
    toursHref,
  ]);

  const experienceParagraphs = hardenedTemplate?.overviewParagraphs?.length
    ? hardenedTemplate.overviewParagraphs
    : tour
      ? getExpandedTourDescription(tour)
      : [];

  useStructuredData(structuredDataNodes);

  if (!state || !city) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tour not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that city. Head back to destinations to keep
          exploring.
        </p>
      </main>
    );
  }

  if (!tour) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tour not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that tour. Head back to the tours list to keep
          exploring.
        </p>
        <div className="mt-6">
          <Link href={toursHref}>
            <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]">
              Back to tours
            </a>
          </Link>
        </div>
      </main>
    );
  }

  const tourSlug = isFlagstaff ? getFlagstaffTourSlug(tour) : tour.slug;
  const seoMeta = buildTourMeta(tour, canonicalUrl);
  const relatedTours = (
    isFlagstaff
      ? flagstaffTours
      : getToursByCity(state.slug, city.slug).map(item =>
          item.engine === "engine6" && item.productCode
            ? mergeEngine6LiveFieldsIntoTour(
                item,
                liveEngine6DynamicByProductCode[item.productCode]
              )
            : item
        )
  ).filter(item =>
    isFlagstaff
      ? getFlagstaffTourSlug(item) !== tourSlug
      : item.slug !== tour.slug
  );
  const disclosure = getAffiliateDisclosure(tour);
  const fareHarborHeroStartingPrice =
    fareHarborParsed?.priceAdult ?? fareHarborParsed?.priceChild;
  const heroStartingPriceLabel = formatStartingPrice(
    fareHarborHeroStartingPrice ?? tour.startingPrice,
    tour.currency
  );

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={seoMeta.title}
        description={seoMeta.description}
        url={seoMeta.canonical}
        image={heroImage ?? null}
        robots={seoMeta.robots}
        googlebot={seoMeta.googlebot}
      />
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            <Link href="/destinations">
              <a>Destinations</a>
            </Link>
            <span>/</span>
            <Link href={stateHref}>
              <a>{state.name}</a>
            </Link>
            <span>/</span>
            <Link href={cityHref}>
              <a>{city.name}</a>
            </Link>
            <span>/</span>
            <Link href={toursHref}>
              <a>Tours</a>
            </Link>
            <span>/</span>
            <span className="text-white">{tour.title}</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              {tour.destination.city}, {tour.destination.state}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              {hardenedTemplate?.heroTitle ?? tour.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/90">
              {tour.badges.duration ? (
                <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1">
                  {tour.badges.duration}
                </span>
              ) : null}
              {tour.badges.likelyToSellOut ? (
                <span className="inline-flex items-center rounded-full bg-[#ffedd5] px-3 py-1 text-[#9a3412]">
                  Likely to sell out
                </span>
              ) : null}
            </div>
            {heroStartingPriceLabel ? (
              <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
                Prices starting at {heroStartingPriceLabel}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={bookingUrl}>
              <a
                rel="nofollow"
                className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
              >
                {hardenedTemplate?.primaryCtaLabel ?? "BOOK"}
              </a>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
              {heroImage ? (
                <Image
                  src={heroImage}
                  fallbackSrc={heroImage}
                  alt={tour.title}
                  className="h-64 w-full object-cover md:h-80"
                />
              ) : null}
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-[#2f4a2f]">
              What you’ll experience
            </h2>
            {experienceParagraphs.map(paragraph => (
              <p
                key={paragraph}
                className="mt-4 text-sm text-[#405040] leading-relaxed"
              >
                {paragraph}
              </p>
            ))}

            {hardenedTemplate?.secondaryImage ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                <Image
                  src={hardenedTemplate.secondaryImage}
                  fallbackSrc={hardenedTemplate.secondaryImage}
                  alt={
                    hardenedTemplate.secondaryImageAlt ??
                    `${tour.title} landscape`
                  }
                  className="h-64 w-full object-cover"
                />
              </div>
            ) : null}

            {hardenedTemplate?.highlights?.length ? (
              <>
                <h3 className="mt-8 text-xl font-semibold text-[#2f4a2f]">
                  Highlights
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-[#405040]">
                  {hardenedTemplate.highlights.slice(0, 10).map(highlight => (
                    <li key={highlight} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#2f8a3d]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {hardenedTemplate?.faqs?.length ? (
              <>
                <h3 className="mt-8 text-xl font-semibold text-[#2f4a2f]">
                  FAQs
                </h3>
                <div className="mt-4 space-y-4">
                  {hardenedTemplate.faqs.slice(0, 5).map(item => (
                    <div
                      key={item.question}
                      className="rounded-xl border border-black/10 bg-white p-4"
                    >
                      <p className="text-sm font-semibold text-[#1f2a1f]">
                        {item.question}
                      </p>
                      <p className="mt-2 text-sm text-[#405040]">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-[#1f2a1f]">
                {hardenedTemplate ? "What’s included" : "Tour snapshot"}
              </h3>
              {hardenedTemplate ? (
                <div className="mt-4 space-y-4 text-sm text-[#405040]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                      Included
                    </p>
                    <ul className="mt-2 space-y-1">
                      {hardenedTemplate.includes.map(item => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                      Not included
                    </p>
                    <ul className="mt-2 space-y-1">
                      {hardenedTemplate.excludes.map(item => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3 text-sm text-[#405040]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                      Duration
                    </span>
                    <span className="font-semibold text-[#1f2a1f]">
                      {tour.badges.duration ?? "Check booking page"}
                    </span>
                  </div>
                  {tour.badges.likelyToSellOut ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a3412]">
                      Likely to sell out
                    </p>
                  ) : null}
                </div>
              )}
              {disclosure ? (
                <p className="mt-6 text-xs text-[#405040]">{disclosure}</p>
              ) : null}
            </div>
          </div>
        </div>
        {tour.galleryImages?.length ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {tour.galleryImages.map(image => (
              <div
                key={image}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
              >
                <Image
                  src={image}
                  fallbackSrc={image}
                  alt={`${tour.title} gallery`}
                  className="h-56 w-full object-cover md:h-64"
                />
              </div>
            ))}
          </div>
        ) : null}
        {bookingUrl ? (
          <div id="booking-section" className="mt-12 text-center">
            <Link href={bookingUrl}>
              <a
                rel="nofollow"
                className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
              >
                Book This Tour
              </a>
            </Link>
          </div>
        ) : null}
      </section>

      {relatedTours.length > 0 && (
        <section className="bg-white/60">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-2xl font-semibold text-[#2f4a2f]">
              More tours in {city.name}
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedTours.map(related => (
                <TourCard
                  key={related.slug}
                  tour={related}
                  forceDocumentNavigation
                  href={
                    isFlagstaff
                      ? getFlagstaffTourDetailPath(related)
                      : getCityTourDetailPath(related)
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
