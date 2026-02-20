import { useMemo } from "react";

import MapEmbed from "./MapEmbed";

type MapAttraction = {
  title: string;
  lat?: number;
  lng?: number;
};

type GuideThingsMapProps = {
  city: string;
  state: string;
  cityCenter?: { lat: number; lng: number };
  attractions: MapAttraction[];
};

const toGoogleMapsSearchUrl = ({
  title,
  city,
  state,
  lat,
  lng,
}: {
  title: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
}) => {
  if (typeof lat === "number" && typeof lng === "number") {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${title}, ${city}, ${state}`
  )}`;
};

export default function GuideThingsMap({
  city,
  state,
  cityCenter,
  attractions,
}: GuideThingsMapProps) {
  const mappedAttractions = useMemo(
    () =>
      attractions.filter(
        attraction =>
          typeof attraction.lat === "number" &&
          typeof attraction.lng === "number"
      ),
    [attractions]
  );

  const mapLocations = useMemo(
    () =>
      mappedAttractions.map(attraction => ({
        label: attraction.title,
        lat: attraction.lat as number,
        lng: attraction.lng as number,
      })),
    [mappedAttractions]
  );

  const mapQuery =
    cityCenter &&
    typeof cityCenter.lat === "number" &&
    typeof cityCenter.lng === "number"
      ? `${cityCenter.lat},${cityCenter.lng}`
      : `${city}, ${state}`;

  return (
    <div className="space-y-4">
      <MapEmbed
        title={`${city} things to do map`}
        locations={mapLocations}
        query={mapQuery}
        heightClassName="h-72 md:h-96"
      />

      <div className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
        <p className="text-sm text-[#405040]">
          Use the links below to open each attraction in Google Maps.
        </p>
        <ol className="mt-4 space-y-3 text-sm">
          {attractions.map((attraction, index) => (
            <li
              key={attraction.title}
              className="flex items-start justify-between gap-3"
            >
              <span className="text-[#1f2a1f]">
                {index + 1}. {attraction.title}
              </span>
              <a
                href={toGoogleMapsSearchUrl({
                  title: attraction.title,
                  city,
                  state,
                  lat: attraction.lat,
                  lng: attraction.lng,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap font-medium text-[#1f2a1f] underline"
              >
                View on map
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
