export const STAGE_B_BOOKING_PAGE_NOT_FOUND_IDS = new Set([
  "595701",
  "612500",
  "481940",
  "481941",
  "677691",
  "677692",
  "379532",
  "463302",
  "288303",
  "361872",
  "656890",
  "657634",
  "674133",
  "681784",
  "681789",
  "681790",
  "681949",
  "681950",
  "681955",
  "681956",
  "692705",
]);

export type FareHarborBookingPageValidity =
  | "VALID"
  | "BOOKING_PAGE_NOT_FOUND"
  | "TRANSIENT_FAILURE"
  | "INDETERMINATE";

const TERMINAL_BODY_PATTERN =
  /\b(page not found|product (?:was )?deleted|item (?:was )?deleted|experience (?:is )?no longer (?:available|exists)|booking page (?:is )?no longer available)\b/i;

export const classifyFareHarborBookingPageResponse = ({
  status,
  visibleText = "",
  networkError = false,
}: {
  status?: number | null;
  visibleText?: string;
  networkError?: boolean;
}): FareHarborBookingPageValidity => {
  if (
    networkError ||
    status == null ||
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status >= 500
  ) {
    return "TRANSIENT_FAILURE";
  }
  if (status === 404 || status === 410) {
    return "BOOKING_PAGE_NOT_FOUND";
  }
  if (status >= 200 && status < 300) {
    return TERMINAL_BODY_PATTERN.test(visibleText)
      ? "BOOKING_PAGE_NOT_FOUND"
      : "VALID";
  }
  return "INDETERMINATE";
};

const normalizeProductId = (value?: string | null) => {
  const normalized = (value ?? "").trim().replace(/^engine2-/, "");
  return normalized.match(/(\d+)$/)?.[1] ?? normalized;
};

export const isStageBBookingPageNotFound = (
  value?: string | null
): boolean => STAGE_B_BOOKING_PAGE_NOT_FOUND_IDS.has(normalizeProductId(value));
