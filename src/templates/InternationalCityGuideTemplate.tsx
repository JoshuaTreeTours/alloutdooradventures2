import { useMemo, type ReactNode } from "react";
import { Link } from "wouter";

import GuideInternalLinks from "../components/GuideInternalLinks";
import GuideLinkPill from "../components/GuideLinkPill";
import GuideThingsToDoCard from "../components/guides/GuideThingsToDoCard";
import Image from "../components/Image";
import Seo from "../components/Seo";
import { useStructuredData } from "../components/StructuredDataProvider";
import type { GuideContent } from "../data/guideData";
import { buildMetaDescription } from "../utils/seo";
import { buildBreadcrumbList } from "../utils/structuredData";
import {
  buildCityGuideDisplayTitle,
  buildCityGuideH1,
  buildCityGuideMetaTitle,
} from "../utils/guides/cityGuideTitles";
import {
  GENERIC_OUTDOOR_GUIDE_HERO_IMAGE,
  isValidGuideHeroImage,
} from "../utils/guides/resolveGuideHeroImage";

type InternationalCityGuideTemplateProps = {
  guide: GuideContent;
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="mt-12 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-10">
    <h2 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
      {title}
    </h2>
    <div className="mt-5 text-sm text-[#405040] md:text-base">{children}</div>
  </section>
);

export default function InternationalCityGuideTemplate({
  guide,
}: InternationalCityGuideTemplateProps) {
  const guideUrl = `/guides/world/${guide.parentSlug}/${guide.slug}`;
  const displayTitle = buildCityGuideDisplayTitle(guide.name);
  const h1 = buildCityGuideH1(guide.name);
  const metaTitle = buildCityGuideMetaTitle(guide.name);
  const description = buildMetaDescription(
    guide.intro,
    `Plan a ${guide.name} trip with verified landmarks, practical visitor guidance, and curated tours.`,
  );

  const usableGuideImages = (guide.guideImages ?? []).filter(image =>
    isValidGuideHeroImage(image.src),
  );
  const primaryImage = usableGuideImages[0] ?? {
    src: GENERIC_OUTDOOR_GUIDE_HERO_IMAGE,
    alt: `${guide.name} travel scenery`,
    category: "scenic" as const,
  };

  const structuredDataNodes = useMemo(
    () => [
      buildBreadcrumbList(
        guide.breadcrumbs.map(crumb => ({
          name: crumb.label,
          url: crumb.href,
        })),
      ),
      {
        "@type": "TouristDestination",
        name: guide.name,
        description,
        url: guideUrl,
        ...(guide.parentName
          ? {
              containedInPlace: {
                "@type": "Country",
                name: guide.parentName,
              },
            }
          : {}),
      },
    ],
    [description, guide.breadcrumbs, guide.name, guide.parentName, guideUrl],
  );

  useStructuredData(structuredDataNodes);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={metaTitle}
        description={description}
        url={guideUrl}
        image={primaryImage.src}
      />

      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            {guide.breadcrumbs.map((crumb, index) => (
              <span
                key={`${crumb.href}-${index}`}
                className="flex items-center gap-3"
              >
                <Link href={crumb.href}>
                  <a>{crumb.label}</a>
                </Link>
                {index < guide.breadcrumbs.length - 1 ? <span>/</span> : null}
              </span>
            ))}
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              {displayTitle}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">{h1}</h1>
            <div className="mt-4 max-w-4xl text-sm leading-7 text-white/90 md:text-base">
              <p>{guide.intro}</p>
            </div>
            <GuideInternalLinks guide={guide} variant="area" />
            <GuideInternalLinks guide={guide} variant="intro" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <GuideInternalLinks guide={guide} variant="primary" />

        <div className="mt-10 overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm">
          <Image
            src={primaryImage.src}
            fallbackSrc={GENERIC_OUTDOOR_GUIDE_HERO_IMAGE}
            alt={primaryImage.alt}
            className="h-64 w-full object-cover md:h-96"
          />
        </div>

        {guide.activities?.length ? (
          <Section title={`Best ways to explore ${guide.name}`}>
            <div className="flex flex-wrap gap-3">
              {guide.activities.map(activity => (
                <GuideLinkPill key={activity.href} link={activity} />
              ))}
            </div>
          </Section>
        ) : null}

        {guide.topThingsToDo?.length ? (
          <Section title={`Things to Do in ${guide.name}`}>
            <ol className="space-y-6">
              {guide.topThingsToDo.map((item, index) => {
                const fallbackImage =
                  usableGuideImages[index % Math.max(usableGuideImages.length, 1)] ??
                  primaryImage;

                return (
                  <GuideThingsToDoCard
                    key={item.title}
                    index={index + 1}
                    city={guide.name}
                    title={item.title}
                    description={item.description}
                    fallbackImageUrl={fallbackImage.src}
                    fallbackImageAlt={fallbackImage.alt}
                  />
                );
              })}
            </ol>
          </Section>
        ) : null}

        {guide.thingsToDoSections?.length ? (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-[#1f2a1f] md:text-3xl">
              Understand {guide.name}
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {guide.thingsToDoSections.map(section => (
                <article
                  key={section.title}
                  className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-8"
                >
                  <h3 className="text-xl font-semibold text-[#1f2a1f]">
                    {section.title}
                  </h3>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-[#405040] md:text-base">
                    {section.paragraphs.map(paragraph => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {guide.itineraries.length ? (
          <Section title="Recommended itineraries">
            <div className="grid gap-6 md:grid-cols-3">
              {guide.itineraries.map(itinerary => (
                <article
                  key={itinerary.title}
                  className="rounded-2xl border border-black/10 bg-white p-5"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-[#7a8a6b]">
                    {itinerary.duration}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[#1f2a1f]">
                    {itinerary.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#405040]">
                    {itinerary.description}
                  </p>
                  {itinerary.links.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {itinerary.links.map(link => (
                        <GuideLinkPill key={link.href} link={link} />
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </Section>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <Section title="When to go">
            <p className="leading-7">{guide.bestTimeToVisit}</p>
          </Section>
          <Section title="What to bring">
            <p className="leading-7">{guide.whatToPack}</p>
          </Section>
        </div>

        <GuideInternalLinks guide={guide} variant="top-tours" />
        <GuideInternalLinks guide={guide} variant="nearby" />
      </section>
    </main>
  );
}
