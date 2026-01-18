import { Link } from "wouter";

import HorizontalLinkSlider from "../components/HorizontalLinkSlider";
import RegionDropdownButton from "../components/RegionDropdownButton";
import { countriesWithTours } from "../data/europeIndex";
import {
  ACTIVITY_PAGES,
  US_STATES,
  WORLD_DESTINATIONS,
  slugify,
} from "../data/tourCatalog";

export default function ToursCatalog() {
  const handleStateChange = (slug: string) => {
    if (!slug) {
      return;
    }

    window.location.assign(`/tours/us/${slugify(slug)}`);
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
          Tour catalog
        </span>
        <h1 className="text-3xl font-semibold text-[#2f4a2f] md:text-4xl">
          Browse tours by activity or destination
        </h1>
        <p className="max-w-3xl text-sm text-[#405040] md:text-base">
          This catalog is designed to grow with your tour inventory. Start with
          activity categories and region lists, then connect each destination to
          your tour pages and booking links as they go live.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tours"
            className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]"
          >
            Tours home
          </Link>
          <Link
            href="/destinations"
            className="inline-flex items-center justify-center rounded-md bg-black/5 px-4 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:bg-black/10"
          >
            Destinations
          </Link>
        </div>
      </header>

      <section className="mt-12">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Activity focus
          </span>
          <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            Tour styles your travelers ask for most
          </h2>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {ACTIVITY_PAGES.map((category) => (
            <Link
              key={category.title}
              href={`/tours/activities/${category.slug}`}
            >
              <a className="flex h-full flex-col justify-between rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div>
                  <h3 className="text-base font-semibold text-[#1f2a1f]">
                    {category.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#405040]">
                    {category.description}
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                  Explore {category.title} →
                </span>
              </a>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="flex flex-col gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            United States
          </span>
          <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            All 50 states
          </h2>
          <p className="text-sm text-[#405040] md:text-base">
            Link each state to a future tour hub as you build inventory.
          </p>
        </div>
        <div className="mx-auto mt-8 w-full max-w-md">
          <RegionDropdownButton
            label="Choose a state"
            options={US_STATES.map((state) => ({
              name: state,
              slug: state,
            }))}
            onSelect={handleStateChange}
          />
        </div>
      </section>

      <section className="mt-14 space-y-12" aria-label="International tours">
        <HorizontalLinkSlider
          eyebrow="Europe"
          title="Every country in Europe"
          description="Add tours to each country hub as partnerships go live."
          ariaLabel="European tour destinations"
          items={countriesWithTours.map((country) => ({
            label: country.name,
            href: `/destinations/europe/${country.slug}`,
          }))}
        />

        <HorizontalLinkSlider
          eyebrow="Worldwide"
          title="Other global destinations"
          description="Plan inventory beyond Europe with new adventure hubs."
          ariaLabel="World tour destinations"
          items={WORLD_DESTINATIONS.map((destination) => ({
            label: destination,
            href: `/tours/world/${slugify(destination)}`,
          }))}
        />
      </section>
    </main>
  );
}
