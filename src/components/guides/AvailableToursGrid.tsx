import { useMemo } from "react";

import type { UnifiedCityTour } from "../../data/tours";
import TourCard from "../TourCard";
import SeeAllToursBubble from "./SeeAllToursBubble";

type AvailableToursGridProps = {
  cityName?: string;
  stateSlug?: string;
  citySlug?: string;
  tours: UnifiedCityTour[];
  initialLimit?: number;
};

export default function AvailableToursGrid({
  cityName,
  stateSlug,
  citySlug,
  tours,
  initialLimit = 24,
}: AvailableToursGridProps) {
  const visibleTours = useMemo(
    () => tours.slice(0, initialLimit),
    [initialLimit, tours]
  );

  return (
    <section className="mt-12 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-10">
      <h2 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
        Best Tours in {cityName}
      </h2>

      {visibleTours.length ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleTours.map(({ tour, href }) => (
            <TourCard key={tour.id} tour={tour} href={href} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#405040] md:text-base">
          Tours coming soon.
        </p>
      )}

      <SeeAllToursBubble
        cityName={cityName}
        citySlug={citySlug}
        stateSlug={stateSlug}
      />
    </section>
  );
}
