import { useMemo } from "react";

import Seo from "../../components/Seo";
import TourRating from "../../engine2/components/TourRating";
import { buildEngine3ViatorSchemaGraph } from "../schema/buildEngine3ViatorSchemaGraph";
import type { Engine3TourViewModel } from "../types";

type Engine3TourPageProps = {
  tour: Engine3TourViewModel;
};

const EXTERNAL_CTA_REL = "nofollow sponsored noopener noreferrer";
const POSTER_CHILD_PATH =
  "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-from-palm-springs-2335p1";

const priceLabel = (priceFrom?: string) => {
  if (!priceFrom) {
    return undefined;
  }

  return /^prices?\s+starting/i.test(priceFrom)
    ? priceFrom
    : `Prices starting at ${priceFrom}`;
};

const titleCaseFromSlug = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map(token => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");

const cleanSegment = (value?: string) => value?.trim().toLowerCase();

export default function Engine3TourPage({ tour }: Engine3TourPageProps) {
  const hasMeetingPoint = Boolean(tour.meetingPointDescription);
  const canonicalUrl = tour.canonicalPath;
  const isPosterChild2335p1 = canonicalUrl
    ?.toLowerCase()
    .endsWith(POSTER_CHILD_PATH);

  const regionSlug =
    cleanSegment(tour.region) ?? (isPosterChild2335p1 ? "california" : "");
  const citySlug =
    cleanSegment(tour.city) ?? (isPosterChild2335p1 ? "palm-springs" : "");
  const cityRegionLabel = [tour.city?.trim(), tour.region?.trim()]
    .filter(Boolean)
    .join(", ");
  const pageDescription =
    tour.description ||
    (cityRegionLabel ? `${tour.title} in ${cityRegionLabel}` : undefined);

  const breadcrumbItems = [
    { label: "Destinations", href: "/destinations" },
    ...(regionSlug
      ? [
          {
            label: titleCaseFromSlug(regionSlug),
            href: `/destinations/${regionSlug}`,
          },
        ]
      : []),
    ...(regionSlug && citySlug
      ? [
          {
            label: titleCaseFromSlug(citySlug),
            href: `/destinations/${regionSlug}/${citySlug}`,
          },
        ]
      : []),
    { label: tour.title, href: canonicalUrl },
  ];

  const structuredData = useMemo(
    () =>
      buildEngine3ViatorSchemaGraph(tour, canonicalUrl, {
        tripDescription: isPosterChild2335p1 ? pageDescription : undefined,
        breadcrumbItems: breadcrumbItems.map(item => ({
          name: item.label,
          item: item.href,
        })),
      }),
    [breadcrumbItems, canonicalUrl, isPosterChild2335p1, pageDescription, tour]
  );

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={tour.title}
        description={pageDescription}
        url={canonicalUrl}
        image={tour.primaryImageUrl}
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
          {priceLabel(tour.priceFrom) ? (
            <p className="mt-4 text-sm font-semibold text-white/90">
              {priceLabel(tour.priceFrom)}
            </p>
          ) : null}
          {tour.rating && tour.reviewCount ? (
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
        {tour.primaryImageUrl ? (
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
            <img
              src={tour.primaryImageUrl}
              alt={tour.title}
              referrerPolicy="no-referrer"
              loading="eager"
              className="h-64 w-full object-cover md:h-80"
            />
          </div>
        ) : null}

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
