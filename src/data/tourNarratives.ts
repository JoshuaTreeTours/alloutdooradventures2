import type { Tour } from "./tours.types";

const ACTIVITY_LABELS: Record<string, string> = {
  cycling: "Cycling",
  hiking: "Hiking",
  canoeing: "Canoeing",
  detours: "Scenic touring",
  "day-adventures": "Day adventure",
  "multi-day": "Multi-day adventure",
};

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
  return ACTIVITY_LABELS[primarySlug] ?? "Outdoor adventure";
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
  const durationLabel = tour.badges.duration ??
    "a flexible half-day window that can stretch longer when conditions are ideal";
  const ratingLabel = tour.badges.rating
    ? `If ratings are available, recent travelers highlight a ${tour.badges.rating.toFixed(
        1,
      )} out of 5 experience.`
    : "Guest feedback often points to the balance of guidance and freedom.";

  const expandedParagraphs = [
    `${tour.title} is designed to deliver an immersive ${activityLabel.toLowerCase()} experience while keeping the logistics easy. Starting in ${destinationLabel}, you’ll meet a local guide who knows the flow of the day and the best timing for vistas, weather, and trail or water conditions. The tour blends curated waypoints with natural pauses, giving you space to absorb the landscape and keep the experience relaxed. Expect a steady pace that lets you connect with the setting without feeling rushed, with time built in for questions, story-sharing, and quick photo stops that highlight what makes this destination distinct.`,
    `The overall pacing is approachable for most travelers, and we classify the skill level as ${skillLevel}. The route focuses on steady movement rather than high-intensity bursts, so you can settle into a comfortable rhythm. Guides adapt the flow for the group, offering optional extensions or breaks as needed. Because the tour is built around ${durationLabel}, you can plan meals and transportation with confidence, while still enjoying a full sense of the region. This balance makes the experience a strong fit for couples, families, and small groups who want a meaningful outdoor day without overcommitting.`,
    `Scenery is a major part of the story here. Your guide will call out key viewpoints, seasonal highlights, and natural details that many visitors miss when they travel on their own. Depending on the time of year, you might notice changing light on water, a shift in trail textures, or a different mix of wildlife sounds. ${ratingLabel} That feedback aligns with our own emphasis on tours that deliver consistent value across different travel styles. Whether you travel in the early morning or later in the day, the itinerary keeps an eye on comfort, sightlines, and the best ways to experience the surrounding terrain.`,
    `Comfort and preparation are central to the experience. Plan for layers, sun protection, and a reusable water bottle, especially if your tour lands during warmer months. Guides typically review simple safety cues before departure and will confirm any gear needs in advance. Because the tour is guided, you can focus more on the scenery and less on navigation. If you’re new to ${activityLabel.toLowerCase()}, the team is used to answering beginner questions, and they share practical tips about pacing, posture, and how to enjoy the route with less fatigue.`,
    `This tour also shines for travelers who value local context. Guides bring regional insights about geology, ecology, and the cultural history of ${destinationLabel}. Those touchpoints add depth to the day, turning a simple outing into a narrative about place and community. You’ll hear about why specific viewpoints matter, how local ecosystems shape the terrain, and what makes the route feel different from nearby alternatives. The emphasis is on understanding the environment as you explore it, not just passing through, which is why we consider it a strong match for curious travelers and first-time visitors.`,
    `If you’re building a longer itinerary, ${tour.title} can act as a flexible anchor day. The tour’s pacing leaves time for dinner reservations, scenic drives, or a sunset walk afterward. Guests who enjoy a structured experience often appreciate the way this tour simplifies a busy travel day, letting them focus on the best views and the right timing. The route’s design helps you see the destination through an outdoors-first lens, with space to pause and absorb the atmosphere. It’s a satisfying option whether you’re traveling for a weekend or layering multiple adventures into a longer trip.`,
    `Photography-friendly moments are naturally built into the flow. The guide will highlight natural framing, overlook timing, and spots that capture the character of the landscape. These breaks are brief but intentional, so the group stays aligned while still getting those memorable shots. Because the tour is guided, the stops feel purposeful instead of rushed, which is helpful for travelers who want both motion and stillness. The experience encourages mindful pacing—moving through the route steadily, then stopping to really see the details that make ${destinationLabel} feel unique.`,
    `Our Outdoor Adventures team keeps an eye on tours that feel authentic, well-organized, and rewarding for a wide range of travelers. ${tour.title} meets that bar by pairing expert guidance with a route that’s approachable, scenic, and thoughtfully timed. For the clearest availability, check the live booking calendar before you finalize other plans. The tour’s structure allows for easy adjustments, so you can prioritize comfort and enjoyment while still getting the full experience of ${activityLabel.toLowerCase()} in this destination.`,
  ];

  return [...baseParagraphs, ...expandedParagraphs];
};
