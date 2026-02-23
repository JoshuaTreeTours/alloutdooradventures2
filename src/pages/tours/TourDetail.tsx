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
import { buildTourMetaDescription, SITE_URL } from "../../utils/seo";
import {
  buildBreadcrumbList,
  buildTourProductStructuredData,
  buildTourTripStructuredData,
  buildWebPageStructuredData,
} from "../../utils/structuredData";
import { buildTourMeta } from "../../lib/tourMeta";
import {
  DEFAULT_IMAGE_URL,
  PRICE_MIN_THRESHOLD_USD,
} from "../../constants/merchantDefaults";
import { applyPriceFloor } from "../../utils/merchantPricing";
import { usePalmSpringsFareHarborContent } from "../../lib/palmSpringsFareHarborPilot";

type TourDetailProps = {
  params: {
    stateSlug: string;
    citySlug: string;
    slug: string;
  };
};

export default function TourDetail({ params }: TourDetailProps) {
  const tour = getTourBySlugs(params.stateSlug, params.citySlug, params.slug);
  const detailUrl = tour ? getTourDetailPath(tour) : "";
  const heroImage =
    resolveHeroImageForRoute({ route: detailUrl, tour }) ?? undefined;
  const finalHeroImage = heroImage ?? DEFAULT_IMAGE_URL;
  const structuredImages = filterHeroImages(
    [heroImage, ...(tour?.galleryImages ?? [])],
    "product"
  );
  const bookingUrl = tour ? getTourBookingPath(tour) : "";
  const metaDescription = tour
    ? buildTourMetaDescription(tour, {
        isDuplicate: isTourDescriptionDuplicate(tour),
        diagnosticsLabel: `tour:${tour.id}`,
      })
    : undefined;

  const startingPriceLabel = formatStartingPrice(
    applyPriceFloor(tour?.startingPrice ?? null),
    tour?.currency
  );
  const isPriceFallbackApplied =
    !tour ||
    tour.startingPrice === undefined ||
    tour.startingPrice === null ||
    !Number.isFinite(tour.startingPrice) ||
    tour.startingPrice < PRICE_MIN_THRESHOLD_USD;

  const { shouldEnrich, content: palmSpringsContent } =
    usePalmSpringsFareHarborContent(
      tour,
      bookingUrl,
      isPriceFallbackApplied ? "$129" : startingPriceLabel
    );

  const structuredDescription =
    shouldEnrich && palmSpringsContent?.whatYoullExperience
      ? palmSpringsContent.whatYoullExperience
      : metaDescription;

  const structuredDataNodes = useMemo(() => {
    if (!tour || !detailUrl) {
      return null;
    }

    return [
      buildWebPageStructuredData({
        url: detailUrl,
        name: tour.title,
        description: structuredDescription,
        image: finalHeroImage,
        mainEntityId: `${detailUrl}#product`,
      }),
      buildTourProductStructuredData({
        tour,
        detailUrl,
        description: structuredDescription,
        images: structuredImages.length ? structuredImages : undefined,
      }),
      buildTourTripStructuredData({
        tour,
        detailUrl,
        description: structuredDescription,
        images: structuredImages.length ? structuredImages : undefined,
      }),
      buildBreadcrumbList([
        { name: "Tours", url: "/tours" },
        { name: tour.title, url: detailUrl },
      ]),
    ];
  }, [
    detailUrl,
    finalHeroImage,
    structuredDescription,
    structuredImages,
    tour,
  ]);

  useStructuredData(structuredDataNodes);

  if (!tour) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        Tour not found
      </main>
    );
  }

  const state = getStateBySlug(tour.destination.stateSlug);
  const city = getCityBySlugs(
    tour.destination.stateSlug,
    tour.destination.citySlug
  );
  const regionLabel =
    state?.name || tour.destination.state || tour.destination.country || "";
  const destinationLabel = city?.name
    ? `${city.name}, ${regionLabel}`
    : `${tour.destination.city}, ${regionLabel}`;
  const canonicalUrl = `${SITE_URL}/tours/${tour.slug}`;
  const tourMeta = buildTourMeta(tour, canonicalUrl);
  const disclosure = getAffiliateDisclosure(tour);
  const providerLabel = getProviderLabel(tour.bookingProvider);
  const highlights = getTourHighlights(tour);

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
        <h1 className="text-3xl font-semibold text-[#2f4a2f] md:text-4xl">
          {tour.title}
        </h1>
        <p className="mt-2 text-sm text-[#405040]">{destinationLabel}</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-sm">
              <Image
                src={finalHeroImage}
                fallbackSrc={finalHeroImage}
                alt={tour.title}
                className="h-72 w-full object-cover"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm">
            <p className="text-sm font-semibold text-[#1f2a1f]">
              {isPriceFallbackApplied
                ? "From $129 per person"
                : `From ${startingPriceLabel} per person`}
            </p>
            <Link href={bookingUrl}>
              <a className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]">
                BOOK
              </a>
            </Link>
            {disclosure ? (
              <p className="mt-4 text-xs text-[#405040]">{disclosure}</p>
            ) : null}
            <p className="mt-3 text-xs text-[#405040]">
              Provider: <span className="font-semibold">{providerLabel}</span>
            </p>
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
          {shouldEnrich && palmSpringsContent ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#1f2a1f]">
                  Quick facts
                </h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {palmSpringsContent.quickFacts.duration ? (
                    <li>
                      <strong>Duration:</strong>{" "}
                      {palmSpringsContent.quickFacts.duration}
                    </li>
                  ) : null}
                  {palmSpringsContent.quickFacts.location ? (
                    <li>
                      <strong>Location:</strong>{" "}
                      {palmSpringsContent.quickFacts.location}
                    </li>
                  ) : null}
                  {palmSpringsContent.quickFacts.startingPrice ? (
                    <li>
                      <strong>Starting price:</strong> From{" "}
                      {palmSpringsContent.quickFacts.startingPrice} per person
                    </li>
                  ) : null}
                  {palmSpringsContent.quickFacts.pickupAvailability ? (
                    <li>
                      <strong>Pickup:</strong>{" "}
                      {palmSpringsContent.quickFacts.pickupAvailability}
                    </li>
                  ) : null}
                </ul>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#1f2a1f]">
                  Meeting & pickup
                </h2>
                <p className="mt-3 text-sm text-[#405040]">
                  {palmSpringsContent.meetingPickupSummary}
                </p>
              </div>
            </div>
          ) : null}
          {getExpandedTourDescription(tour).map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
