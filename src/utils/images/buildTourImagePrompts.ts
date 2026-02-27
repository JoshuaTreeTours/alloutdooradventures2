const inferActivity = (title: string, fallback?: string) => {
  const normalized = title.toLowerCase();
  if (/jeep|off-?road|4x4/.test(normalized)) return "off-road jeep tour";
  if (/hike|trail|trek/.test(normalized)) return "guided hiking tour";
  if (/boat|sail|kayak|canoe|cruise/.test(normalized)) return "on-water tour";
  if (/museum|history|walking/.test(normalized))
    return "walking sightseeing tour";
  return fallback || "guided outdoor adventure";
};

export function buildTourImagePrompts(input: {
  title: string;
  destinationName: string;
  activityCategory?: string;
  keyFacts?: string[];
}) {
  const activity = inferActivity(input.title, input.activityCategory);
  const facts = (input.keyFacts ?? []).filter(Boolean).slice(0, 3).join(", ");

  const sharedStyle =
    "cinematic travel photography, ultra realistic, diverse adult travelers, non-identifiable faces, no logos, no text, no watermarks, no brand marks";

  const heroPrompt = `${sharedStyle}, wide composition 16:9, a small group experiencing a ${activity} in ${input.destinationName}, scene inspired by \"${input.title}\", dramatic environment details, golden hour light${facts ? `, context cues: ${facts}` : ""}.`;

  const bottomPrompt = `${sharedStyle}, wide composition 16:9, closer storytelling moment with travelers and guide during a ${activity} in ${input.destinationName}, scene inspired by \"${input.title}\", warm natural light, terrain details${facts ? `, context cues: ${facts}` : ""}.`;

  return { heroPrompt, bottomPrompt };
}
