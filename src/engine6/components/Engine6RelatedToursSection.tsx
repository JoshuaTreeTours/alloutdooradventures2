import React, { useRef } from "react";

import TourCard from "../../components/TourCard";
import { getCityTourDetailPath } from "../../data/tours";
import type { Tour } from "../../data/tours.types";

const SCROLL_AMOUNT = 320;

export default function Engine6RelatedToursSection({
  city,
  tours,
}: {
  city: string;
  tours: Tour[];
}) {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  if (tours.length === 0) {
    return null;
  }

  const handleScroll = (direction: "previous" | "next") => {
    if (!sliderRef.current) {
      return;
    }

    sliderRef.current.scrollBy({
      left: direction === "previous" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-10" data-testid="engine6-related-tours">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7a8a6b]">
            Keep exploring
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-green-900 md:text-3xl">
            Other Tours in {city}
          </h2>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => handleScroll("previous")}
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
            aria-label={`View previous tours in ${city}`}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => handleScroll("next")}
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-[#2f4a2f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#294129]"
            aria-label={`View next tours in ${city}`}
          >
            Next
          </button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
        role="region"
        aria-label={`Other tours in ${city}`}
      >
        {tours.map(tour => (
          <div
            key={tour.id}
            className="min-w-[280px] max-w-[320px] flex-[0_0_280px] snap-start md:min-w-[320px] md:flex-[0_0_320px]"
          >
            <TourCard tour={tour} href={getCityTourDetailPath(tour)} />
          </div>
        ))}
      </div>
    </section>
  );
}
