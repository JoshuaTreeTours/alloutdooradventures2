import { useMemo } from "react";
import { Link } from "wouter";

import Image from "../../components/Image";
import Seo from "../../components/Seo";
import TourCard from "../../components/TourCard";
import { useStructuredData } from "../../components/StructuredDataProvider";
import { getCityBySlugs, getStateBySlug } from "../../data/destinations";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../data/tourFallbacks";
import { getAffiliateDisclosure, getTourBookingPath } from "../../data/tours";
import { getExpandedTourDescription } from "../../data/tourNarratives";
import {
  flagstaffTours,
  getFlagstaffTourBySlug,
  getFlagstaffTourDetailPath,
  getFlagstaffTourSlug,
} from "../../data/flagstaffTours";
import { formatStartingPrice } from "../../lib/pricing";
import {
  DEFAULT_IMAGE_URL,
  PRICE_MIN_THRESHOLD_USD,
} from "../../constants/merchantDefaults";
import { applyPriceFloor } from "../../utils/merchantPricing";
import { filterHeroImages, resolveHeroImageForRoute } from "../../utils/hero";
import { buildMetaDescription } from "../../utils/seo";
import {
  buildBreadcrumbList,
  buildTourProductStructuredData,
  buildTourProductNodeId,
  buildTourTripStructuredData,
  buildWebPageStructuredData,
  SITE_BRAND_ID,
  SITE_ORGANIZATION_ID,
  SITE_WEBSITE_ID,
} from "../../utils/structuredData";
import {
  buildTourSchemaGraph,
  ENABLE_TOUR_SCHEMA_V1,
} from "../../schema/buildTourSchemaGraph";

type FlagstaffTourDetailRouteProps = {
  params: {
    tourSlug: string;
  };
};

export default function FlagstaffTourDetailRoute({
  params,
}: FlagstaffTourDetailRouteProps) {
  const state = getStateBySlug("arizona") ?? getFallbackStateBySlug("arizona");
  const city =
    getCityBySlugs("arizona", "flagstaff") ??
    getFallbackCityBySlugs("arizona", "flagstaff");

  if (!state || !city) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tour not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that destination. Head back to destinations to keep
          exploring.
        </p>
      </main>
    );
  }

  const tour = getFlagstaffTourBySlug(params.tourSlug);
  const detailUrl = tour ? getFlagstaffTourDetailPath(tour) : "";
  const heroImage =
    resolveHeroImageForRoute({
      route: detailUrl,
      tour,
    }) ?? undefined;
  const finalHeroImage = heroImage ?? DEFAULT_IMAGE_URL;
  const structuredImages = filterHeroImages(
    [heroImage, ...(tour?.galleryImages ?? [])],
    "product"
  );
  const bookingUrl = tour ? getTourBookingPath(tour) : "";
  const productDescription = tour
    ? getExpandedTourDescription(tour)[0]
    : undefined;
  const metaDescription = tour
    ? buildMetaDescription(
        tour.shortDescription ?? tour.badges.tagline ?? tour.longDescription,
        `Book ${tour.title} in ${city.name}, ${state.name} with trusted guides and curated outdoor experiences.`
      )
    : undefined;
  const cityHref = `/destinations/states/${state.slug}/cities/${city.slug}`;
  const stateHref = state.isFallback
    ? "/destinations"
    : `/destinations/states/${state.slug}`;
  const toursHref = `/destinations/${state.slug}/${city.slug}/tours`;
  const structuredDataNodes = useMemo(() => {
    if (!tour || !detailUrl) {
      return null;
    }
    const productNodeId = buildTourProductNodeId(tour.id);
    const tourSchemaNodes = ENABLE_TOUR_SCHEMA_V1
      ? (buildTourSchemaGraph({
          url: detailUrl,
          pageName: tour.title,
          pageDescription: metaDescription ?? productDescription ?? "",
          heroImage: finalHeroImage,
          derivedImages: structuredImages,
          place: {
            city: tour.destination.city,
            region: tour.destination.state,
            countryCode: tour.destination.countryCode ?? undefined,
            lat: tour.destination.lat,
            lng: tour.destination.lng,
          },
          product: {
            id: productNodeId,
            name: tour.title,
            description: productDescription ?? metaDescription ?? "",
            category: tour.primaryCategory,
          },
          trip: {
            id: `${detailUrl}#trip`,
            name: tour.title,
            description: productDescription ?? metaDescription ?? "",
            duration: tour.badges.duration,
            touristType: "Adventure travelers",
            departureLocation: null,
          },
          offers: {
            url: bookingUrl,
            price: applyPriceFloor(tour.startingPrice ?? null),
            priceCurrency: tour.currency ?? "USD",
          },
          brandOrgIds: {
            orgId: SITE_ORGANIZATION_ID,
            brandId: SITE_BRAND_ID,
            websiteId: SITE_WEBSITE_ID,
          },
        })["@graph"] as Record<string, unknown>[])
      : [
          buildWebPageStructuredData({
            url: detailUrl,
            name: tour.title,
            description: metaDescription,
            image: finalHeroImage,
            mainEntityId: productNodeId,
          }),
          buildTourProductStructuredData({
            tour,
            detailUrl,
            description: productDescription,
            images: structuredImages.length ? structuredImages : undefined,
          }),
          buildTourTripStructuredData({
            tour,
            detailUrl,
            description: productDescription,
            images: structuredImages.length ? structuredImages : undefined,
          }),
        ];

    return [
      ...tourSchemaNodes,
      buildBreadcrumbList([
        { name: "Destinations", url: "/destinations" },
        { name: state.name, url: stateHref },
        { name: city.name, url: cityHref },
        { name: "Tours", url: toursHref },
        { name: tour.title, url: detailUrl },
      ]),
    ];
  }, [
    bookingUrl,
    city.name,
    cityHref,
    detailUrl,
    finalHeroImage,
    metaDescription,
    productDescription,
    state.name,
    stateHref,
    structuredImages,
    tour,
    toursHref,
  ]);

  useStructuredData(structuredDataNodes);

  if (!tour) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tour not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that tour. Head back to the tours list to keep
          exploring.
        </p>
        <div className="mt-6">
          <Link href="/destinations/arizona/flagstaff/tours">
            <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]">
              Back to tours
            </a>
          </Link>
        </div>
      </main>
    );
  }

  const tourSlug = getFlagstaffTourSlug(tour);
  const title = `${tour.title} | ${city.name}, ${state.name} Outdoor Tour`;
  const description =
    metaDescription ??
    buildMetaDescription(
      tour.shortDescription ?? tour.badges.tagline ?? tour.longDescription,
      `Book ${tour.title} in ${city.name}, ${state.name} with trusted guides and curated outdoor experiences.`
    );
  const relatedTours = flagstaffTours.filter(
    item => getFlagstaffTourSlug(item) !== tourSlug
  );
  const disclosure = getAffiliateDisclosure(tour);
  const startingPriceLabel = formatStartingPrice(
    applyPriceFloor(tour.startingPrice ?? null),
    tour.currency
  );
  const isPriceFallbackApplied =
    tour.startingPrice === undefined ||
    tour.startingPrice === null ||
    !Number.isFinite(tour.startingPrice) ||
    tour.startingPrice < PRICE_MIN_THRESHOLD_USD;

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={title}
        description={description}
        url={detailUrl}
        image={finalHeroImage}
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
            <p className="mt-3 text-sm font-semibold text-white/90">
              {isPriceFallbackApplied
                ? "From $129 per person"
                : `From ${startingPriceLabel} per person`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={bookingUrl}>
              <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
                Book Now
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
              {finalHeroImage ? (
                <Image
                  src={finalHeroImage}
                  fallbackSrc={finalHeroImage}
                  alt={tour.title}
                  className="h-64 w-full object-cover md:h-80"
                />
              ) : null}
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-[#2f4a2f]">
              What you’ll experience
            </h2>
            {getExpandedTourDescription(tour).map(paragraph => (
              <p
                key={paragraph}
                className="mt-4 text-sm text-[#405040] leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-[#1f2a1f]">
                Tour snapshot
              </h3>
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
                  href={getFlagstaffTourDetailPath(related)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
