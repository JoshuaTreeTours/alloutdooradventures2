import { isEuropeCountrySlug } from "../data/tourIndex";

export function buildDestinationUrl(countrySlug: string) {
  if (countrySlug === "mexico") {
    return "/destinations/mexico";
  }

  return isEuropeCountrySlug(countrySlug)
    ? `/destinations/europe/${countrySlug}`
    : `/destinations/world/${countrySlug}`;
}
