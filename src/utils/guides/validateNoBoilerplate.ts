const BLACKLIST = [
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
  /prominent landmark/i,
  /recognized as part of the city'?s physical and cultural landscape/i,
  /identifiable design features/i,
  /long-standing local relevance/i,
  /site-specific details/i,
  /practical orientation point/i,
  /connected to shoreline infrastructure/i,
  /\bit is known for\b/i,
];

export const validateNoBoilerplate = (description: string): boolean =>
  !BLACKLIST.some(pattern => pattern.test(description));
