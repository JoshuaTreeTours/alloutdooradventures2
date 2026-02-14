export type BuiltTourCopy = {
  experienceText: string;
  highlights: string[];
  metaDescription: string;
};

const sanitizeTourLabel = (value: string) =>
  value.replace(/\bFood\s+Tour\b/gi, "Guided Tour");

const toSentenceCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const splitNameTokens = (name: string) =>
  sanitizeTourLabel(name)
    .split(/[-,:()]/g)
    .map((token) => token.trim())
    .filter(Boolean);

export const buildTourCopy = ({
  name,
  provider,
  city,
  region,
}: {
  name: string;
  provider: string;
  city: string;
  region: string;
}): BuiltTourCopy => {
  const sanitizedName = sanitizeTourLabel(name);
  const tokens = splitNameTokens(sanitizedName);
  const moodWord = tokens[0] ?? "guided";
  const accentWord = tokens[tokens.length - 1] ?? "adventure";

  const experienceText = [
    `${sanitizedName} with ${provider} is designed for travelers who want more than a quick photo stop in ${city}. This experience combines local storytelling, practical route planning, and time to explore the landscapes that define ${city}, ${region}.`,
    `Expect a relaxed but well-paced outing where your guide helps you understand what makes each stop unique, from geology and neighborhood history to small details you might miss on your own. The pace works well for first-time visitors and return travelers who want a dependable, professionally operated day in the desert.`,
    `Throughout the tour, your guide can share tips on timing, weather, and local recommendations so the rest of your trip in ${city} is even easier to plan. ${provider} keeps the logistics simple, so you can focus on the experience itself and enjoy every segment with confidence.`,
    `If you are comparing options, this is a strong fit when you want a ${moodWord.toLowerCase()} experience with reliable operations and memorable views. It is a polished way to enjoy ${accentWord.toLowerCase()} moments while making the most of your time in ${city}.`,
  ].join(" ");

  const highlights = [
    `Guided ${toSentenceCase(moodWord)} experience in ${city}`,
    `Operated by ${provider} with straightforward booking`,
    `Great fit for first-time and repeat visitors to ${region}`,
  ].map(sanitizeTourLabel);

  const metaDescription = sanitizeTourLabel(
    `${sanitizedName} in ${city}, ${region} with ${provider}. Guided experience, clear logistics, and memorable local stops.`,
  );

  return {
    experienceText: sanitizeTourLabel(experienceText),
    highlights,
    metaDescription,
  };
};
