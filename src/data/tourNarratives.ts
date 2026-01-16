import type { Tour } from "./tours.types";
import { getActivityLabels, getActivityLabelFromSlug } from "./activityLabels";

const ACTIVITY_LABELS = getActivityLabels();

const SKILL_LEVELS: Record<string, string> = {
  cycling: "Beginner to intermediate fitness",
  hiking: "All levels with steady footing",
  canoeing: "Beginner-friendly paddling",
  detours: "Easy, low-impact pace",
  "day-adventures": "All levels with guided support",
  "multi-day": "Moderate stamina for longer days",
};

const getPrimaryActivitySlug = (tour: Tour) =>
  tour.activitySlugs.find((slug) => ACTIVITY_LABELS[slug]) ??
  tour.activitySlugs[0] ??
  "adventure";

export const getActivityLabel = (tour: Tour) => {
  const primarySlug = getPrimaryActivitySlug(tour);
  return getActivityLabelFromSlug(primarySlug) || "Outdoor adventure";
};

export const getSkillLevelLabel = (tour: Tour) => {
  const primarySlug = getPrimaryActivitySlug(tour);
  return SKILL_LEVELS[primarySlug] ?? "All levels with guide support";
};

export const getTourReviewSummary = (tour: Tour) => {
  const activityLabel = getActivityLabel(tour).toLowerCase();
  const destinationLabel = `${tour.destination.city}, ${tour.destination.state}`;
  const durationLabel = tour.badges.duration ?? "a flexible half-day window";

  return `Our Outdoor Adventures team sees ${tour.title} as a confident, well-paced way to experience ${destinationLabel}. The tour balances guided storytelling with plenty of space to settle into the scenery, making it ideal for travelers who want ${activityLabel} without the hassle of planning every turn. The experience is structured around ${durationLabel}, with a rhythm that favors comfort, steady exploration, and clear guidance from local experts.`;
};

export const getExpandedTourDescription = (tour: Tour) => {
  const baseParagraphs = tour.longDescription
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const activityLabel = getActivityLabel(tour);
  const skillLevel = getSkillLevelLabel(tour);
  const destinationLabel = `${tour.destination.city}, ${tour.destination.state}`;
  const durationLabel =
    tour.badges.duration ?? "a flexible half-day window";
  const ratingLabel = tour.badges.rating
    ? `Recent travelers highlight a ${tour.badges.rating.toFixed(1)} out of 5 experience.`
    : "Guest feedback often points to the balance of guidance and freedom.";

  const expandedParagraphs = [
    `${tour.title} delivers a guided ${activityLabel.toLowerCase()} experience with a relaxed, scenic pace. Starting in ${destinationLabel}, the route focuses on standout viewpoints and comfortable timing so you can enjoy the setting without feeling rushed.`,
    `We classify the skill level as ${skillLevel}, with the day structured around ${durationLabel}. Guides adapt the flow for the group, offering helpful context and optional pauses while keeping the outing smooth and approachable.`,
    `Scenery and local insight are the highlights. ${ratingLabel} Expect thoughtful stops, clear guidance, and a route that balances exploration with comfort.`,
  ];

  return [...baseParagraphs, ...expandedParagraphs];
};

export const getTourHighlights = (tour: Tour) => {
  const activityLabel = getActivityLabel(tour);
  const skillLevel = getSkillLevelLabel(tour);
  const destinationLabel = `${tour.destination.city}, ${tour.destination.state}`;
  const durationLabel = tour.badges.duration ?? "Flexible half-day pacing";
  const highlightSource =
    tour.badges.tagline || tour.tagPills?.[0] || "Local guide expertise";

  return [
    `${activityLabel} focus in ${destinationLabel}.`,
    `${durationLabel} with ${skillLevel.toLowerCase()}.`,
    highlightSource,
  ];
};
