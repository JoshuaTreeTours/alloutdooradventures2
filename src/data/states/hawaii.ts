import { parse } from "csv-parse/sync";

import hawaiiCsvRaw from "../../../data/hawaii.csv?raw";
import { slugify } from "../../utils/slugify";

export type HawaiiSourceRow = {
  id: string;
  sourceItemId: string;
  slug: string;
  title: string;
  description: string;
  country: "United States";
  countrySlug: "united-states";
  state: "Hawaii";
  stateSlug: "hawaii";
  city: string;
  citySlug: string;
  location: string;
  locationLat: string;
  locationLong: string;
  image: string;
  imageUrl: string;
  photo: string;
  thumbnail: string;
  cover: string;
  bookingUrl: string;
  providerName: string;
  providerShortName: string;
  providerEmail: string;
  providerPhone: string;
};

const clean = (value?: string) => (value ?? "").trim();

const HAWAII_CITY_ANCHORS = [
  "honolulu",
  "kahului",
  "kona",
  "hilo",
] as const;

const getLocationParts = (location?: string) =>
  clean(location)
    .split("/")
    .map(clean)
    .filter(Boolean);

const getCityFromLocation = (location?: string) => {
  const parts = getLocationParts(location);
  return parts[2] ?? parts[parts.length - 1] ?? "";
};

const inferCity = (record: Record<string, string>, title: string) => {
  const explicit = clean(
    record.city || record.destination_city || record.location_city || record.locality
  );
  if (explicit) {
    return explicit;
  }

  const fromLocation = getCityFromLocation(record.location);
  if (fromLocation) {
    return fromLocation;
  }

  const haystack = [title, clean(record.location), clean(record.address)]
    .join(" ")
    .toLowerCase();

  const anchored = HAWAII_CITY_ANCHORS.find(anchor => haystack.includes(anchor));
  if (anchored) {
    if (anchored === "kona") {
      return "Kona";
    }
    return anchored.charAt(0).toUpperCase() + anchored.slice(1);
  }

  return "Hawaii";
};

export function loadHawaiiTours(): HawaiiSourceRow[] {
  try {
    if (!clean(hawaiiCsvRaw)) {
      console.warn("[hawaii] hawaii.csv not found or empty");
      return [];
    }

    const parsed = parse(hawaiiCsvRaw, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    }) as Array<Record<string, string>>;

    return parsed.reduce<HawaiiSourceRow[]>((rows, record, index) => {
      try {
        const sourceItemId = clean(
          record.sourceItemId || record.item_id || record.id || record.tour_id
        );
        const title = clean(record.title || record.item_name || record.name);

        if (!sourceItemId) {
          console.warn(`[hawaii] skipping row ${index + 2}: missing id`);
          return rows;
        }

        if (!title) {
          console.warn(`[hawaii] skipping row ${sourceItemId}: missing title`);
          return rows;
        }

        const city = inferCity(record, title);
        const citySlug = slugify(city) || "hawaii";

        rows.push({
          id: sourceItemId,
          sourceItemId,
          slug: clean(record.slug),
          title,
          description: clean(record.description || record.short_description),
          country: "United States",
          countrySlug: "united-states",
          state: "Hawaii",
          stateSlug: "hawaii",
          city,
          citySlug,
          location: clean(record.location),
          locationLat: clean(record.location_lat || record.lat),
          locationLong: clean(record.location_long || record.long || record.lng),
          image: clean(record.image),
          imageUrl: clean(record.image_url),
          photo: clean(record.photo),
          thumbnail: clean(record.thumbnail),
          cover: clean(record.cover),
          bookingUrl: clean(record.booking_url || record.regular_link || record.calendar_link),
          providerName: clean(record.operator || record.company_name),
          providerShortName: clean(record.company_shortname),
          providerEmail: clean(record.company_email),
          providerPhone: clean(record.company_phone),
        });

        return rows;
      } catch {
        console.warn(`[hawaii] skipped malformed row ${index + 2}`);
        return rows;
      }
    }, []);
  } catch (error) {
    console.warn("[hawaii] failed to parse hawaii.csv", error);
    return [];
  }
}
