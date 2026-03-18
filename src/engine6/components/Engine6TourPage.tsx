import type { ReactNode } from "react";
import type { Engine6Tour } from "../types";

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

export default function Engine6TourPage({ tour }: { tour: Engine6Tour }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="grid gap-6 md:grid-cols-5">
        <img
          src={tour.heroImageUrl}
          alt={tour.title}
          className="h-[420px] w-full rounded-2xl object-cover md:col-span-3"
        />
        <div className="rounded-2xl bg-green-700 p-6 text-white md:col-span-2">
          <h1 className="text-3xl font-bold leading-tight">{tour.title}</h1>
          <p className="mt-2 text-green-100">
            {tour.city}, {tour.state}
          </p>
          <p className="mt-4">
            ⭐ {tour.aggregateRating ?? "N/A"} ({tour.reviewCount ?? 0} reviews)
          </p>
          <p className="mt-2 font-semibold">
            Starting price: {tour.priceFormatted}
          </p>
          <p className="mt-2 text-sm text-green-50">
            Meeting place: {tour.meetingPointText}
          </p>
          <a
            href={tour.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block rounded-lg bg-white px-4 py-2 font-semibold text-green-700"
          >
            Book now
          </a>
        </div>
      </section>

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
    </main>
  );
}
