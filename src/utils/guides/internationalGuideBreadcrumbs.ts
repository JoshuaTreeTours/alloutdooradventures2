import { buildCityGuide, buildCountryGuide } from "../../data/guideData";

export type GuideBreadcrumbItem = {
  name: string;
  url: string;
};

const toSlugLabel = (value: string) =>
  value
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const resolveInternationalGuideBreadcrumb = ({
  countrySlug,
  citySlug,
  countryName,
  cityName,
}: {
  countrySlug: string;
  citySlug: string;
  countryName?: string | null;
  cityName?: string | null;
}): GuideBreadcrumbItem | null => {
  const normalizedCountrySlug = countrySlug.trim().toLowerCase();
  const normalizedCitySlug = citySlug.trim().toLowerCase();

  if (!normalizedCountrySlug || !normalizedCitySlug) {
    return null;
  }

  const cityGuide = buildCityGuide({
    regionType: "country",
    parentSlug: normalizedCountrySlug,
    citySlug: normalizedCitySlug,
  });

  if (cityGuide) {
    return {
      name:
        cityName?.trim() || cityGuide.name || toSlugLabel(normalizedCitySlug),
      url: `/guides/world/${normalizedCountrySlug}/${normalizedCitySlug}`,
    };
  }

  const countryGuide = buildCountryGuide(normalizedCountrySlug);

  if (countryGuide) {
    return {
      name:
        countryName?.trim() ||
        countryGuide.name ||
        toSlugLabel(normalizedCountrySlug),
      url: `/guides/world/${normalizedCountrySlug}`,
    };
  }

  return null;
};
