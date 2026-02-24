import { useMemo } from "react";
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
import { isPalmSpringsTour } from "../../../../utils/fh/palmSpringsPilotContent";
import {
  buildJoshuaTreeTemplate,
  isJoshuaTreeTour,
} from "../../../../utils/tours/buildJoshuaTreeTemplate";
import { isRemovedTourSlug } from "../../../../utils/tours/isTourRemoved";
import RemovedTourGone from "../../../RemovedTourGone";

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

  const engine2Tour = getEngine2TourBySlug(
    params.stateSlug,
    params.citySlug,
    params.tourSlug
  );

  if (engine2Tour) {
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
  const structuredImages = filterHeroImages(
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
  const isJoshuaTree =
    !!tour &&
    isJoshuaTreeTour({
      citySlug: tour.destination.citySlug,
      city: tour.destination.city,
      canonicalPath,
      title: tour.title,
    });
  const joshuaTreeTemplate =
    tour && isJoshuaTree
      ? buildJoshuaTreeTemplate({
          title: tour.title,
          city: tour.destination.city,
          state: tour.destination.state,
          citySlug: tour.destination.citySlug,
          canonicalPath,
          lowPrice: tour.startingPrice,
          duration: tour.badges.duration,
          category: tour.primaryCategory,
          tags: [...(tour.tags ?? []), ...(tour.categories ?? [])],
        })
      : null;
  const structuredDataNodes = useMemo(() => {
    if (!tour || !canonicalUrl) {
      return null;
    }

    const canonicalProductUrl = resolveCanonicalProductUrl(canonicalUrl);
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
            city: isJoshuaTree ? "Joshua Tree" : tour.destination.city,
            region: isJoshuaTree ? "CA" : tour.destination.state,
            regionCode: isJoshuaTree ? "CA" : undefined,
            countryCode: isJoshuaTree ? "US" : (tour.destination.countryCode ?? undefined),
            lat: tour.destination.lat,
            lng: tour.destination.lng,
          },
          product: {
            id: `${canonicalUrl}#product`,
            name: tour.title,
            description:
              joshuaTreeTemplate?.description ??
              productDescription ??
              seoDescription ??
              "",
            category: tour.primaryCategory,
          },
          trip: {
            id: `${canonicalUrl}#trip`,
            name: tour.title,
            description:
              joshuaTreeTemplate?.description ??
              productDescription ??
              seoDescription ??
              "",
            duration: tour.badges.duration,
            touristType: "Adventure travelers",
            departureLocation: joshuaTreeTemplate?.logistics.meetingPoint
              ? {
                  name: joshuaTreeTemplate.logistics.meetingPoint,
                  addressCountry: "US",
                }
              : null,
            itinerary: joshuaTreeTemplate?.itinerarySteps?.length
              ? {
                  "@type": "ItemList",
                  itemListElement: joshuaTreeTemplate.itinerarySteps.map(
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
            lowPrice: tour.startingPrice,
            highPrice: tour.startingPrice,
            price: tour.startingPrice,
            priceCurrency: tour.currency ?? "USD",
            availability: "https://schema.org/InStock",
            offerCount: typeof tour.startingPrice === "number" ? 1 : null,
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
          }),
          buildTourProductStructuredData({
            tour,
            detailUrl: canonicalUrl,
            description: productDescription,
            images: structuredImages.length ? structuredImages : undefined,
          }),
          buildTourTripStructuredData({
            tour,
            detailUrl: canonicalUrl,
            description: productDescription,
            images: structuredImages.length ? structuredImages : undefined,
          }),
        ];

    const faqNode = joshuaTreeTemplate?.faq?.length
      ? {
          "@type": "FAQPage",
          "@id": `${canonicalUrl}#faqpage`,
          mainEntityOfPage: canonicalProductUrl,
          mainEntity: joshuaTreeTemplate.faq.map(item => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
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
    tour,
    toursHref,
    isJoshuaTree,
    joshuaTreeTemplate,
  ]);

  const experienceParagraphs = joshuaTreeTemplate
    ? [joshuaTreeTemplate.description]
    : tour
      ? getExpandedTourDescription(tour)
      : [];
  const logisticsRows = joshuaTreeTemplate
    ? [
        { label: "Price", value: joshuaTreeTemplate.logistics.priceLabel },
        { label: "Duration", value: joshuaTreeTemplate.logistics.duration },
        {
          label: "Meeting point",
          value: joshuaTreeTemplate.logistics.meetingPoint,
        },
        { label: "Age", value: joshuaTreeTemplate.logistics.age },
        { label: "Group size", value: joshuaTreeTemplate.logistics.groupSize },
        {
          label: "Cancellation",
          value: joshuaTreeTemplate.logistics.cancellation,
        },
      ]
        .filter(item => (item.label === "Price" ? !!item.value : true))
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
              {tour.title}
            </h1>
            {joshuaTreeTemplate?.priceLabel ? (
              <p className="mt-2 text-lg font-semibold text-[#d9f99d]">
                {joshuaTreeTemplate.priceLabel}
              </p>
            ) : null}
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
            {tour.badges.tagline ? (
              <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
                {tour.badges.tagline}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={bookingUrl}>
              <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
                BOOK
              </a>
            </Link>
            <Link href={toursHref}>
              <a className="inline-flex items-center justify-center rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25">
                Back to tours
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

            {joshuaTreeTemplate?.highlights?.length ? (
              <>
                <h3 className="mt-8 text-xl font-semibold text-[#2f4a2f]">
                  Highlights
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-[#405040]">
                  {joshuaTreeTemplate.highlights.slice(0, 10).map(highlight => (
                    <li key={highlight} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#2f8a3d]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {joshuaTreeTemplate?.itinerarySteps?.length ? (
              <>
                <h3 className="mt-8 text-xl font-semibold text-[#2f4a2f]">
                  Itinerary
                </h3>
                <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[#405040]">
                  {joshuaTreeTemplate.itinerarySteps.slice(0, 6).map(step => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </>
            ) : null}

            {joshuaTreeTemplate?.faq?.length ? (
              <>
                <h3 className="mt-8 text-xl font-semibold text-[#2f4a2f]">
                  FAQs
                </h3>
                <div className="mt-4 space-y-4">
                  {joshuaTreeTemplate.faq.slice(0, 5).map(item => (
                    <div
                      key={item.q}
                      className="rounded-xl border border-black/10 bg-white p-4"
                    >
                      <p className="text-sm font-semibold text-[#1f2a1f]">
                        {item.q}
                      </p>
                      <p className="mt-2 text-sm text-[#405040]">
                        {item.a}
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
                {joshuaTreeTemplate ? "Tour logistics" : "Tour snapshot"}
              </h3>
              {joshuaTreeTemplate ? (
                <div className="mt-4 space-y-3 text-sm text-[#405040]">
                  {logisticsRows.map(item => (
                    <div key={item.label}>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#1f2a1f]">
                        {item.value}
                      </p>
                    </div>
                  ))}
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
          <div className="mt-12 text-center">
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
