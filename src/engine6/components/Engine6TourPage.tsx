import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Seo from "../../components/Seo";
import { useStructuredData } from "../../components/StructuredDataProvider";
import TourCard from "../../components/TourCard";
import { getToursByCityUnified } from "../../data/tours";
import Engine6DebugPanel from "./Engine6DebugPanel";
import { formatEngine6AggregateRating } from "../rating";
import { buildEngine6ParentCityToursPath } from "../routeIntegrity";
import { buildEngine6SchemaGraph } from "../schema/buildEngine6SchemaGraph";
import { buildEngine6Seo, formatEngine6CategoryLabel } from "../seo";
import { buildEngine6DisplaySections } from "../displaySections";
import type { Engine6Tour } from "../types";
import {
  fetchEngine6LiveProductFields,
  mergeEngine6LiveFieldsIntoEngine6Tour,
  type Engine6LiveProductFields,
} from "../liveProductFields";

const BOOK_CTA_CLASSES =
  "inline-flex rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]";

const EXTERNAL_BOOKING_REL = "sponsored nofollow noopener";

function Engine6BookingCta({
  href,
  isExternal,
  className,
  noteClassName = "mt-2 max-w-md text-xs leading-5 text-[#405040]",
  feedbackClassName = "mt-2 text-sm font-medium text-[#2f4a2f]",
}: {
  href: string;
  isExternal: boolean;
  className: string;
  noteClassName?: string;
  feedbackClassName?: string;
}) {
  const [isOpening, setIsOpening] = useState(false);

  return (
    <div>
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? EXTERNAL_BOOKING_REL : undefined}
        onClick={() => {
          if (isExternal) {
            setIsOpening(true);
          }
        }}
        className={className}
      >
        Check availability
      </a>
      {isOpening ? (
        <p className={feedbackClassName} aria-live="polite">
          Opening secure Viator booking page…
        </p>
      ) : null}
      {isExternal ? (
        <p className={noteClassName}>
          Booking opens on Viator, our secure travel partner. Some availability
          pages may take a few seconds to load.
        </p>
      ) : null}
    </div>
  );
}

const ContentSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="mt-8 rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
    <h2 className="text-2xl font-semibold text-green-900">{title}</h2>
    <div className="mt-4">{children}</div>
  </section>
);

const normalizeItinerarySummaryBlocks = (summary: string) => {
  const clean = summary.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const chunks = clean
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(chunk => chunk.trim())
    .filter(Boolean);
  if (chunks.length <= 1) return [clean];

  const targetBlocks = Math.max(2, Math.min(5, chunks.length));
  const chunkSize = Math.ceil(chunks.length / targetBlocks);
  const blocks: string[] = [];
  for (let index = 0; index < chunks.length; index += chunkSize) {
    blocks.push(chunks.slice(index, index + chunkSize).join(" "));
  }
  return blocks.slice(0, 5);
};

const getItineraryStopType = (item: {
  title: string;
  stopType?: "stop" | "pass-by";
  description?: string;
  admissionNote?: string;
}) => {
  if (item.stopType === "pass-by") return "Pass by";
  if (item.stopType === "stop") return "Stop";
  const text = [item.title, item.description ?? "", item.admissionNote ?? ""]
    .join(" ")
    .toLowerCase();
  return /\bpass(?:\s|-)?by\b/.test(text) ? "Pass by" : "Stop";
};

const buildEngine6Breadcrumbs = (tour: Engine6Tour) => {
  const pathSegments = tour.canonicalPath.split("/").filter(Boolean);
  const stateSlug = pathSegments[1] ?? "";
  const parentCityToursPath =
    buildEngine6ParentCityToursPath(tour.canonicalPath) ??
    `/destinations/${stateSlug}/${pathSegments[2] ?? ""}/tours`;

  return [
    { label: "Destinations", href: "/destinations" },
    { label: tour.state, href: `/destinations/${stateSlug}` },
    { label: tour.city, href: parentCityToursPath },
  ];
};

const RatingSummary = ({
  aggregateRating,
  reviewCount,
}: {
  aggregateRating: number | null;
  reviewCount: number | null;
}) => {
  const ratingLabel = formatEngine6AggregateRating(aggregateRating) ?? "N/A";
  const totalReviews = reviewCount ?? 0;

  return (
    <div className="space-y-2" data-testid="engine6-rating-summary">
      <div
        className="flex items-center gap-1"
        aria-label={`Rated ${ratingLabel} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            data-testid="engine6-rating-star"
            className="text-lg leading-none text-amber-300"
          >
            ★
          </span>
        ))}
      </div>
      <p className="text-sm font-semibold text-white">
        {ratingLabel} rating • {totalReviews} reviews
      </p>
    </div>
  );
};

export const hydrateRelatedTourCommercialFields = (
  entry: { tour: import("../../data/tours.types").Tour; href: string },
  liveFields?: Partial<Engine6LiveProductFields>
) => {
  const baseTour = entry.tour;
  if (baseTour.engine !== "engine6" || !liveFields) {
    return entry;
  }

  const priceAmount =
    typeof liveFields.priceAmount === "number" ? liveFields.priceAmount : null;
  const priceFormatted =
    typeof liveFields.priceFormatted === "string"
      ? liveFields.priceFormatted.trim()
      : "";

  return {
    ...entry,
    tour: {
      ...baseTour,
      startingPrice: priceAmount ?? baseTour.startingPrice,
      badges: {
        ...baseTour.badges,
        rating:
          typeof liveFields.aggregateRating === "number"
            ? liveFields.aggregateRating
            : baseTour.badges.rating,
        reviewCount:
          typeof liveFields.reviewCount === "number"
            ? liveFields.reviewCount
            : baseTour.badges.reviewCount,
        priceFrom: priceFormatted || baseTour.badges.priceFrom,
        duration:
          typeof liveFields.durationText === "string" &&
          liveFields.durationText.trim()
            ? liveFields.durationText
            : baseTour.badges.duration,
      },
    },
  };
};

export default function Engine6TourPage({
  tour: initialTour,
}: {
  tour: Engine6Tour;
}) {
  const relatedToursScrollerRef = useRef<HTMLDivElement | null>(null);
  const SHOW_ENGINE6_DEBUG =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ENGINE6_DEBUG === "true";
  const [liveCurrentProductFields, setLiveCurrentProductFields] =
    useState<Engine6LiveProductFields | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchEngine6LiveProductFields(initialTour.productCode)
      .then(fields => {
        if (!cancelled && fields) {
          setLiveCurrentProductFields(fields);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [initialTour.productCode]);

  const tour = useMemo(
    () =>
      mergeEngine6LiveFieldsIntoEngine6Tour(
        initialTour,
        liveCurrentProductFields ?? undefined
      ),
    [initialTour, liveCurrentProductFields]
  );
  const categoryLabel =
    tour.categoryLabel ?? formatEngine6CategoryLabel(tour.primaryCategory);
  const seo = buildEngine6Seo(tour);
  const schema = buildEngine6SchemaGraph(tour);
  const schemaGraph = schema["@graph"] as Array<Record<string, unknown>>;
  const resolvedHeroUrl = tour.resolvedHero?.url ?? tour.heroImageUrl;
  const hasPrice = Boolean(tour.priceFormatted);
  const hasRating =
    typeof tour.aggregateRating === "number" &&
    typeof tour.reviewCount === "number";
  const hasMeetingPoint = Boolean(tour.meetingPointText?.trim());
  const hasDuration = Boolean(tour.durationText?.trim());
  const breadcrumbs = buildEngine6Breadcrumbs(tour);
  const parentCityToursPath =
    buildEngine6ParentCityToursPath(tour.canonicalPath) ?? breadcrumbs[2]?.href;
  const displaySections = buildEngine6DisplaySections(
    tour.highlights,
    tour.requirements
  );
  const relatedTours = useMemo(() => {
    const [, stateSlug = "", citySlug = "", currentSlug = ""] =
      /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/.exec(
        tour.canonicalPath
      ) ?? [];

    if (!stateSlug || !citySlug) {
      return [];
    }

    return getToursByCityUnified(stateSlug, citySlug).filter(entry => {
      const matchesProductCode =
        Boolean(tour.productCode) &&
        Boolean(entry.tour.productCode) &&
        entry.tour.productCode?.toUpperCase() ===
          tour.productCode.toUpperCase();
      const matchesSlug = entry.tour.slug === currentSlug;

      return !matchesProductCode && !matchesSlug;
    });
  }, [tour.canonicalPath, tour.productCode]);
  const [liveEngine6DynamicByProductCode, setLiveEngine6DynamicByProductCode] =
    useState<Record<string, Engine6LiveProductFields>>({});
  const relatedEngine6ProductCodes = useMemo(
    () =>
      relatedTours
        .map(entry => entry.tour)
        .map(candidate =>
          candidate.engine === "engine6" && candidate.productCode
            ? candidate.productCode
            : null
        )
        .filter((productCode): productCode is string => Boolean(productCode)),
    [relatedTours]
  );
  useEffect(() => {
    let cancelled = false;
    if (relatedEngine6ProductCodes.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    Promise.all(
      relatedEngine6ProductCodes.map(async productCode => {
        const fields = await fetchEngine6LiveProductFields(productCode);
        if (!fields) return null;
        return [productCode, fields] as const;
      })
    )
      .then(results => {
        if (cancelled) return;
        const next: Record<string, Engine6LiveProductFields> = {};
        for (const result of results) {
          if (!result) continue;
          next[result[0]] = result[1];
        }
        if (Object.keys(next).length > 0) {
          setLiveEngine6DynamicByProductCode(previous => ({
            ...previous,
            ...next,
          }));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [relatedEngine6ProductCodes]);
  const hydratedRelatedTours = useMemo(
    () =>
      relatedTours.map(entry =>
        entry.tour.engine === "engine6" && entry.tour.productCode
          ? hydrateRelatedTourCommercialFields(
              entry,
              liveEngine6DynamicByProductCode[entry.tour.productCode]
            )
          : entry
      ),
    [liveEngine6DynamicByProductCode, relatedTours]
  );

  const scrollRelatedToursByDirection = useCallback(
    (direction: "prev" | "next") => {
      const scroller = relatedToursScrollerRef.current;
      if (!scroller) return;
      const scrollAmount = Math.max(
        280,
        Math.round(scroller.clientWidth * 0.85)
      );
      const signedAmount = direction === "next" ? scrollAmount : -scrollAmount;
      scroller.scrollBy({ left: signedAmount, behavior: "smooth" });
    },
    []
  );
  const showRelatedTours = hydratedRelatedTours.length >= 2;
  const isExternalBookingUrl = /^https?:\/\//i.test(tour.bookingUrl);
  useStructuredData(schemaGraph);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={seo.title}
        description={seo.description}
        url={seo.url}
        image={seo.image}
      />
      <section
        className="bg-[#2f4a2f] text-white"
        data-testid="engine6-hero-banner"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="mb-4 text-xs text-green-100/80"
              data-testid="engine6-breadcrumbs"
            >
              <ol className="flex flex-wrap items-center gap-2">
                {breadcrumbs.map((crumb, index) => (
                  <li
                    key={crumb.href}
                    className="inline-flex items-center gap-2"
                  >
                    <a
                      href={crumb.href}
                      aria-label={
                        index === 2
                          ? `${crumb.label} Tours & Activities`
                          : crumb.label
                      }
                      className="transition hover:text-white hover:underline"
                    >
                      {crumb.label}
                    </a>
                    <span aria-hidden="true" className="text-white/40">
                      /
                    </span>
                  </li>
                ))}
                <li aria-current="page" className="font-medium text-white/90">
                  {tour.title}
                </li>
              </ol>
            </nav>

            <p
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-green-100/70"
              data-testid="engine6-tours-activities-label"
            >
              {tour.city} Tours & Activities
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/75">
              {tour.city}, {tour.state}
            </p>
            {categoryLabel ? (
              <p className="mt-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-green-50">
                {categoryLabel}
              </p>
            ) : null}
            <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              {tour.title}
            </h1>

            <div
              className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm"
              data-testid="engine6-commercial-facts"
            >
              <div className="grid gap-4 text-sm text-white/95 md:grid-cols-2">
                <div className="space-y-4">
                  {hasPrice ? (
                    <p>
                      <strong>Price:</strong> {tour.priceFormatted}
                    </p>
                  ) : null}
                  {hasRating ? (
                    <RatingSummary
                      aggregateRating={tour.aggregateRating}
                      reviewCount={tour.reviewCount}
                    />
                  ) : null}
                </div>

                <div className="space-y-4">
                  {hasDuration ? (
                    <p>
                      <strong>Duration:</strong> {tour.durationText}
                    </p>
                  ) : null}
                  {hasMeetingPoint ? (
                    <p>
                      <strong>Meeting point:</strong> {tour.meetingPointText}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/90">
              <span className="block">
                This tour is operated by an independent third-party provider.
              </span>
              <span className="block">
                All Outdoor Adventures is a marketplace that connects travelers
                with local tour operators.
              </span>
            </p>

            <div className="mt-6">
              <Engine6BookingCta
                href={tour.bookingUrl}
                isExternal={isExternalBookingUrl}
                className={BOOK_CTA_CLASSES}
                feedbackClassName="mt-2 text-sm font-medium text-white"
                noteClassName="mt-2 max-w-md text-xs leading-5 text-white/85"
              />
            </div>
          </div>

          {resolvedHeroUrl ? (
            <img
              src={resolvedHeroUrl}
              alt={tour.title}
              className="h-80 w-full rounded-3xl object-cover shadow-2xl md:h-[440px]"
            />
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {tour.overviewText ? (
          <ContentSection title="Overview">
            <div className="space-y-4 text-base leading-7 text-slate-700">
              {tour.overviewText.split(/\n\n+/).map((paragraph, index) => (
                <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </ContentSection>
        ) : null}

        {displaySections.highlights.length > 0 ? (
          <ContentSection title="Highlights">
            <ul className="grid gap-3 md:grid-cols-2">
              {displaySections.highlights.map((highlight, index) => (
                <li
                  key={`${highlight.slice(0, 32)}-${index}`}
                  className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm leading-6 text-green-950"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </ContentSection>
        ) : null}

        {tour.included.length > 0 ? (
          <ContentSection title="What’s included">
            <ul className="grid gap-3 md:grid-cols-2">
              {tour.included.map((item, index) => (
                <li
                  key={`${item.slice(0, 32)}-${index}`}
                  className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm leading-6 text-green-950"
                >
                  {item}
                </li>
              ))}
            </ul>
          </ContentSection>
        ) : null}

        {tour.itinerary.length > 0 ? (
          <ContentSection title="Itinerary">
            <div data-testid="engine6-itinerary-timeline" className="space-y-6">
              {tour.itinerary.map((item, index) => {
                const shouldRenderSectionLabel =
                  Boolean(item.sectionLabel) &&
                  item.sectionLabel !== tour.itinerary[index - 1]?.sectionLabel;
                const itineraryDescription = item.description?.trim()
                  ? item.description.trim()
                  : getItineraryStopType(item) === "Pass by"
                    ? `${item.title} (Pass By)`
                    : "";

                return (
                  <div key={`${item.title}-${index}`} className="space-y-3">
                    {shouldRenderSectionLabel ? (
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
                        {item.sectionLabel}
                      </p>
                    ) : null}
                    <div
                      className="rounded-xl border border-green-100 bg-green-50/60 p-5"
                      data-testid="engine6-itinerary-item"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 space-y-2">
                          <span className="inline-flex rounded-full border border-green-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-800">
                            {getItineraryStopType(item)}
                          </span>
                          <p className="whitespace-normal break-words text-lg font-semibold leading-snug text-green-900">
                            {item.title}
                          </p>
                        </div>
                        {item.duration ? (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-800">
                            {item.duration}
                          </span>
                        ) : null}
                      </div>
                      {itineraryDescription ? (
                        <p className="mt-3 text-sm leading-6 text-slate-700">
                          {itineraryDescription}
                        </p>
                      ) : null}
                      {item.admissionNote ? (
                        <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-800">
                          {item.admissionNote}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </ContentSection>
        ) : tour.itinerarySummaryText ? (
          <ContentSection title="Itinerary summary">
            <div
              className="rounded-xl border border-amber-200 bg-amber-50 p-5"
              data-testid="engine6-itinerary-summary-only"
            >
              <ul className="space-y-3">
                {normalizeItinerarySummaryBlocks(tour.itinerarySummaryText).map(
                  (segment, index) => (
                    <li
                      key={`${segment.slice(0, 32)}-${index}`}
                      className="rounded-lg bg-white/70 p-3 text-sm leading-6 text-amber-900"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                        Stop {index + 1}
                      </p>
                      <p>{segment}</p>
                    </li>
                  )
                )}
              </ul>
            </div>
          </ContentSection>
        ) : null}

        {tour.faqs.length > 0 ? (
          <ContentSection title="FAQs">
            <div className="space-y-3">
              {tour.faqs.map((faq, index) => (
                <details
                  key={`${faq.question.slice(0, 32)}-${index}`}
                  className="rounded-xl border border-green-100 bg-green-50/60 p-4"
                >
                  <summary className="cursor-pointer list-none font-semibold text-green-900">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </ContentSection>
        ) : null}

        {displaySections.additionalInfo.length > 0 ? (
          <ContentSection title="Additional info">
            <ul className="space-y-3">
              {displaySections.additionalInfo.map((item, index) => (
                <li
                  key={`${item.slice(0, 32)}-${index}`}
                  className="rounded-xl border border-green-100 bg-green-50/60 p-4 text-sm leading-6 text-slate-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </ContentSection>
        ) : null}

        <section
          className="mt-8 rounded-[2rem] bg-[#1f4d36] px-6 py-12 text-center text-white shadow-xl"
          data-testid="engine6-bottom-cta"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-green-200">
            READY TO BOOK?
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Lock in your {tour.city} adventure today.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-green-100">
            Secure your spot, confirm the latest availability, and review final
            departure details before checkout.
          </p>
          <div className="mt-6 flex justify-center">
            <Engine6BookingCta
              href={tour.bookingUrl}
              isExternal={isExternalBookingUrl}
              className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1f4d36] transition hover:bg-green-50"
              feedbackClassName="mt-2 text-sm font-medium text-white"
              noteClassName="mx-auto mt-2 max-w-md text-xs leading-5 text-green-100"
            />
          </div>
        </section>

        {showRelatedTours ? (
          <section
            className="mt-8"
            data-testid="engine6-related-tours"
            aria-label={`Other Tours in ${tour.city}`}
          >
            <h2 className="text-2xl font-semibold text-green-900">
              Other Tours in {tour.city}
            </h2>
            <div className="relative mt-4">
              <button
                type="button"
                aria-label={`Scroll other ${tour.city} tours left`}
                className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-green-200 bg-white/95 text-2xl font-bold text-green-900 shadow-lg transition hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 md:flex"
                onClick={() => scrollRelatedToursByDirection("prev")}
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                type="button"
                aria-label={`Scroll other ${tour.city} tours right`}
                className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-green-200 bg-white/95 text-2xl font-bold text-green-900 shadow-lg transition hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 md:flex"
                onClick={() => scrollRelatedToursByDirection("next")}
              >
                <span aria-hidden="true">›</span>
              </button>
              <div
                ref={relatedToursScrollerRef}
                className="-mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-4"
              >
                {hydratedRelatedTours.map(entry => (
                  <div
                    key={`${entry.href}-${entry.tour.id}`}
                    className="w-[82vw] max-w-sm shrink-0 snap-start md:w-[360px]"
                  >
                    <TourCard
                      tour={entry.tour}
                      href={entry.href}
                      forceDocumentNavigation
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
        {SHOW_ENGINE6_DEBUG && <Engine6DebugPanel tour={tour} />}
        {parentCityToursPath ? (
          <div className="mt-8 text-center" data-testid="engine6-back-to-tours">
            <a
              href={parentCityToursPath}
              className="inline-flex items-center rounded-full border border-green-800 px-4 py-2 text-sm font-semibold text-green-900 transition hover:bg-green-50"
            >
              Back to {tour.city} tours
            </a>
          </div>
        ) : null}
      </div>
    </main>
  );
}
