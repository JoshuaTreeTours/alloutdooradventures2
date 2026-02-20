import tourEnrichmentCsv from "../../../data/tourEnrichment.csv?raw";
import merchantFeedCsv from "../../../data/merchantFeed.csv?raw";
import { tours } from "../../data/tours";
import type { Tour } from "../../data/tours.types";
import { getAllEngine2Tours } from "../../engine2/data/loadEngine2";
import { formatStartingPrice } from "../../lib/pricing";

type TopTourCard = {
  title: string;
  image: string;
  link: string;
  price: string;
  description: string;
};

type TourCandidate = TopTourCard & {
  key: string;
  stateSlug: string;
  citySlug: string;
  lat?: number;
  lng?: number;
  rating: number;
  popularity: number;
};

type CsvRow = Record<string, string>;

const parseCsv = (input: string): CsvRow[] => {
  const lines = input.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const parseLine = (line: string) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === '"') {
        if (inQuotes && line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        cells.push(current);
        current = "";
        continue;
      }

      current += char;
    }

    cells.push(current);
    return cells.map(cell => cell.trim());
  };

  const headers = parseLine(lines[0]);
  return lines.slice(1).map(line => {
    const rowValues = parseLine(line);
    return headers.reduce<CsvRow>((acc, header, index) => {
      acc[header] = rowValues[index] ?? "";
      return acc;
    }, {});
  });
};

const normalize = (value: string | undefined) =>
  (value ?? "").trim().toLowerCase();

const enrichmentRows = parseCsv(tourEnrichmentCsv);
const merchantRows = parseCsv(merchantFeedCsv);

const enrichmentBySlug = new Map(
  enrichmentRows
    .filter(row => row.slug)
    .map(row => [normalize(row.slug), row] as const)
);

const enrichmentByTourId = new Map(
  enrichmentRows
    .filter(row => row.tourId)
    .map(row => [normalize(row.tourId), row] as const)
);

const enrichmentBySourceUrl = new Map(
  enrichmentRows
    .filter(row => row.source_url)
    .map(row => [normalize(row.source_url), row] as const)
);

const merchantByLink = new Map(
  merchantRows
    .filter(row => row.link)
    .map(row => [normalize(row.link), row] as const)
);

const getTourIdFromBookingUrl = (bookingUrl: string) => {
  const match = bookingUrl.match(/\/items\/(\d+)/);
  return match?.[1] ?? "";
};

const findDatasetRowForTour = (tour: Tour) => {
  const bySlug = enrichmentBySlug.get(normalize(tour.slug));
  if (bySlug) return bySlug;

  const byId = enrichmentByTourId.get(
    normalize(getTourIdFromBookingUrl(tour.bookingUrl))
  );
  if (byId) return byId;

  return enrichmentBySourceUrl.get(normalize(tour.bookingUrl));
};

const toPriceLabel = (value?: string | null, currency?: string) => {
  if (!value) return null;
  const numeric = Number(value.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return value.startsWith("From") ? value : `From ${value}`;
  }
  const formatted = formatStartingPrice(numeric, currency ?? "USD");
  return formatted ? `From ${formatted}` : null;
};

const toTourCandidate = (tour: Tour): TourCandidate | null => {
  const datasetRow = findDatasetRowForTour(tour);
  const merchantRow = merchantByLink.get(normalize(tour.bookingUrl));
  const rawPrice =
    datasetRow?.price ||
    merchantRow?.price ||
    formatStartingPrice(tour.startingPrice, tour.currency);
  const price = toPriceLabel(rawPrice, datasetRow?.currency || tour.currency);
  const image = datasetRow?.image || merchantRow?.image_link || tour.heroImage;

  if (!tour.title || !image || !tour.bookingUrl || !price) {
    return null;
  }

  return {
    key: `${tour.id}::${tour.bookingUrl}`,
    title: tour.title,
    image,
    link: tour.bookingUrl,
    price,
    description:
      datasetRow?.description || tour.shortDescription || tour.longDescription,
    stateSlug: tour.destination.stateSlug,
    citySlug: tour.destination.citySlug,
    lat: tour.destination.lat,
    lng: tour.destination.lng,
    rating: Number(datasetRow?.ratingValue || tour.badges.rating || 0),
    popularity: Number(datasetRow?.ratingCount || tour.badges.reviewCount || 0),
  };
};

const toEngine2Candidates = (): TourCandidate[] =>
  getAllEngine2Tours()
    .map(tour => {
      const pathParts = tour.seo.canonicalPath.split("/").filter(Boolean);
      const stateSlug =
        pathParts[1] === "united-states" ? pathParts[2] : pathParts[1];
      const price = toPriceLabel(
        tour.pricing?.priceRange || tour.pricing?.price,
        tour.pricing?.currency
      );
      const image =
        tour.images.hero || tour.images.gallery[0] || tour.seo.ogImage;

      if (
        !tour.name ||
        !image ||
        !tour.booking.bookingUrl ||
        !price ||
        !stateSlug
      ) {
        return null;
      }

      return {
        key: `${tour.id}::${tour.booking.bookingUrl}`,
        title: tour.name,
        image,
        link: tour.booking.bookingUrl,
        price,
        description: tour.content.highlights[0] || tour.content.experienceText,
        stateSlug,
        citySlug: tour.sourceCitySlug,
        lat: tour.geo.lat ?? undefined,
        lng: tour.geo.lng ?? undefined,
        rating: 0,
        popularity: 0,
      };
    })
    .filter((tour): tour is TourCandidate => Boolean(tour));

const haversineKm = (a: TourCandidate, b: TourCandidate) => {
  if (
    a.lat === undefined ||
    a.lng === undefined ||
    b.lat === undefined ||
    b.lng === undefined
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 6371 * 2 * Math.asin(Math.sqrt(h));
};

const scoreSort = (a: TourCandidate, b: TourCandidate) =>
  b.rating - a.rating ||
  b.popularity - a.popularity ||
  a.title.localeCompare(b.title);

export const getTopToursForCity = (
  citySlug?: string,
  stateSlug?: string
): TopTourCard[] => {
  if (!stateSlug) return [];

  const allCandidates = [
    ...tours.map(toTourCandidate),
    ...toEngine2Candidates(),
  ].filter((tour): tour is TourCandidate => Boolean(tour));

  const sameCity = citySlug
    ? allCandidates
        .filter(
          tour => tour.citySlug === citySlug && tour.stateSlug === stateSlug
        )
        .sort(scoreSort)
    : [];

  const sameState = allCandidates
    .filter(tour => tour.stateSlug === stateSlug)
    .sort(scoreSort);

  const anchor = sameCity.find(
    tour => tour.lat !== undefined && tour.lng !== undefined
  );
  const closest = anchor
    ? allCandidates
        .filter(tour => tour.key !== anchor.key)
        .sort(
          (a, b) =>
            haversineKm(anchor, a) - haversineKm(anchor, b) || scoreSort(a, b)
        )
    : [];

  const selected = [...sameCity, ...sameState, ...closest].reduce<
    TourCandidate[]
  >((acc, tour) => {
    if (!acc.some(item => item.key === tour.key)) {
      acc.push(tour);
    }
    return acc;
  }, []);

  return selected.slice(0, 3).map(tour => ({
    title: tour.title,
    image: tour.image,
    link: tour.link,
    price: tour.price,
    description:
      tour.description.length > 170
        ? `${tour.description.slice(0, 167).trimEnd()}...`
        : tour.description,
  }));
};
