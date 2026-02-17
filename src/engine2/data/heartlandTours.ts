import { slugify } from "../../utils/slugify";
import { ENGINE2_DEFAULT_IMAGE } from "../config/destinations";
import { buildTourCopy } from "../content/templates/buildTourCopy";
import type { Engine2Tour } from "./loadEngine2";

type HeartlandCsvRow = Record<string, string>;

type HeartlandDataset = {
  key: string;
  label: string;
  rows: HeartlandCsvRow[];
};

const clean = (value?: string) => (value ?? "").trim();

const toTitleCase = (value: string) =>
  value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const parseCsvRows = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && text[i + 1] === "\n") {
        i += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    if (!inQuotes && char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
};

const parseCsv = (contents: string): HeartlandCsvRow[] => {
  const rows = parseCsvRows(contents).filter(cells =>
    cells.some(cell => clean(cell).length > 0)
  );

  if (!rows.length) {
    return [];
  }

  const header = rows[0].map(value => clean(value));

  return rows.slice(1).map(cells => {
    const record: HeartlandCsvRow = {};
    header.forEach((name, index) => {
      record[name] = cells[index] ?? "";
    });
    return record;
  });
};

const HEARTLAND_CSVS = import.meta.glob("../../../data/heartland/*.csv", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const loadHeartlandDatasets = (): HeartlandDataset[] =>
  Object.entries(HEARTLAND_CSVS)
    .map(([filePath, csvContents]) => {
      const fileName = filePath.split("/").pop() ?? "";
      const key = fileName.replace(/\.csv$/i, "").toLowerCase();

      return {
        key,
        label: `${toTitleCase(key)} Tours`,
        rows: parseCsv(csvContents),
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));

const parseLatLng = (latRaw: string, lngRaw: string) => {
  let lat = Number.parseFloat(latRaw);
  let lng = Number.parseFloat(lngRaw);

  if (!Number.isFinite(lat)) lat = Number.NaN;
  if (!Number.isFinite(lng)) lng = Number.NaN;

  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    [lat, lng] = [lng, lat];
  }

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    return { lat: null, lng: null };
  }

  return { lat, lng };
};

export const loadHeartlandEngine2Tours = (): Engine2Tour[] => {
  const byId = new Map<string, Engine2Tour>();

  for (const dataset of loadHeartlandDatasets()) {
    for (const row of dataset.rows) {
      const parts = clean(row.location)
        .split("/")
        .map(clean)
        .filter(Boolean);

      if (parts.length < 3) {
        continue;
      }

      const [countryRaw, regionRaw, cityRaw] = parts;
      if (slugify(countryRaw) !== "united-states") {
        continue;
      }

      const regionSlug = slugify(regionRaw);
      const citySlug = slugify(cityRaw);
      const id = clean(row.item_id);
      const name = clean(row.item_name);
      if (!regionSlug || !citySlug || !id || !name) {
        continue;
      }

      const providerName = clean(row.company_name) || "Unknown provider";
      const slug = `${slugify(name)}-${id}`;
      const canonicalPath = `/destinations/united-states/${regionSlug}/${citySlug}/tours/${slug}`;
      const primaryImage = clean(row.image_url) || ENGINE2_DEFAULT_IMAGE;
      const copy = buildTourCopy({
        name,
        provider: providerName,
        city: toTitleCase(cityRaw),
        region: toTitleCase(regionRaw),
      });
      const coords = parseLatLng(clean(row.location_lat), clean(row.location_long));

      byId.set(`${dataset.key}-${id}`, {
        id: `${dataset.key}-${id}`,
        sourceDatasetKey: dataset.key,
        sourceCountrySlug: "united-states",
        sourceCitySlug: citySlug,
        slug,
        name,
        provider: {
          name: providerName,
          shortName: clean(row.company_shortname),
          email: clean(row.company_email) || undefined,
          phone: clean(row.company_phone) || undefined,
        },
        geo: {
          country: "United States",
          region: toTitleCase(regionRaw),
          city: toTitleCase(cityRaw),
          lat: coords.lat,
          lng: coords.lng,
        },
        seo: {
          title: `${name} | ${toTitleCase(cityRaw)}, ${toTitleCase(regionRaw)} Tour`,
          description: copy.metaDescription,
          canonicalPath,
          ogImage: primaryImage,
        },
        content: {
          experienceText: copy.experienceText,
          highlights: copy.highlights,
        },
        images: {
          hero: primaryImage,
          gallery: [],
        },
        booking: {
          bookingUrl: clean(row.regular_link) || clean(row.calendar_link),
        },
        pricing: {
          currency: "USD",
        },
      });
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.seo.canonicalPath.localeCompare(b.seo.canonicalPath)
  );
};

export const getHeartlandDatasetSummaries = () => {
  const tours = loadHeartlandEngine2Tours();
  const counts = new Map<string, number>();

  for (const tour of tours) {
    const key = tour.sourceDatasetKey;
    if (!key) {
      continue;
    }

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return loadHeartlandDatasets().map(dataset => ({
    key: dataset.key,
    label: dataset.label,
    tourCount: counts.get(dataset.key) ?? 0,
  }));
};
