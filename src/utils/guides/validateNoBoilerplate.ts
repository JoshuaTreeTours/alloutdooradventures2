export const GUIDE_DESCRIPTION_BLACKLIST: RegExp[] = [
  /one of the most valuable things to do/i,
  /balanced itinerary/i,
  /travelers comparing/i,
  /\bplan for\b/i,
  /\bpair with\b/i,
  /easy recommendation/i,
  /you should/i,
  /pair this with nearby dining/i,
];

export const validateNoBoilerplate = (description: string): boolean =>
  !GUIDE_DESCRIPTION_BLACKLIST.some(pattern => pattern.test(description));
