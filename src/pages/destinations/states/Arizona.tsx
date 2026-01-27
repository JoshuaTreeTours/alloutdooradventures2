import TourCard from "../../../components/TourCard";
import {
  flagstaffTours,
  getFlagstaffTourDetailPath,
} from "../../../data/flagstaffTours";
import sedonaToursData from "../../../data/generated/arizona.sedona.tours.json";

const sedonaTours = sedonaToursData.tours.slice(0, 6);

export default function Arizona() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section className="rounded-2xl bg-[#f7f3ea] p-10 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2f4a2f]">
          Arizona
        </h1>
        <p className="mt-4 text-sm md:text-base text-[#405040]">
          Chase crimson sunsets, hike desert mesas, and take in the canyon views
          that make Arizona unforgettable.
        </p>
      </section>
      <section className="mt-10">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Flagstaff tours
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
            Flagstaff adventures to book now
          </h2>
          <p className="mt-3 text-sm md:text-base text-[#405040]">
            Browse the curated Flagstaff tour lineup right from the Arizona hub.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {flagstaffTours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              href={getFlagstaffTourDetailPath(tour)}
            />
          ))}
        </div>
      </section>
      <section className="mt-16">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Sedona tours
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
            Sedona red-rock experiences
          </h2>
          <p className="mt-3 text-sm md:text-base text-[#405040]">
            Explore guided adventures from Sedona’s top operators, curated from
            the latest FareHarbor inventory.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {sedonaTours.map((tour) => (
            <a
              key={tour.id}
              href={`/arizona/sedona/${tour.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={tour.imageUrl}
                  alt={tour.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                    {tour.location}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[#1f2a1f]">
                    {tour.title}
                  </h3>
                </div>
                <p className="text-sm text-[#405040]">{tour.tagline}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                  Hosted by {tour.operator}
                </p>
                <span className="mt-auto text-sm font-semibold text-[#2f4a2f]">
                  View details →
                </span>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a
            href="/arizona/sedona"
            className="inline-flex items-center justify-center rounded-md border border-[#2f4a2f]/30 px-5 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:bg-[#f1eadf]"
          >
            View all Sedona tours
          </a>
        </div>
      </section>
    </main>
  );
}
