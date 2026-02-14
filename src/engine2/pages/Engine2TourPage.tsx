import { useMemo } from "react";
import { Link } from "wouter";

import Image from "../../components/Image";
import Seo from "../../components/Seo";
import { useStructuredData } from "../../components/StructuredDataProvider";
import { ENGINE2_DEFAULT_IMAGE } from "../config/destinations";
import { getAllEngine2Tours, type Engine2Tour } from "../data/loadEngine2";
import { buildSchemaGraph } from "../schema/buildSchemaGraph";
import { buildEngine2Seo } from "../seo/buildEngine2Seo";

type Engine2TourPageProps = {
  tour: Engine2Tour;
};

const normalizeStringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map(item => item.trim())
    .filter(Boolean);
};

export default function Engine2TourPage({ tour }: Engine2TourPageProps) {
  const normalizedTour = useMemo(() => {
    const highlights = normalizeStringArray(tour.content.highlights);
    const gallery = normalizeStringArray(tour.images.gallery);
    const heroImage =
      typeof tour.images.hero === "string" && tour.images.hero.trim().length > 0
        ? tour.images.hero
        : ENGINE2_DEFAULT_IMAGE;
    const experienceText =
      typeof tour.content.experienceText === "string" &&
      tour.content.experienceText.trim().length > 0
        ? tour.content.experienceText
        : `Explore ${tour.name} in ${tour.geo.city}, ${tour.geo.region}.`;

    return {
      ...tour,
      images: {
        hero: heroImage,
        gallery,
      },
      content: {
        experienceText,
        highlights,
      },
    };
  }, [tour]);

  const seo = useMemo(() => buildEngine2Seo(normalizedTour), [normalizedTour]);
  const bookingPath = `${tour.seo.canonicalPath}/book`;

  const structuredDataNodes = useMemo(
    () => buildSchemaGraph(normalizedTour, seo),
    [normalizedTour, seo]
  );

  const relatedTours = useMemo(
    () =>
      getAllEngine2Tours().filter(
        item =>
          item.slug !== tour.slug && item.sourceCitySlug === tour.sourceCitySlug
      ),
    [tour.slug, tour.sourceCitySlug]
  );

  useStructuredData(structuredDataNodes);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={seo.title}
        description={seo.description}
        url={seo.canonical}
        image={seo.og.image}
      />
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            {tour.geo.city}, {tour.geo.region}
          </p>
          <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
            {tour.name}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
            Operated by {tour.provider.name}
          </p>
          <div className="mt-6 flex gap-3">
            <Link href={bookingPath}>
              <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
                BOOK
              </a>
            </Link>
            <Link href="/destinations/california/palm-springs/tours">
              <a className="inline-flex items-center justify-center rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25">
                Back to tours
              </a>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <Image
            src={normalizedTour.images.hero}
            fallbackSrc={normalizedTour.images.hero}
            alt={tour.name}
            className="h-64 w-full object-cover md:h-80"
          />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-[#2f4a2f]">
          What you'll experience
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[#405040]">
          {normalizedTour.content.experienceText}
        </p>
        {normalizedTour.content.highlights.length ? (
          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-[#405040]">
            {normalizedTour.content.highlights.map(highlight => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        ) : null}

        {normalizedTour.images.gallery.length ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {normalizedTour.images.gallery.map(image => (
              <div
                key={image}
                className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
              >
                <Image
                  src={image}
                  fallbackSrc={image}
                  alt={`${tour.name} gallery`}
                  className="h-56 w-full object-cover md:h-64"
                />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {relatedTours.length ? (
        <section className="bg-white/60">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-2xl font-semibold text-[#2f4a2f]">
              More tours in {tour.geo.city}
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedTours.map(related => (
                <Link key={related.slug} href={related.seo.canonicalPath}>
                  <a className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <Image
                      src={related.images.hero}
                      fallbackSrc={related.images.hero}
                      alt={related.name}
                      className="h-44 w-full object-cover"
                    />
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#7a8a6b]">
                        {related.geo.city}, {related.geo.region}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-[#1f2a1f]">
                        {related.name}
                      </h3>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
