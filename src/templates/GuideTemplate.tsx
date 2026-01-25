import type { ReactNode } from "react";
import { Link } from "wouter";

import GuideInternalLinks from "../components/GuideInternalLinks";
import Image from "../components/Image";
import Seo from "../components/Seo";
import type { GuideContent, GuideLink } from "../data/guideData";
import type { GuideImage } from "../data/guideImages";
import { buildMetaDescription } from "../utils/seo";

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

const GuideImageBlock = ({ image }: { image: GuideImage }) => (
  <div className="mt-10 overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm">
    <Image
      src={image.src}
      alt={image.alt}
      className="h-64 w-full object-cover md:h-96"
    />
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

  const guideImages =
    guide.type === "city" ? guide.guideImages ?? [] : [];
  const guideTitle =
    guide.type === "city" && guide.parentName
      ? `${guide.name}, ${guide.parentName} Outdoor Adventure Guide | Tours & Tips`
      : `${guide.name} Outdoor Adventure Guide | Tours & Tips`;
  const guideDescription = buildMetaDescription(
    guide.intro,
    `Plan your ${guide.name} adventure with curated tours, itineraries, and local guide highlights.`,
  );
  const guideUrl =
    guide.type === "state"
      ? `/guides/us/${guide.slug}`
      : guide.type === "country"
        ? `/guides/world/${guide.slug}`
        : guide.regionType === "state"
          ? `/guides/us/${guide.parentSlug}/${guide.slug}`
          : `/guides/world/${guide.parentSlug}/${guide.slug}`;

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo title={guideTitle} description={guideDescription} url={guideUrl} />
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
              {guide.name} Outdoor Adventure Guide
            </h1>
            {guide.activityFocus ? (
              <p className="mt-3 text-sm text-white/80 md:text-base">
                Showing tours focused on {guide.activityFocus}.
              </p>
            ) : null}
            <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
              {guide.intro}
            </p>
            <GuideInternalLinks guide={guide} variant="intro" />
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
        <GuideInternalLinks guide={guide} variant="primary" />
        {guideImages[0] ? <GuideImageBlock image={guideImages[0]} /> : null}
        {guide.type === "city" && guide.activities?.length ? (
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

        <GuideInternalLinks guide={guide} variant="top-tours" />

        {guide.type === "city" && guide.topThingsToDo?.length ? (
          <Section title={`Top 15 things to do in ${guide.name}`}>
            <ol className="list-decimal space-y-3 pl-5">
              {guide.topThingsToDo.map((item) => (
                <li key={item.title}>
                  <p className="font-semibold text-[#1f2a1f]">{item.title}</p>
                  <p className="text-sm text-[#405040]">{item.description}</p>
                </li>
              ))}
            </ol>
          </Section>
        ) : null}

        {guide.type === "city" && guide.thingsToDoSections?.length ? (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-[#1f2a1f] md:text-3xl">
              Things to do in {guide.name}
            </h2>
            <div className="mt-6 space-y-8">
              {guide.thingsToDoSections.map((section) => (
                <article
                  key={section.title}
                  className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-10"
                >
                  <h3 className="text-xl font-semibold text-[#1f2a1f] md:text-2xl">
                    {section.title}
                  </h3>
                  <div className="mt-4 space-y-4 text-sm text-[#405040] leading-relaxed md:text-base">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {guideImages[1] ? <GuideImageBlock image={guideImages[1]} /> : null}

        <div className="grid gap-6 md:grid-cols-2">
          <Section title={guide.type === "city" ? "When to go" : "Best time to visit"}>
            <p>{guide.bestTimeToVisit}</p>
          </Section>
          <Section title={guide.type === "city" ? "What to bring" : "What to pack"}>
            <p>{guide.whatToPack}</p>
          </Section>
        </div>

        {guideImages[2] ? <GuideImageBlock image={guideImages[2]} /> : null}

        <GuideInternalLinks guide={guide} variant="nearby" />
      </section>
    </main>
  );
}
