import type { ViatorProductData } from "../types";

export const viatorProductCacheByCode: Record<string, ViatorProductData> = {
  "6740JTREE": {
    sourceUrl:
      "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Hummer-Adventure-from-Palm-Desert/d648-6740JTREE",
    productCode: "6740JTREE",
    title: "Joshua Tree Hummer Adventure from Palm Desert",
    supplierImage:
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
    imageCandidates: [
      "https://dynamic-media.tacdn.com/media/photo-o/2f/globalNav/fallback-image.webp",
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
    ],
    priceFrom: "USD 199",
    priceCurrency: "USD",
    rating: 4.8,
    reviewCount: 642,
    operatorName: "Desert Adventures Red Jeep Tours",
    highlights: [
      "Travel in an open-air Hummer through Joshua Tree National Park terrain",
      "Stop at geologic landmarks and panoramic viewpoints",
      "Guide commentary on desert ecology and regional history",
    ],
    included: ["Professional guide", "Bottled water"],
    meetingPointDescription:
      "Departure and return details are confirmed on the Viator booking page after checkout.",
    duration: "3 hours",
    latitude: 33.7226,
    longitude: -116.3745,
  },
  "2335P1": {
    sourceUrl:
      "https://www.viator.com/tours/Palm-Springs/San-Andreas-Fault-Jeep-Tour-from-Palm-Springs/d648-2335P1?pid=P00058975&uid=U00174482&mcid=58086&currency=USD",
    productCode: "2335P1",
    title: "San Andreas Fault Jeep Tour from Palm Springs",
    supplierImage: "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa",
    priceFrom: "USD 175",
    rating: 4.5,
    reviewCount: 117,
    highlights: [
      "Open-air Jeep ride through the San Andreas Fault zone",
      "Guide-led geology interpretation at key viewpoints",
      "Stops near desert washes and fan-palm oasis habitat",
    ],
    included: [
      "Professional guide",
      "Guided Jeep transportation",
      "Interpretive geology commentary",
    ],
    notIncluded: [
      "Guide gratuities",
      "Hotel pickup and drop-off unless selected",
    ],
    duration: "3 hours",
  },
};
