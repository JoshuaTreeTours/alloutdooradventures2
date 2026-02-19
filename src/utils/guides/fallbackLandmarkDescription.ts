const inferType = (landmarkName: string) => {
  if (/\bpark\b/i.test(landmarkName)) return "park";
  if (/\bmuseum\b/i.test(landmarkName)) return "museum";
  if (/\bbridge\b/i.test(landmarkName)) return "bridge";
  if (/\bgarden\b/i.test(landmarkName)) return "garden";
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
    return `${cleanName} is a ${type} in ${location}. The site is known locally for recognizable design and regular public use, with visible ties to nearby neighborhoods.`;
  }

  return [
    `${cleanName} is a ${type} in ${location}.`,
    `It is part of the city's established network of cultural and public places.`,
    `The setting includes identifiable physical features that make the site easy to distinguish.`,
    `Its layout supports a mix of everyday activity and city-level events across the year.`,
    `Historical records and civic references keep the site connected to the area's development story.`,
    `Visitors usually experience a clear sense of place through the landmark's scale, access, and surrounding context.`,
  ].join(" ");
};
