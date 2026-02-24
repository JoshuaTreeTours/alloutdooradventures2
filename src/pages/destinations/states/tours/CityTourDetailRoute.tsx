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
import { getJoshuaTree459591Override } from "../../../../utils/fh/joshuaTree459591Content";
import { isRemovedTourSlug } from "../../../../utils/tours/isTourRemoved";
import { isJTreeHikeTemplate } from "../../../../utils/tours/isJTreeHikeTemplate";
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
  const structuredDataNodes = useMemo(() => {
    if (!tour || !canonicalUrl) {
      return null;
    }
    const isJTreeHikeClimb = tour
    ? isJTreeHikeTemplate({ slug: tour.slug, tourId: tour.id })
    : false;
    const jt459591Override = isJTreeHikeClimb
      ? getJoshuaTree459591Override(canonicalUrl)
      : null;
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
            city: jt459591Override ? "Joshua Tree" : tour.destination.city,
            region: jt459591Override ? "CA" : tour.destination.state,
            regionCode: jt459591Override ? "CA" : undefined,
            countryCode: jt459591Override
              ? "US"
              : (tour.destination.countryCode ?? undefined),
            lat: jt459591Override ? 34.1347 : tour.destination.lat,
            lng: jt459591Override ? -116.3131 : tour.destination.lng,
          },
          product: {
            id: `${canonicalUrl}#product`,
            name: tour.title,
            description:
              jt459591Override?.schemaDescription ??
              productDescription ??
              seoDescription ??
              "",
            category: jt459591Override
              ? "Hiking & climbing tour"
              : tour.primaryCategory,
          },
          trip: {
            id: `${canonicalUrl}#trip`,
            name: tour.title,
            description:
              jt459591Override?.schemaDescription ??
              productDescription ??
              seoDescription ??
              "",
            duration: jt459591Override?.durationISO ?? tour.badges.duration,
            touristType: "Adventure travelers",
            departureLocation: jt459591Override?.meetingPoint
              ? {
                  name:
                    jt459591Override.meetingPoint.name ??
                    jt459591Override.meetingPoint.rawText,
                  streetAddress: jt459591Override.meetingPoint.addressLine1,
                  addressLocality: jt459591Override.meetingPoint.city,
                  addressRegion: jt459591Override.meetingPoint.region,
                  postalCode: jt459591Override.meetingPoint.postalCode,
                  addressCountry: jt459591Override.meetingPoint.country ?? "US",
                }
              : null,
            itinerary: jt459591Override
              ? {
                  "@type": "ItemList",
                  itemListElement: jt459591Override.itinerarySteps.map(
                    (stepName, index) => ({
                      "@type": "ListItem",
                      position: index + 1,
                      name: stepName,
                    })
                  ),
                }
              : null,
          },
          offers: {
            url: offerUrl,
            lowPrice: jt459591Override?.pricing?.low,
            highPrice: jt459591Override?.pricing?.high,
            price: jt459591Override?.schemaPrice ?? tour.startingPrice,
            priceCurrency: tour.currency ?? "USD",
            availability: "https://schema.org/InStock",
            offerCount:
              typeof jt459591Override?.pricing?.low === "number" &&
              typeof jt459591Override?.pricing?.high === "number"
                ? 2
                : null,
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

    const faqNode = jt459591Override?.faqs?.length
      ? {
          "@type": "FAQPage",
          "@id": `${canonicalUrl}#faqpage`,
          mainEntityOfPage: canonicalProductUrl,
          mainEntity: jt459591Override.faqs.map(item => ({
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
    tour,
    toursHref,
  ]);

  const isJTreeHikeClimb = tour
    ? isJTreeHikeTemplate({ slug: tour.slug, tourId: tour.id })
    : false;
  const jt459591Override =
    tour && canonicalUrl && isJTreeHikeClimb
      ? getJoshuaTree459591Override(canonicalUrl)
      : null;
  const experienceParagraphs = jt459591Override?.whatYoullExperience?.length
    ? jt459591Override.whatYoullExperience
    : tour
      ? getExpandedTourDescription(tour)
      : [];
  const logisticsRows = jt459591Override
    ? [
        { label: "Duration", value: jt459591Override.logistics.duration },
        {
          label: "Meeting point",
          value: jt459591Override.logistics.meetingPoint,
        },
        { label: "Age", value: jt459591Override.logistics.age },
        { label: "Group size", value: jt459591Override.logistics.groupSize },
        {
          label: "Cancellation",
          value: jt459591Override.logistics.cancellation,
        },
      ]
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
            {jt459591Override ? (
              <p className="mt-2 text-lg font-semibold text-[#d9f99d]">
                {jt459591Override.heroPriceText
                  ? `From ${jt459591Override.heroPriceText}`
                  : "Check booking page"}
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

            {jt459591Override?.highlights?.length ? (
              <>
                <h3 className="mt-8 text-xl font-semibold text-[#2f4a2f]">
                  Highlights
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-[#405040]">
                  {jt459591Override.highlights.slice(0, 10).map(highlight => (
                    <li key={highlight} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#2f8a3d]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {jt459591Override?.itinerarySteps?.length ? (
              <>
                <h3 className="mt-8 text-xl font-semibold text-[#2f4a2f]">
                  Itinerary
                </h3>
                <ol className="mt-4 space-y-2 text-sm text-[#405040]">
                  {jt459591Override.itinerarySteps.slice(0, 6).map(step => (
                    <li key={step} className="rounded-xl border border-black/10 bg-white px-4 py-3">
                      {step}
                    </li>
                  ))}
                </ol>
              </>
            ) : null}

            {jt459591Override?.faqs?.length ? (
              <>
                <h3 className="mt-8 text-xl font-semibold text-[#2f4a2f]">
                  FAQs
                </h3>
                <div className="mt-4 space-y-4">
                  {jt459591Override.faqs.slice(0, 5).map(item => (
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
                {jt459591Override ? "Tour logistics" : "Tour snapshot"}
              </h3>
              {jt459591Override ? (
                <div className="mt-4 space-y-3 text-sm text-[#405040]">
                  {logisticsRows.map(item => (
                    <div key={item.label}>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#1f2a1f]">
                        {item.value ?? "Check booking page"}
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
