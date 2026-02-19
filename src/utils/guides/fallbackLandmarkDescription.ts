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
    park: `${landmarkName} is a major urban park in ${cityName}, ${stateName}, defined by managed green space and public recreation areas. It is known for trails, landscaped sections, and recurring community use that reflect local planning priorities. Visitors experience open views, varied walking routes, and a practical snapshot of how residents use outdoor space across the city.`,
    museum: `${landmarkName} is a museum site in ${cityName}, ${stateName}, focused on preserving and presenting regional collections or specialized exhibits. It is known for curated galleries and interpretive context that connect local history, art, or science to broader themes. Visitors experience structured exhibits, educational materials, and a concise introduction to the city's cultural institutions.`,
    bridge: `${landmarkName} is a bridge landmark associated with transportation links in ${cityName}, ${stateName}, and often serves as a visual marker in the surrounding corridor. It is known for engineering design, river or roadway crossings, and its role in local connectivity. Visitors experience prominent vantage points, changing perspectives across the span, and clear geographic context for the area.`,
    district: `${landmarkName} is a recognized district in ${cityName}, ${stateName}, with concentrated historic fabric, commercial streets, or civic landmarks. It is known for layered architecture and place identity shaped by long-term development patterns. Visitors experience walkable blocks, distinct building character, and an immediate sense of the neighborhood's role in the wider city.`,
    waterfront: `${landmarkName} is a waterfront landmark in ${cityName}, ${stateName}, connected to shoreline infrastructure and public access zones. It is known for views over the water, maritime activity, and its relationship to nearby civic or commercial districts. Visitors experience promenades, changing light conditions, and a clear reference point for understanding the city's coastal or riverfront geography.`,
    landmark: `${landmarkName} is a prominent landmark in ${cityName}, ${stateName}, recognized as part of the city's physical and cultural landscape. It is known for identifiable design features and long-standing local relevance across civic life. Visitors experience site-specific details, neighborhood context, and a practical orientation point when exploring the surrounding area.`,
  };

  return templates[type];
};
