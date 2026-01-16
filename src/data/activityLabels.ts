const ACTIVITY_LABELS: Record<string, string> = {
  cycling: "Cycling",
  hiking: "Hiking",
  canoeing: "Paddle Sports",
  detours: "Scenic touring",
  "day-adventures": "Day adventure",
  "multi-day": "Multi-day adventure",
};

export const getActivityLabelFromSlug = (slug?: string) => {
  if (!slug) {
    return "";
  }

  return (
    ACTIVITY_LABELS[slug] ??
    slug
      .split("-")
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join(" ")
  );
};

export const getActivityLabels = () => ACTIVITY_LABELS;
