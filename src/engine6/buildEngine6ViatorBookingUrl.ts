const ENGINE6_VIATOR_AFFILIATE_PARAMS = {
  pid: "P00290915",
  mcid: "42383",
  medium: "link",
} as const;

const ENGINE6_VIATOR_PATH_PREFIX =
  "https://www.viator.com/tours/Utah/East-Zion-Top-of-the-World-Jeep-Tour/d785-";

export const buildEngine6ViatorBookingUrl = (productCode: string): string => {
  const url = new URL(`${ENGINE6_VIATOR_PATH_PREFIX}${productCode}`);
  url.searchParams.set("pid", ENGINE6_VIATOR_AFFILIATE_PARAMS.pid);
  url.searchParams.set("mcid", ENGINE6_VIATOR_AFFILIATE_PARAMS.mcid);
  url.searchParams.set("medium", ENGINE6_VIATOR_AFFILIATE_PARAMS.medium);

  return url.toString();
};
