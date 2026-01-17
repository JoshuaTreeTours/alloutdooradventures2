import TourCard from "../../../components/TourCard";
import {
  flagstaffTours,
  getFlagstaffTourDetailPath,
} from "../../../data/flagstaffTours";

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
    </main>
  );
}
