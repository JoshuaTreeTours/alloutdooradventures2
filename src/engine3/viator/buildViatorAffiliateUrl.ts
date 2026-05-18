const VIATOR_AFFILIATE_PARAMS = [
  ["mcid", "58086"],
  ["pid", "P00290915"],
  ["medium", "link"],
  ["api_version", "2.0"],
  ["uid", "U00174482"],
  ["currency", "USD"],
] as const;

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

    for (const [key] of VIATOR_AFFILIATE_PARAMS) {
      url.searchParams.delete(key);
    }

    for (const [key, value] of VIATOR_AFFILIATE_PARAMS) {
      url.searchParams.append(key, value);
    }

    return url.toString();
  } catch {
    return null;
  }
};
