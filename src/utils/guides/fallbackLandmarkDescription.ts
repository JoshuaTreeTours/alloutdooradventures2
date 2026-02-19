const inferType = (landmarkName: string) => {
  if (/\bpark\b/i.test(landmarkName)) return "park";
  if (/\bmuseum\b/i.test(landmarkName)) return "museum";
  if (/\bbridge\b/i.test(landmarkName)) return "bridge";
  if (/\bgarden\b/i.test(landmarkName)) return "garden";
  if (/\bharbor\b|\bwaterfront\b|\bbeach\b/i.test(landmarkName)) return "waterfront";
  return "site";
};

export const fallbackLandmarkDescription = (args: {
  landmarkName: string;
  cityName: string;
  stateName?: string;
  tier: "tier1" | "tier2";
}): string => {
  const { landmarkName, cityName, stateName, tier } = args;
  const cleanName = landmarkName.replace(/\./g, "").trim();
  const location = stateName ? `${cityName}, ${stateName}` : cityName;
  const type = inferType(landmarkName);

  if (tier === "tier2") {
    return `${cleanName} is a ${type} in ${location}. It stands out for a recognizable layout and a locally known feature that distinguishes it from nearby stops.`;
  }

  return [
    `${cleanName} is a ${type} in ${location}.`,
    `Its setting is defined by clear physical traits that make the location easy to identify on arrival.`,
    `A distinguishing feature gives the site a specific role in local history or present-day use.`,
    `The surrounding district provides scale and context, whether residential, commercial, or waterfront.`,
    `Records and maps consistently mark this location as a notable point within ${cityName}.`,
    `Visitors usually notice a concrete mix of form, setting, and local function rather than generic city context.`,
  ].join(" ");
};
