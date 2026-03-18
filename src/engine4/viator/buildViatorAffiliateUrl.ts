import { engine4ViatorTours } from "../data/viatorTours";

const VIATOR_AFFILIATE_PARAMS = {
  pid: "P00290915",
  mcid: "42383",
  medium: "link",
} as const;

export const buildViatorAffiliateUrlFromUrl = (inputUrl: string): string => {
  const url = new URL(inputUrl);
  url.searchParams.set("pid", VIATOR_AFFILIATE_PARAMS.pid);
  url.searchParams.set("mcid", VIATOR_AFFILIATE_PARAMS.mcid);
  url.searchParams.set("medium", VIATOR_AFFILIATE_PARAMS.medium);

  return url.toString();
};

export const buildViatorAffiliateUrl = (productCode: string): string => {
  const record = engine4ViatorTours.find(
    tour => tour.productCode === productCode
  );
  if (!record?.bookingUrl) {
    throw new Error(
      `Unable to build Viator affiliate URL: unknown product code ${productCode}`
    );
  }

  return buildViatorAffiliateUrlFromUrl(record.bookingUrl);
};
