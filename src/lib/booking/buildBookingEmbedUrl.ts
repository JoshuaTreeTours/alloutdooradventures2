import { getFareharborItemFromUrl, normalizeFareharborUrl } from "../fareharbor";
import type { NormalizedTour } from "../tours/getTourById";

const isValidUrl = (value?: string) => {
  if (!value) {
    return false;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export function buildBookingEmbedUrl(tour: NormalizedTour): string | null {
  if (isValidUrl(tour.bookingUrl)) {
    return normalizeFareharborUrl(tour.bookingUrl) ?? tour.bookingUrl;
  }

  if (tour.bookingProvider !== "fareharbor") {
    return null;
  }

  const existing = getFareharborItemFromUrl(tour.bookingWidgetUrl ?? tour.bookingUrl);
  const shortname = existing?.companyShortname ?? tour.sourceOperatorSlug;
  const itemId = existing?.itemId ?? tour.sourceItemId ?? tour.id.match(/-(\d+)$/)?.[1];

  if (!shortname || !itemId) {
    return null;
  }

  const generated = `https://fareharbor.com/embeds/book/${shortname}/items/${itemId}/`;
  return normalizeFareharborUrl(generated) ?? generated;
}
