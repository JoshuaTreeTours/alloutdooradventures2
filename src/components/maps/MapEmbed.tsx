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
  children?: ReactNode;
};

const buildMapUrls = (locations: MapLocation[], zoom = 8) => {
  if (locations.length === 0) {
    return {
      embedUrl: `https://www.google.com/maps?q=United%20States&z=${zoom}&output=embed`,
      linkUrl: "https://www.google.com/maps",
    };
  }

  if (locations.length === 1) {
    const [location] = locations;
    const query = `${location.lat},${location.lng}`;

    return {
      embedUrl: `https://www.google.com/maps?q=${query}&z=${zoom}&output=embed`,
      linkUrl: `https://www.google.com/maps?q=${query}`,
    };
  }

  const path = locations
    .map((location) => `${location.lat},${location.lng}`)
    .join("/");

  return {
    embedUrl: `https://www.google.com/maps/dir/${path}?output=embed`,
    linkUrl: `https://www.google.com/maps/dir/${path}`,
  };
};

export default function MapEmbed({
  title,
  locations,
  heightClassName = "h-96",
  children,
}: MapEmbedProps) {
  const { embedUrl, linkUrl } = buildMapUrls(locations);

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm">
      <div className={`w-full overflow-hidden rounded-xl ${heightClassName}`}>
        <iframe
          title={title}
          src={embedUrl}
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#405040]">
        <p>
          Map preview generated from the featured coordinates for this destination.
        </p>
        <a
          href={linkUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]"
        >
          Open in Google Maps
        </a>
      </div>
      {children}
    </div>
  );
}
