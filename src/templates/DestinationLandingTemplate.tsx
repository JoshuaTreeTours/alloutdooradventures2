import { Link } from "wouter";

import Image from "../components/Image";
import Seo from "../components/Seo";
import TourCard from "../components/TourCard";
import type { StateDestination } from "../data/destinations";
import type { Tour } from "../data/tours.types";
import { buildMetaDescription } from "../utils/seo";

type DestinationLandingTemplateProps = {
  state: StateDestination;
  tours: Tour[];
};

export default function DestinationLandingTemplate({
  state,
  tours,
}: DestinationLandingTemplateProps) {
  const paragraphs = state.longDescription.split("\n\n");
  const title = `${state.name} Outdoor Adventures | Tours & Destinations`;
  const description = buildMetaDescription(
    state.intro,
    `Explore ${state.name} tours, cities, and outdoor experiences curated by local experts.`,
  );

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={title}
        description={description}
        url={`/destinations/${state.slug}`}
      />
      <section className="relative overflow-hidden bg-[#2f4a2f]">
        <Image
          src={state.heroImage}
          fallbackSrc="/hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-20 text-white">
          <Link href="/destinations">
            <a className="text-xs uppercase tracking-[0.3em] text-white/80">
              Destinations
            </a>
          </Link>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/80">
              {state.description}
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">{state.name}</h1>
            <p className="max-w-2xl text-sm text-white/90 md:text-base">
              {state.intro}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {state.topRegions.map((region) => (
              <span
                key={region.title}
                className="rounded-full bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em]"
              >
                {region.title}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Destination overview
          </span>
          <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Plan a {state.name} itinerary
          </h2>
          <p className="text-sm text-[#405040] md:text-base">
            Use these editorial highlights to build a flexible, outdoors-first
            trip, then browse curated tours below.
          </p>
        </div>
        <div className="mt-8 space-y-5 text-sm leading-relaxed text-[#405040] md:text-base">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="bg-white/70">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-2 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              Tours
            </span>
            <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              {state.name} tour picks
            </h2>
            <p className="text-sm text-[#405040] md:text-base">
              Tours are curated from our live booking feeds and tagged by
              adventure category to keep the list fresh.
            </p>
          </div>
          {tours.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <TourCard key={tour.slug} tour={tour} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-sm text-[#405040]">
              New tours are on the way. Check back soon for curated adventures.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
