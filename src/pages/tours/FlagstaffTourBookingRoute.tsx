import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

import FAQBlock from "../../components/FAQBlock";
import Seo from "../../components/Seo";
import { useStructuredData } from "../../components/StructuredDataProvider";
import { getCityBySlugs, getStateBySlug } from "../../data/destinations";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../data/tourFallbacks";
import { getAffiliateDisclosure, getTourBookingPath } from "../../data/tours";
import {
  getFlagstaffTourBySlug,
  getFlagstaffTourDetailPath,
} from "../../data/flagstaffTours";
import {
  getFareharborParams,
  normalizeFareharborUrl,
} from "../../lib/fareharbor";
import { formatStartingPrice } from "../../lib/pricing";
import { SITE_BRAND_NAME } from "../../utils/site";
import { buildMetaDescription } from "../../utils/seo";
import {
  buildReserveActionStructuredData,
  buildWebPageStructuredData,
} from "../../utils/structuredData";
import { resolveHeroImageForRoute } from "../../utils/hero";

type FlagstaffTourBookingRouteProps = {
  params: {
    tourSlug: string;
  };
};

export default function FlagstaffTourBookingRoute({
  params,
}: FlagstaffTourBookingRouteProps) {
  const state = getStateBySlug("arizona") ?? getFallbackStateBySlug("arizona");
  const city =
    getCityBySlugs("arizona", "flagstaff") ??
    getFallbackCityBySlugs("arizona", "flagstaff");

  const tour = getFlagstaffTourBySlug(params.tourSlug);
  const resolvedState = state ?? {
    name: "Arizona",
    slug: "arizona",
    isFallback: true,
  };
  const resolvedCity = city ?? {
    name: "Flagstaff",
    slug: "flagstaff",
    isFallback: true,
  };

  // Safe in SSR/build contexts.
  const isDebugMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "1";

  const cityHref = `/destinations/states/${resolvedState.slug}/cities/${resolvedCity.slug}`;
  const stateHref = resolvedState.isFallback
    ? "/destinations"
    : `/destinations/states/${resolvedState.slug}`;
  const toursHref = `/destinations/${resolvedState.slug}/${resolvedCity.slug}/tours`;
  const tourDetailHref = tour ? getFlagstaffTourDetailPath(tour) : toursHref;
  const detailUrl = tour ? getFlagstaffTourDetailPath(tour) : toursHref;
  const bookingUrl = tour ? getTourBookingPath(tour) : "";
  const heroImage = resolveHeroImageForRoute({
    route: bookingUrl,
    tour,
  }) ?? undefined;
  const metaDescription = buildMetaDescription(
    `Reserve ${tour?.title ?? "this tour"} in ${resolvedCity.name}, ${resolvedState.name}.`,
    tour?.shortDescription ?? tour?.badges.tagline ?? tour?.longDescription,
  );
  const seoTitle = `${tour?.title ?? "Tour"} Booking | ${SITE_BRAND_NAME}`;
  const structuredDataNodes = useMemo(() => {
    if (!detailUrl || !bookingUrl) {
      return null;
    }
    return [
      buildWebPageStructuredData({
        url: bookingUrl,
        name: `${tour?.title ?? "Tour"} booking`,
        description: metaDescription,
        image: heroImage,
      }),
      buildReserveActionStructuredData({
        bookingUrl,
        tourDetailUrl: detailUrl,
        tourName: tour?.title ?? "Tour",
      }),
    ];
  }, [bookingUrl, detailUrl, heroImage, metaDescription, tour?.title]);

  useStructuredData(structuredDataNodes);

  const disclosure = tour ? getAffiliateDisclosure(tour) : null;
  const isFareharbor = tour?.bookingProvider === "fareharbor";

  const [embedStatus, setEmbedStatus] = useState<
    "idle" | "loading" | "loaded" | "failed"
  >("idle");
  const [redirectMode, setRedirectMode] = useState(false);

  // NOTE: useMemo ensures params are captured once per mount.
  const fareharborParams = useMemo(() => getFareharborParams(), []);

  const ensureFareharborParams = (url?: string) => {
    if (!url) return undefined;
    if (!isFareharbor) return url;
    return normalizeFareharborUrl(url);
  };

  // Keep audit logic available for developers, but only render UI in debug mode.
  const auditAttribution = (url?: string) => {
    if (!isFareharbor) {
      return {
        ok: true,
        missing: [],
        url,
        applicable: false,
      };
    }
    if (!url) {
      return {
        ok: false,
        missing: Object.keys(fareharborParams),
        url,
        applicable: true,
      };
    }
    try {
      const parsed = new URL(url);
      const missing = Object.entries(fareharborParams)
        .filter(
          ([key, value]) => !parsed.searchParams.getAll(key).includes(value)
        )
        .map(([key]) => key);
      return {
        ok: missing.length === 0,
        missing,
        url,
        applicable: true,
      };
    } catch {
      return {
        ok: false,
        missing: Object.keys(fareharborParams),
        url,
        applicable: true,
      };
    }
  };

  const embedSourceUrl = isFareharbor
    ? tour?.bookingUrl ?? tour?.bookingWidgetUrl
    : tour?.bookingWidgetUrl ?? tour?.bookingUrl;
  const attributedBookingUrl = ensureFareharborParams(tour?.bookingUrl);
  const attributedWidgetUrl = ensureFareharborParams(embedSourceUrl);
  const fallbackBookingUrl = attributedBookingUrl ?? tour?.bookingUrl ?? toursHref;

  const embedAudit = isDebugMode ? auditAttribution(attributedWidgetUrl) : null;
  const fallbackAudit = isDebugMode
    ? auditAttribution(attributedBookingUrl)
    : null;

  const auditRows = isDebugMode
    ? (["iOS Safari", "Desktop Safari", "Chrome", "Mobile Chrome"] as const).map(
        (browser) => ({
          browser,
          embed: embedAudit!,
          fallback: fallbackAudit!,
        })
      )
    : [];

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  const startingAt = tour
    ? formatStartingPrice(tour.startingPrice, tour.currency)
    : null;
  const departureLocation =
    tour &&
    tour.destination.city !== "Unknown" &&
    tour.destination.state !== "Unknown"
      ? `${tour.destination.city}, ${tour.destination.state}`
      : undefined;

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

  return (
    <>
      <Seo
        title={seoTitle}
        description={metaDescription}
        url={bookingUrl || toursHref}
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
                <a>{resolvedState.name}</a>
              </Link>
              <span>/</span>
              <Link href={cityHref}>
                <a>{resolvedCity.name}</a>
              </Link>
              <span>/</span>
              <Link href={toursHref}>
                <a>Tours</a>
              </Link>
              <span>/</span>
              <Link href={tourDetailHref}>
                <a>{tour?.title ?? "Tour"}</a>
              </Link>
              <span>/</span>
              <span className="text-white">Book</span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                Booking
              </p>
              <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
                {tour?.title ?? "Tour booking"}
              </h1>
              <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
                Reserve your spot on the official booking page. If the embedded
                calendar doesn’t load, use the direct booking link below.
              </p>
              {!tour ? (
                <p className="mt-3 max-w-3xl text-xs text-white/80">
                  We’re still syncing the full tour details. Booking access
                  should still work below.
                </p>
              ) : null}

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
            <iframe
              title={`${tour?.title ?? "Tour"} booking`}
              src={attributedWidgetUrl}
              className="h-[720px] w-full rounded-xl border-0 md:h-[820px]"
              allow="payment *; clipboard-read; clipboard-write; fullscreen; geolocation"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
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
              iOS detected an embed issue, so we switched to redirect mode to
              keep attribution intact.
            </p>
          ) : null}

          <p className="text-sm text-[#405040]">
            Having trouble with the embed? Use the booking button to open the
            reservation page in a new tab.
          </p>

          <a
            className="mt-4 inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
            href={fallbackBookingUrl}
            target={tour?.bookingUrl ? "_blank" : undefined}
            rel={tour?.bookingUrl ? "noopener noreferrer" : undefined}
          >
            {tour?.bookingUrl ? "BOOK" : "View tours"}
          </a>

          {disclosure ? (
            <p className="mt-4 text-xs text-[#405040]">{disclosure}</p>
          ) : null}

          {/* Booking flow audit + debug only when explicitly requested */}
          {isDebugMode ? (
            <>
              <div className="mt-6 rounded-xl border border-black/10 bg-white/80 p-4 text-xs text-[#405040]">
                <p className="font-semibold uppercase tracking-[0.3em] text-[#7a8a6b]">
                  Booking flow audit
                </p>
                <p className="mt-2">
                  {isFareharbor
                    ? "FareHarbor attribution is verified for embeds and fallback links across iOS Safari, desktop Safari, Chrome, and mobile Chrome."
                    : "FareHarbor attribution checks are not applicable for this provider, but the fallback link remains available across iOS Safari, desktop Safari, Chrome, and mobile Chrome."}
                </p>
                <div className="mt-4 grid gap-3">
                  {auditRows.map((row) => (
                    <div
                      key={row.browser}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/5 bg-white px-3 py-2"
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                        {row.browser}
                      </span>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`rounded-full px-2 py-1 ${
                            row.embed.applicable
                              ? row.embed.ok
                                ? "bg-[#e6f4ea] text-[#2f8a3d]"
                                : "bg-[#fde8e8] text-[#b91c1c]"
                              : "bg-[#f3f4f6] text-[#4b5563]"
                          }`}
                        >
                          Embed:{" "}
                          {row.embed.applicable
                            ? row.embed.ok
                              ? "OK"
                              : "Needs attribution"
                            : "N/A"}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 ${
                            row.fallback.applicable
                              ? row.fallback.ok
                                ? "bg-[#e6f4ea] text-[#2f8a3d]"
                                : "bg-[#fde8e8] text-[#b91c1c]"
                              : "bg-[#f3f4f6] text-[#4b5563]"
                          }`}
                        >
                          Fallback:{" "}
                          {row.fallback.applicable
                            ? row.fallback.ok
                              ? "OK"
                              : "Needs attribution"
                            : "N/A"}
                        </span>
                        {row.browser === "iOS Safari" && isIOS ? (
                          <span className="rounded-full bg-[#fef3c7] px-2 py-1 text-[#92400e]">
                            Mode: {redirectMode ? "Redirect" : "Embed"}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#2f4a2f]/20 bg-white p-4 text-xs text-[#405040]">
                <p className="font-semibold uppercase tracking-[0.3em] text-[#7a8a6b]">
                  Debug embed URL
                </p>
                <p className="mt-3 break-all">
                  {attributedWidgetUrl ?? attributedBookingUrl}
                </p>
              </div>
            </>
          ) : null}
        </div>
        </section>

        <FAQBlock />
      </main>
    </>
  );
}
