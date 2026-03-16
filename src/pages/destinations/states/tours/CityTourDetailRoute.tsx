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
import {
  filterHeroImages,
  resolveHeroImageForRoute,
} from "../../../../utils/hero";
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
import { mapViatorToEngine4Tour } from "../../../../engine4/viator/mapViatorToEngine4Tour";
import Engine4TourPage from "../../../../engine4/components/Engine4TourPage";
import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../../../../engine4/data/viatorTours";
import {
  ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODES,
  ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODE,
  hasViatorNonZeroPrice,
  mapEngine5ProductPayloadToEngine4ApiTour,
  resolveStrictEngine5BridgeApiTour,
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
  const [strictBridgeApiTour, setStrictBridgeApiTour] =
    useState<Engine4ViatorApiTour>();
  const [strictBridgeSource, setStrictBridgeSource] =
    useState<Engine4BridgeRuntimeSource>();

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
      !ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODES.includes(
        engine4RouteTour.id.toUpperCase() as
          | (typeof ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODES)[number]
      )
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

  if (isRemovedTourSlug(params.tourSlug)) {
    return (
      <RemovedTourGone
        cityToursPath={`/destinations/${params.stateSlug}/${params.citySlug}/tours`}
      />
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

      return (
        (() => {
          const cachedFallback =
            engine4ViatorApiFallbackByProductCode[productCode];
          const resolvedBridge = resolveStrictEngine5BridgeApiTour({
            productCode,
            runtimeApiTour: strictBridgeApiTour,
            runtimeSource: strictBridgeSource,
            cachedFallbackApiTour: cachedFallback,
          });

          const hasPrice = hasViatorNonZeroPrice(
            resolvedBridge.apiTour?.fromPrice
          );

          if (
            ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODES.includes(
              productCode as
                | (typeof ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODES)[number]
            ) &&
            !hasPrice
          ) {
            return (
              <main className="mx-auto max-w-4xl px-6 py-16">
                <h1 className="text-2xl font-semibold text-[#1f2a1f]">
                  Pricing temporarily unavailable
                </h1>
                <p className="mt-4 text-[#334433]">
                  We couldn&apos;t load valid pricing for this tour right now. Please
                  try again shortly.
                </p>
              </main>
            );
          }

          const mappedTour = mapViatorToEngine4Tour({
            record: tourRecord,
            apiTour: resolvedBridge.apiTour,
          });

          if (
            ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODES.includes(
              productCode as
                | (typeof ENGINE4_STRICT_ENGINE5_BRIDGE_PRODUCT_CODES)[number]
            ) &&
            !hasViatorNonZeroPrice(mappedTour.facts.priceFrom)
          ) {
            return (
              <main className="mx-auto max-w-4xl px-6 py-16">
                <h1 className="text-2xl font-semibold text-[#1f2a1f]">
                  Pricing temporarily unavailable
                </h1>
                <p className="mt-4 text-[#334433]">
                  Tour details loaded, but a valid non-zero price is not
                  currently available.
                </p>
              </main>
            );
          }

          return <Engine4TourPage tour={mappedTour} />;
        })()
      );
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
  const baseStructuredImages = filterHeroImages(
    [heroImage, ...(tour?.galleryImages ?? [])],
    "product"
  );
  const bookingUrl = tour ? getTourBookingPath(tour) : "";
  const seoDescription = tour
    ? buildTourMeta(tour, canonicalUrl).description
    : undefined;
  const productDescription = tour
    ? getExpandedTourDescription(tour)[0]
    : undefined;
  const cityHref =
    state && city
      ? `/destinations/states/${state.slug}/cities/${city.slug}`
      : "";
  const stateHref = state
    ? state.isFallback
      ? "/destinations"
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

  const structuredImages = filterHeroImages(
    hardenedTemplate?.schemaImages?.length
      ? hardenedTemplate.schemaImages
      : baseStructuredImages,
    "product"
  );

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
          <Link href={`/destinations/${state.slug}/${city.slug}/tours`}>
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
    isFlagstaff ? flagstaffTours : getToursByCity(state.slug, city.slug)
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
              <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
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
              <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
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
