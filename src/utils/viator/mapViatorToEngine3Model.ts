export type Engine3ViatorTour = {
  title: string;
  heroImageUrl?: string;
  priceFrom?: { amount: number; currency?: string };
  rating?: { value: number; count?: number };
  description?: string;
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
  meeting?: {
    title?: string;
    address: string;
    instructions?: string;
    mapsUrl?: string;
  };
  itinerary?: { title?: string; duration?: string; description?: string }[];
  faqs?: { q: string; a: string }[];
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null =>
  value && typeof value === "object" ? (value as UnknownRecord) : null;

const asNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const arrayOfRecords = (value: unknown): UnknownRecord[] =>
  Array.isArray(value) ? value.map(asRecord).filter(Boolean) as UnknownRecord[] : [];

const listOfStrings = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const items = value.map(asNonEmptyString).filter(Boolean) as string[];
  return items.length ? items : undefined;
};

const firstMatch = <T>(values: Array<T | undefined>): T | undefined =>
  values.find(value => value !== undefined);

export const mapViatorToEngine3Model = (
  source: unknown,
  fallbackTitle: string
): Engine3ViatorTour => {
  const root = asRecord(source) ?? {};
  const data = asRecord(root.data) ?? root;

  const title =
    firstMatch([
      asNonEmptyString(data.title),
      asNonEmptyString(data.productName),
      asNonEmptyString(data.name),
    ]) ?? fallbackTitle;

  const supplierImages = arrayOfRecords(data.supplierImages);
  const supplierHero = supplierImages
    .map(image => asRecord(image.fullSizeImage))
    .map(image => asNonEmptyString(image?.src))
    .find(Boolean);

  const mediaImages = arrayOfRecords(data.media)
    .map(media => asRecord(media.image))
    .map(image => asNonEmptyString(image?.url))
    .find(Boolean);

  const pricing = asRecord(data.pricing);
  const priceAmount = firstMatch([
    asNumber(asRecord(data.priceFrom)?.amount),
    asNumber(pricing?.fromPrice),
    asNumber(pricing?.price),
  ]);
  const currency = firstMatch([
    asNonEmptyString(asRecord(data.priceFrom)?.currency),
    asNonEmptyString(pricing?.currency),
  ]);

  const ratingValue = firstMatch([
    asNumber(data.rating),
    asNumber(asRecord(data.reviews)?.combinedAverageRating),
  ]);
  const ratingCount = firstMatch([
    asNumber(data.reviewCount),
    asNumber(asRecord(data.reviews)?.totalReviews),
  ]);

  const departureLocations = arrayOfRecords(
    asRecord(data.departureAndReturnLocations)?.departureLocations
  );
  const primaryDeparture = departureLocations[0] ?? null;
  const meetingAddress = asNonEmptyString(primaryDeparture?.description);

  const itinerary = arrayOfRecords(data.itinerary)
    .map(step => ({
      title: asNonEmptyString(step.title),
      duration: asNonEmptyString(step.duration),
      description: asNonEmptyString(step.description),
    }))
    .filter(step => step.title || step.duration || step.description);

  const faqs = arrayOfRecords(data.faqs)
    .map(item => {
      const q = asNonEmptyString(item.question);
      const a = asNonEmptyString(item.answer);
      return q && a ? { q, a } : null;
    })
    .filter(Boolean) as { q: string; a: string }[];

  return {
    title,
    heroImageUrl: firstMatch([supplierHero, mediaImages]),
    priceFrom: priceAmount !== undefined ? { amount: priceAmount, currency } : undefined,
    rating:
      ratingValue !== undefined
        ? {
            value: ratingValue,
            count: ratingCount,
          }
        : undefined,
    description: firstMatch([
      asNonEmptyString(data.description),
      asNonEmptyString(data.overview),
    ]),
    highlights: firstMatch([
      listOfStrings(data.highlights),
      listOfStrings(data.additionalHighlights),
    ]),
    included: listOfStrings(data.inclusions),
    notIncluded: listOfStrings(data.exclusions),
    meeting: meetingAddress
      ? {
          title: asNonEmptyString(primaryDeparture?.title),
          address: meetingAddress,
          instructions: asNonEmptyString(primaryDeparture?.instructions),
          mapsUrl: asNonEmptyString(primaryDeparture?.googleMapsUrl),
        }
      : undefined,
    itinerary: itinerary.length ? itinerary : undefined,
    faqs: faqs.length ? faqs : undefined,
  };
};
