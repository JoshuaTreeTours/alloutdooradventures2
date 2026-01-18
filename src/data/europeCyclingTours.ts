import { normalizeFareharborUrl } from "../lib/fareharbor";
import { slugify } from "./tourCatalog";
import type { Tour } from "./tours.types";

const buildTourSlug = (title: string, id: string) =>
  slugify(`${title}-${id}`);
const normalizeBookingUrl = (url: string) => normalizeFareharborUrl(url) ?? url;

export const europeCyclingTours: Tour[] = [
  {
    id: "copenhagenbikes-553857",
    slug: buildTourSlug("Spanish Private Tour", "553857"),
    title: "Spanish Private Tour",
    operator: "Tropical Bikes",
    categories: ["cycling"],
    primaryCategory: "cycling",
    tags: [
      "Bike Rental",
      "Bike Tour",
      "Guided Tour",
      "Private",
      "Sightseeing Tour",
    ],
    destination: {
      state: "Denmark",
      stateSlug: "denmark",
      city: "København",
      citySlug: slugify("København"),
    },
    heroImage: "https://cdn.filestackcontent.com/JZKT0KsQnyQI013znvNg",
    galleryImages: ["https://cdn.filestackcontent.com/JZKT0KsQnyQI013znvNg"],
    badges: {
      tagline: "Bike Tour",
    },
    tagPills: [
      "Bike Rental",
      "Bike Tour",
      "Guided Tour",
      "Private",
      "Sightseeing Tour",
    ],
    activitySlugs: ["cycling"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/copenhagenbikes/items/553857/?asn=fhdn-dkk&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/copenhagenbikes/items/553857/?asn=fhdn-dkk&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    longDescription:
      "Spanish Private Tour is a guided cycling experience in København, Denmark that follows bike-friendly lanes and local highlights for an easy, personalized ride.",
  },
  {
    id: "mikesbiketoursamsterdam-689900",
    slug: buildTourSlug("Amsterdam Essentials Bike Tour", "689900"),
    title: "Amsterdam Essentials Bike Tour",
    operator: "Mike's Bike Tours Amsterdam",
    categories: ["cycling"],
    primaryCategory: "cycling",
    tags: [
      "Attraction",
      "Bike Rental",
      "Bike Tour",
      "City Tour",
      "E-Bike",
      "Guided Tour",
      "History Tour",
      "Other",
      "Photography Tour",
      "Sightseeing Tour",
    ],
    destination: {
      state: "Netherlands",
      stateSlug: "netherlands",
      city: "Amsterdam",
      citySlug: "amsterdam",
    },
    heroImage: "https://cdn.filestackcontent.com/T1TodpmpTCiFVE5YccgS",
    galleryImages: ["https://cdn.filestackcontent.com/T1TodpmpTCiFVE5YccgS"],
    badges: {
      tagline: "Bike Tour",
    },
    tagPills: [
      "Bike Rental",
      "Bike Tour",
      "City Tour",
      "E-Bike",
      "Guided Tour",
    ],
    activitySlugs: ["cycling"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/mikesbiketoursamsterdam/items/689900/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/mikesbiketoursamsterdam/items/689900/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    longDescription:
      "Amsterdam Essentials Bike Tour is a guided ride through Amsterdam, Netherlands featuring canal-side neighborhoods, historic districts, and easy-to-follow cycling paths.",
  },
  {
    id: "valenciabikes-197884",
    slug: buildTourSlug("Valencia Bike Tour in DUTCH", "197884"),
    title: "Valencia Bike Tour in DUTCH",
    operator: "Valencia Bikes",
    categories: ["cycling"],
    primaryCategory: "cycling",
    tags: ["Attraction", "Bike Tour", "City Tour"],
    destination: {
      state: "Spain",
      stateSlug: "spain",
      city: "Valencia",
      citySlug: "valencia",
    },
    heroImage: "https://cdn.filestackcontent.com/6xRmregTyWUcPOev23zl",
    galleryImages: ["https://cdn.filestackcontent.com/6xRmregTyWUcPOev23zl"],
    badges: {
      tagline: "Bike Tour",
    },
    tagPills: ["Bike Tour", "City Tour"],
    activitySlugs: ["cycling"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/valenciabikes/items/197884/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/valenciabikes/items/197884/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    longDescription:
      "Valencia Bike Tour in DUTCH offers a relaxed cycling loop through Valencia, Spain with local storytelling and scenic city parks.",
  },
  {
    id: "citybike-218862",
    slug: buildTourSlug("Welcome to Tallinn Bike Tour", "218862"),
    title: "Welcome to Tallinn Bike Tour",
    operator: "City Bike",
    categories: ["cycling"],
    primaryCategory: "cycling",
    tags: ["Bike Tour"],
    destination: {
      state: "Estonia",
      stateSlug: "estonia",
      city: "Tallinn",
      citySlug: "tallinn",
    },
    heroImage: "https://cdn.filestackcontent.com/JC2FaOPSW2CIGQAbhwIo",
    galleryImages: ["https://cdn.filestackcontent.com/JC2FaOPSW2CIGQAbhwIo"],
    badges: {
      tagline: "Bike Tour",
    },
    tagPills: ["Bike Tour"],
    activitySlugs: ["cycling"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/citybike/items/218862/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/citybike/items/218862/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    longDescription:
      "Welcome to Tallinn Bike Tour is a guided cycling outing in Tallinn, Estonia that highlights the old town, seaside paths, and local neighborhoods.",
  },
  {
    id: "golocalsansebastian-183031",
    slug: buildTourSlug("Classic E-Bike Tour (Tour in English)", "183031"),
    title: "Classic E-Bike Tour (Tour in English)",
    operator: "Go Local San Sebastián",
    categories: ["cycling"],
    primaryCategory: "cycling",
    tags: ["Bike Rental", "Bike Tour", "E-Bike", "Guided Tour"],
    destination: {
      state: "Spain",
      stateSlug: "spain",
      city: "Donostia",
      citySlug: "donostia",
    },
    heroImage: "https://cdn.filestackcontent.com/smCcFhbhR9Cf4DPT7OhF",
    galleryImages: ["https://cdn.filestackcontent.com/smCcFhbhR9Cf4DPT7OhF"],
    badges: {
      tagline: "E-Bike Tour",
    },
    tagPills: ["Bike Tour", "E-Bike", "Guided Tour"],
    activitySlugs: ["cycling"],
    bookingProvider: "fareharbor",
    bookingUrl:
      "https://fareharbor.com/embeds/book/golocalsansebastian/items/183031/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    bookingWidgetUrl:
      "https://fareharbor.com/embeds/calendar/golocalsansebastian/items/183031/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    longDescription:
      "Classic E-Bike Tour (Tour in English) is a guided ride around Donostia, Spain featuring beachfront routes and cultural landmarks with the ease of e-bikes.",
  },
  {
    id: "hollandbikestoursandrentalsparis-539390",
    slug: buildTourSlug("Lyon Highlights Tour", "539390"),
    title: "Lyon Highlights Tour",
    operator: "Holland Bikes Tours and Rentals",
    categories: ["cycling"],
    primaryCategory: "cycling",
    tags: ["Bike Tour"],
    destination: {
      state: "France",
      stateSlug: "france",
      city: "Lyon",
      citySlug: "lyon",
    },
    heroImage: "https://cdn.filestackcontent.com/QH3hKtgQkmDEgwrSJNFy",
    galleryImages: ["https://cdn.filestackcontent.com/QH3hKtgQkmDEgwrSJNFy"],
    badges: {
      tagline: "Bike Tour",
    },
    tagPills: ["Bike Tour"],
    activitySlugs: ["cycling"],
    bookingProvider: "fareharbor",
    bookingUrl: normalizeBookingUrl(
      "https://fareharbor.com/embeds/book/hollandbikestoursandrentalsparis/items/539390/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    ),
    bookingWidgetUrl: normalizeBookingUrl(
      "https://fareharbor.com/embeds/calendar/hollandbikestoursandrentalsparis/items/539390/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    ),
    longDescription:
      "Lyon Highlights Tour is a guided ride through Lyon, France that combines riverside paths, historic squares, and the city’s culinary landmarks.",
  },
  {
    id: "cognac-tasting-tour-592787",
    slug: buildTourSlug(
      "Balade VAE guidée dans le vignoble de Cognac - Demi-journée",
      "592787",
    ),
    title: "Balade VAE guidée dans le vignoble de Cognac - Demi-journée",
    operator: "Cognac Tasting Tour",
    categories: ["cycling"],
    primaryCategory: "cycling",
    tags: ["Bike Tour"],
    destination: {
      state: "France",
      stateSlug: "france",
      city: "Saint-Preuil",
      citySlug: slugify("Saint-Preuil"),
    },
    heroImage: "https://cdn.filestackcontent.com/w1w2i3ZbQZiSRMbHVNFB",
    galleryImages: ["https://cdn.filestackcontent.com/w1w2i3ZbQZiSRMbHVNFB"],
    badges: {
      tagline: "Bike Tour",
    },
    tagPills: ["Bike Tour"],
    activitySlugs: ["cycling"],
    bookingProvider: "fareharbor",
    bookingUrl: normalizeBookingUrl(
      "https://fareharbor.com/embeds/book/cognac-tasting-tour/items/592787/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    ),
    bookingWidgetUrl: normalizeBookingUrl(
      "https://fareharbor.com/embeds/calendar/cognac-tasting-tour/items/592787/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    ),
    longDescription:
      "Balade VAE guidée dans le vignoble de Cognac - Demi-journée pairs scenic vineyard lanes near Saint-Preuil with a relaxed electric bike pace.",
  },
  {
    id: "nicecitytour-223953",
    slug: buildTourSlug("Le French Riviera Tour - 45 min. - 16 monuments", "223953"),
    title: "Le French Riviera Tour - 45 min. - 16 monuments",
    operator: "Happymoov Nice Vélotaxis",
    categories: ["cycling"],
    primaryCategory: "cycling",
    tags: ["Bike Tour"],
    destination: {
      state: "France",
      stateSlug: "france",
      city: "Nice",
      citySlug: "nice",
    },
    heroImage: "https://cdn.filestackcontent.com/hH6TcqrfT5WLXs6NQDSo",
    galleryImages: ["https://cdn.filestackcontent.com/hH6TcqrfT5WLXs6NQDSo"],
    badges: {
      tagline: "Bike Tour",
    },
    tagPills: ["Bike Tour"],
    activitySlugs: ["cycling"],
    bookingProvider: "fareharbor",
    bookingUrl: normalizeBookingUrl(
      "https://fareharbor.com/embeds/book/nicecitytour/items/223953/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    ),
    bookingWidgetUrl: normalizeBookingUrl(
      "https://fareharbor.com/embeds/calendar/nicecitytour/items/223953/?asn=fhdn-eur&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no",
    ),
    longDescription:
      "Le French Riviera Tour - 45 min. - 16 monuments is a quick, guided ride around Nice, France highlighting seaside promenades and landmark stops.",
  },
];
