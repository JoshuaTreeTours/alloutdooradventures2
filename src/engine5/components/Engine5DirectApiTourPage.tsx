import Seo from "../../components/Seo";
import RatingStars from "../../engine4/components/RatingStars";
import type { Engine5ResolvedTour } from "../viator/resolveEngine5Tour";

type Engine5DirectApiTourPageProps = {
  resolved: Engine5ResolvedTour;
};

const BOOK_CTA_CLASSES =
  "inline-flex rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]";

export default function Engine5DirectApiTourPage({
  resolved,
}: Engine5DirectApiTourPageProps) {
  const { apiTour, normalized } = resolved;
  const heroImage =
    apiTour.canonicalHeroUrl ?? normalized.canonicalHeroUrl ?? "";
  const hasText = (value?: string) => Boolean(value?.trim());
  const hasPrice = hasText(apiTour.fromPrice);
  const hasMeetingPoint = hasText(apiTour.meetingPoint);
  const hasDuration = hasText(apiTour.duration);
  const hasCancellation = hasText(apiTour.cancellationPolicy);
  const hasItinerary = apiTour.itinerary.length > 0;
  const hasFaqs = apiTour.faqs.length > 0;
  const hasHighlights = apiTour.highlights.length > 0;
  const hasInclusions = apiTour.inclusions.length > 0;
  const hasExclusions = apiTour.exclusions.length > 0;
  const hasAdditionalInfo = apiTour.additionalInfo.length > 0;

  const ratingValue = Number(apiTour.rating);
  const reviewCount = Number(apiTour.reviewCount);
  const hasRating =
    Number.isFinite(ratingValue) &&
    ratingValue > 0 &&
    Number.isFinite(reviewCount) &&
    reviewCount > 0;

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={apiTour.title}
        description={apiTour.description}
        url={
          normalized.slug
            ? `/destinations/${normalized.destination.stateSlug}/${normalized.destination.citySlug}/tours/${normalized.slug}`
            : undefined
        }
        image={heroImage}
      />

      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/75">
              {normalized.destination.city}, {normalized.destination.state}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              {apiTour.title}
            </h1>
            <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="grid gap-3 text-sm text-white/95 md:grid-cols-2">
                <div className="space-y-3">
                  {hasPrice ? (
                    <p>
                      <strong>From:</strong> {apiTour.fromPrice} per person
                    </p>
                  ) : null}
                  {hasRating ? (
                    <RatingStars
                      ratingValue={ratingValue}
                      reviewCount={reviewCount}
                    />
                  ) : null}
                </div>
                <div className="space-y-3">
                  {hasMeetingPoint ? (
                    <p>
                      <strong>Meeting point:</strong> {apiTour.meetingPoint}
                    </p>
                  ) : null}
                  {hasDuration ? (
                    <p>
                      <strong>Duration:</strong> {apiTour.duration}
                    </p>
                  ) : null}
                </div>
              </div>
              {hasCancellation ? (
                <p className="mt-4 border-t border-white/20 pt-3 text-sm text-white/90">
                  <strong>Cancellation:</strong> {apiTour.cancellationPolicy}
                </p>
              ) : null}
            </div>
            <a
              href={apiTour.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 ${BOOK_CTA_CLASSES}`}
            >
              Book This Tour
            </a>
          </div>
          <img
            src={heroImage || undefined}
            alt={apiTour.title}
            className="h-80 w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="mt-3 leading-7 text-[#334433]">{apiTour.description}</p>

        {hasHighlights ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Highlights</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-[#334433]">
              {apiTour.highlights.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}

        {hasInclusions || hasExclusions ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">What's Included</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {hasInclusions ? (
                <div className="rounded-xl bg-white/70 p-4">
                  <h3 className="font-semibold">Included</h3>
                  <ul className="mt-2 list-disc space-y-2 pl-6 text-[#334433]">
                    {apiTour.inclusions.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {hasExclusions ? (
                <div className="rounded-xl bg-white/70 p-4">
                  <h3 className="font-semibold">Not Included</h3>
                  <ul className="mt-2 list-disc space-y-2 pl-6 text-[#334433]">
                    {apiTour.exclusions.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {hasMeetingPoint ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Meeting & Pickup</h2>
            <p className="mt-3 text-[#334433]">{apiTour.meetingPoint}</p>
          </>
        ) : null}

        {hasItinerary ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Itinerary</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-[#334433]">
              {apiTour.itinerary.map(stop => (
                <li key={`${stop.title}-${stop.duration ?? ""}`}>
                  <strong>{stop.title}</strong>
                  {stop.duration ? ` (${stop.duration})` : ""}
                  {stop.description ? `: ${stop.description}` : ""}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {hasAdditionalInfo ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">
              Good to Know / Additional Info
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-[#334433]">
              {apiTour.additionalInfo.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}

        {hasFaqs ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">FAQs</h2>
            <div className="mt-3 space-y-3">
              {apiTour.faqs.map(faq => (
                <details
                  key={faq.question}
                  className="rounded-lg bg-white/80 p-4 text-[#334433]"
                >
                  <summary className="cursor-pointer font-semibold">
                    {faq.question}
                  </summary>
                  <p className="mt-2">{faq.answer}</p>
                </details>
              ))}
            </div>
          </>
        ) : null}

        <a
          href={apiTour.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-10 ${BOOK_CTA_CLASSES}`}
        >
          Book This Tour
        </a>
      </section>
    </main>
  );
}
