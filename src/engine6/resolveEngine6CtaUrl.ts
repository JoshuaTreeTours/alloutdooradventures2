import { buildEngine6ViatorBookingUrl } from "./buildEngine6ViatorBookingUrl";
import type { Engine6Tour } from "./types";

export const resolveEngine6CtaUrl = (
  tour: Pick<
    Engine6Tour,
    "bookingProvider" | "bookingUrl" | "referenceBookingUrl"
  >
): string => {
  if (tour.bookingProvider === "viator") {
    return (
      buildEngine6ViatorBookingUrl(
        tour.referenceBookingUrl ?? tour.bookingUrl ?? null
      ) ?? tour.bookingUrl
    );
  }

  return tour.bookingUrl;
};
