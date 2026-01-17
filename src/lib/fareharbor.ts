const REQUIRED_FAREHARBOR_PARAMS = {
  "full-items": "yes",
  "bookable-only": "yes",
  flow: "no",
  branding: "no",
} as const;

const AFFILIATE_PARAMS = {
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
