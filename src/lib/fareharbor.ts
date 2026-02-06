const REQUIRED_FAREHARBOR_PARAMS = {
  "full-items": "yes",
  "bookable-only": "yes",
  flow: "no",
  branding: "no",
} as const;

const AFFILIATE_PARAMS = {
  asn: "fhdn",
  "asn-ref": "alloutdooradventures",
  ref: "alloutdooradventures",
} as const;

const hasParamValue = (
  searchParams: URLSearchParams,
  key: string,
  value: string,
) => searchParams.getAll(key).includes(value);

export const getFareharborParams = () => ({
  ...REQUIRED_FAREHARBOR_PARAMS,
  ...AFFILIATE_PARAMS,
});

export const normalizeFareharborUrl = (url?: string) => {
  if (!url) {
    return undefined;
  }

  try {
    const normalized = new URL(url);
    if (normalized.hostname !== "fareharbor.com") {
      return url;
    }

    const calendarMatch = normalized.pathname.match(
      /\/embeds\/calendar\/([^/]+)\/items\/(\d+)/,
    );
    const bookCalendarMatch = normalized.pathname.match(
      /\/embeds\/book\/([^/]+)\/items\/(\d+)\/calendar/,
    );
    const bookMatch = normalized.pathname.match(
      /\/embeds\/book\/([^/]+)\/items\/(\d+)/,
    );

    if (calendarMatch?.[1] && calendarMatch?.[2]) {
      normalized.pathname = `/embeds/book/${calendarMatch[1]}/items/${calendarMatch[2]}/`;
    } else if (bookCalendarMatch?.[1] && bookCalendarMatch?.[2]) {
      normalized.pathname = `/embeds/book/${bookCalendarMatch[1]}/items/${bookCalendarMatch[2]}/`;
    } else if (bookMatch?.[1] && bookMatch?.[2]) {
      normalized.pathname = `/embeds/book/${bookMatch[1]}/items/${bookMatch[2]}/`;
    }

    const params = normalized.searchParams;

    Object.entries(REQUIRED_FAREHARBOR_PARAMS).forEach(([key, value]) => {
      if (!hasParamValue(params, key, value)) {
        params.append(key, value);
      }
    });

    Object.entries(AFFILIATE_PARAMS).forEach(([key, value]) => {
      if (!params.has(key)) {
        params.append(key, value);
      }
    });

    return normalized.toString();
  } catch {
    return url;
  }
};

export const buildFareharborEmbedUrl = ({
  baseUrl,
  companySlug,
  itemId,
  extraParams,
}: {
  baseUrl?: string;
  companySlug?: string;
  itemId?: string;
  extraParams?: Record<string, string>;
}) => {
  if (baseUrl) {
    return normalizeFareharborUrl(baseUrl);
  }

  if (!companySlug || !itemId) {
    return undefined;
  }

  try {
    const url = new URL(
      `https://fareharbor.com/embeds/book/${companySlug}/items/${itemId}/`,
    );
    const params = {
      ...getFareharborParams(),
      ...extraParams,
    };
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    return normalizeFareharborUrl(url.toString()) ?? url.toString();
  } catch {
    return undefined;
  }
};

export const getFareharborItemFromUrl = (url?: string) => {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "fareharbor.com") {
      return null;
    }

    const match =
      parsed.pathname.match(/\/embeds\/book\/([^/]+)\/items\/(\d+)/) ??
      parsed.pathname.match(/\/embeds\/calendar\/([^/]+)\/items\/(\d+)/);

    if (!match?.[1] || !match?.[2]) {
      return null;
    }

    return {
      companyShortname: match[1],
      itemId: match[2],
    };
  } catch {
    return null;
  }
};
