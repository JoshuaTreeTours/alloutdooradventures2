import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

import Image from "../../components/Image";
import Seo from "../../components/Seo";
import { useStructuredData } from "../../components/StructuredDataProvider";
import { ENGINE2_DEFAULT_IMAGE } from "../config/destinations";
import { getAllEngine2Tours, type Engine2Tour } from "../data/loadEngine2";
import { buildSchemaGraph } from "../schema/buildSchemaGraph";
import { buildEngine2Seo } from "../seo/buildEngine2Seo";
import { PRICE_MIN_THRESHOLD_USD } from "../../constants/merchantDefaults";
import { applyPriceFloor, parsePrice } from "../../utils/merchantPricing";
import {
  getPalmSpringsPilotContent,
  isPalmSpringsTour,
} from "../../utils/fh/palmSpringsPilotContent";
import type { AOAEnrichedContent } from "../../utils/fh/transformToAOAContent";

type Engine2TourPageProps = {
  tour: Engine2Tour;
  isPspEngine1FhRewriteEnabled: boolean;
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

export default function Engine2TourPage({
  tour,
  isPspEngine1FhRewriteEnabled,
}: Engine2TourPageProps) {
  const [pilotContent, setPilotContent] = useState<AOAEnrichedContent | null>(
    null
  );
  const normalizedTour = useMemo(() => {
    const highlights = normalizeStringArray(tour.content.highlights);
    const heroImage =
      typeof tour.images.hero === "string" && tour.images.hero.trim().length > 0
        ? tour.images.hero
        : ENGINE2_DEFAULT_IMAGE;
    const gallery = normalizeStringArray(tour.images.gallery).filter(
      image => image !== heroImage
    );
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
  const isPalmSprings = isPalmSpringsTour(tour);
  useEffect(() => {
    if (!isPspEngine1FhRewriteEnabled || !isPalmSprings) {
      setPilotContent(null);
      return;
    }

    let isMounted = true;
    const origin = window.location.origin;

    getPalmSpringsPilotContent(tour, origin).then(content => {
      if (isMounted) {
        setPilotContent(content);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isPalmSprings, isPspEngine1FhRewriteEnabled, tour]);

  if (isPalmSprings && typeof window === "undefined") {
    console.info(
      `[FHPilot] fetched=${pilotContent ? "ok" : "failed"} transformed=${pilotContent ? "ok" : "failed"}`
    );
  }
  const bookingPath = `${tour.seo.canonicalPath}/book`;
  const backToToursPath = tour.seo.canonicalPath.replace(
    /\/tours\/[^/]+$/,
    "/tours"
  );
  const basePrice = parsePrice(tour.pricing?.price ?? null);
  const displayPrice = applyPriceFloor(basePrice);
  const isPriceFallbackApplied =
    basePrice === null || basePrice <= 0 || basePrice < PRICE_MIN_THRESHOLD_USD;

  const structuredDataNodes = useMemo(
    () => buildSchemaGraph(normalizedTour, seo, pilotContent, isPalmSprings),
    [normalizedTour, seo, pilotContent, isPalmSprings]
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
          {pilotContent ? (
            <p className="mt-2 inline-flex w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-white">
              Pilot enrichment active
            </p>
          ) : null}
          <p className="mt-4 text-sm font-semibold text-white/90">
            {isPriceFallbackApplied
              ? "From $129 per person"
              : `From $${displayPrice.toFixed(2)} per person`}
          </p>
          <div className="mt-6 flex gap-3">
            <Link href={bookingPath}>
              <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">
                BOOK
              </a>
            </Link>
            <Link href={backToToursPath}>
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
        {pilotContent?.quickFacts ? (
          <div className="mt-8 rounded-xl border border-black/10 bg-[#f8f5ee] p-5">
            <h3 className="text-lg font-semibold text-[#2f4a2f]">
              Quick facts
            </h3>
            <ul className="mt-3 space-y-1 text-sm text-[#405040]">
              {pilotContent.quickFacts.duration ? (
                <li>
                  <strong>Duration:</strong> {pilotContent.quickFacts.duration}
                </li>
              ) : null}
              {pilotContent.quickFacts.meetingPoint ? (
                <li>
                  <strong>Meeting point:</strong>{" "}
                  {pilotContent.quickFacts.meetingPoint}
                </li>
              ) : null}
              {pilotContent.quickFacts.age ? (
                <li>
                  <strong>Age:</strong> {pilotContent.quickFacts.age}
                </li>
              ) : null}
              {pilotContent.quickFacts.groupSize ? (
                <li>
                  <strong>Group size:</strong>{" "}
                  {pilotContent.quickFacts.groupSize}
                </li>
              ) : null}
              {pilotContent.quickFacts.cancellation ? (
                <li>
                  <strong>Cancellation:</strong>{" "}
                  {pilotContent.quickFacts.cancellation}
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
        {pilotContent?.whatYoullExperience ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              What You’ll Experience
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#405040]">
              {pilotContent.whatYoullExperience}
            </p>
          </>
        ) : null}
        {(pilotContent?.highlights ?? normalizedTour.content.highlights)
          .length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Highlights
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#405040]">
              {(
                pilotContent?.highlights ?? normalizedTour.content.highlights
              ).map(highlight => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </>
        ) : null}
        {pilotContent?.whatsIncluded?.length ||
        pilotContent?.whatsNotIncluded?.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-[#2f4a2f]">
                What’s Included
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#405040]">
                {(pilotContent?.whatsIncluded ?? []).map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#2f4a2f]">
                Not Included
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#405040]">
                {(pilotContent?.whatsNotIncluded ?? []).map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {pilotContent?.quickFacts?.cancellation ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Cancellation
            </h2>
            <p className="mt-3 text-sm text-[#405040]">
              {pilotContent.quickFacts.cancellation}
            </p>
          </>
        ) : null}

        {pilotContent?.faq?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">FAQ</h2>
            <div className="mt-4 space-y-4">
              {pilotContent.faq.map(item => (
                <div key={item.q}>
                  <p className="text-sm font-semibold text-[#2f4a2f]">
                    {item.q}
                  </p>
                  <p className="text-sm text-[#405040]">{item.a}</p>
                </div>
              ))}
            </div>
          </>
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
              {relatedTours.map(related => {
                const relatedHeroImage =
                  related.images.hero || ENGINE2_DEFAULT_IMAGE;

                return (
                  <Link key={related.slug} href={related.seo.canonicalPath}>
                    <a className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <Image
                        src={relatedHeroImage}
                        fallbackSrc={relatedHeroImage}
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
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
