const BLACKLIST = [
  /one of the most valuable things to do/i,
  /balanced itinerary/i,
  /travelers comparing attractions/i,
  /easy recommendation/i,
  /plan for 60 to 150 minutes/i,
  /you should/i,
  /pair this with nearby dining/i,
];

export const validateNoBoilerplate = (description: string): boolean =>
  !BLACKLIST.some(pattern => pattern.test(description));
