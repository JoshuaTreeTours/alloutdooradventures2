import { useMemo } from "react";

import Seo from "../../components/Seo";
import TourRating from "../../engine2/components/TourRating";
import { DEFAULT_ENGINE3_HERO_IMAGE_URL } from "../constants";
import { buildEngine3ViatorSchemaGraph } from "../schema/buildEngine3ViatorSchemaGraph";
import { buildEngine3BreadcrumbItems } from "../utils/buildEngine3BreadcrumbItems";
import type { Engine3TourViewModel } from "../types";
import { extractViatorProductCode } from "../../utils/viator/extractViatorProductCode";
import {
  getViatorFromPrice,
  peekViatorFromPriceCache,
} from "../../server/viator/getViatorFromPrice";

type Engine3TourPageProps = {
  tour: Engine3TourViewModel;
};

const EXTERNAL_CTA_REL = "nofollow sponsored noopener noreferrer";
const POSTER_CHILD_PATHS = new Set([
  "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
  "/destinations/california/palm-springs/tours/palm-springs-indian-canyons-bike-and-hike-3351p15",
]);

const priceLabel = (priceFrom?: string) => {
  if (!priceFrom) {
    return undefined;
  }

  return /^prices?\s+starting/i.test(priceFrom)
    ? priceFrom
    : `Prices starting at ${priceFrom}`;
};

const parsePriceValue = (priceFrom?: string): number | undefined => {
  if (!priceFrom) {
    return undefined;
  }

  const numeric = Number.parseFloat(priceFrom.replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
};

const formatUsdPrice = (value: number): string => {
  const normalized = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return `USD ${normalized}`;
};

const isValidMetric = (value?: number): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

export default function Engine3TourPage({ tour }: Engine3TourPageProps) {
  const hasMeetingPoint = Boolean(tour.meetingPointDescription);
  const canonicalUrl = tour.canonicalPath;
  const canonicalUrlLower = canonicalUrl?.toLowerCase();
  const isPosterChildPalmSprings = Boolean(
    canonicalUrlLower &&
    Array.from(POSTER_CHILD_PATHS).some(path =>
      canonicalUrlLower.endsWith(path)
    )
  );

  const cityRegionLabel = [tour.city?.trim(), tour.region?.trim()]
    .filter(Boolean)
    .join(", ");
  const pageDescription =
    tour.description ||
    (cityRegionLabel ? `${tour.title} in ${cityRegionLabel}` : undefined);
  const heroUrl =
    tour.primaryImageUrl ||
    tour.heroImageOverrideUrl ||
    DEFAULT_ENGINE3_HERO_IMAGE_URL;

  const breadcrumbItems = buildEngine3BreadcrumbItems({
    title: tour.title,
    canonicalUrl,
    stateSlug:
      tour.stateSlug ?? (isPosterChildPalmSprings ? "california" : undefined),
    citySlug:
      tour.citySlug ?? (isPosterChildPalmSprings ? "palm-springs" : undefined),
    region: tour.region,
    city: tour.city,
  });

  const viatorProductCode = extractViatorProductCode(tour.bookingUrl);
  const viatorFromPrice = viatorProductCode
    ? peekViatorFromPriceCache(viatorProductCode, "USD")
    : null;

  const staticPriceValue = parsePriceValue(tour.priceFrom);
  const runtimePriceValue =
    viatorFromPrice && Number.isFinite(viatorFromPrice.price)
      ? viatorFromPrice.price
      : undefined;
  const resolvedPriceFrom =
    staticPriceValue !== undefined
      ? tour.priceFrom
      : runtimePriceValue && runtimePriceValue > 0
        ? formatUsdPrice(runtimePriceValue)
        : undefined;
  const showRating =
    isValidMetric(tour.rating) && isValidMetric(tour.reviewCount);

  if (typeof window === "undefined" && viatorProductCode) {
    void getViatorFromPrice(viatorProductCode, "USD");
  }

  const structuredData = useMemo(
    () =>
      buildEngine3ViatorSchemaGraph(tour, canonicalUrl, {
        tripDescription: isPosterChildPalmSprings ? pageDescription : undefined,
        breadcrumbItems: breadcrumbItems.map(item => ({
          name: item.label,
          item: item.href,
        })),
        offerPrice:
          viatorFromPrice && Number.isFinite(viatorFromPrice.price)
            ? viatorFromPrice.price
            : undefined,
      }),
    [
      breadcrumbItems,
      canonicalUrl,
      isPosterChildPalmSprings,
      pageDescription,
      tour,
      viatorFromPrice,
    ]
  );

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={tour.title}
        description={pageDescription}
        url={canonicalUrl}
        image={heroUrl}
      />
      <script
        id="structured-data-engine3-viator"
        key="structured-data-engine3-viator"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            {tour.city}, {tour.region}
          </p>
          <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
            {tour.title}
          </h1>
          <nav aria-label="Breadcrumb" className="mt-4 text-xs text-white/85">
            <ol className="flex flex-wrap items-center gap-2">
              {breadcrumbItems.map((item, index) => (
                <li key={item.href} className="inline-flex items-center gap-2">
                  {index > 0 ? <span aria-hidden="true">&gt;</span> : null}
                  {index === breadcrumbItems.length - 1 ? (
                    <span
                      aria-current="page"
                      className="font-semibold text-white"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <a
                      className="underline decoration-white/50"
                      href={item.href}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          {tour.duration ? (
            <p className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]">
              {tour.duration}
            </p>
          ) : null}
          {priceLabel(resolvedPriceFrom) ? (
            <p className="mt-4 text-sm font-semibold text-white/90">
              {priceLabel(resolvedPriceFrom)}
            </p>
          ) : null}
          {showRating ? (
            <TourRating rating={tour.rating} reviewCount={tour.reviewCount} />
          ) : null}
          <div className="mt-6">
            <a
              href={tour.bookingUrl}
              target="_blank"
              rel={EXTERNAL_CTA_REL}
              className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
            >
              Book This Tour
            </a>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <img
            src={heroUrl}
            alt={tour.title}
            referrerPolicy="no-referrer"
            loading="eager"
            className="h-64 w-full object-cover md:h-80"
          />
        </div>

        {tour.description ? (
          <>
            <h2 className="text-2xl font-semibold text-[#2f4a2f]">Overview</h2>
            <p className="mt-3 text-sm leading-7 text-[#405040]">
              {tour.description}
            </p>
          </>
        ) : null}

        {tour.highlights?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Highlights
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[#405040]">
              {tour.highlights.map(highlight => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </>
        ) : null}

        {tour.included?.length || tour.notIncluded?.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {tour.included?.length ? (
              <div>
                <h2 className="text-xl font-semibold text-[#2f4a2f]">
                  Included
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#405040]">
                  {tour.included.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {tour.notIncluded?.length ? (
              <div>
                <h2 className="text-xl font-semibold text-[#2f4a2f]">
                  Not included
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#405040]">
                  {tour.notIncluded.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {hasMeetingPoint ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Meeting and pickup
            </h2>
            <p className="mt-3 text-sm text-[#405040]">
              {tour.meetingPointDescription}
            </p>
          </>
        ) : null}

        {tour.itinerary?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">
              Itinerary
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[#405040]">
              {tour.itinerary.map((step, index) => (
                <li key={`${step.title ?? "step"}-${index}`}>
                  {step.title ?? "Stop"}
                  {step.duration ? ` (${step.duration})` : ""}
                  {step.description ? ` — ${step.description}` : ""}
                </li>
              ))}
            </ol>
          </>
        ) : null}

        {tour.faqs?.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold text-[#2f4a2f]">FAQs</h2>
            <div className="mt-4 space-y-4">
              {tour.faqs.map(item => (
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

        <div className="mt-10">
          <a
            href={tour.bookingUrl}
            target="_blank"
            rel={EXTERNAL_CTA_REL}
            className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
          >
            Book This Tour
          </a>
        </div>
      </section>
    </main>
  );
}
