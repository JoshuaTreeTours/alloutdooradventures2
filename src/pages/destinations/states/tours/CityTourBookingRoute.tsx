import { Link } from "wouter";

import { getCityBySlugs, getStateBySlug } from "../../../../data/destinations";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../../../../data/tourFallbacks";
import {
  getAffiliateDisclosure,
  getTourBySlugs,
} from "../../../../data/tours";

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

  const tour = getTourBySlugs(state.slug, city.slug, params.tourSlug);

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

  const searchParams = new URLSearchParams(window.location.search);
  const isDebugMode = searchParams.get("debug") === "1";
  const cityHref = `/destinations/states/${state.slug}/cities/${city.slug}`;
  const stateHref = state.isFallback
    ? "/destinations"
    : `/destinations/states/${state.slug}`;
  const toursHref = `/destinations/${state.slug}/${city.slug}/tours`;
  const disclosure = getAffiliateDisclosure(tour);

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
            <Link
              href={toursHref}
            >
              <a>Tours</a>
            </Link>
            <span>/</span>
            <Link
              href={`${toursHref}/${tour.slug}`}
            >
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
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        {tour.bookingWidgetUrl ? (
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm md:p-6">
            <iframe
              title={`${tour.title} booking`}
              src={tour.bookingWidgetUrl}
              className="h-[720px] w-full rounded-xl border-0 md:h-[820px]"
              allow="payment *; clipboard-read; clipboard-write; fullscreen; geolocation"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
            />
          </div>
        ) : null}
        <div className="rounded-2xl border border-dashed border-[#2f4a2f]/30 bg-white/80 p-6 text-[#1f2a1f]">
          <p className="text-sm text-[#405040]">
            Having trouble with the embed? Use the booking button to open the
            reservation page in a new tab.
          </p>
          <Link href={`${toursHref}/${tour.slug}`}>
            <a className="mt-4 inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
              BOOK
            </a>
          </Link>
          {disclosure ? (
            <p className="mt-4 text-xs text-[#405040]">{disclosure}</p>
          ) : null}
          {isDebugMode && (
            <div className="mt-6 rounded-xl border border-[#2f4a2f]/20 bg-white p-4 text-xs text-[#405040]">
              <p className="font-semibold uppercase tracking-[0.3em] text-[#7a8a6b]">
                Debug embed URL
              </p>
              <p className="mt-3 break-all">
                {tour.bookingWidgetUrl ?? tour.bookingUrl}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
