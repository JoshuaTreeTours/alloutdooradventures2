import { Link } from "wouter";

import Image from "../../../components/Image";
import { getCityTourBookingPath, type CityTour } from "./cityTourData";

type CityTourPageProps = {
  tour?: CityTour;
};

export default function CityTourPage({ tour }: CityTourPageProps) {
  if (!tour) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Tour not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that Sedona tour. Head back to Arizona to keep
          exploring.
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
            <Link href="/destinations">
              <a>Destinations</a>
            </Link>
            <span>/</span>
            <Link href="/destinations/states/arizona">
              <a>Arizona</a>
            </Link>
            <span>/</span>
            <Link href="/arizona/sedona">
              <a>Sedona tours</a>
            </Link>
            <span>/</span>
            <span className="text-white">{tour.title}</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              {tour.location}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              {tour.title}
            </h1>
            {tour.tagline ? (
              <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
                {tour.tagline}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={getCityTourBookingPath(tour)}>
              <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
                Book now
              </a>
            </Link>
            <Link href="/arizona/sedona">
              <a className="inline-flex items-center justify-center rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25">
                Back to Sedona tours
              </a>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-6 py-14 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
            <Image
              src={tour.imageUrl}
              fallbackSrc="/hero.jpg"
              alt={tour.title}
              className="h-80 w-full object-cover"
            />
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#2f4a2f]">
              About this Sedona tour
            </h2>
            <p className="mt-3 text-sm md:text-base text-[#405040]">
              {tour.shortDescription}
            </p>
            <p className="mt-4 text-sm text-[#405040]">
              Hosted by <span className="font-semibold">{tour.operator}</span>.
            </p>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#2f4a2f]">Highlights</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {tour.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#f1eadf] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#2f4a2f]/20 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#2f4a2f]">
              Ready to book?
            </h3>
            <p className="mt-3 text-sm text-[#405040]">
              Secure your preferred time with the official booking calendar.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Link href={getCityTourBookingPath(tour)}>
                <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
                  View booking calendar
                </a>
              </Link>
              <a
                href={tour.bookingUrl}
                className="inline-flex items-center justify-center rounded-md border border-[#2f4a2f]/30 px-4 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:bg-[#f1eadf]"
                target="_blank"
                rel="noreferrer"
              >
                Open official booking page
              </a>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
