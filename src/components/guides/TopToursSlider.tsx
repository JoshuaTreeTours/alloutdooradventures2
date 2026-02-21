import TourCard from "../TourCard";
import HorizontalCardSlider from "../HorizontalCardSlider";
import {
  tours as allTours,
  getToursByCity,
  getToursByState,
} from "../../data/tours";
import type { Tour } from "../../data/tours.types";
import { slugify } from "../../utils/slugify";

type TopToursSliderProps = {
  city?: string;
  state: string;
  country: string;
  stateSlug: string;
  citySlug?: string;
  maxTours?: number;
};

const dedupeTours = (entries: Tour[]) => {
  const byId = new Map<string, Tour>();
  entries.forEach(entry => {
    if (!byId.has(entry.id)) {
      byId.set(entry.id, entry);
    }
  });
  return [...byId.values()];
};

const getToursByCountry = (country: string) => {
  const normalizedCountry = slugify(country);
  return allTours.filter(
    tour =>
      slugify(tour.destination.country || "United States") === normalizedCountry
  );
};

export default function TopToursSlider({
  city,
  state,
  country,
  stateSlug,
  citySlug,
  maxTours = 12,
}: TopToursSliderProps) {
  const cityTours = citySlug ? getToursByCity(stateSlug, citySlug) : [];
  const stateTours = getToursByState(stateSlug);
  const countryTours = getToursByCountry(country);

  const topTours = dedupeTours([
    ...cityTours,
    ...stateTours,
    ...countryTours,
  ]).slice(0, maxTours);

  return (
    <section className="mt-12 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-10">
      <h2 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
        Top Tours
      </h2>
      {topTours.length ? (
        <div className="mt-6">
          <HorizontalCardSlider
            items={topTours}
            ariaLabel={`Top tours in ${city ?? state}`}
            getKey={tour => tour.id}
            renderItem={tour => <TourCard tour={tour} />}
          />
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#405040]">
          We’re adding more tours in {city ?? state}. Check back soon for fresh
          options.
        </p>
      )}
      <p className="mt-3 text-xs text-[#607060]">
        Showing tours prioritized by city, then {state}, then {country}.
      </p>
    </section>
  );
}
