import { Link } from "wouter";

import Image from "../../../components/Image";
import TourCard from "../../../components/TourCard";
import { getActivityLabelFromSlug } from "../../../data/activityLabels";
import { countriesWithTours, toursByCountry } from "../../../data/europeIndex";

type EuropeCountryRouteProps = {
  params: {
    countrySlug: string;
    categorySlug?: string;
  };
};

export default function EuropeCountryRoute({
  params,
}: EuropeCountryRouteProps) {
  const country = countriesWithTours.find(
    (entry) => entry.slug === params.countrySlug,
  );
  const countryTours = toursByCountry[params.countrySlug] ?? [];
  const categorySlug = params.categorySlug;
  const categoryLabel = getActivityLabelFromSlug(categorySlug);
  const filteredTours = categorySlug
    ? countryTours.filter(
        (tour) =>
          tour.activitySlugs.includes(categorySlug) ||
          tour.categories?.includes(categorySlug) ||
          tour.primaryCategory === categorySlug,
      )
    : countryTours;

  if (!country) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Destination not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that destination. Head back to Europe to keep
          exploring.
        </p>
      </main>
    );
  }

  const heroImage = countryTours[0]?.heroImage ?? "/hero.jpg";

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
            <span className="text-white">{country.name}</span>
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/80">
              Europe country hub
            </p>
            <h1 className="text-3xl font-semibold md:text-5xl">
              {country.name} tours
            </h1>
            <p className="max-w-2xl text-sm text-white/90 md:text-base">
              Browse guided adventures across {country.name}, updated from our
              live European inventory.
            </p>
            {categorySlug ? (
              <p className="text-sm text-white/80">
                Filtered by{" "}
                <span className="font-semibold">{categoryLabel}</span>.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-2 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              {country.name} tours
            </span>
            <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              Explore active tours in {country.name}
            </h2>
            <p className="text-sm text-[#405040]">
              Showing {filteredTours.length} tours
            </p>
            {categorySlug ? (
              <Link href={`/destinations/europe/${country.slug}`}>
                <a className="text-sm font-semibold text-[#2f4a2f]">
                  View all {country.name} tours →
                </a>
              </Link>
            ) : null}
          </div>
          {filteredTours.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-sm text-[#405040]">
              New {country.name} tours are on the way. Check back soon.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
