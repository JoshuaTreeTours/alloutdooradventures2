export const BANNED_PHRASES: string[] = [
  "One of the most valuable things to do",
  "Travelers comparing attractions",
  "easy recommendation",
  "practical stop",
  "plan for",
  "avoid unnecessary transit time",
  "coverage for",
  "cross-links",
  "article set",
  "according to",
];

export const hasBoilerplate = (text: string) => {
  const value = text.toLowerCase();
  return BANNED_PHRASES.some(phrase => value.includes(phrase.toLowerCase()));
};

export const assertNoBoilerplate = (text: string): void => {
  if (hasBoilerplate(text)) {
    throw new Error(`Boilerplate phrase detected in text: ${text.slice(0, 120)}`);
  }
};
