import type { Engine6PageData } from "../types";

type Props = { data: Engine6PageData };

export default function Engine6ItinerarySection({ data }: Props) {
  if (!data.itinerary.length) return null;

  return (
    <>
      <h2 className="mt-8 text-2xl font-semibold">Itinerary</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-[#334433]">
        {data.itinerary.map(stop => (
          <li key={stop.title}>
            <strong>{stop.title}:</strong> {stop.description}
          </li>
        ))}
      </ul>
    </>
  );
}
