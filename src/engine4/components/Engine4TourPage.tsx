import { Link } from "wouter";

import TourCard from "../../components/TourCard";
import Seo from "../../components/Seo";
import RatingStars from "./RatingStars";
import { getEngine4ListingEntries } from "../listing/getEngine4ListingEntries";
import { buildEngine4ViatorSchemaGraph } from "../schema/buildEngine4ViatorSchemaGraph";
import type { Engine4TourViewModel } from "../types";

type Engine4TourPageProps = {
  tour: Engine4TourViewModel;
};

const BOOK_CTA_CLASSES =
  "inline-flex rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]";

export default function Engine4TourPage({ tour }: Engine4TourPageProps) {
  const schema = buildEngine4ViatorSchemaGraph(tour);
  const heroImage = tour.primaryImage ?? tour.heroImage ?? "";
  const overview = tour.content.overview;
  const highlights = tour.content.highlights;
  const faqs = tour.content.faqs;
  const itinerary = tour.content.itinerary ?? [];
  const hasHighlights = highlights.length > 0;
  const hasFaqs = faqs.length > 0;
  const hasText = (value?: string) => Boolean(value?.trim());
  const hasPrice = hasText(tour.facts.priceFrom);
  const rating = Number(tour.facts.ratingValue);
  const reviewCount = Number(tour.facts.reviewCount);
  const hasRatingRow = Number.isFinite(rating) && Number.isFinite(reviewCount);
  const hasMeetingPoint = hasText(tour.facts.meetingPointShort);
  const hasStartTime = hasText(tour.facts.startTime);
  const hasDuration = hasText(tour.facts.duration);
  const hasCancellation = hasText(tour.facts.cancellationPolicy);
  const inclusions = tour.content.inclusions;
  const exclusions = tour.content.exclusions;
  const hasInclusions = inclusions.length > 0;
  const hasExclusions = exclusions.length > 0;
  const hasAdditionalInfo = hasText(tour.content.additionalInfo);
  const hasWhatToExpect = hasText(tour.content.whatToExpect);
  const shouldRenderHiloEngine5Debug =
    tour.canonicalPath ===
    "/destinations/hawaii/hilo/tours/private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1";
  const itineraryCount = Array.isArray(tour.content.itinerary)
    ? tour.content.itinerary.length
    : 0;
  const faqCount = Array.isArray(tour.content.faqs)
    ? tour.content.faqs.length
    : 0;
  const destinationStatePath = `/destinations/${tour.destination.stateSlug}`;
  const destinationCityPath = `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}`;
  const moreTours = getEngine4ListingEntries(
    tour.destination.stateSlug,
    tour.destination.citySlug
  )
    .filter(entry => entry.tour.productCode !== tour.productCode)
    .slice(0, 6);

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    const graphNodes = schema["@graph"];
    const schemaImages = graphNodes
      .filter(
        node =>
          (node["@type"] === "TouristTrip" || node["@type"] === "Product") &&
          typeof node.image === "string"
      )
      .map(node => node.image);

    if (!heroImage || schemaImages.some(image => image !== heroImage)) {
      throw new Error(
        `Engine4 hero image mismatch for ${tour.productCode}: hero=${heroImage || "<missing>"}`
      );
    }
  }

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={tour.title}
        description={overview}
        url={tour.canonicalPath}
        image={heroImage}
      />
      <script
        id="structured-data-engine4-viator"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <nav
              aria-label="Destination breadcrumb"
              className="text-xs text-white/80"
            >
              <Link href="/destinations">
                <a className="underline-offset-4 hover:underline">
                  Destinations
                </a>
              </Link>{" "}
              /{" "}
              <Link href={destinationStatePath}>
                <a className="underline-offset-4 hover:underline">
                  {tour.destination.state}
                </a>
              </Link>{" "}
              /{" "}
              <Link href={destinationCityPath}>
                <a className="underline-offset-4 hover:underline">
                  {tour.destination.city}
                </a>
              </Link>
            </nav>
            <p className="text-xs uppercase tracking-[0.3em] text-white/75">
              {tour.destination.city}, {tour.destination.state}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">
              {tour.title}
            </h1>
            <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="grid gap-3 text-sm text-white/95 md:grid-cols-2">
                <div className="space-y-3">
                  {hasPrice ? (
                    <p>
                      <strong>From:</strong> {tour.facts.priceFrom} per person
                    </p>
                  ) : null}
                  {hasRatingRow ? (
                    <RatingStars
                      ratingValue={rating}
                      reviewCount={reviewCount}
                    />
                  ) : null}
                </div>
                <div className="space-y-3">
                  {hasMeetingPoint ? (
                    <p>
                      <strong>Meeting point:</strong>{" "}
                      {tour.facts.meetingPointShort}
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
              </div>
              {hasCancellation ? (
                <p className="mt-4 border-t border-white/20 pt-3 text-sm text-white/90">
                  <strong>Cancellation:</strong> {tour.facts.cancellationPolicy}
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
            src={heroImage || undefined}
            alt={tour.title}
            className="h-80 w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {shouldRenderHiloEngine5Debug ? (
          <div className="mb-6 rounded-xl border border-[#c8d5c8] bg-white/80 p-4 text-sm text-[#1f2a1f]">
            <p className="font-semibold">
              Engine5 Hilo debug (rendered tour object)
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>facts.priceFrom:</strong>{" "}
                {tour.facts.priceFrom || "<empty>"}
              </li>
              <li>
                <strong>facts.meetingPointShort:</strong>{" "}
                {tour.facts.meetingPointShort || "<empty>"}
              </li>
              <li>
                <strong>facts.duration:</strong>{" "}
                {tour.facts.duration || "<empty>"}
              </li>
              <li>
                <strong>content.itinerary.length:</strong>{" "}
                {String(itineraryCount)}
              </li>
              <li>
                <strong>content.faqs.length:</strong> {String(faqCount)}
              </li>
            </ul>
          </div>
        ) : null}
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="mt-3 leading-7 text-[#334433]">{overview}</p>

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

        {hasInclusions || hasExclusions ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">
              What&apos;s Included
            </h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {hasInclusions ? (
                <div className="rounded-xl bg-white/70 p-4">
                  <h3 className="font-semibold">Included</h3>
                  <ul className="mt-2 list-disc space-y-2 pl-6 text-[#334433]">
                    {inclusions.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {hasExclusions ? (
                <div className="rounded-xl bg-white/70 p-4">
                  <h3 className="font-semibold">Not Included</h3>
                  <ul className="mt-2 list-disc space-y-2 pl-6 text-[#334433]">
                    {exclusions.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {hasAdditionalInfo || hasWhatToExpect ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">
              Good to Know / Requirements
            </h2>
            {hasWhatToExpect ? (
              <p className="mt-3 text-[#334433]">{tour.content.whatToExpect}</p>
            ) : null}
            {hasAdditionalInfo ? (
              <p className="mt-3 text-[#334433]">
                {tour.content.additionalInfo}
              </p>
            ) : null}
          </>
        ) : null}

        {hasMeetingPoint ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">
              Meeting &amp; Pickup
            </h2>
            <p className="mt-3 text-[#334433]">{tour.facts.meetingPointFull}</p>
          </>
        ) : null}

        {hasCancellation ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Cancellation Policy</h2>
            <p className="mt-3 text-[#334433]">
              {tour.facts.cancellationPolicy}
            </p>
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

        {moreTours.length ? (
          <>
            <h2 className="mt-12 text-2xl font-semibold">
              More tours in {tour.destination.city}
            </h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {moreTours.map(entry => (
                <TourCard
                  key={entry.tour.id}
                  tour={entry.tour}
                  href={entry.href}
                />
              ))}
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
