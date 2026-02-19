const GENERIC_TRAVEL_ADVICE_PATTERNS = [
  /one of the most valuable things to do/i,
  /travelers?\s+comparing\s+attractions?/i,
  /balanced\s+itinerary/i,
  /avoid\s+unnecessary\s+transit(?:\s+time)?/i,
  /golden\s+hour/i,
  /easy\s+recommendation\s+for\s+travelers?/i,
  /high-impact\s+stop/i,
  /pair\s+this\s+experience/i,
  /prioritize\s+.+?\s+early\s+in\s+your\s+trip/i,
];

export const isGenericTravelAdvice = (text: string): boolean =>
  GENERIC_TRAVEL_ADVICE_PATTERNS.some(pattern => pattern.test(text));

