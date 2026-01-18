import { Link } from "wouter";

import Image from "../components/Image";
import { countriesWithTours } from "../data/europeIndex";
import { US_STATES, slugify } from "../data/tourCatalog";
import { getToursByActivity } from "../data/tours";

type ActivityExplorerTemplateProps = {
  title: string;
  description: string;
  image: string;
  activitySlug: string;
};

type GeoLink = {
  label: string;
  href: string;
};

const getDestinationSlug = (destinationState: string, stateSlug?: string) =>
  stateSlug || slugify(destinationState);

export default function ActivityExplorerTemplate({
  title,
  description,
  image,
  activitySlug,
}: ActivityExplorerTemplateProps) {
  const activityTours = getToursByActivity(activitySlug);
  const usStateMap = new Map(
    US_STATES.map((state) => [slugify(state), state]),
  );
  const europeMap = new Map(
    countriesWithTours.map((country) => [country.slug, country.name]),
  );

  const usStateSlugs = new Set<string>();
  const europeCountrySlugs = new Set<string>();
  const worldCountryMap = new Map<string, string>();

  activityTours.forEach((tour) => {
    const slug = getDestinationSlug(
      tour.destination.state,
      tour.destination.stateSlug,
    );
    if (usStateMap.has(slug)) {
      usStateSlugs.add(slug);
      return;
    }
    if (europeMap.has(slug)) {
      europeCountrySlugs.add(slug);
      return;
    }
    if (!worldCountryMap.has(slug)) {
      worldCountryMap.set(slug, tour.destination.state);
    }
  });

  const usLinks: GeoLink[] = Array.from(usStateSlugs)
    .map((slug) => ({
      label: usStateMap.get(slug) ?? slug,
      href: `/tours/${activitySlug}/us/${slug}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const europeLinks: GeoLink[] = Array.from(europeCountrySlugs)
    .map((slug) => ({
      label: europeMap.get(slug) ?? slug,
      href: `/destinations/europe/${slug}/${activitySlug}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const worldLinks: GeoLink[] = Array.from(worldCountryMap.entries())
    .map(([slug, label]) => ({
      label,
      href: `/destinations/world/${slug}/${activitySlug}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="relative overflow-hidden bg-[#2f4a2f]">
        <Image
          src={image}
          fallbackSrc="/hero.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-20 text-white">
          <span className="text-xs uppercase tracking-[0.3em] text-white/80">
            Activity guide
          </span>
          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl font-semibold md:text-5xl">{title}</h1>
            <p className="text-sm text-white/90 md:text-base">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tours/catalog"
              className="inline-flex items-center justify-center rounded-md bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/25"
            >
              Back to catalog
            </Link>
            <Link
              href="/tours"
              className="inline-flex items-center justify-center rounded-md bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/15"
            >
              Tours home
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            United States
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            {title} tours by state
          </h2>
          <p className="mt-3 text-sm text-[#405040] md:text-base">
            Choose a state to explore active tours in this activity.
          </p>
        </div>
        {usLinks.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {usLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a className="flex h-full items-center justify-between rounded-2xl border border-black/10 bg-white/80 px-5 py-4 text-sm font-semibold text-[#1f2a1f] shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <span>{link.label}</span>
                  <span className="text-[#2f4a2f]">→</span>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-sm text-[#405040]">
            No {title.toLowerCase()} tours are available in the United States
            yet.
          </p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            Europe
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            European destinations
          </h2>
          <p className="mt-3 text-sm text-[#405040] md:text-base">
            Browse European country hubs for this activity.
          </p>
        </div>
        {europeLinks.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {europeLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a className="flex h-full items-center justify-between rounded-2xl border border-black/10 bg-white/80 px-5 py-4 text-sm font-semibold text-[#1f2a1f] shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <span>{link.label}</span>
                  <span className="text-[#2f4a2f]">→</span>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-sm text-[#405040]">
            No {title.toLowerCase()} tours are available in Europe yet.
          </p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            World
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            International destinations
          </h2>
          <p className="mt-3 text-sm text-[#405040] md:text-base">
            Explore non-US, non-European countries offering this activity.
          </p>
        </div>
        {worldLinks.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {worldLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a className="flex h-full items-center justify-between rounded-2xl border border-black/10 bg-white/80 px-5 py-4 text-sm font-semibold text-[#1f2a1f] shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <span>{link.label}</span>
                  <span className="text-[#2f4a2f]">→</span>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-sm text-[#405040]">
            No {title.toLowerCase()} tours are available worldwide yet.
          </p>
        )}
      </section>
    </main>
  );
}
