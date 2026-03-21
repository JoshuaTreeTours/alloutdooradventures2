import type { ReactNode } from "react";
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

const formatCategoryLabel = (value: string | null) =>
  value
    ? value
        .split("-")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : null;

const RatingSummary = ({
  aggregateRating,
  reviewCount,
}: {
  aggregateRating: number | null;
  reviewCount: number | null;
}) => {
  const ratingLabel =
    typeof aggregateRating === "number" ? aggregateRating.toFixed(1) : "N/A";
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

export default function Engine6TourPage({ tour }: { tour: Engine6Tour }) {
  const categoryLabel = formatCategoryLabel(tour.primaryCategory);
  const hasPrice = Boolean(tour.priceFormatted);
  const hasRating =
    typeof tour.aggregateRating === "number" &&
    typeof tour.reviewCount === "number";
  const hasMeetingPoint = Boolean(tour.meetingPointText?.trim());

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <section
        className="bg-[#2f4a2f] text-white"
        data-testid="engine6-hero-banner"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
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

          <img
            src={tour.heroImageUrl}
            alt={tour.title}
            className="h-80 w-full rounded-3xl object-cover shadow-2xl md:h-[440px]"
          />
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

        {tour.highlights.length > 0 ? (
          <ContentSection title="Highlights">
            <ul className="grid gap-3 md:grid-cols-2">
              {tour.highlights.map((highlight, index) => (
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

        <section className="mt-8 rounded-3xl bg-green-900 px-6 py-8 text-center text-white shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-200">
            Ready to reserve?
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Lock in your Engine6 adventure today.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-green-100">
            Secure your spot, confirm the latest availability, and review final
            departure details on the booking page before checkout.
          </p>
          <a
            href={tour.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className={`mt-6 ${BOOK_CTA_CLASSES}`}
          >
            Book now
          </a>
        </section>
      </div>
    </main>
  );
}
