const inferType = (landmarkName: string) => {
  if (/\bpark\b/i.test(landmarkName)) return "park";
  if (/\bmuseum\b/i.test(landmarkName)) return "museum";
  if (/\bbridge\b/i.test(landmarkName)) return "bridge";
  if (/\bdistrict\b|\bold town\b|\bquarter\b/i.test(landmarkName))
    return "district";
  if (/\bbeach\b|\bharbor\b|\bwaterfront\b|\bpier\b/i.test(landmarkName))
    return "waterfront";
  return "landmark";
};

const limitWords = (text: string, maxWords: number): string => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return text;
  }

  return `${words.slice(0, maxWords).join(" ").replace(/[,:;\-]+$/g, "")}.`;
};

export const fallbackLandmarkDescription = (args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
}): string => {
  const { landmarkName, cityName, stateName } = args;
  const type = inferType(landmarkName);

  const templates: Record<string, string> = {
    park: `${landmarkName} is a major public park in ${cityName}, ${stateName}, known for open lawns, trails, and recreation areas that anchor outdoor activity in the city.`,
    museum: `${landmarkName} is a museum in ${cityName}, ${stateName}, featuring curated exhibitions that highlight art, science, or regional history in a single, focused visit.`,
    bridge: `${landmarkName} is a prominent bridge in ${cityName}, ${stateName}, notable for its engineering profile and elevated views over surrounding waterways and neighborhoods.`,
    district: `${landmarkName} is a district in ${cityName}, ${stateName}, recognized for concentrated historic streets, local businesses, and architecture that reflects the city's development.`,
    waterfront: `${landmarkName} is a waterfront area in ${cityName}, ${stateName}, known for shoreline access, scenic promenades, and active public space near the water.`,
    landmark: `${landmarkName} is a notable landmark in ${cityName}, ${stateName}, known for its local significance and role as a recognizable stop on city visits.`,
  };

  return limitWords(templates[type], 45);
};
