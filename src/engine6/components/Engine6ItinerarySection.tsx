import type { Engine6ItineraryStop } from "../types";

type Engine6ItinerarySectionProps = {
  itinerary: Engine6ItineraryStop[];
};

export default function Engine6ItinerarySection({
  itinerary,
}: Engine6ItinerarySectionProps) {
  if (!itinerary.length) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold">Itinerary</h2>
      <ul className="mt-3 space-y-3">
        {itinerary.map(stop => (
          <li key={`${stop.title}-${stop.description}`} className="rounded-xl bg-white p-4">
            <p className="font-semibold">{stop.title}</p>
            <p className="mt-1 text-sm text-[#334433]">{stop.description}</p>
            {stop.duration ? (
              <p className="mt-1 text-xs uppercase tracking-wide text-[#4a5f4a]">
                Duration: {stop.duration}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
