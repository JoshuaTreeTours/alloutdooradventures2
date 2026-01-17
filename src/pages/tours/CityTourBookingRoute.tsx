import { useEffect, useState } from "react";
import { Link } from "wouter";

import FAQBlock from "../../components/FAQBlock";
import {
  auditBookingAttribution,
  ensureBookingAttribution,
} from "../../data/bookingAttribution";
import { getCityBySlugs, getStateBySlug } from "../../data/destinations";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../data/tourFallbacks";
import { getAffiliateDisclosure } from "../../data/tours";
import { getCityTourConfig } from "../../data/cityTourRegistry";

type CityTourBookingRouteProps = {
  params: {
    citySlug: string;
    tourSlug: string;
  };
};

export default function CityTourBookingRoute({
  params,
}: CityTourBookingRouteProps) {
  const cityConfig = getCityTourConfig(params.citySlug);

  if (!cityConfig) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Booking not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that tour booking page. Head back to tours to keep
          exploring.
        </p>
        <div className="mt-6">
          <Link href="/tours">
            <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]">
              Back to tours
            </a>
          </Link>
        </div>
      </main>
    );
  }

  const state =
    getStateBySlug(cityConfig.stateSlug) ??
    getFallbackStateBySlug(cityConfig.stateSlug);
  const city =
    getCityBySlugs(cityConfig.stateSlug, cityConfig.citySlug) ??
    getFallbackCityBySlugs(cityConfig.stateSlug, cityConfig.citySlug);

  if (!state || !city) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Booking not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that tour booking page. Head back to tours to keep
          exploring.
        </p>
        <div className="mt-6">
          <Link href="/tours">
            <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]">
              Back to tours
            </a>
          </Link>
        </div>
      </main>
    );
  }

  const tour = cityConfig.getTourBySlug(params.tourSlug);

  if (!tour) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Booking not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that tour booking page. Head back to tours to keep
          exploring.
        </p>
        <div className="mt-6">
          <Link href="/tours">
            <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]">
              Back to tours
            </a>
          </Link>
        </div>
      </main>
    );
  }

  const searchParams = new URLSearchParams(window.location.search);
  const isDebugMode = searchParams.get("debug") === "1";
  const cityHref = `/destinations/states/${state.slug}/cities/${city.slug}`;
  const stateHref = state.isFallback
    ? "/destinations"
    : `/destinations/states/${state.slug}`;
  const toursHref = `/destinations/${state.slug}/${city.slug}/tours`;
  const tourDetailHref = cityConfig.getTourDetailPath(tour);
  const disclosure = getAffiliateDisclosure(tour);
  const [embedStatus, setEmbedStatus] = useState<
    "idle" | "loading" | "loaded" | "failed"
  >("idle");
  const [redirectMode, setRedirectMode] = useState(false);

  const attributedBookingUrl = ensureBookingAttribution(
    tour.bookingUrl,
    tour.bookingProvider,
  );
  const attributedWidgetUrl = ensureBookingAttribution(
    tour.bookingWidgetUrl,
    tour.bookingProvider,
  );
  const fallbackBookingUrl = attributedBookingUrl ?? tour.bookingUrl;
  const embedAudit = auditBookingAttribution(
    attributedWidgetUrl,
    tour.bookingProvider,
  );
  const fallbackAudit = auditBookingAttribution(
    attributedBookingUrl,
    tour.bookingProvider,
  );
  const auditRows = [
    "iOS Safari",
    "Desktop Safari",
    "Chrome",
    "Mobile Chrome",
  ].map((browser) => ({
    browser,
    embed: embedAudit,
    fallback: fallbackAudit,
  }));
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

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
              {tour.destination.city}, {tour.destination.state}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              Book {tour.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
              Secure your reservation in a few clicks. All bookings are
              completed through our verified partner.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={tourDetailHref}>
              <a className="inline-flex items-center justify-center rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25">
                Back to tour details
              </a>
            </Link>
            <a
              className="inline-flex items-center justify-center rounded-md border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              href={fallbackBookingUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open in new tab
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
            {redirectMode || !attributedWidgetUrl ? (
              <div className="flex flex-col items-center gap-4 p-8 text-center text-sm text-[#405040]">
                <p>
                  We couldn’t load the booking embed in this browser. Use the
                  button below to complete your booking.
                </p>
                <a
                  className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
                  href={fallbackBookingUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Continue to booking
                </a>
              </div>
            ) : (
              <iframe
                title={`Book ${tour.title}`}
                src={attributedWidgetUrl}
                className="h-[720px] w-full"
                onLoad={() => setEmbedStatus("loaded")}
                onError={() => setEmbedStatus("failed")}
              />
            )}
          </div>
          <aside className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#1f2a1f]">
                Booking details
              </h2>
              <p className="mt-3 text-sm text-[#405040]">
                Booking is handled by {tour.operator ?? "our partner"}. You’ll
                see real-time availability and confirmations.
              </p>
              {disclosure ? (
                <p className="mt-4 text-xs text-[#7a8a6b]">
                  {disclosure}
                </p>
              ) : null}
            </div>
            {isDebugMode ? (
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-[#1f2a1f]">
                  Attribution audit
                </h2>
                <div className="mt-4 space-y-4 text-xs text-[#405040]">
                  {auditRows.map((row) => (
                    <div key={row.browser} className="space-y-2">
                      <div className="font-semibold text-[#1f2a1f]">
                        {row.browser}
                      </div>
                      <div>
                        Embed: {row.embed.ok ? "✅" : "⚠️"}
                        {row.embed.missing.length
                          ? ` Missing ${row.embed.missing.join(", ")}`
                          : ""}
                      </div>
                      <div>
                        Fallback: {row.fallback.ok ? "✅" : "⚠️"}
                        {row.fallback.missing.length
                          ? ` Missing ${row.fallback.missing.join(", ")}`
                          : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <FAQBlock
          heading="Booking support"
          subheading="Your reservation questions, answered."
          faqs={[
            {
              question: "Will I be charged today?",
              answer:
                "Your booking partner will confirm pricing and payment terms before checkout.",
            },
            {
              question: "Can I change my reservation?",
              answer:
                "Use the confirmation email from the booking partner to update your booking.",
            },
            {
              question: "Is this a verified partner?",
              answer:
                "Yes. We only embed booking links from trusted partners who handle reservations securely.",
            },
          ]}
        />
      </section>
    </main>
  );
}
