import type { Engine5ViatorTourRecord } from "./types";

export const buildEngine5TourPath = (record: Engine5ViatorTourRecord) =>
  `/destinations/${record.destination.stateSlug}/${record.destination.citySlug}/tours/${record.slug}`;
