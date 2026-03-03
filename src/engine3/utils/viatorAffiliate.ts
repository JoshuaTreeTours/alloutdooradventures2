import { extractViatorProductCode } from "../../utils/viator/extractViatorProductCode";

const AFFILIATE_PID = "P00290915";
const AFFILIATE_MCID = "42383";
const AFFILIATE_MEDIUM = "link";

const isViatorHost = (hostname: string): boolean =>
  hostname === "viator.com" || hostname.endsWith(".viator.com");

export function withViatorAffiliateParams(inputUrl: string): string {
  try {
    const url = new URL(inputUrl);

    if (!isViatorHost(url.hostname)) {
      return inputUrl;
    }

    const productCode = extractViatorProductCode(inputUrl);
    if (productCode) {
      url.pathname = `/d648-${productCode}`;
    }

    if (url.hostname !== "www.viator.com") {
      url.hostname = "www.viator.com";
    }

    url.protocol = "https:";

    const params = url.searchParams;
    params.set("pid", AFFILIATE_PID);
    params.set("mcid", AFFILIATE_MCID);
    params.set("medium", AFFILIATE_MEDIUM);

    return url.toString();
  } catch (error) {
    console.warn(
      "[withViatorAffiliateParams] failed to parse URL, returning original:",
      inputUrl,
      error
    );

    return inputUrl;
  }
}
