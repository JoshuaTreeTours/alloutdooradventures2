// Endpoints observed from FareHarbor booking widget network calls.
const BASE_URL = "https://fareharbor.com/api/v1";

export type FareharborAvailability = {
  availabilityId: string;
  startDate?: string;
  startTime?: string;
  endTime?: string;
  isAvailable: boolean;
  raw: Record<string, unknown>;
};

export const fareharborEndpoints = {
  availability: (companyShortname: string, itemId: string) =>
    `${BASE_URL}/companies/${companyShortname}/items/${itemId}/availability/`,
  quote: (companyShortname: string, itemId: string, availabilityId: string) =>
    `${BASE_URL}/companies/${companyShortname}/items/${itemId}/availability/${availabilityId}/`,
};

export const buildAvailabilityQuery = (startDate: string, endDate: string) =>
  new URLSearchParams({ start: startDate, end: endDate }).toString();

const normalizeString = (value: unknown) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
};

const normalizeNumber = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const coerceDate = (value: unknown) => {
  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }
  return undefined;
};

const coerceTime = (value: unknown) => {
  if (typeof value === "string" && value.length >= 5) {
    return value;
  }
  return undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const getAvailabilityEntries = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (isRecord(payload)) {
    const listCandidates = [
      payload.availability,
      payload.availabilities,
      payload.results,
      payload.data,
    ];
    for (const candidate of listCandidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }
  }
  return [];
};

const isAvailabilityOpen = (entry: Record<string, unknown>) => {
  if (typeof entry.is_available === "boolean") {
    return entry.is_available;
  }
  if (typeof entry.available === "boolean") {
    return entry.available;
  }

  const capacityCandidates = [
    entry.spots_available,
    entry.remaining_capacity,
    entry.capacity_available,
    entry.capacity_remaining,
    entry.available_spots,
  ];
  for (const candidate of capacityCandidates) {
    const normalized = normalizeNumber(candidate);
    if (normalized !== null) {
      return normalized > 0;
    }
  }

  return true;
};

export const parseAvailabilityResponse = (
  payload: unknown,
): FareharborAvailability[] => {
  const entries = getAvailabilityEntries(payload);

  return entries
    .filter(isRecord)
    .map((entry) => {
      const availabilityId = normalizeString(
        entry.availability_id ??
          entry.availabilityId ??
          entry.availability ??
          entry.pk ??
          entry.id,
      );
      if (!availabilityId) {
        return null;
      }

      return {
        availabilityId,
        startDate: coerceDate(
          entry.start_date ??
            entry.start ??
            entry.date ??
            entry.start_time ??
            entry.start_at,
        ),
        startTime: coerceTime(entry.start_time ?? entry.start_at),
        endTime: coerceTime(entry.end_time ?? entry.end_at),
        isAvailable: isAvailabilityOpen(entry),
        raw: entry,
      } satisfies FareharborAvailability;
    })
    .filter((entry): entry is FareharborAvailability => entry !== null);
};
