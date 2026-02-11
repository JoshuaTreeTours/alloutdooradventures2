import { Link } from "wouter";

import {
  getCityTourBookingPath,
  getCityTourPath,
  type CityTour,
} from "./cityTourData";

type CityTourBookingPageProps = {
  tour?: CityTour;
};

export default function CityTourBookingPage({
  tour,
}: CityTourBookingPageProps) {
  if (!tour) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Booking page not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that Sedona tour booking page. Head back to Arizona to
          keep exploring.
        </p>
        <div className="mt-6">
          <Link href="/destinations/states/arizona">
            <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]">
              Back to Arizona
            </a>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            <Link href={getCityTourPath(tour)}>
              <a>{tour.title}</a>
            </Link>
            <span>/</span>
            <span className="text-white">Booking</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              {tour.location}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              Book {tour.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
              Reserve your spot through the official FareHarbor calendar. If the
              embed doesn’t load, use the direct booking link below.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={getCityTourPath(tour)}>
              <a className="inline-flex items-center justify-center rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25">
                Back to tour
              </a>
            </Link>
            <Link href={getCityTourBookingPath(tour)}>
              <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
                Refresh booking
              </a>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          {tour.bookingWidgetUrl ? (
            <iframe
              title={tour.title + " booking"}
              src={tour.bookingWidgetUrl}
              className="h-[820px] w-full"
              loading="lazy"
            />
          ) : (
            <div className="p-10 text-center text-sm text-[#405040]">
              Booking details aren’t available right now. Please use the direct
              booking link below.
            </div>
          )}
        </div>
        <div className="mt-6 flex flex-col items-start gap-3">
          <a
            href={tour.bookingUrl}
            className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
            target="_blank"
            rel="noreferrer"
          >
            Open official booking page
          </a>
          <p className="text-xs text-[#405040]">
            You’ll be taken to FareHarbor to confirm availability and pricing.
          </p>
        </div>
      </section>
    </main>
  );
}
