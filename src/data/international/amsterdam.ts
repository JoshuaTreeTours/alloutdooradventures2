import { parse } from "csv-parse/sync";

import amsterdamCsvRaw from "../../../data/amsterdam.csv?raw";
import { slugify } from "../../utils/slugify";

export interface AmsterdamTourRow {
  id: string;
  title: string;
  slug: string;
  country: "Netherlands";
  countrySlug: "netherlands";
  city: "Amsterdam";
  citySlug: "amsterdam";
  image: string;
  location: "Amsterdam";
  bookingUrl: string;
  description: string;
  price: string;
  providerName: string;
  providerShortName: string;
  providerEmail: string;
  providerPhone: string;
  locationLat: string;
  locationLong: string;
}

const clean = (value?: string) => (value ?? "").trim();

const resolveId = (record: Record<string, string>) =>
  clean(record.item_id || record.sourceItemId || record.id);

const resolveTitle = (record: Record<string, string>) =>
  clean(record.item_name || record.title || record.name);

const resolveSlug = (record: Record<string, string>, title: string) => {
  const slugFromRecord = slugify(clean(record.slug));
  if (slugFromRecord) {
    return slugFromRecord;
  }

  return slugify(title) || "amsterdam-tour";
};

const resolveImage = (record: Record<string, string>) =>
  clean(record.image || record.image_url || record.photo);

export const loadAmsterdamTours = (): AmsterdamTourRow[] => {
  try {
    if (!clean(amsterdamCsvRaw)) {
      console.warn("[amsterdam] amsterdam.csv not found or empty");
      return [];
    }

    const parsed = parse(amsterdamCsvRaw, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    }) as Array<Record<string, string>>;

    const seenIds = new Set<string>();

    return parsed.reduce<AmsterdamTourRow[]>((acc, record, index) => {
      try {
        const id = resolveId(record);
        if (!id) {
          console.warn(`[amsterdam] skipped row ${index + 2}: missing id`);
          return acc;
        }

        if (seenIds.has(id)) {
          console.warn(`[amsterdam] deduped row ${index + 2}: duplicate id=${id}`);
          return acc;
        }

        const title = resolveTitle(record);
        if (!title) {
          console.warn(`[amsterdam] skipped row ${index + 2}: missing title`);
          return acc;
        }

        seenIds.add(id);

        acc.push({
          id,
          title,
          slug: resolveSlug(record, title),
          country: "Netherlands",
          countrySlug: "netherlands",
          city: "Amsterdam",
          citySlug: "amsterdam",
          image: resolveImage(record),
          location: "Amsterdam",
          bookingUrl: clean(
            record.booking_url || record.regular_link || record.calendar_link
          ),
          description: clean(record.description || record.summary),
          price: clean(record.price || record.starting_price),
          providerName: clean(record.company_name || record.operator),
          providerShortName: clean(record.company_shortname),
          providerEmail: clean(record.company_email),
          providerPhone: clean(record.company_phone),
          locationLat: clean(record.location_lat || record.lat),
          locationLong: clean(record.location_long || record.lng || record.long),
        });

        return acc;
      } catch (error) {
        console.warn(`[amsterdam] skipped malformed row ${index + 2}`, error);
        return acc;
      }
    }, []);
  } catch (error) {
    console.warn("[amsterdam] failed to load amsterdam.csv", error);
    return [];
  }
};
