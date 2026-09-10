import { Link } from "wouter";

import GuideThingsToDoCard from "../../components/guides/GuideThingsToDoCard";
import Image from "../../components/Image";
import Seo from "../../components/Seo";
import rawParisGuide from "../../content/guides/world/france/paris.generated.json";
import { getInternationalEngine6CityGuideTours } from "../../data/internationalGuideEngine6Tours";
import { deepenInternationalPoiNarrative } from "../../data/internationalGuidePhase2";
import { getTourDetailPath } from "../../data/tours";
import type { Tour } from "../../data/tours.types";
import { getEngine2ParisTours } from "../../engine2/data/parisTours";
import { isGenericHeroFallbackImage } from "../../utils/hero";
import {
  buildCityGuideDisplayTitle,
  buildCityGuideH1,
  buildCityGuideMetaTitle,
} from "../../utils/guides/cityGuideTitles";

type ParisGeneratedGuide = {
  city: string;
  country: string;
  wikidataId: string;
  wikipediaTitle: string;
  wikipediaUrl: string;
  leadImageUrl?: string | null;
  seoTitle: string;
  seoDescription: string;
  intro: string;
  topThings: Array<{ title: string; description: string }>;
  neighborhoods?: string[];
  whenToGo: string[];
  gettingAround: string[];
  dayTrips: string[];
  facts: {
    officialWebsite?: string | null;
  };
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isGuideLike = (value: unknown): value is ParisGeneratedGuide => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const guide = value as Record<string, unknown>;
  if (
    !isNonEmptyString(guide.seoTitle) ||
    !isNonEmptyString(guide.seoDescription) ||
    !isNonEmptyString(guide.intro) ||
    !isNonEmptyString(guide.wikipediaUrl) ||
    !isNonEmptyString(guide.wikipediaTitle) ||
    !isNonEmptyString(guide.wikidataId)
  ) {
    return false;
  }

  if (!Array.isArray(guide.topThings) || !Array.isArray(guide.whenToGo)) {
    return false;
  }

  return Array.isArray(guide.gettingAround) && Array.isArray(guide.dayTrips);
};

const parisGuide = isGuideLike(rawParisGuide) ? rawParisGuide : null;

const legacyParisTours: Tour[] = getEngine2ParisTours().map(tour => {
  const image = tour.images.hero || tour.seo.ogImage || "";

  return {
    id: `engine2-guide-${tour.id}`,
    engine: "engine2",
    slug: tour.slug,
    title: tour.name,
    operator: tour.provider.name,
    categories: ["adventure"],
    primaryCategory: "adventure",
    destination: {
      country: tour.geo.country,
      state: tour.geo.country,
      stateSlug: tour.sourceCountrySlug || "france",
      city: tour.geo.city,
      citySlug: tour.sourceCitySlug || "paris",
      lat: tour.geo.lat ?? undefined,
      lng: tour.geo.lng ?? undefined,
    },
    heroImage: image,
    galleryImages: image ? [image] : [],
    badges: { tagline: "Tour" },
    activitySlugs: ["adventure"],
    bookingProvider: "fareharbor",
    bookingUrl: tour.booking.bookingUrl,
    bookingWidgetUrl: tour.booking.bookingUrl,
    longDescription: tour.content.experienceText || tour.seo.description,
  };
});

const engine6ParisTours = getInternationalEngine6CityGuideTours(
  "france",
  "paris",
);
const topParisTours = (
  engine6ParisTours.length ? engine6ParisTours : legacyParisTours
).slice(0, 10);

const phase2ParisTopThings =
  parisGuide?.topThings.map(item => ({
    ...item,
    description: deepenInternationalPoiNarrative(
      parisGuide.city,
      item.title,
      item.description,
    ),
  })) ?? [];

export default function ParisGuideRoute() {
  if (!parisGuide) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-3xl font-semibold">Paris Guide — Coming soon</h1>
        <p className="mt-4 text-base text-[#405040]">
          We’re polishing this Paris guide now. Please check back soon.
        </p>
      </main>
    );
  }

  const cityGuideDisplayTitle = buildCityGuideDisplayTitle(parisGuide.city);
  const cityGuideMetaTitle = buildCityGuideMetaTitle(parisGuide.city);
  const cityGuideH1 = buildCityGuideH1(parisGuide.city);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-[#1f2a1f]">
      <Seo
        title={cityGuideMetaTitle}
        description={parisGuide.seoDescription}
        url="/guides/world/france/paris"
        image={parisGuide.leadImageUrl ?? null}
      />
      <header>
        <p className="text-xs uppercase tracking-wide text-[#5f7a5f]">
          {cityGuideDisplayTitle}
        </p>
        <h1 className="mt-2 text-4xl font-bold">{cityGuideH1}</h1>
        <div className="mt-4 space-y-3 text-lg text-[#334433]">
          <p>{parisGuide.intro}</p>
        </div>
        {parisGuide.leadImageUrl ? (
          <img
            src={parisGuide.leadImageUrl}
            alt="Paris skyline"
            className="mt-6 h-auto w-full rounded-xl object-cover"
            loading="lazy"
          />
        ) : null}
      </header>

      <section className="mt-10 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-10">
        <h2 className="text-2xl font-semibold">Things to Do in Paris</h2>
        <ol className="mt-6 space-y-6">
          {phase2ParisTopThings.map((item, index) => (
            <GuideThingsToDoCard
              key={item.title}
              index={index + 1}
              city={parisGuide.city}
              title={item.title}
              description={item.description}
              fallbackImageUrl={parisGuide.leadImageUrl ?? null}
              fallbackImageAlt="Paris travel scenery"
            />
          ))}
        </ol>
      </section>

      {parisGuide.neighborhoods?.length ? (
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Neighborhoods to explore</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-[#405040]">
            {parisGuide.neighborhoods.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10 grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="text-xl font-semibold">When to go</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-[#405040]">
            {parisGuide.whenToGo.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Getting around</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-[#405040]">
            {parisGuide.gettingAround.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Day trips</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-[#405040]">
            {parisGuide.dayTrips.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {topParisTours.length ? (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold">Top tours in Paris</h2>
            <p className="text-sm text-[#405040]">
              Swipe to browse {topParisTours.length} picks
            </p>
          </div>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
            {topParisTours.map(tour => {
              const rawImage = tour.heroImage || undefined;
              const image =
                rawImage && !isGenericHeroFallbackImage(rawImage)
                  ? rawImage
                  : undefined;

              return (
                <article
                  key={tour.id}
                  className="min-w-[260px] max-w-[260px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-black/5">
                    {image ? (
                      <Image
                        src={image}
                        fallbackSrc={image}
                        alt={tour.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#7a8a6b]">
                      {tour.operator}
                    </p>
                    <h3 className="mt-2 line-clamp-2 min-h-[3rem] text-base font-semibold text-[#1f2a1f]">
                      {tour.title}
                    </h3>
                    <Link href={getTourDetailPath(tour)}>
                      <a className="mt-4 inline-flex rounded-full bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#287a35]">
                        View tour
                      </a>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-12 border-t border-[#dde7dd] pt-6">
        <h2 className="text-xl font-semibold">Further reading</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-[#405040]">
          <li>
            <a
              className="underline"
              href={parisGuide.wikipediaUrl}
              target="_blank"
              rel="noreferrer"
            >
              Wikipedia ({parisGuide.wikipediaTitle})
            </a>
          </li>
          <li>
            <a
              className="underline"
              href={`https://www.wikidata.org/wiki/${parisGuide.wikidataId}`}
              target="_blank"
              rel="noreferrer"
            >
              Wikidata (Paris {parisGuide.wikidataId})
            </a>
          </li>
          {parisGuide.facts?.officialWebsite ? (
            <li>
              <a
                className="underline"
                href={parisGuide.facts.officialWebsite}
                target="_blank"
                rel="noreferrer"
              >
                Paris tourism official site
              </a>
            </li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
