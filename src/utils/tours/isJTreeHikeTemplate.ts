const JT_HIKE_CLIMB_SLUG = "hike-and-climb-459591";
const JT_HIKE_CLIMB_ID = "459591";

type IsJTreeHikeTemplateArgs = {
  slug?: string | null;
  tourId?: string | number | null;
};

const normalizeTourId = (value?: string | number | null) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "string") {
    const match = value.match(/(\d+)/);
    return match?.[1] ?? value.trim();
  }
  return "";
};

export const isJTreeHikeTemplate = ({
  slug,
  tourId,
}: IsJTreeHikeTemplateArgs): boolean => {
  if (slug === JT_HIKE_CLIMB_SLUG) {
    return true;
  }

  const normalizedId = normalizeTourId(tourId);
  return normalizedId === JT_HIKE_CLIMB_ID;
};

export { JT_HIKE_CLIMB_SLUG, JT_HIKE_CLIMB_ID };
