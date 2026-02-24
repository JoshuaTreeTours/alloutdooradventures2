import { useMemo } from "react";
import { Link } from "wouter";

import Image from "../../components/Image";
import Seo from "../../components/Seo";
import { useStructuredData } from "../../components/StructuredDataProvider";
import { getCityBySlugs, getStateBySlug } from "../../data/destinations";
import {
  getAffiliateDisclosure,
  getProviderLabel,
  getTourBookingPath,
  getTourBySlugs,
  getTourDetailPath,
  isTourDescriptionDuplicate,
} from "../../data/tours";
import { formatStartingPrice } from "../../lib/pricing";
import {
  getExpandedTourDescription,
  getTourHighlights,
} from "../../data/tourNarratives";
import { filterHeroImages, resolveHeroImageForRoute } from "../../utils/hero";
import { buildTourMetaDescription } from "../../utils/seo";
import { SITE_URL } from "../../utils/seo";
import {
  buildBreadcrumbList,
  buildTourProductStructuredData,
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
import { buildTourMeta } from "../../lib/tourMeta";
import {
  DEFAULT_IMAGE_URL,
  PRICE_MIN_THRESHOLD_USD,
} from "../../constants/merchantDefaults";
import { applyPriceFloor } from "../../utils/merchantPricing";

type TourDetailProps = {
  params: {
    stateSlug: string;
    citySlug: string;
    slug: string;
  };
};

export default function TourDetail({ params }: TourDetailProps) {
  const tour = getTourBySlugs(params.stateSlug, params.citySlug, params.slug);
  const state = tour ? getStateBySlug(tour.destination.stateSlug) : null;
  const city =
    tour && tour.destination.stateSlug
      ? getCityBySlugs(tour.destination.stateSlug, tour.destination.citySlug)
      : null;
  const detailUrl = tour ? getTourDetailPath(tour) : "";
  const heroImage =
    resolveHeroImageForRoute({
      route: detailUrl,
      tour,
    }) ?? undefined;
  const secondaryImage =
    tour?.secondaryImageUrl && tour.secondaryImageUrl !== heroImage
      ? tour.secondaryImageUrl
      : undefined;
  if (tour?.slug.endsWith("34849") && import.meta.env.DEV && typeof window !== "undefined") {
    console.info("[Engine1 34849 FH images]", {
      heroUrl: heroImage ?? null,
      galleryUrls: tour.galleryImages ?? [],
      selectedSecondaryUrl: secondaryImage ?? null,
    });
  }
  const finalHeroImage = heroImage ?? DEFAULT_IMAGE_URL;
  const structuredImages = filterHeroImages(
    [heroImage, secondaryImage],
    "product"
  );
  const bookingUrl = tour ? getTourBookingPath(tour) : "";
  const metaDescription = tour
    ? buildTourMetaDescription(tour, {
        isDuplicate: isTourDescriptionDuplicate(tour),
        diagnosticsLabel: `tour:${tour.id}`,
      })
    : undefined;
  const structuredDataNodes = useMemo(() => {
    if (!tour || !detailUrl) {
      return null;
    }
    const tourSchemaNodes = ENABLE_TOUR_SCHEMA_V1
        ? (buildTourSchemaGraph({
          url: detailUrl,
          pageName: tour.title,
          pageDescription: metaDescription ?? "",
          heroImage: finalHeroImage,
          image2: secondaryImage,
          derivedImages: structuredImages,
          place: {
            city: tour.destination.city,
            region: tour.destination.state,
            countryCode: tour.destination.countryCode ?? undefined,
            lat: tour.destination.lat,
            lng: tour.destination.lng,
          },
          product: {
            id: `${detailUrl}#product`,
            name: tour.title,
            description: metaDescription ?? "",
            category: tour.primaryCategory,
          },
          trip: {
            id: `${detailUrl}#trip`,
            name: tour.title,
            description: metaDescription ?? "",
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
            mainEntityId: `${detailUrl}#product`,
          }),
          buildTourProductStructuredData({
            tour,
            detailUrl,
            description: metaDescription,
            images: structuredImages.length ? structuredImages : undefined,
          }),
          buildTourTripStructuredData({
            tour,
            detailUrl,
            description: metaDescription,
            images: structuredImages.length ? structuredImages : undefined,
          }),
        ];

    return [
      ...tourSchemaNodes,
      buildBreadcrumbList([
        { name: "Tours", url: "/tours" },
        { name: tour.title, url: detailUrl },
      ]),
    ];
  }, [
    bookingUrl,
    detailUrl,
    finalHeroImage,
    metaDescription,
    structuredImages,
    tour,
  ]);

  useStructuredData(structuredDataNodes);

  if (!tour) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tour not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that tour. Browse the destination page to explore
          other options.
        </p>
      </main>
    );
  }

  const regionLabel = tour.destination.state || tour.destination.country || "";
  const destinationLabel = regionLabel
    ? `${tour.destination.city}, ${regionLabel}`
    : tour.destination.city;
  const canonicalUrl = `${SITE_URL}/tours/${tour.slug}`;
  const tourMeta = buildTourMeta(tour, canonicalUrl);
  const disclosure = getAffiliateDisclosure(tour);
  const providerLabel = getProviderLabel(tour.bookingProvider);
  const highlights = getTourHighlights(tour);
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
        title={tourMeta.title}
        description={tourMeta.description}
        url={tourMeta.canonical}
        image={finalHeroImage}
        robots={tourMeta.robots}
        googlebot={tourMeta.googlebot}
      />
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
          <Link href="/tours">
            <a>Back to tours</a>
          </Link>
          <span>/</span>
          <Link
            href={`/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours`}
          >
            <a>{destinationLabel}</a>
          </Link>
        </div>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-sm">
              {finalHeroImage ? (
                <Image
                  src={finalHeroImage}
                  fallbackSrc={finalHeroImage}
                  alt={tour.title}
                  className="h-72 w-full object-cover"
                />
              ) : null}
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                {destinationLabel}
              </p>
              <h1 className="text-3xl font-semibold text-[#2f4a2f] md:text-4xl">
                {tour.title}
              </h1>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#1f2a1f]">
                {tour.badges.duration ? (
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1">
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
                <p className="text-sm text-[#405040] md:text-base">
                  {tour.badges.tagline}
                </p>
              ) : null}
              {tour.tagPills?.length ? (
                <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2f4a2f]">
                  {tour.tagPills.map(tag => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#2f4a2f]/20 bg-white px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#1f2a1f]">
                Ready to book?
              </h2>
              <p className="mt-3 text-sm text-[#405040]">
                Book instantly through our {providerLabel} partner link. You’ll
                be taken to the official booking page for availability and
                pricing.
              </p>
              <p className="mt-4 text-sm font-semibold text-[#1f2a1f]">
                {isPriceFallbackApplied
                  ? "From $129 per person"
                  : `From ${startingPriceLabel} per person`}
              </p>
              <Link href={bookingUrl}>
                <a className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]">
                  BOOK
                </a>
              </Link>
              <div className="mt-6 space-y-2 text-xs text-[#405040]">
                {disclosure ? <p>{disclosure}</p> : null}
                <p className="rounded-xl border border-dashed border-black/10 bg-white/60 p-4">
                  Provider:{" "}
                  <span className="font-semibold">{providerLabel}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 space-y-4 text-sm text-[#405040] md:text-base">
          <div className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[#1f2a1f]">
              Tour highlights
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#405040] md:text-base">
              {highlights.map(highlight => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
          {getExpandedTourDescription(tour).map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {secondaryImage ? (
          <div className="mt-10 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
            <Image
              src={secondaryImage}
              fallbackSrc={secondaryImage}
              loading="lazy"
              alt={`${tour.title} photo in ${tour.destination.city}, ${tour.destination.state}`}
              className="h-56 w-full object-cover md:h-72"
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
