import {
  getFareharborOperatorSlugFromUrl,
  normalizeFareharborUrl,
} from "../utils/fareharbor/normalizeFareharborUrl";

const REQUIRED_FAREHARBOR_PARAMS = {
  "full-items": "yes",
  "bookable-only": "yes",
  flow: "no",
  branding: "no",
  marketplace: "yes",
  asn: "fhdn",
} as const;

const AFFILIATE_PARAMS = {
  "asn-ref": "alloutdooradventures",
  ref: "https://www.alloutdooradventures.com",
  back: "https://www.alloutdooradventures.com/",
} as const;

export const getFareharborParams = () => ({
  ...REQUIRED_FAREHARBOR_PARAMS,
  ...AFFILIATE_PARAMS,
});

export { getFareharborOperatorSlugFromUrl, normalizeFareharborUrl };

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
