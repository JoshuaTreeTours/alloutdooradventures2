import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

import Seo from "../../../../components/Seo";
import TourCard from "../../../../components/TourCard";
import BookingCtaLink from "../../../../components/BookingCtaLink";
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
  getLegacyTourBySlugs,
  getToursByCity,
} from "../../../../data/tours";
import {
  flagstaffTours,
  getFlagstaffTourBySlug,
  getFlagstaffTourDetailPath,
} from "../../../../data/flagstaffTours";
import {
  getFareharborOperatorSlugFromUrl,
  getFareharborParams,
  normalizeFareharborUrl,
} from "../../../../lib/fareharbor";
import {
  OPT_OUT_OPERATOR_SLUGS,
  recordBlockedFareharborEmbed,
} from "../../../../utils/fareharbor/optOutOperators";
import { formatStartingPrice } from "../../../../lib/pricing";
import { resolveUsGuideHref } from "../../../../utils/guides/guideResolver";
import { buildBookingMeta } from "../../../../lib/tourMeta";
import {
  buildReserveActionStructuredData,
  buildWebPageStructuredData,
} from "../../../../utils/structuredData";
import { resolveHeroImageForRoute } from "../../../../utils/hero";
import { getEngine2TourBySlug } from "../../../../engine2/data/loadEngine2";
import Engine2TourBookingPage from "../../../../engine2/pages/Engine2TourBookingPage";
import { isRemovedTourSlug } from "../../../../utils/tours/isTourRemoved";
import RouteRedirect from "../../../../components/RouteRedirect";
import {
  getRetiredFareHarborTourRedirectPath,
  isSuppressedFareHarborBookingPage,
} from "../../../../utils/fareharbor/suppressedBookingPages";
import RemovedTourGone from "../../../RemovedTourGone";

type CityTourBookingRouteProps = {
  params: {
    stateSlug: string;
    citySlug: string;
    tourSlug: string;
  };
};

export default function CityTourBookingRoute({
  params,
}: CityTourBookingRouteProps) {
  const retiredFareHarborRedirectPath = getRetiredFareHarborTourRedirectPath({
    stateSlug: params.stateSlug,
    citySlug: params.citySlug,
    tourSlug: params.tourSlug,
  });

  if (retiredFareHarborRedirectPath) {
    return <RouteRedirect to={retiredFareHarborRedirectPath} />;
  }

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
    if (isSuppressedFareHarborBookingPage(engine2Tour)) {
      return <RouteRedirect to={engine2Tour.seo.canonicalPath} />;
    }

    return <Engine2TourBookingPage tour={engine2Tour} />;
  }

  const state =
    getStateBySlug(params.stateSlug) ??
    getFallbackStateBySlug(params.stateSlug);
  const city =
    getCityBySlugs(params.stateSlug, params.citySlug) ??
    getFallbackCityBySlugs(params.stateSlug, params.citySlug);

  if (!state || !city) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Booking not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that tour booking page. Head back to tours to keep
          exploring.
        </p>
        <div className="mt-6">
          <Link
            href={`/destinations/${params.stateSlug}/${params.citySlug}/tours`}
          >
            <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]">
              Back to tours
            </a>
          </Link>
        </div>
      </main>
    );
  }

  const isFlagstaff = state.slug === "arizona" && city.slug === "flagstaff";
  const resolvedTour = isFlagstaff
    ? getFlagstaffTourBySlug(params.tourSlug)
    : getTourBySlugs(state.slug, city.slug, params.tourSlug);

  const legacyFareHarborTour = isFlagstaff
    ? null
    : getLegacyTourBySlugs(state.slug, city.slug, params.tourSlug);

  const tour =
    !isFlagstaff &&
    resolvedTour?.engine === "engine6" &&
    resolvedTour.bookingUrl.startsWith("/destinations/") &&
    legacyFareHarborTour?.bookingProvider === "fareharbor"
      ? legacyFareHarborTour
      : resolvedTour;

  if (!tour) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Booking not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that tour booking page. Head back to tours to keep
          exploring.
        </p>
        <div className="mt-6">
          <Link
            href={`/destinations/${params.stateSlug}/${params.citySlug}/tours`}
          >
            <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]">
              Back to tours
            </a>
          </Link>
        </div>
      </main>
    );
  }

  if (isSuppressedFareHarborBookingPage(tour)) {
    const redirectPath = isFlagstaff
      ? getFlagstaffTourDetailPath(tour)
      : getCityTourDetailPath(tour);

    return <RouteRedirect to={redirectPath} />;
  }

  // NOTE: useMemo ensures params are captured once per mount.
  const fareharborParams = useMemo(() => getFareharborParams(), []);
  const isFareharbor = tour.bookingProvider === "fareharbor";
  const fareharborOperatorSlug = isFareharbor
    ? getFareharborOperatorSlugFromUrl(tour.bookingUrl)
    : null;
  const isBlockedFareharborEmbed =
    !!fareharborOperatorSlug &&
    OPT_OUT_OPERATOR_SLUGS.has(fareharborOperatorSlug);

  const ensureFareharborParams = (url?: string) => {
    if (!url) return undefined;
    if (!isFareharbor) return url;
    return normalizeFareharborUrl(url);
  };

  const embedSourceUrl = isFareharbor ? tour.bookingUrl : tour.bookingWidgetUrl;
  const attributedBookingUrl = ensureFareharborParams(tour.bookingUrl);
  const attributedWidgetUrl = isBlockedFareharborEmbed
    ? undefined
    : ensureFareharborParams(embedSourceUrl);
  const fallbackBookingUrl = attributedBookingUrl ?? tour.bookingUrl;

  useEffect(() => {
    if (!isBlockedFareharborEmbed || !fareharborOperatorSlug) {
      return;
    }

    recordBlockedFareharborEmbed(fareharborOperatorSlug);
  }, [fareharborOperatorSlug, isBlockedFareharborEmbed]);

  const disclosure = getAffiliateDisclosure(tour);
  const disclosureText =
    disclosure ??
    "Affiliate disclosure: This booking link may be monetized and can generate a commission at no extra cost to you.";

  const [embedStatus, setEmbedStatus] = useState<
    "idle" | "loading" | "loaded" | "failed"
  >("idle");
  const [redirectMode, setRedirectMode] = useState(false);

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  const startingAt = formatStartingPrice(tour.startingPrice, tour.currency);
  const departureLocation =
    tour.destination.city !== "Unknown" && tour.destination.state !== "Unknown"
      ? `${tour.destination.city}, ${tour.destination.state}`
      : undefined;

  const cityHref = resolveUsGuideHref(state.slug, city.slug).href;
  const stateHref = state.isFallback
    ? "/destinations"
    : `/destinations/states/${state.slug}`;
  const toursHref = `/destinations/${state.slug}/${city.slug}/tours`;
  const tourDetailHref = isFlagstaff
    ? getFlagstaffTourDetailPath(tour)
    : `${toursHref}/${tour.slug}`;
  const detailUrl = isFlagstaff
    ? getFlagstaffTourDetailPath(tour)
    : getCityTourDetailPath(tour);
  const bookingUrl = getTourBookingPath(tour);
  const heroImage =
    resolveHeroImageForRoute({
      route: bookingUrl,
      tour,
    }) ?? undefined;

  const canonicalTourUrl = detailUrl;
  const bookingMeta = buildBookingMeta(tour, canonicalTourUrl);
  const structuredDataNodes = useMemo(() => {
    if (!detailUrl || !bookingUrl) {
      return null;
    }
    return [
      buildWebPageStructuredData({
        url: bookingUrl,
        name: `${tour.title} booking`,
        description: bookingMeta.description,
        image: heroImage,
      }),
      buildReserveActionStructuredData({
        bookingUrl,
        tourDetailUrl: detailUrl,
        tourName: tour.title,
      }),
    ];
  }, [bookingMeta.description, bookingUrl, detailUrl, heroImage, tour.title]);

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

  useEffect(() => {
    if (!attributedWidgetUrl || embedStatus !== "loading") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setEmbedStatus(current => {
        if (current === "loaded") {
          return current;
        }
        return "failed";
      });
      setRedirectMode(true);
    }, 10000);

    return () => window.clearTimeout(timeout);
  }, [attributedWidgetUrl, embedStatus]);

  const relatedTours = (
    isFlagstaff ? flagstaffTours : getToursByCity(state.slug, city.slug)
  ).filter(item => item.slug !== tour.slug);
  return (
    <>
      <Seo
        title={bookingMeta.title}
        description={bookingMeta.description}
        url={bookingMeta.canonical}
        image={heroImage ?? null}
        robots={bookingMeta.robots}
        googlebot={bookingMeta.googlebot}
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
              <Link href={tourDetailHref}>
                <a>{tour.title}</a>
              </Link>
              <span>/</span>
              <span className="text-white">Book</span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                Booking
              </p>
              <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
                {tour.title}
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
          {isBlockedFareharborEmbed ? (
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1f2a1f]">
                Unavailable
              </h2>
              <p className="mt-3 text-sm text-[#405040]">
                This operator is temporarily unavailable through our embedded
                booking flow.
              </p>
              <Link href={toursHref}>
                <a className="mt-4 inline-flex items-center justify-center rounded-md border border-[#2f4a2f]/30 px-4 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:bg-[#f2ebe0]">
                  Browse city tours
                </a>
              </Link>
            </div>
          ) : attributedWidgetUrl && !redirectMode ? (
            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm md:p-6">
              <iframe
                title={`${tour.title} booking`}
                src={attributedWidgetUrl}
                className="h-[720px] w-full rounded-xl border-0 md:h-[820px]"
                allow="payment *; clipboard-read; clipboard-write; fullscreen; geolocation"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
                loading="lazy"
                onError={() => {
                  setEmbedStatus("failed");
                  setRedirectMode(true);
                }}
                onLoad={() => {
                  setEmbedStatus("loaded");
                  setRedirectMode(false);
                }}
              />
            </div>
          ) : null}

          <div className="rounded-2xl border border-dashed border-[#2f4a2f]/30 bg-white/80 p-6 text-[#1f2a1f]">
            {redirectMode ? (
              <p className="mb-3 rounded-xl border border-[#2f4a2f]/20 bg-[#f8f4ed] p-3 text-xs text-[#405040]">
                The booking embed did not load, so we switched to redirect mode
                to keep attribution intact.
              </p>
            ) : null}

            <p className="text-sm text-[#405040]">
              Having trouble with the embed? Use the booking button to open the
              reservation page in a new tab.
            </p>

            <BookingCtaLink
              className="mt-4 inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
              href={fallbackBookingUrl}
            >
              BOOK
            </BookingCtaLink>

            <p className="mt-4 text-xs text-[#405040]">{disclosureText}</p>

            <Link href={toursHref}>
              <a className="mt-4 inline-flex items-center justify-center rounded-md border border-[#2f4a2f]/30 px-4 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:bg-[#f2ebe0]">
                Back to tours
              </a>
            </Link>

            {/* Booking flow audit UI removed */}
          </div>
        </section>

        {relatedTours.length > 0 ? (
          <section className="bg-white/60">
            <div className="mx-auto max-w-6xl px-6 py-14">
              <h2 className="text-2xl font-semibold text-[#2f4a2f]">
                More tours in {city.name}
              </h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {relatedTours.slice(0, 6).map(related => (
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
        ) : null}
      </main>
    </>
  );
}
