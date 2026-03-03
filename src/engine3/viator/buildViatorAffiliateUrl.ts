import { withViatorAffiliateParams } from "../utils/viatorAffiliate";

const isViatorHost = (hostname: string): boolean =>
  hostname === "viator.com" || hostname.endsWith(".viator.com");

export const buildViatorAffiliateUrl = (inputUrl: string): string | null => {
  if (typeof inputUrl !== "string" || inputUrl.trim().length === 0) {
    return null;
  }

  try {
    const url = new URL(inputUrl);

    if (!isViatorHost(url.hostname)) {
      return null;
    }

    return withViatorAffiliateParams(inputUrl);
  } catch {
    return null;
  }
};
