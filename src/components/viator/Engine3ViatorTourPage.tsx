import BookingCtaLink from "../BookingCtaLink";
import Seo from "../Seo";
import type { Engine3TourRecord } from "../../data/viator/engine3Tours";

type Engine3ViatorTourPageProps = {
  tour: Engine3TourRecord;
};

const formatPrice = (amount: number, currency?: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || "USD"} ${amount}`;
  }
};

const renderStars = (value: number) => {
  const clamped = Math.max(0, Math.min(5, value));
  const rounded = Math.round(clamped);
  return "★★★★★".slice(0, rounded) + "☆☆☆☆☆".slice(rounded);
};

export default function Engine3ViatorTourPage({ tour }: Engine3ViatorTourPageProps) {
  const { mapped } = tour;
  const heroImageUrl = mapped.heroImageUrl || tour.fallbackHeroImage;

  return (
    <>
      <Seo
        title={mapped.title}
        description={mapped.description || "Viator tour details sourced from the supplier listing."}
        canonicalPath={`/destinations/states/${tour.stateSlug}/cities/${tour.citySlug}/tours/${tour.tourSlug}`}
      />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <img
          src={heroImageUrl}
          alt={mapped.title}
          className="h-[360px] w-full rounded-2xl object-cover"
          loading="eager"
        />

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900">{mapped.title}</h1>
            {mapped.rating ? (
              <p className="mt-2 text-sm text-neutral-700">
                <span className="mr-2">{renderStars(mapped.rating.value)}</span>
                {mapped.rating.count ? `${mapped.rating.count} Reviews` : undefined}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-neutral-200 p-4 text-right">
            <p className="text-sm text-neutral-500">Starting price</p>
            <p className="text-lg font-semibold text-neutral-900">
              {mapped.priceFrom
                ? `From ${formatPrice(mapped.priceFrom.amount, mapped.priceFrom.currency)}`
                : "See booking page for current pricing."}
            </p>
            <BookingCtaLink
              href={tour.bookingUrl}
              className="mt-3 inline-block rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Book This Tour
            </BookingCtaLink>
          </div>
        </div>

        {mapped.description ? (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">What you’ll experience</h2>
            <p className="mt-3 text-neutral-700">{mapped.description}</p>
          </section>
        ) : null}

        {mapped.highlights?.length ? (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Highlights</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-neutral-700">
              {mapped.highlights.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {mapped.included?.length || mapped.notIncluded?.length ? (
          <section className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold">What’s included</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-neutral-700">
                {(mapped.included || []).map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Not included</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-neutral-700">
                {(mapped.notIncluded || []).map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Meeting and Pickup</h2>
          {mapped.meeting ? (
            <div className="mt-3 space-y-2 text-neutral-700">
              {mapped.meeting.title ? <p className="font-medium">{mapped.meeting.title}</p> : null}
              <p>{mapped.meeting.address}</p>
              {mapped.meeting.instructions ? <p>{mapped.meeting.instructions}</p> : null}
              {mapped.meeting.mapsUrl ? (
                <a href={mapped.meeting.mapsUrl} className="text-emerald-700 underline" target="_blank" rel="noreferrer">
                  Open in Google Maps
                </a>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-neutral-700">
              See booking page for the latest meeting and pickup details.
            </p>
          )}
        </section>

        {mapped.itinerary?.length ? (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">Itinerary</h2>
            <div className="mt-3 space-y-4">
              {mapped.itinerary.map((step, index) => (
                <article key={`${step.title || "step"}-${index}`} className="rounded-xl border border-neutral-200 p-4">
                  {step.title ? <h3 className="font-semibold">{step.title}</h3> : null}
                  {step.duration ? <p className="text-sm text-neutral-500">{step.duration}</p> : null}
                  {step.description ? <p className="mt-2 text-neutral-700">{step.description}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {mapped.faqs?.length ? (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold">FAQs</h2>
            <div className="mt-3 space-y-4">
              {mapped.faqs.map(item => (
                <article key={item.q}>
                  <h3 className="font-semibold">{item.q}</h3>
                  <p className="text-neutral-700">{item.a}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
