const activityLabel = (activity: string) => {
  const text = activity.toLowerCase();
  if (text.includes("stargaz")) return "stargazing";
  if (text.includes("climb")) return "hiking and climbing";
  if (text.includes("hike")) return "hiking";
  if (text.includes("sound")) return "a sound bath experience";
  return "a guided outdoor adventure";
};

export const buildFirstPersonExperienceDescription = (input: {
  title: string;
  city: string;
  duration?: string | null;
  categories?: string[];
  highlights?: string[];
}): string => {
  const activity = activityLabel(
    [input.title, ...(input.categories ?? [])].join(" ")
  );
  const durationLabel =
    input.duration?.trim() || "the timing listed on the booking page";
  const featuredHighlight = input.highlights?.find(Boolean)?.trim();

  const paragraphs = [
    `I love this ${input.city} tour because it keeps the day focused on ${activity} while still giving me time to actually absorb the desert landscape instead of rushing between stops.`,
    `The pacing is built around ${durationLabel}, so I can settle into a comfortable rhythm, check in with my guide, and stay present for the parts of Joshua Tree that make this route feel distinct.`,
    featuredHighlight
      ? `One thing that stands out every time is ${featuredHighlight.toLowerCase()}. It gives the experience a clear point of difference and makes the outing feel personal rather than generic.`
      : `I come away feeling like I had a complete experience: a clear plan, enough interpretation to understand what I’m seeing, and a finish that leaves time to regroup before heading back.`,
  ];

  return paragraphs.join("\n\n");
};
