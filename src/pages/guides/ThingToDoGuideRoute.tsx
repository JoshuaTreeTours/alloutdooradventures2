import { Link } from "wouter";

import Seo from "../../components/Seo";
import { useStructuredData } from "../../components/StructuredDataProvider";
import { resolveThingPage } from "../../utils/guides/thingPages";
import { buildBreadcrumbList } from "../../utils/structuredData";
import { isGenericHeroFallbackImage } from "../../utils/hero";

type ThingToDoGuideRouteProps = {
  params: {
    countrySlug: string;
    regionSlug: string;
    citySlug: string;
    thingSlug: string;
  };
};

export default function ThingToDoGuideRoute({
  params,
}: ThingToDoGuideRouteProps) {
  const resolved = resolveThingPage(params);

  if (!resolved) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Attraction not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          We couldn’t find that attraction page. Return to the city guide and
          explore another thing to do.
        </p>
      </main>
    );
  }

  const { guide, thing, sourceUrl, paragraphs, facts } = resolved;
  const cityPath = `/${guide.slug.replace(/^\/+/, "")}`;
  const pagePath = `${cityPath}/${params.thingSlug}`;
  const title = `${thing.title} in ${guide.city} | Things to Do`;
  const description = paragraphs[0] ?? thing.description;

  useStructuredData([
    buildBreadcrumbList([
      { name: "Guides", url: "/guides" },
      { name: "US", url: "/guides/us" },
      { name: guide.state, url: `/guides/us/${params.regionSlug}` },
      { name: guide.city ?? guide.state, url: cityPath },
      { name: thing.title, url: pagePath },
    ]),
    {
      "@type": ["TouristAttraction", "Place"],
      name: thing.title,
      description,
      url: pagePath,
      isPartOf: {
        "@type": "TouristDestination",
        name: `${guide.city}, ${guide.state}`,
        url: cityPath,
      },
      ...(sourceUrl ? { sameAs: sourceUrl } : {}),
    },
  ]);

  const heroImage = isGenericHeroFallbackImage(guide.hero.image)
    ? null
    : guide.hero.image;

  return (
    <main className="bg-[#f6f1e8] px-6 py-14 text-[#1f2a1f]">
      <Seo
        title={title}
        description={description}
        url={pagePath}
        image={heroImage}
      />

      <article className="mx-auto max-w-4xl rounded-3xl border border-black/10 bg-white/80 p-8 shadow-sm md:p-10">
        <p className="text-xs uppercase tracking-[0.25em] text-[#405040]">
          Things to do in {guide.city}
        </p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
          {thing.title}
        </h1>

        <div className="mt-6 space-y-4 text-sm leading-7 text-[#405040] md:text-base">
          {(paragraphs.length ? paragraphs : [thing.description]).map(
            paragraph => (
              <p key={paragraph}>{paragraph}</p>
            )
          )}
        </div>

        {facts.length ? (
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Quick facts</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#405040]">
              {facts.map(fact => (
                <li key={`${fact.label}-${fact.value}`}>
                  <span className="font-semibold text-[#1f2a1f]">
                    {fact.label}:
                  </span>{" "}
                  {fact.value}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="mt-8 inline-block text-sm font-medium underline"
          >
            Official link
          </a>
        ) : null}

        <div className="mt-8">
          <Link href={cityPath}>
            <a className="text-sm font-medium underline">
              Back to Things to do in {guide.city}
            </a>
          </Link>
        </div>
      </article>
    </main>
  );
}
