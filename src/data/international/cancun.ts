import { parse } from "csv-parse/sync";

import { cancunCsvRaw } from "./rawCsvData";
import { slugify } from "../../utils/slugify";

export interface CancunTourRow {
  id: string;
  title: string;
  slug: string;
  country: "Mexico";
  countrySlug: "mexico";
  city: "Cancun";
  citySlug: "cancun";
  image: string;
  description: string;
  price: string;
  bookingUrl: string;
  providerName: string;
  providerShortName: string;
  providerEmail: string;
  providerPhone: string;
  location: string;
  locationLat: string;
  locationLong: string;
}

const clean = (value?: string) => (value ?? "").trim();

const normalizeCity = (value: string) => {
  const normalized = clean(value).toLowerCase();
  if (!normalized) {
    return "Cancun" as const;
  }

  return normalized
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .includes("cancun")
    ? ("Cancun" as const)
    : ("Cancun" as const);
};

const resolveSlug = (record: Record<string, string>, title: string) => {
  const rawSlug = clean(record.slug);
  if (rawSlug) {
    return slugify(rawSlug);
  }

  const fromTitle = slugify(title || clean(record.item_name));
  return fromTitle || "cancun-tour";
};

const resolveImage = (record: Record<string, string>) =>
  clean(record.image || record.image_url || record.photo);

const resolveId = (record: Record<string, string>) =>
  clean(record.sourceItemId || record.item_id || record.id);

export function loadCancunTours(): CancunTourRow[] {
  try {
    if (!clean(cancunCsvRaw)) {
      console.warn("[cancun] cancun.csv not found or empty");
      return [];
    }

    const parsed = parse(cancunCsvRaw, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    }) as Array<Record<string, string>>;

    const rows = parsed.reduce<CancunTourRow[]>((acc, record, index) => {
      try {
        const id = resolveId(record);
        if (!id) {
          console.warn(`[cancun] skipped row ${index + 2}: missing id`);
          return acc;
        }

        const title = clean(record.title || record.item_name || record.name);
        if (!title) {
          console.warn(`[cancun] skipped row ${index + 2}: missing title`);
          return acc;
        }

        const location = clean(record.location);
        const row: CancunTourRow = {
          id,
          title,
          slug: resolveSlug(record, title),
          country: "Mexico",
          countrySlug: "mexico",
          city: normalizeCity(clean(record.city || record.destination_city)),
          citySlug: "cancun",
          image: resolveImage(record),
          description: clean(record.description || record.summary),
          price: clean(record.price || record.starting_price),
          bookingUrl: clean(
            record.booking_url || record.regular_link || record.calendar_link
          ),
          providerName: clean(record.company_name || record.operator),
          providerShortName: clean(record.company_shortname),
          providerEmail: clean(record.company_email),
          providerPhone: clean(record.company_phone),
          location,
          locationLat: clean(record.location_lat || record.lat),
          locationLong: clean(record.location_long || record.lng || record.long),
        };

        acc.push(row);
        return acc;
      } catch (error) {
        console.warn(`[cancun] skipped malformed row ${index + 2}`, error);
        return acc;
      }
    }, []);

    return rows;
  } catch (error) {
    console.warn("[cancun] failed to load cancun.csv", error);
    return [];
  }
}
