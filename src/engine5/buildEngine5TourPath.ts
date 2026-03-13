import type { Engine5ProductRecord } from "./types";

export const buildEngine5TourPath = (record: Engine5ProductRecord) =>
  `/destinations/${record.destination.stateSlug}/${record.destination.citySlug}/tours/${record.routeSlug}`;
