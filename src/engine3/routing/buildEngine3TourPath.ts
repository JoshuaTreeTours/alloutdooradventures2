import type { Engine3Tour } from "../types";

export const buildEngine3TourPath = (tour: Engine3Tour): string => {
  const productCodeLower = tour.viator.productCode.toLowerCase();
  const stateOrRegion = tour.destination.state ?? tour.destination.region ?? "";

  return `/destinations/${stateOrRegion}/${tour.destination.city}/tours/${tour.slug}-${productCodeLower}`;
};
