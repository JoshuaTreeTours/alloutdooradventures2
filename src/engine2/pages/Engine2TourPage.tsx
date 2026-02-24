import { useMemo } from "react";
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
import { isBadTokenString, sanitizeFhText } from "../../utils/text/sanitizeFhText";
import {
  getPalmSpringsOverrideContent,
  getPalmSpringsPilotContent,
  isPalmSpringsTour,
} from "../../utils/fh/palmSpringsPilotContent";
import type { TourRewriteV3 } from "../../utils/fh/transformToAOAContent";

type Engine2TourPageProps = {
  tour: Engine2Tour;
  isFHPilotEnabled: boolean;
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
    const heroSummary =
      typeof tour.content.heroSummary === "string" &&
      tour.content.heroSummary.trim().length > 0
        ? tour.content.heroSummary
        : undefined;
    const faqs = Array.isArray(tour.content.faqs)
      ? tour.content.faqs
          .filter(
            (item): item is { question: string; answer: string } =>
              Boolean(item?.question?.trim()) && Boolean(item?.answer?.trim())
          )
          .slice(0, 10)
      : [];
    const practicalNotes = normalizeStringArray(tour.content.practicalNotes).slice(0, 8);

    return {
      ...tour,
      images: {
        hero: heroImage,
        gallery,
      },
      content: {
        experienceText,
        highlights,
        heroSummary,
        faqs,
        practicalNotes,
      },
    };
  }, [tour]);

  const seo = useMemo(() => buildEngine2Seo(normalizedTour), [normalizedTour]);
  const isPalmSprings = isPalmSpringsTour(tour);
  const overrideContent = getPalmSpringsOverrideContent(tour);
  const pilotContent =
    isFHPilotEnabled && isPalmSprings && tour.bookingUrl
      ? getPalmSpringsPilotContent(tour)
      : null;
  const isJoshuaTreeTour = tour.sourceCitySlug === "joshua-tree";
  const sanitizeTourText = (value: string) => {
    const cleaned = sanitizeFhText(value, {
      itemName: tour.name,
      durationText: undefined,
    });

    if (isBadTokenString(cleaned)) {
      return "This guided experience in Joshua Tree is booked through FareHarbor and includes all logistics details on the booking page.";
    }

    return cleaned;
  };

  const engine1Content = {
    whatYoullExperience: normalizedTour.content.experienceText
      .split(/\n\n+/)
      .map(paragraph => paragraph.trim())
      .filter(Boolean)
      .map(paragraph => (isJoshuaTreeTour ? sanitizeTourText(paragraph) : paragraph)),
    highlights: normalizedTour.content.highlights.map(item =>
      isJoshuaTreeTour ? sanitizeTourText(item) : item
    ),
    faqs: (normalizedTour.content.faqs ?? []).map(item => ({
      question: isJoshuaTreeTour ? sanitizeTourText(item.question) : item.question,
      answer: isJoshuaTreeTour ? sanitizeTourText(item.answer) : item.answer,
    })),
    practicalNotes: (normalizedTour.content.practicalNotes ?? []).map(item =>
      isJoshuaTreeTour ? sanitizeTourText(item) : item
    ),
  };

  const content = overrideContent?.enabled
    ? overrideContent.content
    : engine1Content;

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
  const enginePriceLabel =
    basePrice === null || basePrice <= 0 || basePrice < PRICE_MIN_THRESHOLD_USD
      ? undefined
      : `From $${displayPrice.toFixed(2)} per person`;
  const overridePriceLabel = overrideContent?.enabled
    ? overrideContent.content.heroPriceText
    : undefined;
  const headerPriceLabel = overridePriceLabel ?? enginePriceLabel;
  const showFallbackPrice = !overridePriceLabel && !enginePriceLabel;

  const overrideSchemaDescription = overrideContent?.enabled
    ? overrideContent.content.schemaDescription
    : undefined;
  const overrideFaqs = overrideContent?.enabled
    ? overrideContent.content.faqs
    : undefined;

  const rewriteV3Content: TourRewriteV3 | undefined = overrideContent?.enabled
    ? overrideContent.content
    : undefined;

  const formattedMeetingPoint = rewriteV3Content?.meetingPoint
    ? [
        rewriteV3Content.meetingPoint.name,
        rewriteV3Content.meetingPoint.addressLine1,
        rewriteV3Content.meetingPoint.city,
        rewriteV3Content.meetingPoint.region,
        rewriteV3Content.meetingPoint.postalCode,
      ]
        .filter(Boolean)
        .join(", ") || rewriteV3Content.meetingPoint.rawText
    : undefined;

  const structuredDataNodes = useMemo(
    () =>
      buildSchemaGraph(
        normalizedTour,
        seo,
        pilotContent,
        isPalmSprings,
        overrideSchemaDescription,
        overrideFaqs,
        overrideContent?.enabled ?? false,
        rewriteV3Content
      ),
    [
      normalizedTour,
      seo,
      pilotContent,
      isPalmSprings,
      overrideSchemaDescription,
      overrideFaqs,
      overrideContent?.enabled,
      rewriteV3Content,
    ]
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
          {normalizedTour.content.heroSummary ? (
            <p className="mt-3 max-w-3xl text-sm text-white/90 md:text-base">
              {isJoshuaTreeTour
                ? sanitizeTourText(normalizedTour.content.heroSummary)
                : normalizedTour.content.heroSummary}
            </p>
          ) : null}
          {rewriteV3Content?.category?.primary ? (
            <p className="mt-2 text-sm text-white/90">
              {rewriteV3Content.category.primary}
              {rewriteV3Content.durationLabel
                ? ` · ${rewriteV3Content.durationLabel}`
                : ""}
              {formattedMeetingPoint ? ` · ${formattedMeetingPoint}` : ""}
            </p>
          ) : null}
          {headerPriceLabel ? (
            <p className="mt-4 text-sm font-semibold text-white/90">
              {headerPriceLabel}
            </p>
          ) : null}
          {showFallbackPrice ? (
            <p className="mt-4 text-sm font-semibold text-white/90">
              From $129 per person
            </p>
          ) : null}
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
        {overrideContent?.enabled ? (
          <div className="mt-6 rounded-lg border border-black/10 bg-[#f8f5ee] px-4 py-3 text-xs leading-relaxed text-[#405040] md:text-sm">
            <ul className="space-y-1">
              {rewriteV3Content?.category?.primary ? (
                <li>
                  <strong>Category:</strong> {rewriteV3Content.category.primary}
                </li>
              ) : null}
              {rewriteV3Content?.durationLabel ? (
                <li>
                  <strong>Duration:</strong> {rewriteV3Content.durationLabel}
                </li>
              ) : null}
              {formattedMeetingPoint ? (
                <li>
                  <strong>Meeting point:</strong> {formattedMeetingPoint}
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
        <h2 className="mt-6 text-2xl font-semibold text-[#2f4a2f]">
          What you'll experience
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#405040]">
          {content.whatYoullExperience.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
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
              {pilotContent.quickFacts.startLocationArea ? (
                <li>
                  <strong>Start area:</strong>{" "}
                  {pilotContent.quickFacts.startLocationArea}
                </li>
              ) : null}
              {pilotContent.quickFacts.pickup ? (
                <li>
                  <strong>Pickup:</strong> {pilotContent.quickFacts.pickup}
                </li>
              ) : null}
              {pilotContent.quickFacts.ageOrMinimumRequirements ? (
                <li>
                  <strong>Minimums:</strong>{" "}
                  {pilotContent.quickFacts.ageOrMinimumRequirements}
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
        {pilotContent?.experienceInDepth?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Experience In Depth
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#405040]">
              {pilotContent.experienceInDepth.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </>
        ) : null}
        {content.highlights.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Highlights
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#405040]">
              {content.highlights.map(highlight => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </>
        ) : null}

        {!overrideContent?.enabled && content.practicalNotes?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Practical notes
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#405040]">
              {content.practicalNotes.map(note => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </>
        ) : null}

        {!overrideContent?.enabled && content.faqs?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Frequently asked questions
            </h2>
            <div className="mt-4 space-y-4">
              {content.faqs.map(item => (
                <article
                  key={item.question}
                  className="rounded-lg border border-black/10 bg-white p-4"
                >
                  <h3 className="text-sm font-semibold text-[#2f4a2f]">
                    {item.question}
                  </h3>
                  <p className="mt-1 text-sm text-[#405040]">{item.answer}</p>
                </article>
              ))}
            </div>
          </>
        ) : null}
        {overrideContent?.enabled && overrideContent.content.faqs?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Frequently asked questions
            </h2>
            <div className="mt-4 space-y-4">
              {overrideContent.content.faqs.map(item => (
                <article
                  key={item.question}
                  className="rounded-lg border border-black/10 bg-white p-4"
                >
                  <h3 className="text-sm font-semibold text-[#2f4a2f]">
                    {item.question}
                  </h3>
                  <p className="mt-1 text-sm text-[#405040]">{item.answer}</p>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {pilotContent?.itineraryOutline?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Itinerary
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[#405040]">
              {pilotContent.itineraryOutline.map(step => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </>
        ) : null}

        {pilotContent?.quickFacts?.startLocationArea ||
        pilotContent?.quickFacts?.pickup ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Meeting & Pickup
            </h2>
            <p className="mt-3 text-sm text-[#405040]">
              {pilotContent.quickFacts?.startLocationArea
                ? `Meeting area: ${pilotContent.quickFacts.startLocationArea}. `
                : "Meeting location details vary by departure. "}
              {pilotContent.quickFacts?.pickup
                ? `Pickup: ${pilotContent.quickFacts.pickup}.`
                : "Pickup details vary by departure."}
            </p>
          </>
        ) : null}

        {pilotContent?.whoItsFor?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Who It’s For
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#405040]">
              {pilotContent.whoItsFor.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}

        {pilotContent?.included?.length || pilotContent?.notIncluded?.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-[#2f4a2f]">
                What’s Included
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#405040]">
                {(pilotContent?.included ?? []).map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#2f4a2f]">
                Not Included
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#405040]">
                {(pilotContent?.notIncluded ?? []).map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {pilotContent?.cancellationSummary ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Cancellation
            </h2>
            <p className="mt-3 text-sm text-[#405040]">
              {pilotContent.cancellationSummary}
            </p>
          </>
        ) : null}

        {pilotContent?.rulesAndRequirements?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Rules & Requirements
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#405040]">
              {pilotContent.rulesAndRequirements.map(rule => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </>
        ) : null}

        {pilotContent?.faq?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">FAQ</h2>
            <div className="mt-4 space-y-4">
              {pilotContent.faq.map(item => (
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
