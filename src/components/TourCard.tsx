import { Link } from "wouter";

import type { TourRegistryEntry } from "../data/tourRegistry";
import Image from "./Image";

type TourCardProps = {
  tour: TourRegistryEntry;
};

export default function TourCard({ tour }: TourCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-sm">
      <div className="relative h-48 w-full">
        <Image
          src={tour.image}
          fallbackSrc="/hero.jpg"
          alt={tour.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
            {tour.categories.join(" • ")}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[#1f2a1f]">
            {tour.title}
          </h3>
          <p className="mt-2 text-sm text-[#405040]">{tour.blurb}</p>
        </div>
        <div className="mt-auto">
          <Link href={`/tours/${tour.destination}/${tour.slug}`}>
            <a className="inline-flex items-center text-sm font-semibold text-[#2f4a2f]">
              View tour
            </a>
          </Link>
        </div>
      </div>
    </article>
  );
}
