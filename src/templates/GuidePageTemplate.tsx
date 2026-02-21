import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "wouter";

import Seo from "../components/Seo";
import TourCard from "../components/TourCard";
import AvailableToursGrid from "../components/guides/AvailableToursGrid";
import GuideThingsToDoCard from "../components/guides/GuideThingsToDoCard";
import SeeAllToursBubble from "../components/guides/SeeAllToursBubble";
import GuideThingsMap from "../components/maps/GuideThingsMap";
import { useStructuredData } from "../components/StructuredDataProvider";
import {
  getToursByCity,
  getToursByCityUnified,
  getToursByState,
} from "../data/tours";
import type { GuidePageData } from "../utils/loadGuide";
import { getGuidePlaceName, getValidSameAsLinks } from "../utils/loadGuide";
import { buildBreadcrumbList } from "../utils/structuredData";
import { buildCityFactsCard } from "../utils/guides/buildCityFactsCard";

type GuidePageTemplateProps = {
  guide: GuidePageData;
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mt-12 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-10">
    <h2 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
      {title}
    </h2>
    <div className="mt-4 text-sm text-[#405040] md:text-base">{children}</div>
  </section>
);

export default function GuidePageTemplate({ guide }: GuidePageTemplateProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const isTier2 = guide.tier === "tier2";
  const place = getGuidePlaceName(guide);
  const urlPath = `/${guide.slug.replace(/^\/+/, "")}`;
  const sameAs = getValidSameAsLinks(guide);
  const tours = guide.tours.citySlug
    ? getToursByCity(guide.tours.stateSlug, guide.tours.citySlug)
    : getToursByState(guide.tours.stateSlug);
  const featuredTours = tours.slice(0, guide.tours.limit ?? 6);
  const allCityTours =
    guide.tours.stateSlug && guide.tours.citySlug
      ? getToursByCityUnified(guide.tours.stateSlug, guide.tours.citySlug)
      : [];
  const mappedThingsLimit = isTier2 ? 5 : 8;
  const mappedThings = guide.thingsToDo.slice(0, mappedThingsLimit);
  const wikiExtractFallback = (
    guide.aboutCity as
      | { sections?: Array<{ paragraphs?: string[] }> }
      | undefined
  )?.sections
    ?.flatMap(section => section.paragraphs ?? [])
    .join(" ");
  const aboutFactsCard =
    guide.aboutCity?.factsCard ??
    buildCityFactsCard({
      cityName: place,
      stateName: guide.state,
      countryName: guide.country,
      wikiSummaryText: guide.aboutCity?.wikiSummaryText ?? guide.overview[0],
      wikiExtractText: guide.aboutCity?.wikiExtractText ?? wikiExtractFallback,
      thingsToDoItems: guide.thingsToDo,
    });

  const breadcrumbs = [
    { name: "Guides", url: "/guides" },
    { name: "US", url: "/guides/us" },
    {
      name: guide.state,
      url: `/guides/us/${guide.state.toLowerCase().replace(/\s+/g, "-")}`,
    },
    ...(guide.city ? [{ name: guide.city, url: urlPath }] : []),
  ];

  const structuredDataNodes = useMemo(() => {
    const destinationType = guide.city
      ? "TouristDestination"
      : "AdministrativeArea";
    return [
      buildBreadcrumbList(breadcrumbs),
      {
        "@type": destinationType,
        name: place,
        description: guide.overview[0],
        url: urlPath,
        ...(sameAs.length ? { sameAs } : {}),
        containedInPlace: {
          "@type": "Country",
          name: guide.country,
        },
      },
    ];
  }, [
    breadcrumbs,
    guide.country,
    guide.overview,
    place,
    sameAs,
    urlPath,
    guide.city,
  ]);

  useStructuredData(structuredDataNodes);

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
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={`${guide.title} | Outdoor Adventures`}
        description={guide.overview[0]}
        url={urlPath}
        image={guide.hero.image}
      />

      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.url} className="flex items-center gap-3">
                <Link href={crumb.url}>
                  <a>{crumb.name}</a>
                </Link>
                {index < breadcrumbs.length - 1 ? <span>/</span> : null}
              </span>
            ))}
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            {place} guide
          </p>
          <h1 className="text-3xl font-semibold md:text-5xl">
            {guide.hero.headline}
          </h1>
          <p className="max-w-3xl text-sm text-white/90 md:text-base">
            {guide.hero.subheadline}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm">
          <img
            src={guide.hero.image}
            alt={guide.hero.alt}
            className="h-64 w-full object-cover md:h-96"
          />
        </div>

        <Section title={`Highlights of "${place}"`}>
          <GuideThingsMap
            city={guide.city ?? place}
            state={guide.state}
            cityCenter={guide.cityCenter}
            attractions={mappedThings}
          />
        </Section>

        <Section title={aboutFactsCard.title}>
          <ul className="list-disc space-y-2 pl-5">
            {aboutFactsCard.bullets.map(bullet => (
              <li key={`${bullet.label}:${bullet.value}`}>
                <strong>{bullet.label}:</strong> {bullet.value}
              </li>
            ))}
          </ul>
        </Section>

        {!isTier2 && featuredTours.length ? (
          <Section title="Top Tours">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
                {featuredTours.map(tour => (
                  <div
                    key={tour.id}
                    className="min-w-0 flex-[0_0_85%] md:flex-[0_0_50%] lg:flex-[0_0_33%]"
                  >
                    <TourCard tour={tour} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={`top-tours-dot-${index}`}
                    type="button"
                    aria-label={`Go to top tour ${index + 1}`}
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
            <SeeAllToursBubble
              cityName={guide.city}
              citySlug={guide.tours.citySlug}
              stateSlug={guide.tours.stateSlug}
            />
          </Section>
        ) : null}

        <Section title={`Things to Do in ${place}`}>
          <ol className="space-y-5">
            {guide.thingsToDo.map((item, index) => {
              const sourceUrl =
                item.sourceUrl ?? item.source_url ?? item.wikiUrl;

              return (
                <GuideThingsToDoCard
                  key={item.title}
                  index={index + 1}
                  city={guide.city ?? place}
                  title={item.title}
                  description={item.description}
                  sourceUrl={sourceUrl}
                  wikiUrl={item.wikiUrl}
                  imageUrl={item.imageUrl}
                  disableImage={item.disableImage}
                />
              );
            })}
          </ol>
        </Section>

        <div className="grid gap-6 md:grid-cols-2">
          {!isTier2 ? (
            <Section title="Best time to visit">
              <p className="font-semibold">{guide.bestTimeToVisit.title}</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {guide.bestTimeToVisit.bullets.map(bullet => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </Section>
          ) : null}
          <Section title="Travel tips">
            <ul className="list-disc space-y-2 pl-5">
              {guide.travelTips.map(tip => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </Section>
        </div>

        {guide.faq?.length ? (
          <Section title={`FAQs about ${place}`}>
            <div className="space-y-4">
              {guide.faq.map(item => (
                <article key={item.q}>
                  <h3 className="font-semibold text-[#1f2a1f]">{item.q}</h3>
                  <p className="mt-1 text-sm text-[#405040]">{item.a}</p>
                </article>
              ))}
            </div>
          </Section>
        ) : null}

        <Section title={`Learn More About ${place}`}>
          <ul className="space-y-3 text-sm font-medium">
            <li>
              <a
                href={guide.seoLinks.wikipedia}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1f2a1f] underline"
              >
                {`${place} travel guide — Wikipedia`}
              </a>
            </li>
            <li>
              <a
                href={guide.seoLinks.officialTourism}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1f2a1f] underline"
              >
                {`Official ${place} tourism website`}
              </a>
            </li>
            <li>
              <a
                href={guide.seoLinks.reference}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1f2a1f] underline"
              >
                {`${place} ${guide.state} history & overview`}
              </a>
            </li>
          </ul>
        </Section>

        {guide.tours.citySlug ? (
          <AvailableToursGrid
            cityName={guide.city ?? place}
            citySlug={guide.tours.citySlug}
            stateSlug={guide.tours.stateSlug}
            tours={allCityTours}
          />
        ) : null}
      </section>
    </main>
  );
}
