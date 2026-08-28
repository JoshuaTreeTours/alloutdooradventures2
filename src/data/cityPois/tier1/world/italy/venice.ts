import type { Tier1WorldCityPoi } from "../types";

export const pois: Tier1WorldCityPoi[] = [
  {
    id: "st-marks-basilica",
    name: "St. Mark's Basilica",
    lat: 45.4346,
    lng: 12.3397,
    categories: ["historic", "architecture", "landmark"],
    description:
      "St. Mark's Basilica faces Piazza San Marco with gold mosaics, marble floors, and the Pala d'Oro that define Venice's Byzantine heart. The interior rewards a slow circuit of the narthex, high altar, and museum terrace above the horses. Timed entry keeps the visit focused on the mosaics rather than the daytime queue that fills the piazza.",
  },
  {
    id: "doges-palace",
    name: "Doge's Palace",
    lat: 45.4338,
    lng: 12.3402,
    categories: ["historic", "palace", "museum"],
    description:
      "The Doge's Palace was the political center of the Venetian Republic, with vast council halls, armories, and prison corridors linked by the Bridge of Sighs. Tintoretto and Veronese canvases fill the Sala del Maggior Consiglio, while the Scala d'Oro leads into gilded state rooms. Pairing the palace with St. Mark's Basilica covers the civic and sacred core of the lagoon city.",
  },
  {
    id: "rialto-bridge",
    name: "Rialto Bridge",
    lat: 45.4380,
    lng: 12.3359,
    categories: ["landmark", "historic", "architecture"],
    description:
      "The Rialto Bridge is the oldest spanning of the Grand Canal, with stone arches, shop galleries, and a high walkway over working gondolas and vaporetti. Cross at the top for the classic canal view toward Ca' Foscari, then drop to the Rialto Market stalls on the San Polo side. Early morning is the quietest time to photograph the bridge without the midday crush.",
  },
  {
    id: "grand-canal",
    name: "Grand Canal",
    lat: 45.4408,
    lng: 12.3290,
    categories: ["landmark", "waterway", "historic"],
    description:
      "The Grand Canal is Venice's main water avenue, lined with palazzi from Ca' d'Oro to the Accademia and Santa Maria della Salute. A vaporetto or gondola ride shows the city's palaces, warehouses, and landing stages as they were meant to be seen from the water. The S-shaped route is the clearest way to understand how Venice is organized around boats rather than streets.",
  },
  {
    id: "piazza-san-marco",
    name: "Piazza San Marco",
    lat: 45.4340,
    lng: 12.3386,
    categories: ["plaza", "historic", "landmark"],
    description:
      "Piazza San Marco is Venice's principal civic square, framed by the basilica, the Campanile, the Clock Tower, and the Procuratie arcades. Café terraces and museum galleries sit under the porticoes, while the open pavement is the city's ceremonial stage. Climb the Campanile for lagoon views that place the islands, the Giudecca, and the Lido in one sweep.",
  },
  {
    id: "murano",
    name: "Murano",
    lat: 45.4584,
    lng: 12.3568,
    categories: ["island", "craft", "historic"],
    description:
      "Murano is the lagoon island known for glass furnaces, showroom galleries, and the Museo del Vetro on Fondamenta Giustinian. A short water-taxi or vaporetto hop from Fondamente Nove brings you to working furnaces where molten glass is shaped in public demonstrations. The canals here are quieter than San Marco, with brick fondamenta and neighborhood bakeries between studio visits.",
  },
  {
    id: "burano",
    name: "Burano",
    lat: 45.4852,
    lng: 12.4167,
    categories: ["island", "neighborhood", "landmark"],
    description:
      "Burano is a brightly painted fishing island in the northern lagoon, famous for lace-making and tightly packed canals lined with colored houses. The leaning campanile of San Martino and the lace museum give the visit more than a photo stop. It pairs naturally with Murano and Torcello on a boat circuit that leaves the densest tourist routes behind.",
  },
  {
    id: "bridge-of-sighs",
    name: "Bridge of Sighs",
    lat: 45.4340,
    lng: 12.3409,
    categories: ["historic", "landmark", "architecture"],
    description:
      "The Bridge of Sighs is the enclosed limestone crossing that once linked the Doge's Palace courtrooms to the New Prisons over the Rio di Palazzo. Views from the bridge's small windows look toward the lagoon and San Giorgio Maggiore, the last water glimpse attributed to condemned prisoners. Seeing it from a gondola below or from inside a palace tour explains why it remains one of Venice's most recognized spans.",
  },
];
