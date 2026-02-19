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

export const fallbackLandmarkDescription = (args: {
  landmarkName: string;
  cityName: string;
  stateName: string;
}): string => {
  const { landmarkName, cityName, stateName } = args;
  const type = inferType(landmarkName);

  const templates: Record<string, string> = {
    park: `${landmarkName} is a major park in ${cityName}, ${stateName}, with public trails and managed green space. It is a practical stop for walking, viewpoints, and orientation before exploring nearby neighborhoods.`,
    museum: `${landmarkName} is a museum in ${cityName}, ${stateName}, focused on curated collections and rotating exhibits. It gives visitors a direct introduction to local art, science, or history without requiring a full-day visit.`,
    bridge: `${landmarkName} is a bridge landmark in ${cityName}, ${stateName}, known as a visible transportation crossing and viewpoint. It is often paired with waterfront walks and nearby districts in city itineraries.`,
    district: `${landmarkName} is a district in ${cityName}, ${stateName}, recognized for concentrated historic blocks, businesses, and public streets. It works well for walking routes that combine architecture, dining, and local street life.`,
    waterfront: `${landmarkName} is a waterfront landmark in ${cityName}, ${stateName}, associated with shoreline access and public promenades. Visitors typically come for open views, walking paths, and nearby harbor or river activity.`,
    landmark: `${landmarkName} is a notable landmark in ${cityName}, ${stateName}. It provides a clear orientation point and is commonly included in city plans for its location, recognizability, and local significance.`,
  };

  return templates[type];
};
