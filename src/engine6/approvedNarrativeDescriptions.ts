export const ENGINE6_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
  "5615689P4",
  "5614063P8",
  "62527P11",
  "3857PHI",
  "5250LIBERTYELLIS",
  "122012P17",
  "3780P45",
  "3780SUPER",
  "276551P2",
  "58347P1",
] as const;

export type Engine6TargetedNarrativeDescriptionProductCode =
  (typeof ENGINE6_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const ENGINE6_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  Engine6TargetedNarrativeDescriptionProductCode,
  string
> = {
  "5615689P4":
    "Explore downtown Las Vegas by e-bike on a guided ride through the city's creative and historic districts. Pedal through the 18b Arts District to see colorful murals, local galleries, and neighborhood landmarks before continuing to sites such as the STRAT, the Gold & Silver Pawn Shop, and the Las Vegas Boulevard Gateway Arches. Along the way, your guide shares stories about Las Vegas culture, architecture, and transformation beyond the resort corridor while providing a relaxed route suitable for most riders.",
  "5614063P8":
    "Travel from New York City to Washington, D.C. on a guided day trip that showcases many of the nation's most recognizable landmarks. Visit areas surrounding the White House, Capitol Hill, and major memorials while learning about the history and institutions that shape the United States government. With round-trip transportation included, this excursion offers an efficient way to experience the highlights of the capital in a single day before returning to New York in the evening.",
  "62527P11":
    "Experience one of North America's most famous natural wonders on a guided day trip from New York City to Niagara Falls. Travel comfortably with round-trip transportation and enjoy time to explore major viewpoints overlooking the American and Horseshoe Falls. Throughout the day, your guide provides insight into the region's history, geology, and significance while coordinating logistics so you can focus on the waterfalls and surrounding scenery before returning to New York.",
  "3857PHI":
    "Discover two distinct sides of Pennsylvania on a guided day trip from New York City. Begin in historic Philadelphia, where you'll see landmarks connected to the nation's founding and learn about the city's role in American history. Continue into Amish Country to experience a quieter rural landscape shaped by longstanding traditions and agricultural life. This full-day excursion combines urban history, cultural insight, and countryside scenery in a single itinerary.",
  "5250LIBERTYELLIS":
    "Explore two of New York Harbor's most important landmarks with a guided visit to Liberty Island and Ellis Island. Learn the story of the Statue of Liberty as a symbol of freedom before continuing to Ellis Island, where millions of immigrants first entered the United States. Ferry transportation is included, and your guide provides historical context that brings the harbor, the monuments, and the immigration experience to life throughout the tour.",
  "122012P17":
    "See many of New York City's most recognizable neighborhoods and landmarks on a guided half-day sightseeing tour by luxury coach. Travel through Midtown, Central Park, Lincoln Center, and other notable areas while your guide shares stories about the city's history, architecture, and culture. Strategic photo stops along the route allow you to capture iconic views without the hassle of navigating the city on your own, making this an efficient introduction to New York for first-time visitors.",
  "3780P45":
    "Cruise the Mississippi River from the French Quarter riverfront aboard the Riverboat CITY of NEW ORLEANS. This 75-minute sightseeing route uses live captain narration while the boat passes downtown river landmarks including Jackson Square, St. Louis Cathedral, the Crescent City Connection, the Aquarium of the Americas, Mardi Gras World, Caesars Casino, and Woldenberg Riverfront Park. Travelers experience New Orleans from the water with open river views and a smooth downtown round-trip finish at the dock behind JAX Brewery.",
  "3780SUPER":
    "Explore New Orleans in one combined sightseeing day with a guided French Quarter walk, independent lunch time at the French Market, and a 75-minute Mississippi River cruise aboard the Riverboat CITY of NEW ORLEANS. The experience continues by narrated coach through city highlights such as the Garden District, City Park, the National WWII Museum, and Audubon Aquarium. Starting and finishing at Cafe Beignet in the JAX Brewery Building, the route blends walking, riverboat, and bus perspectives on New Orleans.",
  "276551P2":
    "Bike through New Orleans on a guided city route linking the French Quarter, Jackson Square, Congo Square, the Garden District, and Lafayette Cemetery No. 1. Starting and finishing on Washington Avenue, the ride uses a comfortable pace to cover more ground than a walking tour while a local guide adds neighborhood context and practical recommendations. Travelers experience historic streets, downtown transitions, and garden-district architecture with bicycle, helmet, bottled water, and weather support included.",
  "58347P1":
    "Ride beyond the French Quarter on a small-group New Orleans bicycle tour through Faubourg Marigny, Bywater, and Treme. Departing from North Rampart Street, the three-hour route includes stops near the Mississippi River, Jackson Square, and St. Roch Community Church while the guide connects neighborhood scenery with the city's multicultural origins and Creole culture. Travelers use included bicycle and helmet equipment, with bottled water provided and the loop finishing back at the meeting point.",
};

export const getEngine6TargetedNarrativeDescription = (productCode: string) =>
  ENGINE6_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as Engine6TargetedNarrativeDescriptionProductCode
  ];
