export const buildItinerarySteps = (input: {
  title: string;
  city: string;
  duration?: string | null;
  highlights?: string[];
}): string[] => {
  const duration = input.duration?.trim();
  const location = `${input.city}, California`;
  const primary = input.highlights?.find(Boolean);

  const steps = [
    `Meet your guide in ${location}, check in, and review route and safety details.`,
    `Begin the approach with a paced introduction to terrain, conditions, and group expectations${duration ? ` for the ${duration} outing` : ""}.`,
    primary
      ? `Move into the core experience with guided focus on ${primary.toLowerCase()}.`
      : `Move into the core experience with guided activity tailored to current group pace and conditions.`,
    `Pause for photos, interpretation, and local context so you can understand what makes this part of Joshua Tree unique.`,
    `Wrap up with a return to the meeting area, plus final recommendations before departure.`,
  ];

  return steps.slice(0, 6);
};

export const toSchemaItinerary = (steps: string[]) => ({
  "@type": "ItemList",
  itemListElement: steps.map((step, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: step,
  })),
});
