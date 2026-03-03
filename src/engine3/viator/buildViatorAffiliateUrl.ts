const AFFILIATE_PID = "P00290915";
const AFFILIATE_MCID = "42383";
const AFFILIATE_MEDIUM = "link";

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

    url.searchParams.set("pid", AFFILIATE_PID);
    url.searchParams.set("mcid", AFFILIATE_MCID);
    url.searchParams.set("medium", AFFILIATE_MEDIUM);

    return url.toString();
  } catch {
    return null;
  }
};
