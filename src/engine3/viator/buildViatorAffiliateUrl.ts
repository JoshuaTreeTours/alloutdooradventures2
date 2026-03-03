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

    url.protocol = "https:";
    if (url.hostname !== "www.viator.com") {
      if (url.hostname === "travelagents.viator.com") {
        console.warn(
          `[engine3] Converting travelagents Viator URL to www.viator.com: ${inputUrl}`
        );
      }
      url.hostname = "www.viator.com";
    }

    return withViatorAffiliateParams(url.toString());
  } catch {
    return null;
  }
};
