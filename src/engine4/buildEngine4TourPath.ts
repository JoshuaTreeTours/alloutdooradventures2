import type { Engine4ViatorTourRecord } from "./types";

const ensureProductCodeSuffix = (slug: string, productCode: string) => {
  const normalizedCode = productCode.toLowerCase();
  return slug.toLowerCase().endsWith(`-${normalizedCode}`)
    ? slug
    : `${slug}-${normalizedCode}`;
};

export const buildEngine4TourPath = (tour: Engine4ViatorTourRecord) =>
  `/destinations/${tour.destination.state}/${tour.destination.city}/tours/${ensureProductCodeSuffix(tour.slug, tour.viator.productCode)}`;
