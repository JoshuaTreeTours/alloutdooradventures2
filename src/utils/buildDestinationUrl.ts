import { isEuropeCountrySlug } from "../data/tourIndex";

export function buildDestinationUrl(countrySlug: string) {
  if (countrySlug === "mexico") {
    return "/destinations/mexico";
  }

  if (countrySlug === "peru") {
    return "/destinations/peru";
  }

  return isEuropeCountrySlug(countrySlug)
    ? `/destinations/europe/${countrySlug}`
    : `/destinations/world/${countrySlug}`;
}
