import type { Engine2Tour } from "../../engine2/data/loadEngine2";

const TARGET_TOUR_ID = 34849;
const TARGET_SLUG = "shared-san-andreas-fault-jeep-tour-34849";
const TARGET_PATH = `/destinations/california/palm-springs/tours/${TARGET_SLUG}`;

type IsTour34849Params = {
  pathname?: string | null;
  tour?: Pick<Engine2Tour, "id" | "slug" | "seo" | "booking"> | null;
};

const parseNumericId = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const trailingMatch = trimmed.match(/(\d+)$/);
  return trailingMatch ? Number(trailingMatch[1]) : null;
};

export const isTour34849 = ({ pathname, tour }: IsTour34849Params): boolean => {
  const normalizedPath =
    typeof pathname === "string" ? pathname.trim().toLowerCase() : "";
  const tourPath =
    typeof tour?.seo?.canonicalPath === "string"
      ? tour.seo.canonicalPath.trim().toLowerCase()
      : "";

  if (
    normalizedPath.includes(`/${TARGET_SLUG}`) ||
    tourPath.includes(`/${TARGET_SLUG}`) ||
    normalizedPath === TARGET_PATH ||
    tourPath === TARGET_PATH
  ) {
    return true;
  }

  if (tour?.slug === TARGET_SLUG) {
    return true;
  }

  const idCandidates = [
    parseNumericId(tour?.id),
    parseNumericId(tour?.booking?.fareharbor?.itemId),
  ];

  return idCandidates.some(id => id === TARGET_TOUR_ID);
};

export { TARGET_SLUG as TOUR_34849_SLUG, TARGET_TOUR_ID };
