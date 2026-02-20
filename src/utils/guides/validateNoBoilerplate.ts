const BLACKLIST = [
  /first-time visitors/i,
  /anchor area/i,
  /pair landmarks/i,
  /reduce transit time/i,
  /one of the most valuable things to do/i,
  /balanced itinerary/i,
  /travelers comparing attractions/i,
  /easy recommendation/i,
  /plan for 60 to 150 minutes/i,
  /you should/i,
  /pair this with nearby dining/i,
  /established network of cultural and public places/i,
  /identifiable physical features/i,
  /city-level events across the year/i,
  /civic references/i,
  /clear sense of place/i,
];

export const validateNoBoilerplate = (description: string): boolean =>
  !BLACKLIST.some(pattern => pattern.test(description));
