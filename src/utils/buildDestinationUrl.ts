import { isEuropeCountrySlug } from "../data/tourIndex";

export function buildDestinationUrl(countrySlug: string) {
  if (countrySlug === "mexico") {
    return "/destinations/mexico";
  }

  if (countrySlug === "peru") {
    return "/destinations/peru";
  }

  if (countrySlug === "argentina") {
    return "/destinations/argentina";
  }

  return isEuropeCountrySlug(countrySlug)
    ? `/destinations/europe/${countrySlug}`
    : `/destinations/world/${countrySlug}`;
}
