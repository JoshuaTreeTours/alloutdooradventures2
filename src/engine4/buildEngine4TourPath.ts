import type { Engine4ViatorTourRecord } from "./types";

export const buildEngine4TourPath = (tour: Engine4ViatorTourRecord) =>
  `/destinations/${tour.destination.state}/${tour.destination.city}/tours/${tour.slug}-${tour.viator.productCode.toLowerCase()}`;
