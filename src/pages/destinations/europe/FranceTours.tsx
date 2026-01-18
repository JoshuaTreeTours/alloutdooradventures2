import { Link } from "wouter";

import Image from "../../../components/Image";
import TourCard from "../../../components/TourCard";
import { tours } from "../../../data/tours";

const franceTours = tours.filter(
  (tour) => tour.destination.stateSlug === "france",
);
const heroImage = franceTours[0]?.heroImage ?? "/hero.jpg";

export default function FranceTours() {
  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="relative overflow-hidden bg-[#2f4a2f]">
        <Image
          src={heroImage}
          fallbackSrc="/hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 text-white">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            <Link href="/destinations">
              <a>Destinations</a>
            </Link>
            <span>/</span>
            <span className="text-white">France</span>
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/80">
              Europe country hub
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">
              France tours
            </h1>
            <p className="max-w-2xl text-sm text-white/90 md:text-base">
              Browse guided cycling experiences across France, from Riviera
              highlights to vineyard routes.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-2 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              France tours
            </span>
            <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              Explore active tours across France
            </h2>
          </div>
          {franceTours.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {franceTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-sm text-[#405040]">
              New France tours are on the way. Check back soon.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
