import type { ReactNode } from "react";
import { Link } from "wouter";

import TourCard from "../components/TourCard";
import type { GuideContent, GuideLink } from "../data/guideData";
import { getGuideTourDetailPath } from "../data/guideData";

type GuideTemplateProps = {
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
    <div className="mt-4 text-sm text-[#405040] md:text-base">{children}</div>
  </section>
);

const LinkPill = ({ link }: { link: GuideLink }) => (
  <Link href={link.href}>
    <a className="inline-flex items-center rounded-full border border-[#2f4a2f]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] transition hover:bg-[#f0f4ee]">
      {link.label}
    </a>
  </Link>
);

const Paragraphs = ({ text }: { text: string }) => (
  <div className="space-y-4">
    {text.split("\n\n").map((paragraph, index) => (
      <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
    ))}
  </div>
);

export default function GuideTemplate({ guide }: GuideTemplateProps) {
  const cityPills =
    guide.topCities?.map((city) => ({
      label: city.name,
      href:
        guide.type === "state"
          ? `/guides/us/${guide.slug}/${city.slug}`
          : `/guides/world/${guide.slug}/${city.slug}`,
    })) ?? [];

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/80">
            {guide.breadcrumbs.map((crumb, index) => (
              <span key={`${crumb.href}-${index}`} className="flex items-center gap-3">
                <Link href={crumb.href}>
                  <a>{crumb.label}</a>
                </Link>
                {index < guide.breadcrumbs.length - 1 ? <span>/</span> : null}
              </span>
            ))}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              {guide.type === "city"
                ? `${guide.name} guide`
                : `${guide.name} guide`}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              {guide.type === "city" && guide.cityGuide
                ? guide.cityGuide.heroTitle
                : `${guide.name} Outdoor Adventure Guide`}
            </h1>
            {guide.activityFocus ? (
              <p className="mt-3 text-sm text-white/80 md:text-base">
                Showing tours focused on {guide.activityFocus}.
              </p>
            ) : null}
            <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
              {guide.intro}
            </p>
          </div>
          {guide.type !== "city" && guide.activities?.length ? (
            <div className="flex flex-wrap gap-3">
              {guide.activities.map((activity) => (
                <LinkPill key={activity.href} link={activity} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        {guide.type === "city" && guide.cityGuide ? (
          <>
            <Section title={`Intro to ${guide.name}`}>
              <Paragraphs text={guide.cityGuide.intro} />
            </Section>
            <Section title={`Why Visit ${guide.name}?`}>
              <Paragraphs text={guide.cityGuide.whyVisit} />
            </Section>
            <Section title={`Best Things to Do in ${guide.name}`}>
              <Paragraphs text={guide.cityGuide.bestThingsIntro} />
              <div className="mt-6 grid gap-4">
                {guide.cityGuide.highlights.map((highlight, index) => (
                  <div
                    key={`${highlight.title}-${index}`}
                    className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
                  >
                    <h3 className="text-lg font-semibold text-[#1f2a1f]">
                      {highlight.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#405040]">
                      {highlight.description}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
            <Section title="When to Go & How Long to Stay">
              <Paragraphs text={guide.cityGuide.whenToGo} />
            </Section>
            <Section title="Who This Destination Is Perfect For">
              <Paragraphs text={guide.cityGuide.whoFor} />
            </Section>
            <Section title="Practical Tips">
              <Paragraphs text={guide.cityGuide.practicalTips} />
            </Section>
            <Section title={`Top Tours in ${guide.name}`}>
              <Paragraphs text={guide.cityGuide.toursIntro} />
              {guide.featuredTours.length ? (
                <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {guide.featuredTours.map((tour) => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      href={getGuideTourDetailPath(tour)}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#405040]">
                  More tours are coming soon.
                </p>
              )}
            </Section>
          </>
        ) : (
          <>
            {guide.activities?.length ? (
              <Section title={`Best ways to explore ${guide.name}`}>
                <div className="flex flex-wrap gap-3">
                  {guide.activities.map((activity) => (
                    <LinkPill key={activity.href} link={activity} />
                  ))}
                </div>
              </Section>
            ) : null}
            {cityPills.length ? (
              <Section title="Top regions / cities">
                <div className="flex flex-wrap gap-3">
                  {cityPills.map((city) => (
                    <LinkPill key={city.href} link={city} />
                  ))}
                </div>
              </Section>
            ) : null}

            <Section title="Recommended itineraries">
              <div className="grid gap-6 md:grid-cols-3">
                {guide.itineraries.map((itinerary) => (
                  <div
                    key={itinerary.title}
                    className="rounded-2xl border border-black/10 bg-white p-5"
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-[#7a8a6b]">
                      {itinerary.duration}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[#1f2a1f]">
                      {itinerary.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#405040]">
                      {itinerary.description}
                    </p>
                    {itinerary.links.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {itinerary.links.map((link) => (
                          <LinkPill key={link.href} link={link} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </Section>

            <div className="grid gap-6 md:grid-cols-2">
              <Section title="Best time to visit">
                <p>{guide.bestTimeToVisit}</p>
              </Section>
              <Section title="What to pack">
                <p>{guide.whatToPack}</p>
              </Section>
            </div>

            <Section title="Featured tours">
              {guide.featuredTours.length ? (
                <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {guide.featuredTours.map((tour) => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      href={getGuideTourDetailPath(tour)}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#405040]">
                  More tours are coming soon.
                </p>
              )}
            </Section>
          </>
        )}
      </section>
    </main>
  );
}
