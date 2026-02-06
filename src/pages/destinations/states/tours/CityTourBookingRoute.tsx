import React, { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

import BookingRenderErrorBoundary from "../../../../components/booking/BookingRenderErrorBoundary";
import FareHarborEmbed from "../../../../components/booking/FareHarborEmbed";
import Seo from "../../../../components/Seo";
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
  getTourBySlugs,
} from "../../../../data/tours";
import {
  getFlagstaffTourBySlug,
  getFlagstaffTourDetailPath,
} from "../../../../data/flagstaffTours";
import {
  buildFareharborEmbedUrl,
  getFareharborItemFromUrl,
  normalizeFareharborUrl,
} from "../../../../lib/fareharbor";
import { formatStartingPrice } from "../../../../lib/pricing";
import { SITE_BRAND_NAME } from "../../../../utils/site";
import { buildMetaDescription } from "../../../../utils/seo";
import {
  buildReserveActionStructuredData,
  buildWebPageStructuredData,
} from "../../../../utils/structuredData";
import { resolveHeroImageForRoute } from "../../../../utils/hero";

type CityTourBookingRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
    tourSlug: string;
  };
};

const toTitleCase = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");

export default function CityTourBookingRoute({
  params,
}: CityTourBookingRouteProps) {
  const state =
    getStateBySlug(params.stateSlug) ?? getFallbackStateBySlug(params.stateSlug);
  const city =
    getCityBySlugs(params.stateSlug, params.citySlug) ??
    getFallbackCityBySlugs(params.stateSlug, params.citySlug);

  const isFlagstaff =
    params.stateSlug === "arizona" && params.citySlug === "flagstaff";
  const tour = isFlagstaff
    ? getFlagstaffTourBySlug(params.tourSlug)
    : getTourBySlugs(params.stateSlug, params.citySlug, params.tourSlug);
  const tourTitle = tour?.title ?? "Book this tour";

  if (!state || !city || !tour) {
    console.warn("[booking] Missing booking metadata.", {
      hasState: Boolean(state),
      hasCity: Boolean(city),
      hasTour: Boolean(tour),
      params,
    });
  }

  const isFareharbor = tour?.bookingProvider === "fareharbor";

  const ensureFareharborParams = (url?: string) => {
    if (!url) return undefined;
    if (!isFareharbor) return url;
    return normalizeFareharborUrl(url);
  };

  const embedSourceUrl = tour
    ? isFareharbor
      ? tour.bookingUrl
      : tour.bookingWidgetUrl
    : undefined;
  const attributedBookingUrl = ensureFareharborParams(tour?.bookingUrl);
  const attributedWidgetUrl = ensureFareharborParams(embedSourceUrl);
  const fallbackBookingUrl =
    attributedBookingUrl ??
    tour?.bookingUrl ??
    (isFlagstaff
      ? `/tours/${params.tourSlug}`
      : `/destinations/${params.stateSlug}/${params.citySlug}/tours/${params.tourSlug}`);

  const disclosure = tour ? getAffiliateDisclosure(tour) : null;

  const [embedStatus, setEmbedStatus] = useState<
    "idle" | "loading" | "loaded" | "failed"
  >("idle");
  const [redirectMode, setRedirectMode] = useState(false);

  const isIOS =
    typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const startingAt = tour
    ? formatStartingPrice(tour.startingPrice, tour.currency)
    : null;
  const departureLocation =
    tour && tour.destination.city !== "Unknown" && tour.destination.state !== "Unknown"
      ? `${tour.destination.city}, ${tour.destination.state}`
      : undefined;

  const displayStateName = state?.name ?? toTitleCase(params.stateSlug);
  const displayCityName = city?.name ?? toTitleCase(params.citySlug);

  const cityHref = `/destinations/states/${state?.slug ?? params.stateSlug}/cities/${city?.slug ?? params.citySlug}`;
  const stateHref = state?.isFallback
    ? "/destinations"
    : `/destinations/states/${state?.slug ?? params.stateSlug}`;
  const toursHref = `/destinations/${params.stateSlug}/${params.citySlug}/tours`;
  const tourDetailHref = tour
    ? isFlagstaff
      ? getFlagstaffTourDetailPath(tour)
      : `${toursHref}/${tour.slug}`
    : isFlagstaff
      ? `/tours/${params.tourSlug}`
      : `${toursHref}/${params.tourSlug}`;
  const detailUrl = tour
    ? isFlagstaff
      ? getFlagstaffTourDetailPath(tour)
      : getCityTourDetailPath(tour)
    : tourDetailHref;
  const bookingUrl = tour
    ? getTourBookingPath(tour)
    : `${toursHref}/${params.tourSlug}/book`;
  const heroImage = resolveHeroImageForRoute({
    route: bookingUrl,
    tour: tour ?? undefined,
  }) ?? undefined;

  const metaDescription = buildMetaDescription(
    tour
      ? `Reserve ${tour.title} in ${displayCityName}, ${displayStateName}.`
      : `Reserve this tour in ${displayCityName}, ${displayStateName}.`,
    tour?.shortDescription ?? tour?.badges.tagline ?? tour?.longDescription,
  );
  const seoTitle = tour
    ? `${tour.title} Booking | ${SITE_BRAND_NAME}`
    : `Book this tour | ${SITE_BRAND_NAME}`;
  const structuredDataNodes = useMemo(() => {
    if (!detailUrl || !bookingUrl || !tour) {
      return null;
    }
    return [
      buildWebPageStructuredData({
        url: bookingUrl,
        name: `${tour.title} booking`,
        description: metaDescription,
        image: heroImage,
      }),
      buildReserveActionStructuredData({
        bookingUrl,
        tourDetailUrl: detailUrl,
        tourName: tour.title,
      }),
    ];
  }, [bookingUrl, detailUrl, heroImage, metaDescription, tour?.title]);

  useStructuredData(structuredDataNodes);

  useEffect(() => {
    if (!attributedWidgetUrl) {
      setEmbedStatus("idle");
      return;
    }
    setEmbedStatus("loading");
  }, [attributedWidgetUrl]);

  useEffect(() => {
    if (!isIOS) {
      setRedirectMode(false);
      return;
    }
    if (!attributedWidgetUrl) {
      setRedirectMode(true);
      return;
    }
    if (embedStatus === "loaded") {
      setRedirectMode(false);
      return;
    }
    const timeout = window.setTimeout(() => {
      if (embedStatus !== "loaded") {
        setEmbedStatus("failed");
        setRedirectMode(true);
      }
    }, 6000);
    return () => window.clearTimeout(timeout);
  }, [attributedWidgetUrl, embedStatus, isIOS]);

  const fareharborItem =
    getFareharborItemFromUrl(embedSourceUrl) ??
    getFareharborItemFromUrl(tour?.bookingUrl);

  const resolvedFareharborEmbedUrl = buildFareharborEmbedUrl({
    baseUrl: attributedWidgetUrl,
    companySlug: fareharborItem?.companyShortname,
    itemId: fareharborItem?.itemId,
  });

  if (isFareharbor && !resolvedFareharborEmbedUrl) {
    console.warn("[booking] Missing FareHarbor embed URL.", {
      tourSlug: params.tourSlug,
      companySlug: fareharborItem?.companyShortname,
      itemId: fareharborItem?.itemId,
    });
  }

  return (
    <BookingRenderErrorBoundary
      fallbackTitle="Book this tour"
      fallbackMessage="We hit a snag while loading this booking page. You can head back to the tour details and try again."
      fallbackHref={tourDetailHref}
      fallbackLinkLabel="Back to tour details"
    >
      <Seo
        title={seoTitle}
        description={metaDescription}
        url={bookingUrl}
        image={heroImage ?? null}
      />
      <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            <Link href="/destinations">
              <a>Destinations</a>
            </Link>
            <span>/</span>
            <Link href={stateHref}>
              <a>{displayStateName}</a>
            </Link>
            <span>/</span>
            <Link href={cityHref}>
              <a>{displayCityName}</a>
            </Link>
            <span>/</span>
            <Link href={toursHref}>
              <a>Tours</a>
            </Link>
            <span>/</span>
            <Link href={tourDetailHref}>
              <a>{tourTitle}</a>
            </Link>
            <span>/</span>
            <span className="text-white">Book</span>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Booking
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              {tourTitle}
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
              Reserve your spot on the official booking page. If the embedded
              calendar doesn’t load, use the direct booking link below.
            </p>

            {startingAt || departureLocation ? (
              <dl className="mt-6 grid gap-4 text-sm text-white/90 sm:grid-cols-2">
                {startingAt ? (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.3em] text-white/70">
                      From
                    </dt>
                    <dd className="mt-2 text-base font-semibold text-white">
                      {startingAt}
                    </dd>
                  </div>
                ) : null}

                {departureLocation ? (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.3em] text-white/70">
                      Departure location
                    </dt>
                    <dd className="mt-2 text-base font-semibold text-white">
                      {departureLocation}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        {attributedWidgetUrl && !redirectMode ? (
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm md:p-6">
            {isFareharbor ? (
              <FareHarborEmbed
                title={`${tourTitle} booking`}
                baseUrl={attributedWidgetUrl}
                companySlug={fareharborItem?.companyShortname}
                itemId={fareharborItem?.itemId}
                onLoad={() => {
                  setEmbedStatus("loaded");
                  setRedirectMode(false);
                }}
              />
            ) : (
              <iframe
                title={`${tourTitle} booking`}
                src={attributedWidgetUrl}
                className="h-[720px] w-full rounded-xl border-0 md:h-[820px]"
                allow="payment *; clipboard-read; clipboard-write; fullscreen; geolocation"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
                onLoad={() => {
                  setEmbedStatus("loaded");
                  setRedirectMode(false);
                }}
              />
            )}
          </div>
        ) : null}

        <div className="rounded-2xl border border-dashed border-[#2f4a2f]/30 bg-white/80 p-6 text-[#1f2a1f]">
          {redirectMode ? (
            <p className="mb-3 rounded-xl border border-[#2f4a2f]/20 bg-[#f8f4ed] p-3 text-xs text-[#405040]">
              iOS detected an embed issue, so we switched to redirect mode to
              keep attribution intact.
            </p>
          ) : null}

          <p className="text-sm text-[#405040]">
            Having trouble with the embed? Use the booking button to open the
            reservation page in a new tab.
          </p>
          {!attributedWidgetUrl ? (
            <p className="mt-3 text-sm text-[#405040]">
              We couldn’t load the embedded calendar. Use the tour details page
              if you need more info before booking.
            </p>
          ) : null}

          <a
            className="mt-4 inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
            href={fallbackBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            BOOK
          </a>

          {disclosure ? (
            <p className="mt-4 text-xs text-[#405040]">{disclosure}</p>
          ) : null}

          {/* Booking flow audit UI removed */}
        </div>
      </section>
      </main>
    </BookingRenderErrorBoundary>
  );
}
