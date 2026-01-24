import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "wouter";

import Image from "../components/Image";
import TourCard from "../components/TourCard";
import MapEmbed from "../components/maps/MapEmbed";
import { getActivityLabelFromSlug } from "../data/activityLabels";
import type { City, StateDestination } from "../data/destinations";
import type { Tour } from "../data/tours.types";
import { cityLongDescriptions } from "../data/cityLongDescriptions";
import { getCityTourDetailPath, getToursByCity } from "../data/tours";
import { getFlagstaffTourDetailPath } from "../data/flagstaffTours";

type CityTemplateProps = {
  state: StateDestination;
  city: City;
  toursOverride?: Tour[];
  stateHrefOverride?: string;
};

function ImageSlider({ images, title }: { images: string[]; title: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-2xl border border-black/10 bg-black/10"
        ref={emblaRef}
      >
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="min-w-0 flex-[0_0_100%]"
            >
              <Image
                src={image}
                fallbackSrc="/hero.jpg"
                alt={`${title} slide ${index + 1}`}
                className="h-72 w-full object-cover md:h-[420px]"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 w-2 rounded-full transition ${
                selectedIndex === index
                  ? "bg-[#2f4a2f]"
                  : "bg-[#2f4a2f]/30"
              }`}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            className="rounded-full border border-[#2f4a2f]/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="rounded-full border border-[#2f4a2f]/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CityTemplate({
  state,
  city,
  toursOverride,
  stateHrefOverride,
}: CityTemplateProps) {
  const longDescription = cityLongDescriptions[city.slug] ?? [];
  const toursHref = `/destinations/${state.slug}/${city.slug}/tours`;
  const stateHref =
    stateHrefOverride ??
    (state.isFallback ? "/destinations" : `/destinations/states/${state.slug}`);
  const cityTours = toursOverride ?? getToursByCity(state.slug, city.slug);
  const categorizedTours = [
    {
      title: "Day Tours & Highlights",
      tours: cityTours.filter((tour) =>
        tour.activitySlugs.includes("detours"),
      ),
    },
    {
      title: "Hiking Tours",
      tours: cityTours.filter((tour) =>
        tour.activitySlugs.includes("hiking"),
      ),
    },
    {
      title: "Cycling Tours",
      tours: cityTours.filter((tour) =>
        tour.activitySlugs.includes("cycling"),
      ),
    },
    {
      title: "Paddle Sports Tours",
      tours: cityTours.filter((tour) =>
        tour.activitySlugs.includes("canoeing"),
      ),
    },
  ].filter((section) => section.tours.length > 0);
  const hasCoordinates =
    Number.isFinite(city.lat) && Number.isFinite(city.lng);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            <Link href="/destinations">
              <a>Destinations</a>
            </Link>
            <span>/</span>
            <Link href={stateHref}>
              <a>{state.name}</a>
            </Link>
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-semibold">{city.name}</h1>
            <p className="mt-3 max-w-3xl text-sm md:text-base text-white/90">
              {city.shortDescription}
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/70">
              {city.name}, {state.name} · {city.region}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {city.activityTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em]"
              >
                {getActivityLabelFromSlug(tag)}
              </span>
            ))}
          </div>
          <div>
            <Link href={toursHref}>
              <a className="inline-flex items-center justify-center rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-[#287a35]">
                SEE TOURS
              </a>
            </Link>
          </div>
          <ImageSlider images={city.heroImages} title={city.name} />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
          Where it is & what it’s like
        </h2>
        <div className="mt-4 space-y-4 text-sm md:text-base text-[#405040] leading-relaxed">
          {city.whereItIs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      {longDescription.length > 0 && (
        <section className="bg-white/60">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <div className="text-center">
              <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
                City guide
              </span>
              <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
                A longer look at {city.name}
              </h2>
            </div>
            <div className="mt-6 space-y-4 text-sm md:text-base text-[#405040] leading-relaxed">
              {longDescription.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              Best outdoor experiences
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
              Outdoor experiences in {city.name}
            </h2>
            <p className="mt-3 text-sm md:text-base text-[#405040]">
              From mountain viewpoints to scenic drives, here’s how to explore the
              landscape around {city.name}.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              { title: "Mountains", copy: city.experiences.mountains },
              { title: "Lakes & water", copy: city.experiences.lakesWater },
              { title: "Desert & forest", copy: city.experiences.desertForest },
              { title: "Cycling & MTB", copy: city.experiences.cycling },
              { title: "Scenic drives", copy: city.experiences.scenicDrives },
              { title: "Seasonal notes", copy: city.experiences.seasonalNotes },
            ].map((experience) => (
              <div
                key={experience.title}
                className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
              >
                <h3 className="text-base font-semibold text-[#1f2a1f]">
                  {experience.title}
                </h3>
                <p className="mt-3 text-sm text-[#405040] leading-relaxed">
                  {experience.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
          Top things to do
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {city.thingsToDo.map((activity) => (
            <li
              key={activity}
              className="rounded-2xl border border-black/10 bg-white/80 p-5 text-sm text-[#405040]"
            >
              {activity}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white/60">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              Tours & guided experiences
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
              Plan guided adventures in {city.name}
            </h2>
          </div>
          <div className="mt-6 space-y-4 text-sm md:text-base text-[#405040] leading-relaxed">
            {city.toursCopy.map((paragraph) => (
              <p key={paragraph}>
                {paragraph}{" "}
                <Link href={toursHref}>
                  <a className="font-semibold text-[#2f4a2f]">
                    Explore tours in {city.name}
                  </a>
                </Link>
              </p>
            ))}
          </div>
        </div>
      </section>

      {toursOverride && toursOverride.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              Flagstaff tours
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
              Flagstaff adventures to book now
            </h2>
            <p className="mt-3 text-sm md:text-base text-[#405040]">
              Explore the curated set of tours available for Flagstaff.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {toursOverride.map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                href={getFlagstaffTourDetailPath(tour)}
              />
            ))}
          </div>
        </section>
      )}

      {categorizedTours.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              Tours by category
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
              Book {city.name} experiences
            </h2>
            <p className="mt-3 text-sm md:text-base text-[#405040]">
              Browse available tours grouped by activity.
            </p>
          </div>
          <div className="mt-10 space-y-12">
            {categorizedTours.map((section) => (
              <div key={section.title}>
                <h3 className="text-xl font-semibold text-[#2f4a2f]">
                  {section.title}
                </h3>
                <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {section.tours.map((tour) => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      href={getCityTourDetailPath(tour)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
          Perfect weekend itinerary
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-white/80 p-6">
            <h3 className="text-base font-semibold text-[#1f2a1f]">Day 1</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#405040]">
              {city.weekendItinerary.dayOne.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/80 p-6">
            <h3 className="text-base font-semibold text-[#1f2a1f]">Day 2</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#405040]">
              {city.weekendItinerary.dayTwo.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white/60">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
            Getting there
          </h2>
          <div className="mt-4 space-y-3 text-sm md:text-base text-[#405040] leading-relaxed">
            {city.gettingThere.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {hasCoordinates ? (
        <section className="mx-auto max-w-5xl px-6 py-14">
          <div className="flex flex-col gap-2 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              Map
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
              {city.name} on the map
            </h2>
          </div>
          <div className="mt-8">
            <MapEmbed
              title={`${city.name} map`}
              locations={[{ label: city.name, lat: city.lat, lng: city.lng }]}
              heightClassName="h-72"
            />
          </div>
        </section>
      ) : null}

      <section className="bg-white/60">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f]">
            FAQ
          </h2>
          <div className="mt-6 space-y-4">
            {city.faq.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-black/10 bg-white p-5"
              >
                <h3 className="text-base font-semibold text-[#1f2a1f]">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm text-[#405040] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={stateHref}>
              <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294129] transition">
                Back to {state.name}
              </a>
            </Link>
            <Link href="/destinations">
              <a className="inline-flex items-center justify-center rounded-md bg-black/5 px-4 py-2 text-sm font-semibold text-[#2f4a2f] hover:bg-black/10 transition">
                All destinations
              </a>
            </Link>
            <Link href={toursHref}>
              <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#287a35]">
                SEE TOURS
              </a>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
