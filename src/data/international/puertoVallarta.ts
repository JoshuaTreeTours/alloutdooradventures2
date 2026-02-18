import { parse } from "csv-parse/sync";

import puertoVallartaCsvRaw from "../../../data/Puerto Vallarta.csv?raw";
import { slugify } from "../../utils/slugify";

export interface PuertoVallartaTourRow {
  id: string;
  sourceItemId: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  price: string;
  bookingUrl: string;
  providerName: string;
  providerShortName: string;
  providerEmail: string;
  providerPhone: string;
  location: string;
  locationLat: string;
  locationLong: string;
  country: "Mexico";
  countrySlug: "mexico";
  city: "Puerto Vallarta";
  citySlug: "puerto-vallarta";
  region: string;
  tags: string[];
}

const clean = (value?: string) => (value ?? "").trim();

const readFirst = (record: Record<string, string>, keys: string[]) => {
  for (const key of keys) {
    const value = clean(record[key]);
    if (value) {
      return value;
    }
  }
  return "";
};

export function loadPuertoVallartaTours(): PuertoVallartaTourRow[] {
  try {
    if (!clean(puertoVallartaCsvRaw)) {
      console.warn("[puerto-vallarta] Puerto Vallarta.csv not found or empty");
      return [];
    }

    const parsed = parse(puertoVallartaCsvRaw, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    }) as Array<Record<string, string>>;

    let loaded = 0;
    let skipped = 0;

    const rows = parsed.reduce<PuertoVallartaTourRow[]>((acc, record, index) => {
      const stableId =
        readFirst(record, ["sourceItemId", "item_id", "id", "tour_id"]) ||
        `row-${index + 2}`;

      try {
        const id =
          readFirst(record, ["sourceItemId", "item_id", "id", "tour_id"]);
        if (!id) {
          skipped += 1;
          console.warn(`[puerto-vallarta] skipped row ${stableId}: missing id`);
          return acc;
        }

        const title = readFirst(record, ["title", "name", "item_name"]);
        if (!title) {
          skipped += 1;
          console.warn(`[puerto-vallarta] skipped row ${stableId}: missing title`);
          return acc;
        }

        const slug = readFirst(record, ["slug"]) || slugify(title);
        if (!slug) {
          skipped += 1;
          console.warn(`[puerto-vallarta] skipped row ${stableId}: missing slug`);
          return acc;
        }

        const image = readFirst(record, [
          "image",
          "image_url",
          "photo",
          "hero_image",
          "thumbnail",
        ]);

        const row: PuertoVallartaTourRow = {
          id,
          sourceItemId: id,
          slug,
          title,
          description: readFirst(record, ["description", "summary", "experience"]),
          image,
          price: readFirst(record, ["price", "starting_price", "adult_price"]),
          bookingUrl: readFirst(record, [
            "booking_url",
            "regular_link",
            "calendar_link",
          ]),
          providerName: readFirst(record, ["company_name", "operator"]),
          providerShortName: readFirst(record, ["company_shortname"]),
          providerEmail: readFirst(record, ["company_email"]),
          providerPhone: readFirst(record, ["company_phone"]),
          location: readFirst(record, ["location"]),
          locationLat: readFirst(record, ["location_lat", "lat"]),
          locationLong: readFirst(record, ["location_long", "lng", "long"]),
          country: "Mexico",
          countrySlug: "mexico",
          city: "Puerto Vallarta",
          citySlug: "puerto-vallarta",
          region: readFirst(record, ["region", "state", "province", "location"]),
          tags: readFirst(record, ["tags"]) 
            .split(/[|,]/)
            .map(tag => tag.trim())
            .filter(Boolean),
        };

        loaded += 1;
        acc.push(row);
        return acc;
      } catch (error) {
        skipped += 1;
        console.warn(
          `[puerto-vallarta] skipped row ${stableId}: malformed (${error instanceof Error ? error.message : String(error)})`
        );
        return acc;
      }
    }, []);

    console.warn(`[puerto-vallarta] loaded ${loaded} rows; skipped ${skipped}`);
    return rows;
  } catch (error) {
    console.warn("[puerto-vallarta] failed to load Puerto Vallarta.csv", error);
    return [];
  }
}
