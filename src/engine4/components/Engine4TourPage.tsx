import Seo from "../../components/Seo";
import { buildEngine4ViatorSchemaGraph } from "../schema/buildEngine4ViatorSchemaGraph";
import type { Engine4TourViewModel } from "../types";

type Engine4TourPageProps = {
  tour: Engine4TourViewModel;
};

const BOOK_CTA_CLASSES =
  "inline-flex rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]";

export default function Engine4TourPage({ tour }: Engine4TourPageProps) {
  const schema = buildEngine4ViatorSchemaGraph(tour);
  const overview = tour.content.overview;
  const highlights = tour.content.highlights;
  const faqs = tour.content.faqs;
  const itinerary = tour.content.itinerary ?? [];
  const hasHighlights = highlights.length > 0;
  const hasFaqs = faqs.length > 0;
  const hasPrice = Boolean(tour.facts.priceFrom);
  const hasRating =
    typeof tour.facts.ratingValue === "number" &&
    typeof tour.facts.reviewCount === "number";
  const hasMeetingPoint = Boolean(tour.facts.meetingPointShort);
  const hasStartTime = Boolean(tour.facts.startTime);
  const hasDuration = Boolean(tour.facts.duration);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={tour.title}
        description={overview}
        url={tour.canonicalPath}
        image={tour.heroImage}
      />
      <script
        id="structured-data-engine4-viator"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/75">
              {tour.destination.city}, {tour.destination.state}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              {tour.title}
            </h1>
            <div className="mt-6 grid gap-3 text-sm text-white/95 md:grid-cols-2">
              {hasPrice ? (
                <p>
                  <strong>From:</strong> {tour.facts.priceFrom} per person
                </p>
              ) : null}
              {hasRating ? (
                <p>
                  <strong>Rating:</strong> {tour.facts.ratingValue?.toFixed(1)} ({tour.facts.reviewCount} reviews)
                </p>
              ) : null}
              {hasMeetingPoint ? (
                <p>
                  <strong>Meeting point:</strong> {tour.facts.meetingPointShort}
                </p>
              ) : null}
              {hasStartTime ? (
                <p>
                  <strong>Start time:</strong> {tour.facts.startTime}
                </p>
              ) : null}
              {hasDuration ? (
                <p>
                  <strong>Duration:</strong> {tour.facts.duration}
                </p>
              ) : null}
            </div>
            <a
              href={tour.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 ${BOOK_CTA_CLASSES}`}
            >
              Book This Tour
            </a>
          </div>
          <img
            src={tour.heroImage ?? undefined}
            alt={tour.title}
            className="h-80 w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="mt-3 text-[#334433]">{overview}</p>

        {hasHighlights ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Highlights</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-[#334433]">
              {highlights.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}

        {itinerary.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Itinerary</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-[#334433]">
              {itinerary.map(stop => (
                <li key={stop.title}>
                  <strong>{stop.title}:</strong> {stop.description}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {hasFaqs ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">FAQs</h2>
            <div className="mt-3 space-y-4">
              {faqs.map(faq => (
                <div key={faq.question}>
                  <h3 className="font-semibold">{faq.question}</h3>
                  <p className="text-[#334433]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}

        <div className="mt-10 text-center">
          <h2 className="text-2xl font-semibold">Ready to book?</h2>
          <p className="mt-2 text-[#405040]">Secure your spot in minutes.</p>
          <a
            href={tour.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-5 ${BOOK_CTA_CLASSES}`}
          >
            Book This Tour
          </a>
        </div>
      </section>
    </main>
  );
}
