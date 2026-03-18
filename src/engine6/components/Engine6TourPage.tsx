import type { Engine6Tour } from "../types";

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
          <p className="mt-2 text-green-100">{tour.city}, {tour.state}</p>
          <p className="mt-4">⭐ {tour.aggregateRating ?? "N/A"} ({tour.reviewCount ?? 0} reviews)</p>
          <p className="mt-2 font-semibold">Starting price: {tour.priceFormatted}</p>
          <p className="mt-2 text-sm text-green-50">Meeting place: {tour.meetingPointText}</p>
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

      <section className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6">
        <h2 className="text-2xl font-semibold text-green-900">Tour itinerary</h2>
        <ul className="mt-4 space-y-4">
          {tour.itinerary.map((item, index) => (
            <li key={`${item.title}-${index}`} className="rounded-lg bg-white p-4">
              <p className="font-semibold text-green-900">{item.title}</p>
              {item.duration ? <p className="text-sm text-green-800">{item.duration}</p> : null}
              {item.description ? <p className="mt-1 text-sm text-slate-700">{item.description}</p> : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
