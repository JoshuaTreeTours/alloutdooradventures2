import { useMemo } from "react";
import { Link } from "wouter";

import GuideLinkPill from "../components/GuideLinkPill";
import Image from "../components/Image";
import Seo from "../components/Seo";
import TourCard from "../components/TourCard";
import BubbleChips from "../components/BubbleChips";
import { useStructuredData } from "../components/StructuredDataProvider";
import type { StateDestination } from "../data/destinations";
import type { Tour } from "../data/tours.types";
import { getTourDetailPath, getToursByCityUnified } from "../data/tours";
import { pickBestHeroImageFromTours } from "../utils/heroImage";
import { resolveHeroImageForRoute, resolveTourHeroImage } from "../utils/hero";
import { SITE_BRAND_NAME } from "../utils/site";
import { buildMetaDescription } from "../utils/seo";
import { buildBreadcrumbList, buildItemList } from "../utils/structuredData";

type DestinationLandingTemplateProps = {
  state: StateDestination;
  tours: Tour[];
};

export default function DestinationLandingTemplate({
  state,
  tours,
}: DestinationLandingTemplateProps) {
  const paragraphs = state.longDescription.split("\n\n");
  const title = `${state.name} Tours & Outdoor Destinations | ${SITE_BRAND_NAME}`;
  const description = buildMetaDescription(
    `Discover ${state.name} tours, outdoor adventures, attractions, travel guides, and local experiences.`,
    state.intro
  );
  const fallbackHeroImage =
    resolveHeroImageForRoute({
      route: `/destinations/${state.slug}`,
      state,
    }) ?? undefined;
  const mexicoHeroImage =
    state.slug === "mexico"
      ? pickBestHeroImageFromTours(tours as unknown[])
      : null;
  const heroImage = mexicoHeroImage ?? fallbackHeroImage;

  const cityCards = useMemo(
    () =>
      state.cities
        .map(city => {
          const cityTours = getToursByCityUnified(state.slug, city.slug);
          return {
            city,
            tourCount: cityTours.length,
            heroImage: pickBestHeroImageFromTours(
              cityTours.map(entry => entry.tour) as unknown[]
            ),
          };
        })
        .sort(
          (a, b) =>
            b.tourCount - a.tourCount || a.city.name.localeCompare(b.city.name)
        ),
    [state.cities, state.slug]
  );
  const cityPills = useMemo(
    () =>
      [...cityCards]
        .sort((a, b) => a.city.name.localeCompare(b.city.name))
        .map(({ city }) => ({
          href: `/destinations/${state.slug}/${city.slug}/tours`,
          label: city.name,
        })),
    [cityCards, state.slug]
  );
  const isCountryDestination = Boolean(state.isFallback);
  const structuredDataNodes = useMemo(() => {
    const breadcrumbs = buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      { name: state.name, url: `/destinations/${state.slug}` },
    ]);
    const itemListItems = tours.map(tour => {
      const image = resolveTourHeroImage(tour);
      return {
        name: tour.title,
        url: getTourDetailPath(tour),
        image: image ? [image] : undefined,
      };
    });
    const nodes = [breadcrumbs];
    if (itemListItems.length) {
      nodes.push(buildItemList(itemListItems));
    }
    return nodes;
  }, [state.name, state.slug, tours]);

  useStructuredData(structuredDataNodes);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={title}
        description={description}
        url={`/destinations/${state.slug}`}
        image={heroImage ?? null}
      />
      <section className="relative overflow-hidden bg-[#2f4a2f]">
        {heroImage ? (
          <Image
            src={heroImage}
            fallbackSrc={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
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
          {state.slug === "mexico" ? (
            <BubbleChips
              items={state.topRegions.map(region => ({
                key: region.title,
                label: region.title,
              }))}
            />
          ) : (
            <div className="flex flex-wrap gap-3">
              {state.topRegions.map(region => (
                <span
                  key={region.title}
                  className="rounded-full bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em]"
                >
                  {region.title}
                </span>
              ))}
            </div>
          )}
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
          {paragraphs.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
              Cities
            </span>
            <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
              {isCountryDestination
                ? "Top regions / cities"
                : `Explore ${state.name} cities`}
            </h2>
          </div>
          {cityCards.length ? (
            isCountryDestination ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {cityPills.map(city => (
                  <GuideLinkPill key={city.href} link={city} />
                ))}
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap gap-3">
                {cityCards.map(({ city, tourCount }) => (
                  <Link
                    key={city.slug}
                    href={`/destinations/${state.slug}/${city.slug}/tours`}
                  >
                    <a className="inline-flex min-h-[68px] min-w-[152px] flex-col justify-center rounded-2xl border border-[#2f4a2f]/20 bg-white px-4 py-2 text-left text-[#2f4a2f] shadow-sm transition hover:-translate-y-0.5 hover:border-[#2f4a2f]/35 hover:bg-[#f0f4ee]">
                      <span className="text-sm font-semibold leading-tight">
                        {city.name}
                      </span>
                      <span className="mt-1 text-xs text-[#405040]">
                        {tourCount} {tourCount === 1 ? "tour" : "tours"}
                      </span>
                    </a>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <p className="mt-6 text-sm text-[#405040]">
              City inventory is being updated. Check back soon.
            </p>
          )}
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
              {tours.map(tour => (
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
