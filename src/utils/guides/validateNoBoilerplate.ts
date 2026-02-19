export const BANNED_PHRASES = [
  "prominent landmark",
  "physical and cultural landscape",
  "long-standing local relevance",
  "practical orientation point",
  "one of the most valuable things to do",
  "balanced itinerary",
  "travelers comparing",
  "pair with nearby",
  "plan for",
];

export const findBannedPhrase = (text: string): string | null => {
  const normalized = text.toLowerCase();
  return BANNED_PHRASES.find(phrase => normalized.includes(phrase)) ?? null;
};

export const validateNoBoilerplate = (description: string): boolean =>
  !findBannedPhrase(description);
