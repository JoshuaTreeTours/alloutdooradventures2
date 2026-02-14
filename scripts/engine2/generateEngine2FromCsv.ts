import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  ENGINE2_DESTINATIONS,
  ENGINE2_DEFAULT_IMAGE,
} from "../../src/engine2/config/destinations";
import { palmSpringsContentOverrides } from "../../src/engine2/content/overrides/palm-springs";
import { buildTourCopy } from "../../src/engine2/content/templates/buildTourCopy";
import { buildEngine2Seo } from "../../src/engine2/seo/buildEngine2Seo";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const sanitizeFoodTourLabel = (value: string) =>
  value.replace(/\bFood\s+Tour\b/gi, "Guided Tour");

const parseCsvRows = (text: string) => {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }
    if (char === "\n" && !inQuotes) {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }
    if (char !== "\r") {
      current += char;
    }
  }
  if (current.length || row.length) {
    row.push(current);
    rows.push(row);
  }
  return rows;
};

const parseCsv = (contents: string): Record<string, string>[] => {
  const rows = parseCsvRows(contents);
  if (!rows.length) return [];
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((row) => {
    const entry: Record<string, string> = {};
    headers.forEach((header, i) => {
      entry[header] = row[i]?.trim() ?? "";
    });
    return entry;
  });
};

const parseLatLng = (latRaw: string, lngRaw: string) => {
  let lat = Number.parseFloat(latRaw);
  let lng = Number.parseFloat(lngRaw);
  if (!Number.isFinite(lat)) lat = Number.NaN;
  if (!Number.isFinite(lng)) lng = Number.NaN;

  const latLooksInvalid = lat < -90 || lat > 90;
  const lngLooksLatitude = lng >= -90 && lng <= 90;
  if (latLooksInvalid && lngLooksLatitude) {
    [lat, lng] = [lng, lat];
  }

  return {
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
  };
};

const normalizeStringArray = (value: unknown, fallback: string[] = []) => {
  const source = Array.isArray(value) ? value : fallback;
  return source
    .filter((item): item is string => typeof item === "string")
    .map((item) => sanitizeFoodTourLabel(item.trim()))
    .filter(Boolean);
};

const parseLocation = (value: string) => {
  const parts = value
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    country: parts[0] ?? ENGINE2_DESTINATIONS.palmSprings.country,
    region: parts[1] ?? ENGINE2_DESTINATIONS.palmSprings.region,
    city: parts[2] ?? ENGINE2_DESTINATIONS.palmSprings.city,
  };
};

const main = async () => {
  const destination = ENGINE2_DESTINATIONS.palmSprings;
  const csvPath = path.resolve(process.cwd(), destination.csvPath);
  const csv = await readFile(csvPath, "utf8");
  const rows = parseCsv(csv);

  const generatedTours = rows
    .map((row) => {
      const id = row.item_id;
      const rawName = row.item_name;
      if (!id || !rawName) {
        return null;
      }
      const name = sanitizeFoodTourLabel(rawName);
      const slug = `${slugify(rawName)}-${id}`;
      const canonicalPath = `${destination.canonicalBasePath}/${slug}`;
      const providerName = row.company_name || "Unknown provider";
      const location = parseLocation(row.location || "");
      const coords = parseLatLng(row.location_lat, row.location_long);
      const defaultCopy = buildTourCopy({
        name,
        provider: providerName,
        city: location.city,
        region: location.region,
      });
      const override = palmSpringsContentOverrides[id] ?? {};

      const primaryImage = row.image_url || ENGINE2_DEFAULT_IMAGE;
      const gallery = normalizeStringArray([primaryImage], [ENGINE2_DEFAULT_IMAGE]);
      const highlights = normalizeStringArray(
        override.highlights,
        normalizeStringArray(defaultCopy.highlights),
      );

      const draftTour = {
        id,
        slug,
        name,
        provider: {
          name: providerName,
          shortName: row.company_shortname || "",
          email: row.company_email || undefined,
          phone: row.company_phone || undefined,
        },
        geo: {
          country: location.country,
          region: location.region,
          city: location.city,
          ...coords,
        },
        seo: {
          title: "",
          description: sanitizeFoodTourLabel(
            override.metaDescription ?? defaultCopy.metaDescription,
          ),
          canonicalPath,
          ogImage: primaryImage,
        },
        content: {
          experienceText: sanitizeFoodTourLabel(
            override.experienceText ?? defaultCopy.experienceText,
          ),
          highlights,
        },
        images: {
          hero: primaryImage,
          gallery,
        },
        booking: {
          calendarLink: row.calendar_link || undefined,
          regularLink: row.regular_link,
        },
      };

      const builtSeo = buildEngine2Seo(draftTour);
      return {
        ...draftTour,
        seo: {
          ...draftTour.seo,
          title: builtSeo.title,
          description: builtSeo.description,
        },
      };
    })
    .filter((tour): tour is NonNullable<typeof tour> => Boolean(tour));

  const outPath = path.resolve(
    process.cwd(),
    "src/engine2/data/palm-springs.generated.ts",
  );
  if (!generatedTours || generatedTours.length === 0) {
    throw new Error("Engine2 generation failed: no tours produced from CSV.");
  }

  const fileContents = `const palmSpringsTours = ${JSON.stringify(generatedTours, null, 2)} as const;\n\nexport default palmSpringsTours;\n`;
  await writeFile(outPath, fileContents, "utf8");

  console.log(`Generated ${generatedTours.length} Engine2 tours -> ${outPath}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
