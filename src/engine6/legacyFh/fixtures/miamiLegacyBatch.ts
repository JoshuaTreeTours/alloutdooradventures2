import { extractLegacyFhProductRecord } from "../extractor";

type MiamiLegacySeed = {
  slug: string;
  canonicalPath: string;
  bookingPath: string;
  title: string;
  operator: string | null;
  heroImageUrl: string;
  galleryImages: string[];
  overview: string;
  highlight: string;
  startingPrice: number | null;
  rating: number | null;
  reviewCount: number | null;
  duration: string | null;
};

const miamiLegacySeeds: MiamiLegacySeed[] = [
  {
    slug: "social-wynwood-instatour-59157",
    title: "Social Wynwood InstaTour",
    operator: "Cycle Party MIA",
    heroImageUrl: "https://cdn.filestackcontent.com/KPnF2fiuRLGICNUvNsBh",
    galleryImages: [
      "https://cdn.filestackcontent.com/KPnF2fiuRLGICNUvNsBh",
      "https://cdn.filestackcontent.com/KPnF2fiuRLGICNUvNsBh",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/social-wynwood-instatour-59157",
    bookingPath:
      "/destinations/florida/miami/tours/social-wynwood-instatour-59157/book",
    overview:
      "Social Wynwood InstaTour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Social Wynwood InstaTour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.4,
    reviewCount: 0,
    duration: null,
  },
  {
    slug: "miami-downtown-private-airplane-tour-371933",
    title: "Miami Downtown Private Airplane Tour",
    operator: "Sky Tours Miami",
    heroImageUrl: "https://cdn.filestackcontent.com/0DSwzrjqRkyXiQSydi6v",
    galleryImages: [
      "https://cdn.filestackcontent.com/0DSwzrjqRkyXiQSydi6v",
      "https://cdn.filestackcontent.com/0DSwzrjqRkyXiQSydi6v",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/miami-downtown-private-airplane-tour-371933",
    bookingPath:
      "/destinations/florida/miami/tours/miami-downtown-private-airplane-tour-371933/book",
    overview:
      "Miami Downtown Private Airplane Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Miami Downtown Private Airplane Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 5,
    reviewCount: 2219,
    duration: null,
  },
  {
    slug: "1-hour-atv-tour-498688",
    title: "1 Hour ATV Tour",
    operator: "Miami ATV Rentals",
    heroImageUrl: "https://cdn.filestackcontent.com/vKvtxTbeRMeypdF1vZRW",
    galleryImages: [
      "https://cdn.filestackcontent.com/vKvtxTbeRMeypdF1vZRW",
      "https://cdn.filestackcontent.com/vKvtxTbeRMeypdF1vZRW",
    ],
    canonicalPath: "/destinations/florida/miami/tours/1-hour-atv-tour-498688",
    bookingPath:
      "/destinations/florida/miami/tours/1-hour-atv-tour-498688/book",
    overview:
      "1 Hour ATV Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "1 Hour ATV Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 5,
    reviewCount: 1698,
    duration: null,
  },
  {
    slug: "2-hour-atv-tour-669338",
    title: "2 Hour ATV Tour",
    operator: "Miami ATV Rentals",
    heroImageUrl: "https://cdn.filestackcontent.com/HZR6KYPYT5Cpcf91IQD3",
    galleryImages: [
      "https://cdn.filestackcontent.com/HZR6KYPYT5Cpcf91IQD3",
      "https://cdn.filestackcontent.com/HZR6KYPYT5Cpcf91IQD3",
    ],
    canonicalPath: "/destinations/florida/miami/tours/2-hour-atv-tour-669338",
    bookingPath:
      "/destinations/florida/miami/tours/2-hour-atv-tour-669338/book",
    overview:
      "2 Hour ATV Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "2 Hour ATV Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 5,
    reviewCount: 1620,
    duration: null,
  },
  {
    slug: "45-minutes-atv-tour-498695",
    title: "45 Minutes ATV Tour",
    operator: "Miami ATV Rentals",
    heroImageUrl: "https://cdn.filestackcontent.com/lJ8eapawT2shGkMVJNig",
    galleryImages: [
      "https://cdn.filestackcontent.com/lJ8eapawT2shGkMVJNig",
      "https://cdn.filestackcontent.com/lJ8eapawT2shGkMVJNig",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/45-minutes-atv-tour-498695",
    bookingPath:
      "/destinations/florida/miami/tours/45-minutes-atv-tour-498695/book",
    overview:
      "45 Minutes ATV Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "45 Minutes ATV Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 4.9,
    reviewCount: 1698,
    duration: null,
  },
  {
    slug: "atv-off-road-tours---by-brothers-family-park-564337",
    title: "ATV Off Road Tours - By Brothers Family Park",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/60EaGyvQly75CNAJYqQp",
    galleryImages: [
      "https://cdn.filestackcontent.com/60EaGyvQly75CNAJYqQp",
      "https://cdn.filestackcontent.com/60EaGyvQly75CNAJYqQp",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/atv-off-road-tours---by-brothers-family-park-564337",
    bookingPath:
      "/destinations/florida/miami/tours/atv-off-road-tours---by-brothers-family-park-564337/book",
    overview:
      "ATV Off Road Tours - By Brothers Family Park is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "ATV Off Road Tours - By Brothers Family Park is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 4,
    reviewCount: 2160,
    duration: null,
  },
  {
    slug: "epic-hotel-30-minute-boat-ride-1-hour-jet-ski-experience-445316",
    title: "EPIC HOTEL | 30 Minute Boat Ride + 1 Hour Jet Ski Experience",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/aB5wQZ3kQTWaw3VlCSBY",
    galleryImages: [
      "https://cdn.filestackcontent.com/aB5wQZ3kQTWaw3VlCSBY",
      "https://cdn.filestackcontent.com/aB5wQZ3kQTWaw3VlCSBY",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/epic-hotel-30-minute-boat-ride-1-hour-jet-ski-experience-445316",
    bookingPath:
      "/destinations/florida/miami/tours/epic-hotel-30-minute-boat-ride-1-hour-jet-ski-experience-445316/book",
    overview:
      "EPIC HOTEL | 30 Minute Boat Ride + 1 Hour Jet Ski Experience is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the...",
    highlight:
      "EPIC HOTEL | 30 Minute Boat Ride + 1 Hour Jet Ski Experience is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 3.9,
    reviewCount: 1440,
    duration: null,
  },
  {
    slug: "venitian-marina-30-minute-boat-ride-1-hour-jet-ski-experience-452361",
    title: "VENITIAN MARINA | 30 Minute Boat Ride + 1 Hour Jet Ski Experience",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/vHGlErbRSieyKeVHaAG5",
    galleryImages: [
      "https://cdn.filestackcontent.com/vHGlErbRSieyKeVHaAG5",
      "https://cdn.filestackcontent.com/vHGlErbRSieyKeVHaAG5",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/venitian-marina-30-minute-boat-ride-1-hour-jet-ski-experience-452361",
    bookingPath:
      "/destinations/florida/miami/tours/venitian-marina-30-minute-boat-ride-1-hour-jet-ski-experience-452361/book",
    overview:
      "VENITIAN MARINA | 30 Minute Boat Ride + 1 Hour Jet Ski Experience is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the...",
    highlight:
      "VENITIAN MARINA | 30 Minute Boat Ride + 1 Hour Jet Ski Experience is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 3.7,
    reviewCount: 1080,
    duration: null,
  },
  {
    slug: "jet-ski-island-fun-key-biscayne-fl-446034",
    title: "Jet Ski Island Fun | Key Biscayne, Fl",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/q3053LqsQjWzFL4oohvQ",
    galleryImages: [
      "https://cdn.filestackcontent.com/q3053LqsQjWzFL4oohvQ",
      "https://cdn.filestackcontent.com/q3053LqsQjWzFL4oohvQ",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/jet-ski-island-fun-key-biscayne-fl-446034",
    bookingPath:
      "/destinations/florida/miami/tours/jet-ski-island-fun-key-biscayne-fl-446034/book",
    overview:
      "Jet Ski Island Fun | Key Biscayne, Fl is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Jet Ski Island Fun | Key Biscayne, Fl is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 3.6,
    reviewCount: 1260,
    duration: null,
  },
  {
    slug: "dkr-marina-30-minute-boat-ride-1-hour-jet-ski-experience-445335",
    title: "DKR MARINA | 30 Minute Boat Ride + 1 Hour Jet Ski Experience",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/fWp4HizuQ8mdmCdhufgJ",
    galleryImages: [
      "https://cdn.filestackcontent.com/fWp4HizuQ8mdmCdhufgJ",
      "https://cdn.filestackcontent.com/fWp4HizuQ8mdmCdhufgJ",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/dkr-marina-30-minute-boat-ride-1-hour-jet-ski-experience-445335",
    bookingPath:
      "/destinations/florida/miami/tours/dkr-marina-30-minute-boat-ride-1-hour-jet-ski-experience-445335/book",
    overview:
      "DKR MARINA | 30 Minute Boat Ride + 1 Hour Jet Ski Experience is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the...",
    highlight:
      "DKR MARINA | 30 Minute Boat Ride + 1 Hour Jet Ski Experience is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 3.5,
    reviewCount: 1260,
    duration: null,
  },
  {
    slug: "2023-slingshot-rentals-509437",
    title: "2023 Slingshot Rentals",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/CRjPnsKMQwcDwATTBcUS",
    galleryImages: [
      "https://cdn.filestackcontent.com/CRjPnsKMQwcDwATTBcUS",
      "https://cdn.filestackcontent.com/CRjPnsKMQwcDwATTBcUS",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/2023-slingshot-rentals-509437",
    bookingPath:
      "/destinations/florida/miami/tours/2023-slingshot-rentals-509437/book",
    overview:
      "2023 Slingshot Rentals is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "2023 Slingshot Rentals is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 3.2,
    reviewCount: 720,
    duration: null,
  },
  {
    slug: "bayside-marketplace-30-minute-boat-ride-1-hour-jet-ski-experience-609866",
    title:
      "BAYSIDE MARKETPLACE | 30 Minute Boat Ride + 1 Hour Jet Ski Experience",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/FFOlssWQHGZHMyUz8LWl",
    galleryImages: [
      "https://cdn.filestackcontent.com/FFOlssWQHGZHMyUz8LWl",
      "https://cdn.filestackcontent.com/FFOlssWQHGZHMyUz8LWl",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/bayside-marketplace-30-minute-boat-ride-1-hour-jet-ski-experience-609866",
    bookingPath:
      "/destinations/florida/miami/tours/bayside-marketplace-30-minute-boat-ride-1-hour-jet-ski-experience-609866/book",
    overview:
      "BAYSIDE MARKETPLACE | 30 Minute Boat Ride + 1 Hour Jet Ski Experience is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on...",
    highlight:
      "BAYSIDE MARKETPLACE | 30 Minute Boat Ride + 1 Hour Jet Ski Experience is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 3.1,
    reviewCount: 1260,
    duration: null,
  },
  {
    slug: "flybridge-impulsive-46-450383",
    title: "Flybridge Impulsive 46'",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/Y2rH1b5lSJuTFfvC0NLw",
    galleryImages: [
      "https://cdn.filestackcontent.com/Y2rH1b5lSJuTFfvC0NLw",
      "https://cdn.filestackcontent.com/Y2rH1b5lSJuTFfvC0NLw",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/flybridge-impulsive-46-450383",
    bookingPath:
      "/destinations/florida/miami/tours/flybridge-impulsive-46-450383/book",
    overview:
      "Flybridge Impulsive 46' is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Flybridge Impulsive 46' is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 3.1,
    reviewCount: 540,
    duration: null,
  },
  {
    slug: "bella-vita-cruiser-yacht-50-469503",
    title: "Bella Vita Cruiser Yacht 50\u2019",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/Yp46GZF0QySxp1tOjTj5",
    galleryImages: [
      "https://cdn.filestackcontent.com/Yp46GZF0QySxp1tOjTj5",
      "https://cdn.filestackcontent.com/Yp46GZF0QySxp1tOjTj5",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/bella-vita-cruiser-yacht-50-469503",
    bookingPath:
      "/destinations/florida/miami/tours/bella-vita-cruiser-yacht-50-469503/book",
    overview:
      "Bella Vita Cruiser Yacht 50\u2019 is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Bella Vita Cruiser Yacht 50\u2019 is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 3,
    reviewCount: 0,
    duration: null,
  },
  {
    slug: "searay-sundecker-27-469657",
    title: "SeaRay Sundecker 27\u2019",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/97GgWakRRqOVVestUsXN",
    galleryImages: [
      "https://cdn.filestackcontent.com/97GgWakRRqOVVestUsXN",
      "https://cdn.filestackcontent.com/97GgWakRRqOVVestUsXN",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/searay-sundecker-27-469657",
    bookingPath:
      "/destinations/florida/miami/tours/searay-sundecker-27-469657/book",
    overview:
      "SeaRay Sundecker 27\u2019 is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "SeaRay Sundecker 27\u2019 is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 3,
    reviewCount: 180,
    duration: null,
  },
  {
    slug: "parasailing-miami-water-sports-534390",
    title: "Parasailing | Miami Water Sports",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/ji8PdkmaTceGOuamWxF1",
    galleryImages: [
      "https://cdn.filestackcontent.com/ji8PdkmaTceGOuamWxF1",
      "https://cdn.filestackcontent.com/ji8PdkmaTceGOuamWxF1",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/parasailing-miami-water-sports-534390",
    bookingPath:
      "/destinations/florida/miami/tours/parasailing-miami-water-sports-534390/book",
    overview:
      "Parasailing | Miami Water Sports is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Parasailing | Miami Water Sports is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 3,
    reviewCount: 1620,
    duration: null,
  },
  {
    slug: "searay-sundancer-55-575607",
    title: "Searay Sundancer 55'",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/F92ZdX5MR3qq5h3XM7FW",
    galleryImages: [
      "https://cdn.filestackcontent.com/F92ZdX5MR3qq5h3XM7FW",
      "https://cdn.filestackcontent.com/F92ZdX5MR3qq5h3XM7FW",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/searay-sundancer-55-575607",
    bookingPath:
      "/destinations/florida/miami/tours/searay-sundancer-55-575607/book",
    overview:
      "Searay Sundancer 55' is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Searay Sundancer 55' is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 3,
    reviewCount: 0,
    duration: null,
  },
  {
    slug: "private-everglades-airboat-tour-660403",
    title: "Private Everglades Airboat Tour",
    operator: "South Florida Airboat Adventures",
    heroImageUrl: "https://cdn.filestackcontent.com/L9C5eBDQ4iXJQF7RgjfA",
    galleryImages: [
      "https://cdn.filestackcontent.com/L9C5eBDQ4iXJQF7RgjfA",
      "https://cdn.filestackcontent.com/L9C5eBDQ4iXJQF7RgjfA",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/private-everglades-airboat-tour-660403",
    bookingPath:
      "/destinations/florida/miami/tours/private-everglades-airboat-tour-660403/book",
    overview:
      "Private Everglades Airboat Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Private Everglades Airboat Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.8,
    reviewCount: 1799,
    duration: null,
  },
  {
    slug: "salt-cured-50-yacht-538569",
    title: "Salt Cured 50' Yacht",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/6OYeZODMTzK9RHY7iRbr",
    galleryImages: [
      "https://cdn.filestackcontent.com/6OYeZODMTzK9RHY7iRbr",
      "https://cdn.filestackcontent.com/6OYeZODMTzK9RHY7iRbr",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/salt-cured-50-yacht-538569",
    bookingPath:
      "/destinations/florida/miami/tours/salt-cured-50-yacht-538569/book",
    overview:
      "Salt Cured 50' Yacht is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Salt Cured 50' Yacht is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.6,
    reviewCount: 0,
    duration: null,
  },
  {
    slug: "3-hour-watersport-excursion-522090",
    title: "3 Hour WaterSport Excursion",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/vqOlAa2wRu2qyVZYhcNH",
    galleryImages: [
      "https://cdn.filestackcontent.com/vqOlAa2wRu2qyVZYhcNH",
      "https://cdn.filestackcontent.com/vqOlAa2wRu2qyVZYhcNH",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/3-hour-watersport-excursion-522090",
    bookingPath:
      "/destinations/florida/miami/tours/3-hour-watersport-excursion-522090/book",
    overview:
      "3 Hour WaterSport Excursion is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "3 Hour WaterSport Excursion is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.6,
    reviewCount: 0,
    duration: null,
  },
  {
    slug: "everglades-airboat-and-florida-alligator-show-tour-132331",
    title: "Everglades Airboat and Florida Alligator Show Tour",
    operator: "South Beach Welcome Center",
    heroImageUrl: "https://cdn.filestackcontent.com/WKQAWo7UTryARUKtiHrn",
    galleryImages: [
      "https://cdn.filestackcontent.com/WKQAWo7UTryARUKtiHrn",
      "https://cdn.filestackcontent.com/WKQAWo7UTryARUKtiHrn",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/everglades-airboat-and-florida-alligator-show-tour-132331",
    bookingPath:
      "/destinations/florida/miami/tours/everglades-airboat-and-florida-alligator-show-tour-132331/book",
    overview:
      "Everglades Airboat and Florida Alligator Show Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Everglades Airboat and Florida Alligator Show Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.5,
    reviewCount: 360,
    duration: null,
  },
  {
    slug: "atv-miami---adrenaline-atv-tours-623313",
    title: "ATV MIAMI - Adrenaline ATV Tours",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/8N7T8HsPSRyq6isH2UfP",
    galleryImages: [
      "https://cdn.filestackcontent.com/8N7T8HsPSRyq6isH2UfP",
      "https://cdn.filestackcontent.com/8N7T8HsPSRyq6isH2UfP",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/atv-miami---adrenaline-atv-tours-623313",
    bookingPath:
      "/destinations/florida/miami/tours/atv-miami---adrenaline-atv-tours-623313/book",
    overview:
      "ATV MIAMI - Adrenaline ATV Tours is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "ATV MIAMI - Adrenaline ATV Tours is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.5,
    reviewCount: 1620,
    duration: null,
  },
  {
    slug: "jet-ski-rentals-miami-watersports-532517",
    title: "Jet Ski Rentals | Miami WaterSports",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/kuY6iXnTbFzacy1ca0ew",
    galleryImages: [
      "https://cdn.filestackcontent.com/kuY6iXnTbFzacy1ca0ew",
      "https://cdn.filestackcontent.com/kuY6iXnTbFzacy1ca0ew",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/jet-ski-rentals-miami-watersports-532517",
    bookingPath:
      "/destinations/florida/miami/tours/jet-ski-rentals-miami-watersports-532517/book",
    overview:
      "Jet Ski Rentals | Miami WaterSports is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Jet Ski Rentals | Miami WaterSports is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.4,
    reviewCount: 1260,
    duration: null,
  },
  {
    slug: "atv-off-road-tours---farmhouse-miami-544433",
    title: "ATV OFF Road Tours - Farmhouse Miami",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/HZ8FLgj7T0O5dPuUlKGJ",
    galleryImages: [
      "https://cdn.filestackcontent.com/HZ8FLgj7T0O5dPuUlKGJ",
      "https://cdn.filestackcontent.com/HZ8FLgj7T0O5dPuUlKGJ",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/atv-off-road-tours---farmhouse-miami-544433",
    bookingPath:
      "/destinations/florida/miami/tours/atv-off-road-tours---farmhouse-miami-544433/book",
    overview:
      "ATV OFF Road Tours - Farmhouse Miami is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "ATV OFF Road Tours - Farmhouse Miami is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.4,
    reviewCount: 1260,
    duration: null,
  },
  {
    slug: "ferreti-destiny-85-ft-597414",
    title: "Ferreti Destiny 85 ft",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/s9jGfokfThuMj5cPlxFQ",
    galleryImages: [
      "https://cdn.filestackcontent.com/s9jGfokfThuMj5cPlxFQ",
      "https://cdn.filestackcontent.com/s9jGfokfThuMj5cPlxFQ",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/ferreti-destiny-85-ft-597414",
    bookingPath:
      "/destinations/florida/miami/tours/ferreti-destiny-85-ft-597414/book",
    overview:
      "Ferreti Destiny 85 ft is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Ferreti Destiny 85 ft is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.3,
    reviewCount: 0,
    duration: null,
  },
  {
    slug: "harmony-45-455028",
    title: "Harmony 45'",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/8kTjCwDS5eIuDEn6nNrw",
    galleryImages: [
      "https://cdn.filestackcontent.com/8kTjCwDS5eIuDEn6nNrw",
      "https://cdn.filestackcontent.com/8kTjCwDS5eIuDEn6nNrw",
    ],
    canonicalPath: "/destinations/florida/miami/tours/harmony-45-455028",
    bookingPath: "/destinations/florida/miami/tours/harmony-45-455028/book",
    overview:
      "Harmony 45' is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Harmony 45' is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.2,
    reviewCount: 0,
    duration: null,
  },
  {
    slug: "nightime-python-road-hunt-660368",
    title: "Nightime Python Road Hunt",
    operator: "South Florida Airboat Adventures",
    heroImageUrl: "https://cdn.filestackcontent.com/eD1QWTMYTIeokra7lAOQ",
    galleryImages: [
      "https://cdn.filestackcontent.com/eD1QWTMYTIeokra7lAOQ",
      "https://cdn.filestackcontent.com/eD1QWTMYTIeokra7lAOQ",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/nightime-python-road-hunt-660368",
    bookingPath:
      "/destinations/florida/miami/tours/nightime-python-road-hunt-660368/book",
    overview:
      "Nightime Python Road Hunt is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Nightime Python Road Hunt is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.2,
    reviewCount: 2161,
    duration: null,
  },
  {
    slug: "sunrise-private-airboat-tour-660426",
    title: "Sunrise Private Airboat Tour",
    operator: "South Florida Airboat Adventures",
    heroImageUrl: "https://cdn.filestackcontent.com/UbYlFMrSIKfM2pgy6VDA",
    galleryImages: [
      "https://cdn.filestackcontent.com/UbYlFMrSIKfM2pgy6VDA",
      "https://cdn.filestackcontent.com/UbYlFMrSIKfM2pgy6VDA",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/sunrise-private-airboat-tour-660426",
    bookingPath:
      "/destinations/florida/miami/tours/sunrise-private-airboat-tour-660426/book",
    overview:
      "Sunrise Private Airboat Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Sunrise Private Airboat Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.2,
    reviewCount: 540,
    duration: null,
  },
  {
    slug: "sunset-private-airboat-tour-660427",
    title: "Sunset Private Airboat Tour",
    operator: "South Florida Airboat Adventures",
    heroImageUrl: "https://cdn.filestackcontent.com/t3nAf8CGSYu1ZfKeoYIw",
    galleryImages: [
      "https://cdn.filestackcontent.com/t3nAf8CGSYu1ZfKeoYIw",
      "https://cdn.filestackcontent.com/t3nAf8CGSYu1ZfKeoYIw",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/sunset-private-airboat-tour-660427",
    bookingPath:
      "/destinations/florida/miami/tours/sunset-private-airboat-tour-660427/book",
    overview:
      "Sunset Private Airboat Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Sunset Private Airboat Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.2,
    reviewCount: 1080,
    duration: null,
  },
  {
    slug: "nighttime-private-airboat-tour-660430",
    title: "Nighttime Private Airboat Tour",
    operator: "South Florida Airboat Adventures",
    heroImageUrl: "https://cdn.filestackcontent.com/yHDCca7RFaAs8zcWkDa4",
    galleryImages: [
      "https://cdn.filestackcontent.com/yHDCca7RFaAs8zcWkDa4",
      "https://cdn.filestackcontent.com/yHDCca7RFaAs8zcWkDa4",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/nighttime-private-airboat-tour-660430",
    bookingPath:
      "/destinations/florida/miami/tours/nighttime-private-airboat-tour-660430/book",
    overview:
      "Nighttime Private Airboat Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "Nighttime Private Airboat Tour is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.2,
    reviewCount: 2521,
    duration: null,
  },
  {
    slug: "susi-55ft-yacht-458061",
    title: "SUSI 55FT YACHT",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/RuJjS0vaRlSK1raUGYTe",
    galleryImages: [
      "https://cdn.filestackcontent.com/RuJjS0vaRlSK1raUGYTe",
      "https://cdn.filestackcontent.com/RuJjS0vaRlSK1raUGYTe",
    ],
    canonicalPath: "/destinations/florida/miami/tours/susi-55ft-yacht-458061",
    bookingPath:
      "/destinations/florida/miami/tours/susi-55ft-yacht-458061/book",
    overview:
      "SUSI 55FT YACHT is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "SUSI 55FT YACHT is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2.1,
    reviewCount: 0,
    duration: null,
  },
  {
    slug: "1-hour-jetski-delivery-445321",
    title: "1 Hour Jetski Delivery",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/UjIhC7BwSJCCY2LI4QOU",
    galleryImages: [
      "https://cdn.filestackcontent.com/UjIhC7BwSJCCY2LI4QOU",
      "https://cdn.filestackcontent.com/UjIhC7BwSJCCY2LI4QOU",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/1-hour-jetski-delivery-445321",
    bookingPath:
      "/destinations/florida/miami/tours/1-hour-jetski-delivery-445321/book",
    overview:
      "1 Hour Jetski Delivery is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "1 Hour Jetski Delivery is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2,
    reviewCount: 1260,
    duration: null,
  },
  {
    slug: "3-hour-jetski-delivery-445326",
    title: "3 Hour Jetski Delivery",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/wcYgCXc7SlmEeDY8DGvV",
    galleryImages: [
      "https://cdn.filestackcontent.com/wcYgCXc7SlmEeDY8DGvV",
      "https://cdn.filestackcontent.com/wcYgCXc7SlmEeDY8DGvV",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/3-hour-jetski-delivery-445326",
    bookingPath:
      "/destinations/florida/miami/tours/3-hour-jetski-delivery-445326/book",
    overview:
      "3 Hour Jetski Delivery is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "3 Hour Jetski Delivery is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2,
    reviewCount: 900,
    duration: null,
  },
  {
    slug: "4-hour-jetski-delivery-445330",
    title: "4 Hour Jetski Delivery",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/I2NWoUoKSk2RKMNVMp5r",
    galleryImages: [
      "https://cdn.filestackcontent.com/I2NWoUoKSk2RKMNVMp5r",
      "https://cdn.filestackcontent.com/I2NWoUoKSk2RKMNVMp5r",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/4-hour-jetski-delivery-445330",
    bookingPath:
      "/destinations/florida/miami/tours/4-hour-jetski-delivery-445330/book",
    overview:
      "4 Hour Jetski Delivery is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "4 Hour Jetski Delivery is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2,
    reviewCount: 720,
    duration: null,
  },
  {
    slug: "5-hour-jetski-delivery-445332",
    title: "5 Hour Jetski Delivery",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/u1YoW61tTzaDSAkJS9jY",
    galleryImages: [
      "https://cdn.filestackcontent.com/u1YoW61tTzaDSAkJS9jY",
      "https://cdn.filestackcontent.com/u1YoW61tTzaDSAkJS9jY",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/5-hour-jetski-delivery-445332",
    bookingPath:
      "/destinations/florida/miami/tours/5-hour-jetski-delivery-445332/book",
    overview:
      "5 Hour Jetski Delivery is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "5 Hour Jetski Delivery is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2,
    reviewCount: 540,
    duration: null,
  },
  {
    slug: "all-day-jet-ski-rental-457752",
    title: "All Day Jet Ski Rental",
    operator: "Jetski Rentals of South Florida",
    heroImageUrl: "https://cdn.filestackcontent.com/3YO0e8s1SFmiLygaAe4G",
    galleryImages: [
      "https://cdn.filestackcontent.com/3YO0e8s1SFmiLygaAe4G",
      "https://cdn.filestackcontent.com/3YO0e8s1SFmiLygaAe4G",
    ],
    canonicalPath:
      "/destinations/florida/miami/tours/all-day-jet-ski-rental-457752",
    bookingPath:
      "/destinations/florida/miami/tours/all-day-jet-ski-rental-457752/book",
    overview:
      "All Day Jet Ski Rental is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center. Expect a steady pace, local context, and a comfortable rhythm that lets you focus on the landscape.",
    highlight:
      "All Day Jet Ski Rental is a guided outdoor experience based in Miami, Florida that keeps the logistics simple and the scenery front and center",
    startingPrice: null,
    rating: 2,
    reviewCount: 0,
    duration: null,
  },
] as MiamiLegacySeed[];

const buildPublicHtml = (seed: MiamiLegacySeed) => `
  <main>
    <meta property="og:image" content="${seed.heroImageUrl}" />
    <h1>${seed.title}</h1>
    <img src="${seed.heroImageUrl}" />
    ${seed.rating !== null ? `<div data-legacy="rating">${seed.rating}</div>` : ""}
    ${seed.reviewCount !== null ? `<div data-legacy="reviews">${seed.reviewCount} reviews</div>` : ""}
    <section data-legacy="overview">
      <p>${seed.overview}</p>
    </section>
    <section data-legacy="highlights">
      <ul>
        <li>${seed.highlight}</li>
      </ul>
    </section>
    ${seed.duration ? `<section data-legacy="duration"><p>${seed.duration}</p></section>` : ""}
  </main>
`;

const buildBookHtml = (seed: MiamiLegacySeed) => {
  const pricing =
    seed.startingPrice !== null
      ? `<section data-fh="pricing"><ul><li>Adult: $${seed.startingPrice.toFixed(0)}</li></ul></section>`
      : "";
  const operatorSentence = seed.operator
    ? `${seed.operator} operates this activity with a local team that coordinates check-in and day-of logistics in Miami.`
    : "Local operators coordinate check-in and day-of logistics for this activity in Miami.";
  const durationSentence = seed.duration
    ? `Typical timing is listed as ${seed.duration}, which helps set expectations for pacing and scheduling before arrival.`
    : "Scheduling details are confirmed during booking so travelers can match the activity window to the rest of their Miami plans.";
  const pricingSentence =
    seed.startingPrice !== null
      ? `Current visible booking pricing starts at $${seed.startingPrice.toFixed(0)}, and final totals depend on selected options and departure details.`
      : "Pricing options can vary by departure and date, so booking details should be reviewed before final confirmation.";
  return `<main>
    <section data-fh="overview">
      <p>${seed.overview}</p>
      <p>${operatorSentence} ${durationSentence} ${pricingSentence}</p>
    </section>
    ${pricing}
  </main>`;
};

export const miamiLegacyMigratedRecords = miamiLegacySeeds.map(seed =>
  extractLegacyFhProductRecord({
    slug: seed.slug,
    canonicalPath: seed.canonicalPath,
    bookingPath: seed.bookingPath,
    operator: seed.operator,
    publicHtml: buildPublicHtml(seed),
    bookingHtml: buildBookHtml(seed),
    fallback: {
      title: seed.title,
      heroImageUrl: seed.heroImageUrl,
      galleryImages: seed.galleryImages,
    },
  })
);

export const MIAMI_MIGRATION_SLUGS = miamiLegacySeeds.map(seed => seed.slug);
export const MIAMI_MIGRATION_SKIPPED: Array<{ slug: string; reason: string }> =
  [];
