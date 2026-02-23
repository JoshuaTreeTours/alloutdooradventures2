import type { Engine2Tour } from "../../engine2/data/loadEngine2";

type PalmSpringsTourCandidate = Partial<Engine2Tour> & {
  destination?: {
    citySlug?: unknown;
  };
};

export const isPalmSpringsTour = (
  tour: PalmSpringsTourCandidate | null | undefined,
  pathname?: string | null
): boolean => {
  if (!tour && typeof pathname !== "string") {
    return false;
  }

  const destinationCitySlug =
    tour?.destination && typeof tour.destination.citySlug === "string"
      ? tour.destination.citySlug
      : null;

  if (destinationCitySlug === "palm-springs") {
    return true;
  }

  const sourceCitySlug =
    typeof tour?.sourceCitySlug === "string" ? tour.sourceCitySlug : null;
  if (sourceCitySlug === "palm-springs") {
    return true;
  }

  const candidatePath =
    typeof pathname === "string"
      ? pathname
      : typeof tour?.seo?.canonicalPath === "string"
        ? tour.seo.canonicalPath
        : null;

  return typeof candidatePath === "string"
    ? candidatePath.includes("/palm-springs/")
    : false;
};
