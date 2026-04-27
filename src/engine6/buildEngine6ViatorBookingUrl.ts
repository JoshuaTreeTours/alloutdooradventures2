const ENGINE6_VIATOR_AFFILIATE_PARAMS = {
  pid: "P00290915",
  mcid: "42383",
  medium: "link",
} as const;

const ENGINE6_VIATOR_AFFILIATE_OVERRIDES: Record<
  string,
  Partial<Record<"pid" | "uid" | "mcid" | "currency" | "medium", string>>
> = {
  "191303P1": {
    pid: "P00290915",
    uid: "U00174482",
    mcid: "58086",
    currency: "USD",
    medium: "link",
  },
  "69764P1": {
    pid: "P00290915",
    uid: "U00174482",
    mcid: "58086",
    currency: "USD",
    medium: "link",
  },
  "18125P5": {
    pid: "P00290915",
    uid: "U00174482",
    mcid: "58086",
    currency: "USD",
    medium: "link",
  },
  "173946P1": {
    pid: "P00290915",
    uid: "U00174482",
    mcid: "58086",
    currency: "USD",
    medium: "link",
  },
};

const ENGINE6_VIATOR_CANONICAL_URL_BY_PRODUCT_CODE: Record<string, string> = {
  "63657P1":
    "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
  "60136P1":
    "https://www.viator.com/tours/Las-Vegas/Antelope-Canyon-Horseshoe-Bend-Day-Tour-from-Las-Vegas/d684-60136P1",
  "7079RREBIKE":
    "https://www.viator.com/tours/Las-Vegas/Red-Rock-Canyon-Electric-Bike-Tour/d684-7079RREBIKE",
  "411138P3":
    "https://www.viator.com/tours/Anchorage/Private-Anchorage-Tour-and-Wilderness-Adventure/d4152-411138P3",
  "89173P8":
    "https://www.viator.com/tours/Fort-Lauderdale/Reef-and-Snorkel-Paddle-Tour/d660-89173P8",
  "5024MANSKY":
    "https://www.viator.com/tours/New-York-City/Manhattan-Sky-Tour-New-York-Helicopter-Flight/d687-5024MANSKY",
  "69764P1":
    "https://www.viator.com/tours/San-Diego/3-Hour-Whale-Watching/d736-69764P1",
  "18125P5":
    "https://www.viator.com/tours/San-Diego/Private-Balboa-Park-Segway-Tour/d736-18125P5",
};

const FALLBACK_ENGINE6_VIATOR_SEARCH_URL = "https://www.viator.com/search";

const normalizePreferredViatorUrl = (preferredUrl: string | null) => {
  if (!preferredUrl) {
    return null;
  }

  try {
    const parsed = new URL(preferredUrl);
    if (!parsed.hostname.endsWith("viator.com")) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const resolveEngine6OfferUrl = (
  bookingUrl: string | null | undefined
): string | undefined => {
  if (!bookingUrl) {
    return undefined;
  }

  const parsed = normalizePreferredViatorUrl(bookingUrl);
  if (!parsed || parsed.pathname.includes("/search/")) {
    return undefined;
  }

  return parsed.toString();
};

export const buildEngine6ViatorBookingUrl = (
  productCode: string,
  preferredUrl: string | null = null
): string => {
  const canonicalUrl =
    ENGINE6_VIATOR_CANONICAL_URL_BY_PRODUCT_CODE[productCode];
  const url =
    normalizePreferredViatorUrl(preferredUrl) ??
    (canonicalUrl ? new URL(canonicalUrl) : null) ??
    new URL(
      `${FALLBACK_ENGINE6_VIATOR_SEARCH_URL}/${encodeURIComponent(productCode)}`
    );

  const affiliateParams = {
    ...ENGINE6_VIATOR_AFFILIATE_PARAMS,
    ...(ENGINE6_VIATOR_AFFILIATE_OVERRIDES[productCode] ?? {}),
  };
  Object.entries(affiliateParams).forEach(([key, value]) => {
    if (value?.trim()) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};
