import { Link } from "wouter";

import TourCard from "../../components/TourCard";
import Seo from "../../components/Seo";
import { getEngine5ListingEntries } from "../listing/getEngine5ListingEntries";
import { buildEngine5SchemaGraph } from "../schema/buildEngine5SchemaGraph";
import type { Engine5TourViewModel } from "../types";

type Engine5TourPageProps = {
  tour: Engine5TourViewModel;
};

export default function Engine5TourPage({ tour }: Engine5TourPageProps) {
  const schema = buildEngine5SchemaGraph(tour);
  const moreTours = getEngine5ListingEntries(
    tour.destination.stateSlug,
    tour.destination.citySlug
  )
    .filter(entry => entry.tour.productCode !== tour.productCode)
    .slice(0, 6);

  return (
    <main className="bg-[#f6f1e8] text-[#1f2a1f]">
      <Seo
        title={tour.title}
        description={tour.content.overview}
        url={tour.canonicalPath}
        image={tour.primaryImage}
      />
      <script
        id="structured-data-engine5-viator"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="bg-[#2f4a2f] text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/75">
              {tour.destination.city}, {tour.destination.state}
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">{tour.title}</h1>
            <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="grid gap-3 text-sm text-white/95 md:grid-cols-2">
                <div className="space-y-3">
                  {tour.facts.priceFrom ? (
                    <p>
                      <strong>From:</strong> {tour.facts.priceFrom} per person
                    </p>
                  ) : null}
                  {typeof tour.facts.ratingValue === "number" &&
                  typeof tour.facts.reviewCount === "number" ? (
                    <p>
                      <strong>Rating:</strong> {tour.facts.ratingValue} ⭐ ({tour.facts.reviewCount} reviews)
                    </p>
                  ) : null}
                </div>
                <div className="space-y-3">
                  {tour.facts.meetingPoint ? (
                    <p>
                      <strong>Meeting point:</strong> {tour.facts.meetingPoint}
                    </p>
                  ) : null}
                  {tour.facts.startTime ? (
                    <p>
                      <strong>Start time:</strong> {tour.facts.startTime}
                    </p>
                  ) : null}
                  {tour.facts.duration ? (
                    <p>
                      <strong>Duration:</strong> {tour.facts.duration}
                    </p>
                  ) : null}
                </div>
              </div>
              {tour.facts.cancellationPolicy ? (
                <p className="mt-4 border-t border-white/20 pt-3 text-sm text-white/90">
                  <strong>Cancellation:</strong> {tour.facts.cancellationPolicy}
                </p>
              ) : null}
            </div>
            <a
              href={tour.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]"
            >
              Book This Tour
            </a>
          </div>
          <img
            src={tour.primaryImage}
            alt={tour.title}
            className="h-80 w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="mt-3 leading-7 text-[#334433]">{tour.content.overview}</p>

        {tour.content.highlights.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Highlights</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-[#334433]">
              {tour.content.highlights.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}

        {tour.content.inclusions.length || tour.content.exclusions.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">What&apos;s Included</h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {tour.content.inclusions.length ? (
                <div className="rounded-xl bg-white/70 p-4">
                  <h3 className="font-semibold">Included</h3>
                  <ul className="mt-2 list-disc space-y-2 pl-6 text-[#334433]">
                    {tour.content.inclusions.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {tour.content.exclusions.length ? (
                <div className="rounded-xl bg-white/70 p-4">
                  <h3 className="font-semibold">Not Included</h3>
                  <ul className="mt-2 list-disc space-y-2 pl-6 text-[#334433]">
                    {tour.content.exclusions.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {tour.content.additionalInfo.length || tour.content.whatToExpect ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Good to Know / Requirements</h2>
            {tour.content.whatToExpect ? (
              <p className="mt-3 text-[#334433]">{tour.content.whatToExpect}</p>
            ) : null}
            {tour.content.additionalInfo.length ? (
              <ul className="mt-3 list-disc space-y-2 pl-6 text-[#334433]">
                {tour.content.additionalInfo.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}

        {tour.facts.meetingPoint ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Meeting &amp; Pickup</h2>
            <p className="mt-3 text-[#334433]">{tour.facts.meetingPoint}</p>
          </>
        ) : null}

        {tour.facts.cancellationPolicy ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Cancellation Policy</h2>
            <p className="mt-3 text-[#334433]">{tour.facts.cancellationPolicy}</p>
          </>
        ) : null}

        {tour.content.faqs.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">FAQs</h2>
            <div className="mt-4 space-y-4">
              {tour.content.faqs.map(item => (
                <article key={item.question} className="rounded-xl bg-white/70 p-4">
                  <h3 className="font-semibold">{item.question}</h3>
                  <p className="mt-2 text-sm text-[#334433]">{item.answer}</p>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {tour.content.itinerary.length ? (
          <>
            <h2 className="mt-8 text-2xl font-semibold">Itinerary</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-[#334433]">
              {tour.content.itinerary.map(item => (
                <li key={item.title}>
                  <strong>{item.title}:</strong> {item.description}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      {moreTours.length ? (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <h2 className="text-2xl font-semibold">More Joshua Tree tours</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {moreTours.map(entry => (
              <TourCard key={entry.href} tour={entry.tour} href={entry.href} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-6 pb-12 text-xs text-[#506050]">
        <Link href="/destinations">
          <a className="underline-offset-4 hover:underline">Back to destinations</a>
        </Link>
      </section>
    </main>
  );
}
