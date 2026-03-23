import React, { type ReactNode } from "react";

import DestinationBreadcrumb from "../../components/DestinationBreadcrumb";
import Seo from "../../components/Seo";
import { getCityTourDetailPath } from "../../data/tours";
import type { Tour } from "../../data/tours.types";
import { slugify } from "../../utils/slugify";
import { getEngine6RelatedToursResult } from "../relatedTours";
import { getEngine6RouteSpecByProductCode } from "../routes";
import { formatEngine6AggregateRating } from "../rating";
import { buildEngine6SchemaGraph } from "../schema/buildEngine6SchemaGraph";
import { buildEngine6Seo, formatEngine6CategoryLabel } from "../seo";
import { ENGINE6_DEPLOYMENT_INFO } from "../deploymentInfo";
import type { Engine6Tour } from "../types";

const BOOK_CTA_CLASSES =
  "inline-flex rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]";

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
        {ratingLabel} rating • {totalReviews.toLocaleString()} reviews
      </p>
    </div>
  );
};

const SnapshotItem = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-green-100 bg-green-50 p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
      {label}
    </p>
    <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
  </div>
);

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="grid gap-3 md:grid-cols-2">
    {items.map((item, index) => (
      <li
        key={`${item.slice(0, 32)}-${index}`}
        className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm leading-6 text-green-950"
      >
        {item}
      </li>
    ))}
  </ul>
);

const resolveRelatedTourCardImageUrl = (tour: Tour) => {
  const normalizedPrimary = tour.primaryImageUrl?.trim();
  if (normalizedPrimary) {
    return normalizedPrimary;
  }

  const normalizedHero = tour.heroImage?.trim();
  if (normalizedHero) {
    return normalizedHero;
  }

  return "/hero.jpg";
};

export default function Engine6TourPage({ tour }: { tour: Engine6Tour }) {
  const routeSpec = getEngine6RouteSpecByProductCode(tour.productCode);
  const categoryLabel =
    tour.categoryLabel ?? formatEngine6CategoryLabel(tour.primaryCategory);
  const seo = buildEngine6Seo(tour);
  const schema = buildEngine6SchemaGraph(tour);
  const destinationStatePath = `/destinations/${routeSpec?.stateSlug ?? slugify(tour.state)}`;
  const destinationCityPath = `${destinationStatePath}/${routeSpec?.citySlug ?? slugify(tour.city)}`;
  const relatedToursResult = getEngine6RelatedToursResult(tour);
  const relatedTours = relatedToursResult.tours;
  const hasPrice = Boolean(tour.priceFormatted);
  const hasRating =
    typeof tour.aggregateRating === "number" &&
    typeof tour.reviewCount === "number";
  const hasMeetingPoint = Boolean(tour.meetingPointText?.trim());
  const snapshotItems = [
    tour.durationText ? { label: "Duration", value: tour.durationText } : null,
    tour.pickupOffered ? { label: "Pickup", value: "Pickup offered" } : null,
    tour.mobileTicket ? { label: "Ticket", value: "Mobile ticket" } : null,
    tour.language ? { label: "Language", value: tour.language } : null,
    tour.operatorName ? { label: "Operator", value: tour.operatorName } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));
  const relatedToursHeading = `Other Tours in ${tour.city}`;

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={seo.title}
        description={seo.description}
        url={seo.url}
        image={seo.image}
      />
      <script
        id="structured-data-engine6-viator"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <section
        className="bg-[#2f4a2f] text-white"
        data-testid="engine6-hero-banner"
        data-product-code={tour.productCode}
        data-hero-source={tour.diagnostics.imageSourceUsed}
        data-hero-resolver={tour.diagnostics.heroResolverName ?? "none"}
        data-hero-path={tour.diagnostics.heroImageFieldPath ?? "none"}
        data-hero-scoped-product-code={
          tour.diagnostics.heroScopedProductCode ?? "none"
        }
        data-hero-scoped-product-url={
          tour.diagnostics.heroScopedProductUrl ?? "none"
        }
        data-hero-scope-confirmed={
          tour.diagnostics.heroScopeConfirmed ? "true" : "false"
        }
        data-hero-rejected-foreign-candidates={
          tour.diagnostics.rejectedForeignHeroCandidates
            ?.map(candidate => candidate.productCode ?? candidate.productUrl ?? "unknown")
            .join(",") ?? ""
        }
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <DestinationBreadcrumb
              state={tour.state}
              city={tour.city}
              title={tour.title}
              statePath={destinationStatePath}
              cityPath={destinationCityPath}
            />
            <p className="text-xs uppercase tracking-[0.3em] text-white/75">
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
                      <strong>From:</strong> {tour.priceFormatted} per person
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
                  {hasMeetingPoint ? (
                    <p>
                      <strong>Meeting point:</strong> {tour.meetingPointText}
                    </p>
                  ) : null}
                  {tour.cancellationSummary ? (
                    <p>
                      <strong>Cancellation:</strong> {tour.cancellationSummary}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <a
              href={tour.bookingUrl}
              target="_blank"
              rel="noreferrer"
              className={`mt-6 ${BOOK_CTA_CLASSES}`}
            >
              Book now
            </a>
          </div>

          {tour.heroImageUrl ? (
            <img
              src={tour.heroImageUrl}
              alt={tour.title}
              className="h-80 w-full rounded-3xl object-cover shadow-2xl md:h-[440px]"
            />
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div
          hidden
          data-testid="engine6-preview-debug"
          data-render-template="App>Engine6ProductRoute>Engine6TourPage"
          data-render-route={routeSpec?.route ?? tour.pagePath}
          data-render-data-source="bundledProducts:getBundledEngine6Tour"
          data-render-product-code={tour.productCode}
          data-render-source-product-url={
            tour.diagnostics.sourceProductUrl ?? "none"
          }
          data-render-commit-sha={
            ENGINE6_DEPLOYMENT_INFO.gitCommitSha ?? "unknown"
          }
          data-render-git-branch={ENGINE6_DEPLOYMENT_INFO.gitBranch ?? "unknown"}
          data-render-vercel-env={ENGINE6_DEPLOYMENT_INFO.vercelEnv ?? "unknown"}
          data-render-preview-url={
            ENGINE6_DEPLOYMENT_INFO.previewUrl ?? "unknown"
          }
        />

        <div
          hidden
          data-testid="engine6-hero-debug"
          data-hero-debug-product-code={tour.productCode}
          data-hero-debug-api-primary={
            tour.diagnostics.apiPrimaryImageCandidate?.url ?? "none"
          }
          data-hero-debug-api-gallery={
            tour.diagnostics.apiGalleryImageCandidates
              .map(candidate => candidate.url)
              .join(",") || "none"
          }
          data-hero-debug-final-url={
            tour.diagnostics.finalSelectedHero?.url ?? tour.heroImageUrl
          }
          data-hero-debug-final-source={tour.diagnostics.imageSourceUsed}
          data-hero-debug-rejected-foreign={
            tour.diagnostics.rejectedForeignHeroCandidates
              ?.map(candidate => candidate.productCode ?? candidate.productUrl ?? "unknown")
              .join(",") ?? ""
          }
        />

        {snapshotItems.length > 0 ? (
          <ContentSection title="Tour snapshot">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {snapshotItems.map(item => (
                <SnapshotItem
                  key={item.label}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </div>
          </ContentSection>
        ) : null}

        {tour.overviewText ? (
          <ContentSection title="Overview">
            <div className="space-y-4 text-base leading-7 text-slate-700">
              {tour.overviewText.split(/\n\n+/).map((paragraph, index) => (
                <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </ContentSection>
        ) : null}

        {tour.highlights.length > 0 ? (
          <ContentSection title="Highlights">
            <BulletList items={tour.highlights} />
          </ContentSection>
        ) : null}

        {tour.itinerary.length > 0 ? (
          <ContentSection title="Itinerary">
            <ul className="space-y-4">
              {tour.itinerary.map((item, index) => (
                <li
                  key={`${item.title}-${index}`}
                  className="rounded-xl border border-green-100 bg-green-50/60 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-lg font-semibold text-green-900">
                      {item.title}
                    </p>
                    {item.duration ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-800">
                        {item.duration}
                      </span>
                    ) : null}
                  </div>
                  {item.description ? (
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {item.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </ContentSection>
        ) : null}

        {tour.inclusionItems.length > 0 || tour.exclusionItems.length > 0 ? (
          <ContentSection title="What’s included">
            <div className="grid gap-6 md:grid-cols-2">
              {tour.inclusionItems.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Included
                  </h3>
                  <div className="mt-3">
                    <BulletList items={tour.inclusionItems} />
                  </div>
                </div>
              ) : null}
              {tour.exclusionItems.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Not included
                  </h3>
                  <div className="mt-3">
                    <BulletList items={tour.exclusionItems} />
                  </div>
                </div>
              ) : null}
            </div>
          </ContentSection>
        ) : null}

        {tour.requirements.length > 0 ? (
          <ContentSection title="Important details">
            <BulletList items={tour.requirements} />
          </ContentSection>
        ) : null}

        {tour.cancellationSummary ? (
          <ContentSection title="Cancellation">
            <p className="text-sm leading-6 text-slate-700">
              {tour.cancellationSummary}
            </p>
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
          <a
            href={tour.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1f4d36] transition hover:bg-green-50"
          >
            Book now
          </a>
        </section>

        <div
          hidden
          data-testid="engine6-related-tours-debug"
          data-engine6-template={relatedToursResult.debug.templatePath}
          data-related-source={relatedToursResult.debug.sourceCollection}
          data-related-current-slug={relatedToursResult.debug.currentTourSlug}
          data-related-city-slug={relatedToursResult.debug.currentCitySlug}
          data-related-state-slug={relatedToursResult.debug.currentStateSlug}
          data-related-same-city-candidates={
            relatedToursResult.debug.siblingCandidateCountBeforeFiltering
          }
          data-related-same-state-candidates={
            relatedToursResult.debug.sameStateCandidateCount
          }
          data-related-siblings-after-current-excluded={
            relatedToursResult.debug.siblingCountAfterExcludingCurrent
          }
          data-related-final-count={relatedToursResult.debug.finalCardCount}
          data-related-final-cards={
            relatedToursResult.debug.finalCardProductCodes.join(",")
          }
          data-related-current-product-code={tour.productCode}
          data-related-hero-scoped-product-code={
            tour.diagnostics.heroScopedProductCode ?? "none"
          }
        />

        {relatedTours.length > 0 ? (
          <section
            className="related-tours mt-10"
            data-testid="engine6-related-tours"
          >
            <h2 className="text-2xl font-semibold text-green-900 md:text-3xl">
              {relatedToursHeading}
            </h2>
            <div
              className="related-tours-slider mt-6 flex gap-5 overflow-x-auto pb-4"
              role="region"
              aria-label={relatedToursHeading}
            >
              {relatedTours.map(relatedTour => {
                const imageUrl = resolveRelatedTourCardImageUrl(relatedTour);

                return (
                  <a
                    key={relatedTour.id}
                    href={getCityTourDetailPath(relatedTour)}
                    className="tour-card min-w-[280px] max-w-[320px] flex-[0_0_280px] overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:min-w-[320px] md:flex-[0_0_320px]"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={relatedTour.title}
                        className="h-48 w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a8a6b]">
                        {relatedTour.destination.city}, {relatedTour.destination.state}
                      </p>
                      <h3 className="mt-3 text-lg font-semibold leading-6 text-green-950">
                        {relatedTour.title}
                      </h3>
                      {relatedTour.badges.priceFrom ? (
                        <p className="mt-3 text-sm font-medium text-slate-600">
                          {relatedTour.badges.priceFrom}
                        </p>
                      ) : null}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
