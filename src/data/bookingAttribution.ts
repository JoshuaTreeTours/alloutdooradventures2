import type { BookingProvider } from "./tours.types";

type AttributionAudit = {
  ok: boolean;
  missing: string[];
  url?: string;
  applicable: boolean;
};

const FAREHARBOR_ATTRIBUTION_PARAMS = {
  "asn-ref": "alloutdooradventures",
  ref: "alloutdooradventures",
  branding: "no",
} as const;

export const ensureBookingAttribution = (
  url: string | undefined,
  provider: BookingProvider,
) => {
  if (!url || provider !== "fareharbor") {
    return url;
  }

  try {
    const normalized = new URL(url);
    Object.entries(FAREHARBOR_ATTRIBUTION_PARAMS).forEach(([key, value]) => {
      normalized.searchParams.set(key, value);
    });
    return normalized.toString();
  } catch {
    return url;
  }
};

export const auditBookingAttribution = (
  url: string | undefined,
  provider: BookingProvider,
): AttributionAudit => {
  if (provider !== "fareharbor") {
    return {
      ok: true,
      missing: [],
      url,
      applicable: false,
    };
  }

  if (!url) {
    return {
      ok: false,
      missing: Object.keys(FAREHARBOR_ATTRIBUTION_PARAMS),
      url,
      applicable: true,
    };
  }

  try {
    const parsed = new URL(url);
    const missing = Object.entries(FAREHARBOR_ATTRIBUTION_PARAMS)
      .filter(([key, value]) => parsed.searchParams.get(key) !== value)
      .map(([key]) => key);
    return {
      ok: missing.length === 0,
      missing,
      url,
      applicable: true,
    };
  } catch {
    return {
      ok: false,
      missing: Object.keys(FAREHARBOR_ATTRIBUTION_PARAMS),
      url,
      applicable: true,
    };
  }
};
