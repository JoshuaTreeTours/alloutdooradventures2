import { useMemo } from "react";
import { Link } from "wouter";

import GuideCard from "../components/GuideCard";
import Seo from "../components/Seo";
import TourCard from "../components/TourCard";
import { useStructuredData } from "../components/StructuredDataProvider";
import { getToursByCity, getToursByState } from "../data/tours";
import type { GuidePageData } from "../utils/loadGuide";
import { getGuidePlaceName, getValidSameAsLinks } from "../utils/loadGuide";
import { getRenderedThing } from "../utils/guides/thingCardContent";
import { buildBreadcrumbList } from "../utils/structuredData";

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
  const isTier2 = guide.tier === "tier2";
  const place = getGuidePlaceName(guide);
  const urlPath = `/${guide.slug.replace(/^\/+/, "")}`;
  const sameAs = getValidSameAsLinks(guide);
  const tours = guide.tours.citySlug
    ? getToursByCity(guide.tours.stateSlug, guide.tours.citySlug)
    : getToursByState(guide.tours.stateSlug);
  const featuredTours = tours.slice(0, guide.tours.limit ?? 6);
  const renderedThings = guide.thingsToDo.map((item, index) =>
    getRenderedThing(guide, item, index)
  );

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
      {
        "@type": "ItemList",
        name: `Things to do in ${place}`,
        itemListElement: renderedThings.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.title,
          item: item.learnMoreUrl,
        })),
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
    renderedThings,
  ]);

  useStructuredData(structuredDataNodes);

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

        <Section title={`About ${place}`}>
          <div className="space-y-4">
            {guide.overview.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Section>

        {!isTier2 ? (
          <Section title={`Top Highlights in ${place}`}>
            <div className="grid gap-4 md:grid-cols-2">
              {guide.highlights.map(item => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-black/10 bg-white p-4"
                >
                  <h3 className="font-semibold text-[#1f2a1f]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#405040]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </Section>
        ) : null}

        <Section title={`Things to Do in ${place}`}>
          <ol className="space-y-5">
            {renderedThings.map((item, index) => (
              <GuideCard
                key={item.title}
                item={item}
                index={index}
                learnMoreUrl={item.learnMoreUrl}
                anchorId={item.anchorId}
              />
            ))}
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

        {featuredTours.length ? (
          <Section title={guide.tours.title ?? `Top tours in ${place}`}>
            <div className="grid gap-6 md:grid-cols-3">
              {featuredTours.map(tour => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </Section>
        ) : null}

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
      </section>
    </main>
  );
}
