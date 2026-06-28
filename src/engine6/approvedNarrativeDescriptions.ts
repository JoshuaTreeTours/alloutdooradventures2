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
    "Pedal through downtown Las Vegas on an e-bike route that moves beyond the resort corridor into the 18b Arts District, where murals, galleries, and neighborhood landmarks reveal a very different side of the city. The ride continues to recognizable stops such as the STRAT, the Gold & Silver Pawn Shop, and the Las Vegas Boulevard Gateway Arches while a guide shares stories about local culture, architecture, and how the city has changed block by block. The pace stays relaxed enough for most riders while still covering meaningful distance across the urban core.",
  "5614063P8":
    "Leave Manhattan for a full day in Washington, D.C., where Capitol Hill, the White House area, and major memorials anchor a fast-paced introduction to the capital. A guide connects each stop to the institutions and history that shaped the United States, while round-trip transportation keeps the day focused on the monuments rather than logistics. You return to New York in the evening with a clear sense of how the city's political landmarks fit together in a single coordinated itinerary across the National Mall corridor.",
  "62527P11":
    "Stand at the edge of Niagara Falls on a long day trip from New York City, with round-trip transportation and time at major viewpoints over the American and Horseshoe Falls. The pace is built around the waterfalls themselves, with a guide adding context on the region's geology and history while you move between scenic overlooks. It is a strong choice when you want one of North America's signature natural sights without planning the long drive yourself or juggling tickets and timing at the falls on your own.",
  "3857PHI":
    "Split a full day between Philadelphia's founding-era landmarks and the quieter farmland of Amish Country on a trip from New York City. The morning focuses on historic Philadelphia streets and the stories behind the nation's early government, while the afternoon shifts to rural Pennsylvania traditions and open countryside. The combination gives you both urban history and a contrasting pastoral landscape in a single itinerary before returning to Manhattan with a fuller picture of Pennsylvania beyond the city limits.",
  "5250LIBERTYELLIS":
    "Ferry across New York Harbor to Liberty Island and Ellis Island, two landmarks that define the city's immigration story and its place in American history. On Liberty Island, the Statue of Liberty dominates the skyline; on Ellis Island, exhibits and preserved halls recall the millions who entered the country through this port. Included ferry transport and guide commentary tie the harbor views to the human history behind the monuments throughout the visit, making this a focused half-day on the water.",
  "122012P17":
    "Roll through Midtown, Central Park, Lincoln Center, and other signature New York neighborhoods on a half-day coach tour designed as a first-timer's orientation. Photo stops are timed for skyline and street-level views you would struggle to assemble on your own in one morning, while a guide fills in architectural and cultural context between neighborhoods. The format covers a wide slice of Manhattan without switching trains, tickets, or routes on your own, which makes it especially useful for visitors with limited time.",
  "3780P45":
    "Board the Riverboat CITY of NEW ORLEANS at the French Quarter riverfront for a 75-minute Mississippi River cruise with live captain narration. Jackson Square, St. Louis Cathedral, the Crescent City Connection, the Aquarium of the Americas, Mardi Gras World, Caesars Casino, and Woldenberg Riverfront Park pass in sequence from the water, giving you open river views of downtown New Orleans. The round-trip cruise finishes back at the dock behind JAX Brewery with the French Quarter skyline still in view.",
  "3780SUPER":
    "Combine a French Quarter walk, lunch time at the French Market, a 75-minute Mississippi River cruise aboard the Riverboat CITY of NEW ORLEANS, and a narrated coach segment through the Garden District, City Park, the National WWII Museum, and Audubon Aquarium. Starting and finishing at Cafe Beignet in the JAX Brewery Building, the day layers walking, river, and street-level perspectives on New Orleans in one coordinated itinerary with varied viewpoints and a mix of independent lunch time and guided segments.",
  "276551P2":
    "Cycle from the French Quarter through Jackson Square and Congo Square into the Garden District and Lafayette Cemetery No. 1 on a city bike route that covers more ground than a walking tour. Beginning and ending on Washington Avenue, the ride moves at a comfortable pace with a local guide adding neighborhood history and practical recommendations along the way. Bicycle, helmet, bottled water, and weather support are included for the full loop through historic streets and garden-district architecture.",
  "58347P1":
    "Ride beyond the French Quarter into Faubourg Marigny, Bywater, and Treme on a small-group bicycle tour departing from North Rampart Street. Stops near the Mississippi River, Jackson Square, and St. Roch Community Church anchor a three-hour route that connects neighborhood scenery to New Orleans' multicultural roots and Creole culture. Bicycle, helmet, and bottled water are included, with the loop returning to the meeting point after varied district scenery and frequent pauses for photos along the way.",
};

export const getEngine6TargetedNarrativeDescription = (productCode: string) =>
  ENGINE6_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as Engine6TargetedNarrativeDescriptionProductCode
  ];
