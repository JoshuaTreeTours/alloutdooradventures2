import type { Engine2Tour } from "../../engine2/data/loadEngine2";

const TARGET_SLUG = "shared-san-andreas-fault-jeep-tour-34849";
const TARGET_ID = 34849;

const toNumericId = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return Number(value);
  }

  return null;
};

export const isTour34849 = (tour?: Engine2Tour | null, pathname?: string) => {
  const slugMatch = tour?.slug === TARGET_SLUG;
  const pathMatch =
    typeof pathname === "string" &&
    pathname.includes(`/${TARGET_SLUG}`) &&
    pathname.includes("/destinations/") &&
    pathname.includes("/tours/");
  const idMatch = toNumericId(tour?.id) === TARGET_ID;

  return slugMatch || pathMatch || idMatch;
};

export { TARGET_SLUG as TOUR_34849_SLUG, TARGET_ID as TOUR_34849_ID };
