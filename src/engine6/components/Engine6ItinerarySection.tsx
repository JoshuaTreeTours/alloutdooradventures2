import type { Engine6ItineraryItem } from "../types";

export default function Engine6ItinerarySection({
  itinerary,
}: {
  itinerary: Engine6ItineraryItem[];
}) {
  if (!itinerary.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-[#1f2a1f]">Itinerary</h2>
      <ol className="mt-5 space-y-4">
        {itinerary.map((item, index) => (
          <li
            key={`${item.title}-${index}`}
            className="rounded-xl border border-black/10 p-4"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-[#7a8a6b]">
              Stop {index + 1}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-[#1f2a1f]">
              {item.title}
            </h3>
            {item.duration ? (
              <p className="mt-1 text-xs text-[#526352]">{item.duration}</p>
            ) : null}
            {item.description ? (
              <p className="mt-2 text-sm text-[#405040]">{item.description}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
