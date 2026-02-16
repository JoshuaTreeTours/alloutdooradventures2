import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  ENGINE2_DESTINATIONS,
  ENGINE2_DEFAULT_IMAGE,
} from "../../src/engine2/config/destinations";
import { palmSpringsContentOverrides } from "../../src/engine2/content/overrides/palm-springs";
import { buildTourCopy } from "../../src/engine2/content/templates/buildTourCopy";
import { buildEngine2Seo } from "../../src/engine2/seo/buildEngine2Seo";
import {
  buildFareHarborUrl,
  normalizeFareHarborUrl,
} from "../../src/engine2/utils/buildFareHarborUrl";
import { parseCsv, toSourceCitySlug } from "./csvUtils";
import { readTourEnrichment } from "./readTourEnrichment";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const sanitizeTourLabel = (value: string) =>
  value.replace(/\bFood\s+Tour\b/gi, "Guided Tour");

const parseLatLng = (
  latRaw: string,
  lngRaw: string,
  context: { itemId: string; csvFile: string }
) => {
  let lat = Number.parseFloat(latRaw);
  let lng = Number.parseFloat(lngRaw);
  if (!Number.isFinite(lat)) lat = Number.NaN;
  if (!Number.isFinite(lng)) lng = Number.NaN;

  const latLooksInvalid = Math.abs(lat) > 90;
  const lngLooksLatitude = Math.abs(lng) <= 90;
  if (latLooksInvalid && lngLooksLatitude) {
    console.warn(
      `WARN: swapped lat/long for item_id ${context.itemId} in ${context.csvFile}`
    );
    [lat, lng] = [lng, lat];
  }

  const latInRange = Number.isFinite(lat) && Math.abs(lat) <= 90;
  const lngInRange = Number.isFinite(lng) && Math.abs(lng) <= 180;

  if (!latInRange || !lngInRange) {
    console.warn(
      `WARN: invalid lat/long for item_id ${context.itemId} in ${context.csvFile}; setting coordinates to null`
    );
    return {
      lat: null,
      lng: null,
    };
  }

  return {
    lat,
    lng,
  };
};

const uniq = (arr: string[]) => Array.from(new Set(arr));

const cleanUrl = (value?: string) => (value ?? "").trim();

const normalizeStringArray = (value: unknown, fallback: string[] = []) => {
  const source = Array.isArray(value) ? value : fallback;
  return source
    .filter((item): item is string => typeof item === "string")
    .map(item => sanitizeTourLabel(item.trim()))
    .filter(Boolean);
};

type ParsedFareHarbor = {
  shortname: string;
  itemId: string;
  refUrl: string;
  backUrl: string;
};

const parseFareHarborDetails = (url?: string): ParsedFareHarbor | undefined => {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "fareharbor.com") {
      return undefined;
    }

    const match =
      parsed.pathname.match(
        /\/embeds\/(?:book|calendar)\/([^/]+)\/items\/(\d+)/
      ) ??
      parsed.pathname.match(/\/embeds\/book\/([^/]+)\/items\/(\d+)\/calendar/);

    if (!match?.[1] || !match?.[2]) {
      return undefined;
    }

    const ref = parsed.searchParams.get("ref") ?? "";
    const back = parsed.searchParams.get("back") ?? ref;

    return {
      shortname: match[1],
      itemId: match[2],
      refUrl: /^https?:\/\//.test(ref)
        ? ref
        : "https://www.alloutdooradventures.com",
      backUrl: /^https?:\/\//.test(back)
        ? back
        : /^https?:\/\//.test(ref)
          ? ref
          : "https://www.alloutdooradventures.com/",
    };
  } catch {
    return undefined;
  }
};


const main = async () => {
  const destination = ENGINE2_DESTINATIONS.palmSprings;
  const csvPath = path.resolve(process.cwd(), destination.csvPath);
  const sourceCitySlug = toSourceCitySlug(destination.csvPath);
  const csvFileName = path.basename(destination.csvPath);
  const csv = await readFile(csvPath, "utf8");
  const rows = parseCsv(csv);
  const enrichmentByTourId = await readTourEnrichment(
    path.resolve(process.cwd(), "data/tourEnrichment.csv")
  );

  const generatedTours = rows.map((row, index) => {
    const fallbackId = `missing-item-id-row-${index + 2}`;
    const id = row.item_id?.trim() || fallbackId;
    const rawName = row.item_name?.trim() || `Untitled Tour ${id}`;
    const enrichment = enrichmentByTourId.get(id);
    if (!row.item_id?.trim()) {
      console.warn(
        `WARN: missing item_id in ${csvFileName} at row ${index + 2}; using ${fallbackId}`
      );
    }
    if (!row.item_name?.trim()) {
      console.warn(
        `WARN: missing item_name for item_id ${id} in ${csvFileName}; using fallback title`
      );
    }
    const name = sanitizeTourLabel(enrichment?.title || rawName);
    const enrichmentSlug = enrichment?.slug?.trim();
    const slug = enrichmentSlug || `${slugify(rawName)}-${id}`;
    const canonicalPath = `${destination.canonicalBasePath}/${slug}`;
    const providerName = row.company_name || "Unknown provider";
    const csvSourceLocation = {
      country: destination.country,
      region: destination.region,
      city: destination.city,
    };
    const coords = parseLatLng(row.location_lat, row.location_long, {
      itemId: id,
      csvFile: csvFileName,
    });
    const defaultCopy = buildTourCopy({
      name,
      provider: providerName,
      city: csvSourceLocation.city,
      region: csvSourceLocation.region,
    });
    const override = palmSpringsContentOverrides[id] ?? {};

    const primaryImage =
      cleanUrl(enrichment?.image) ||
      cleanUrl(row.hero_image_url) ||
      cleanUrl(row.og_image_url) ||
      cleanUrl(row.image_url);
    const galleryRaw = [cleanUrl(row.image_url)].filter(Boolean);
    const gallery = uniq(galleryRaw.filter(url => url !== primaryImage));
    const highlights = normalizeStringArray(
      override.highlights,
      normalizeStringArray(defaultCopy.highlights)
    );

    const fareharbor =
      parseFareHarborDetails(row.regular_link) ??
      parseFareHarborDetails(row.calendar_link) ??
      (row.company_shortname && row.item_id
        ? {
            shortname: row.company_shortname,
            itemId: row.item_id,
            refUrl: "https://www.alloutdooradventures.com",
            backUrl: "https://www.alloutdooradventures.com/",
          }
        : undefined);

    const parsedPrice = Number.parseFloat(enrichment?.price ?? "");
    const hasNumericPrice = Number.isFinite(parsedPrice);
    const normalizedPrice = hasNumericPrice ? parsedPrice.toString() : undefined;
    const normalizedCurrency = cleanUrl(enrichment?.currency) || "USD";
    const normalizedPriceRange = cleanUrl(enrichment?.priceRange) || undefined;

    const draftTour = {
      id,
      sourceCitySlug,
      slug,
      name,
      provider: {
        name: providerName,
        shortName: row.company_shortname || "",
        email: row.company_email || undefined,
        phone: row.company_phone || undefined,
      },
      geo: {
        country: csvSourceLocation.country,
        region: csvSourceLocation.region,
        city: csvSourceLocation.city,
        ...coords,
      },
      seo: {
        title: "",
        description: sanitizeTourLabel(
          enrichment?.description ||
            override.metaDescription ||
            defaultCopy.metaDescription
        ),
        canonicalPath,
        ogImage: primaryImage || gallery[0] || ENGINE2_DEFAULT_IMAGE,
      },
      content: {
        experienceText: sanitizeTourLabel(
          override.experienceText ?? defaultCopy.experienceText
        ),
        highlights,
      },
      images: {
        hero: primaryImage,
        gallery,
      },
      booking: {
        bookingUrl: fareharbor
          ? buildFareHarborUrl({
              company: fareharbor.shortname,
              itemId: fareharbor.itemId,
              calendarPath: row.calendar_link || row.regular_link,
            })
          : normalizeFareHarborUrl(row.regular_link),
        fareharbor,
      },
      pricing: {
        price: normalizedPrice,
        currency: normalizedCurrency,
        priceRange: hasNumericPrice ? undefined : normalizedPriceRange,
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
  });

  const outPath = path.resolve(
    process.cwd(),
    "src/engine2/data/palm-springs.generated.ts"
  );
  if (!generatedTours || generatedTours.length === 0) {
    throw new Error("Engine2 generation failed: no tours produced from CSV.");
  }

  const fileContents = `const palmSpringsTours = ${JSON.stringify(generatedTours, null, 2)} as const;\n\nexport default palmSpringsTours;\n`;
  await writeFile(outPath, fileContents, "utf8");

  console.log(`Generated ${generatedTours.length} Engine2 tours -> ${outPath}`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
