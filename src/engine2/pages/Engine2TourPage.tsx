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
  getTour34849OverrideContent,
  isPalmSpringsTour,
} from "../../utils/fh/palmSpringsPilotContent";

type Engine2TourPageProps = {
  tour: Engine2Tour;
  isFHPilotEnabled: boolean;
  isPsp34849FhOverrideEnabled?: boolean;
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
  isFHPilotEnabled,
  isPsp34849FhOverrideEnabled = false,
}: Engine2TourPageProps) {
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
  const pilotContent =
    isFHPilotEnabled && isPalmSprings && tour.bookingUrl
      ? getPalmSpringsPilotContent(tour)
      : null;
  const is34849 = tour.id === "34849";
  const [tour34849OverrideContent, setTour34849OverrideContent] = useState(
    () =>
      is34849 && isPsp34849FhOverrideEnabled
        ? getPalmSpringsPilotContent(tour)
        : null
  );

  useEffect(() => {
    if (!is34849 || !isPsp34849FhOverrideEnabled) {
      return;
    }

    let isActive = true;
    void getTour34849OverrideContent(tour).then(content => {
      if (isActive) {
        setTour34849OverrideContent(content);
      }
    });

    return () => {
      isActive = false;
    };
  }, [is34849, isPsp34849FhOverrideEnabled, tour]);

  const is34849OverrideActive =
    is34849 && isPsp34849FhOverrideEnabled && Boolean(tour34849OverrideContent);
  const contentToRender = is34849OverrideActive
    ? tour34849OverrideContent
    : pilotContent;

  if (isPalmSprings && typeof window === "undefined") {
    console.info(
      `[FHPilot] fetched=${contentToRender ? "ok" : "failed"} transformed=${contentToRender ? "ok" : "failed"}`
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
    () => buildSchemaGraph(normalizedTour, seo, contentToRender, isPalmSprings),
    [normalizedTour, seo, contentToRender, isPalmSprings]
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
        {is34849OverrideActive ? (
          <p className="mt-6 inline-flex rounded-full border border-[#2f4a2f]/30 bg-[#f2f7f1] px-3 py-1 text-xs font-semibold text-[#2f4a2f]">
            Pilot override active (34849)
          </p>
        ) : null}
        <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f]">
          What you'll experience
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[#405040]">
          {is34849OverrideActive
            ? (contentToRender?.whatYoullExperience ??
              normalizedTour.content.experienceText)
            : normalizedTour.content.experienceText}
        </p>
        {contentToRender?.quickFacts ? (
          <div className="mt-8 rounded-xl border border-black/10 bg-[#f8f5ee] p-5">
            <h3 className="text-lg font-semibold text-[#2f4a2f]">
              Quick facts
            </h3>
            <ul className="mt-3 space-y-1 text-sm text-[#405040]">
              {contentToRender.quickFacts?.duration ? (
                <li>
                  <strong>Duration:</strong>{" "}
                  {contentToRender.quickFacts.duration}
                </li>
              ) : null}
              {contentToRender.quickFacts?.startLocationArea ? (
                <li>
                  <strong>Start area:</strong>{" "}
                  {contentToRender.quickFacts.startLocationArea}
                </li>
              ) : null}
              {contentToRender.quickFacts?.pickup ? (
                <li>
                  <strong>Pickup:</strong> {contentToRender.quickFacts.pickup}
                </li>
              ) : null}
              {contentToRender.quickFacts?.ageOrMinimumRequirements ? (
                <li>
                  <strong>Minimums:</strong>{" "}
                  {contentToRender.quickFacts.ageOrMinimumRequirements}
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
        {!is34849OverrideActive && contentToRender?.whatYoullExperience ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              What You’ll Experience
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#405040]">
              {contentToRender.whatYoullExperience}
            </p>
          </>
        ) : null}
        {contentToRender?.experienceInDepth?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Experience In Depth
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#405040]">
              {contentToRender.experienceInDepth.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </>
        ) : null}
        {(contentToRender?.highlights ?? normalizedTour.content.highlights)
          .length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Highlights
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#405040]">
              {(
                contentToRender?.highlights ?? normalizedTour.content.highlights
              ).map(highlight => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </>
        ) : null}

        {contentToRender?.itineraryOutline?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Itinerary
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[#405040]">
              {contentToRender.itineraryOutline.map(step => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </>
        ) : null}

        {contentToRender?.quickFacts?.startLocationArea ||
        contentToRender?.quickFacts?.pickup ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Meeting & Pickup
            </h2>
            <p className="mt-3 text-sm text-[#405040]">
              {contentToRender.quickFacts?.startLocationArea
                ? `Meeting area: ${contentToRender.quickFacts.startLocationArea}. `
                : "Meeting location details vary by departure. "}
              {contentToRender.quickFacts?.pickup
                ? `Pickup: ${contentToRender.quickFacts.pickup}.`
                : "Pickup details vary by departure."}
            </p>
          </>
        ) : null}

        {contentToRender?.whoItsFor?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Who It’s For
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#405040]">
              {contentToRender.whoItsFor.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}

        {contentToRender?.included?.length ||
        contentToRender?.notIncluded?.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-[#2f4a2f]">
                What’s Included
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#405040]">
                {(contentToRender?.included ?? []).map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#2f4a2f]">
                Not Included
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#405040]">
                {(contentToRender?.notIncluded ?? []).map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {contentToRender?.cancellationSummary ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Cancellation
            </h2>
            <p className="mt-3 text-sm text-[#405040]">
              {contentToRender.cancellationSummary}
            </p>
          </>
        ) : null}

        {contentToRender?.rulesAndRequirements?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Rules & Requirements
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#405040]">
              {contentToRender.rulesAndRequirements.map(rule => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </>
        ) : null}

        {contentToRender?.faq?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">FAQ</h2>
            <div className="mt-4 space-y-4">
              {contentToRender.faq.map(item => (
                <div key={item.question}>
                  <p className="text-sm font-semibold text-[#2f4a2f]">
                    {item.question}
                  </p>
                  <p className="text-sm text-[#405040]">{item.answer}</p>
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
