export const VENICE_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
  "140596P2",
  "17356P1",
  "56417P12",
  "126511P4",
  "15693P31",
  "15693STMARK",
  "6718P153",
  "9555P4",
  "2635PDOLOMITE",
  "7812P214",
  "3731MURANO",
  "92490P4",
] as const;

export type VeniceTargetedNarrativeDescriptionProductCode =
  (typeof VENICE_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const VENICE_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  VeniceTargetedNarrativeDescriptionProductCode,
  string
> = {
  "140596P2":
    "Prosecco is Italy's most beloved bubbly, produced on the scenic slopes just north of Venice. This full-day private tour leaves Piazzale Roma for two wine estates in the Prosecco Hills, with a scenic drive through vineyards and medieval villages. Estate visits include cellar tours, tastings, and a light lunch overlooking the hills, with an English-speaking guide and a certified sommelier. Private transport and a photo stop keep tasting-room timing coordinated so visitors can stay with the vineyards rather than planning rural driving from Venice. Stops include Piazzale Roma, Prosecco Hills wineries.",
  "17356P1":
    "Make lasting images of the canal city with a private photo shoot and gondola ride in Venice. A professional photographer leads a two-hour session through romantic corners around Piazza San Marco and the Rialto, then a 30-minute gondola ride is included as part of the package, along with a digital photo book. Pickup is available from listed apartments, the train station, Piazzale Roma, Accademia, and hotels. The private format keeps posing, light, and canal timing handled so visitors can focus on portraits rather than logistics. Stops include Piazza San Marco, Rialto.",
  "56417P12":
    "Beat the crowds and get an insider introduction to Venice on this private photo walk through lesser-known neighborhoods and canals that locals know. The three-hour outing starts near Campo San Giacomo di Rialto and the Rialto Market, with tailor-made routes and hands-on photography instruction from an internationally published photographer. Bridges, quieter campi, and canal angles replace packed landmark queues. The private format keeps pacing and shooting locations flexible for visitors who want photographs beyond the usual postcard stops. Stops include Campo San Giacomo di Rialto, Rialto Market.",
  "126511P4":
    "Venice's vaporetto water buses reach the lagoon islands, but slow routes and frequent stops can consume a sightseeing day. This private luxury-boat tour uses a water taxi to visit Murano, Burano, and Torcello in one outing, with glassblowing workshops, Burano's colorful houses, and Torcello's early Venetian history. Pickup is arranged from hotel, seaport, airport, or train-station details at booking. The private boat keeps island transfers tight so visitors can spend time on the three islands rather than public-ferry waits. Stops include Isola di Murano, Burano, Isola di Torcello.",
  "15693P31":
    "This full-day tour of Venice covers the city's most-important attractions for first-time visitors. The route crosses Ponte di Rialto, passes Mercato di Rialto, and includes a traditional gondola on the Canal Grande before skip-the-line time at Basilica di San Marco and the Doge's Palace. A local English-speaking guide and headset keep commentary clear through crowded squares. Tickets and gondola timing are coordinated so the six-hour day stays on the landmarks rather than ticket windows. Stops include Ponte di Rialto, Mercato di Rialto, Canal Grande, Basilica di San Marco, Doge's Palace.",
  "15693STMARK":
    "See Venice's Saint Mark's Basilica after hours on a small-group tour without daytime crowds. The visit covers glittering mosaics and the crypt associated with St. Mark, with an optional upgrade into the Doge's Palace and the Bridge of Sighs. Groups stay at 25 or fewer, and after-hours tickets are included for the basilica. The quieter evening format keeps attention on the mosaics and palace interiors rather than queue management in Piazza San Marco. Stops include Basilica di San Marco, Doge's Palace, Bridge of Sighs.",
  "6718P153":
    "Visit two of Venice's most remarkable interiors on a private walking tour of Saint Mark's Basilica and the Doge's Palace. Priority admission skips the long lines so the guide can lead straight into mosaics, palace great halls, historic prisons, weapon collections, and the Bridge of Sighs. The private format replaces a fast group itinerary with flexible pacing in Piazza San Marco. Skip-the-line access and a private guide keep the focus on the two monuments rather than ticket windows. Stops include Saint Mark's Basilica, Doge's Palace Great Halls, Bridge of Sighs.",
  "9555P4":
    "Discover three of the most beautiful islands in the Venetian Lagoon from Venice on a private half-day motorboat outing. Murano shows blown-glass workshops, Burano is known for lace makers and biscuits, and Torcello holds some of the lagoon's oldest settlements. A private captain keeps the itinerary customizable, with hotel pickup in Venice. The half-day format covers Murano, Burano, and Torcello without a full-day luxury charter, giving visitors lagoon island time with a dedicated boat. Stops include Murano glass workshop, Burano lace island, Torcello.",
  "2635PDOLOMITE":
    "Leave Venice for a long day in the Dolomite Mountains, with an early departure to reach Cortina d'Ampezzo, Lago di Misurina, and views of Tre Cime Di Lavaredo when conditions allow. An English-speaking driver-guide handles transfers in an eight-passenger Mercedes minivan, with an optional easy nature walk. Seasonal routing keeps the focus on alpine scenery rather than lagoon sightseeing. The 10-hour format is built for visitors who want mountain landscapes from a Venice base without self-driving mountain roads. Stops include Cortina d'Ampezzo, Tre Cime Di Lavaredo, Lago di Misurina.",
  "7812P214":
    "In Venice, many visitors land in tourist-trap restaurants. This small-group Secret Food Tours walk starts at Teatro Italia and continues toward the Rialto Market, sampling cicchetti, baccalà mantecato, a Venetian meatball, polenta in a traditional bacaro, pasta, cookies, and tiramisù. A local guide covers Venetian life and culinary history while keeping the route on neighborhood eateries rather than landmark queues. The walking format stays food-first for visitors who want authentic bacari instead of generic menus. Stops include Teatro Italia, Rialto Market.",
  "3731MURANO":
    "Take a fully guided small-group boat trip from Venice to Murano and Burano, with a group of up to 22 people. Murano is known for centuries-old glassblowing, and Burano for detailed lacework; the guide shares island history while visiting workshops and walking the streets. Round-trip private-boat transport for the group, plus glassmaking and lacemaking demonstrations, is included. The outing focuses on artisan crafts rather than a three-island luxury charter, giving visitors a structured lagoon introduction. Stops include Isola di Murano, Burano.",
  "92490P4":
    "Combine sightseeing and local food culture in Venice on this two-in-one walking tour. Meet near Campo San Bortolomio in the morning and continue on foot to the Rialto Bridge, Campo San Polo, and Basilica dei Frari, with stops at authentic bacari for cicchetti snacks. A local English-speaking guide leads the route; beverages at bacari are typically at own expense. The format keeps landmark walking and street-food tasting in one outing for visitors who want both the historic center and cicchetti. Stops include Rialto Bridge, Campo San Polo, Basilica dei Frari.",
};

export const getVeniceTargetedNarrativeDescription = (
  productCode: string
) =>
  VENICE_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as VeniceTargetedNarrativeDescriptionProductCode
  ];
