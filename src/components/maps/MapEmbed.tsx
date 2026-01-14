import type { ReactNode } from "react";

type MapLocation = {
  label: string;
  lat: number;
  lng: number;
};

type MapEmbedProps = {
  title: string;
  locations: MapLocation[];
  heightClassName?: string;
  query?: string;
  children?: ReactNode;
};

const buildMapUrls = (
  locations: MapLocation[],
  {
    zoom = 8,
    query,
    title,
  }: { zoom?: number; query?: string; title: string }
) => {
  const encodedQuery = query ? encodeURIComponent(query) : null;

  if (encodedQuery) {
    return {
      embedUrl: `https://www.google.com/maps?q=${encodedQuery}&z=${zoom}&output=embed`,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
      appleMapsUrl: `https://maps.apple.com/?q=${encodedQuery}`,
    };
  }

  if (locations.length === 0) {
    return {
      embedUrl: `https://www.google.com/maps?q=United%20States&z=${zoom}&output=embed`,
      googleMapsUrl: "https://www.google.com/maps",
      appleMapsUrl: "https://maps.apple.com/?q=United%20States",
    };
  }

  if (locations.length === 1) {
    const [location] = locations;
    const query = `${location.lat},${location.lng}`;

    return {
      embedUrl: `https://www.google.com/maps?q=${query}&z=${zoom}&output=embed`,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${query}`,
      appleMapsUrl: `https://maps.apple.com/?q=${query}`,
    };
  }

  const path = locations
    .map((location) => `${location.lat},${location.lng}`)
    .join("/");

  return {
    embedUrl: `https://www.google.com/maps/dir/${path}?output=embed`,
    googleMapsUrl: `https://www.google.com/maps/dir/${path}`,
    appleMapsUrl: `https://maps.apple.com/?q=${encodeURIComponent(title)}`,
  };
};

export default function MapEmbed({
  title,
  locations,
  heightClassName = "h-72 md:h-96",
  query,
  children,
}: MapEmbedProps) {
  const { embedUrl, googleMapsUrl, appleMapsUrl } = buildMapUrls(locations, {
    query,
    title,
  });

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm">
      <div
        className={`relative w-full overflow-hidden rounded-xl ${heightClassName}`}
      >
        <iframe
          title={title}
          src={embedUrl}
          className="block h-full w-full touch-manipulation"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#405040]">
        <p>
          Map preview generated from the featured coordinates for this destination.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#2f4a2f]/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]"
          >
            Open in Google Maps
          </a>
          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#2f4a2f]/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]"
          >
            Open in Apple Maps
          </a>
        </div>
      </div>
      {children}
    </div>
  );
}
