import type { Engine4ViatorApiTour, Engine4ViatorTourRecord } from "../types";

export const engine4ViatorTours: readonly Engine4ViatorTourRecord[] = [
  {
    engine: "engine4",
    bookingProvider: "viator",
    productCode: "74828P3",
    bookingUrl:
      "https://www.viator.com/tours/Aspen/Glimpse-of-Aspen-Tour/d26395-74828P3?pid=P00290915&mcid=42383&medium=link",
    heroImage:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/74/7c/8d.jpg",
    destination: {
      country: "United States",
      state: "Colorado",
      stateSlug: "colorado",
      city: "Aspen",
      citySlug: "aspen",
    },
    slug: "glimpse-of-aspen-tour-74828p3",
  },
  {
    engine: "engine4",
    bookingProvider: "viator",
    productCode: "172188P151",
    bookingUrl:
      "https://www.viator.com/tours/Aspen/Private-Professional-photoshoot-in-Aspen/d26395-172188P151",
    heroImage:
      "https://dynamic-media.tacdn.com/media/photo-o/2e/d7/8f/5e/caption.jpg?w=1100&h=800&s=1",
    destination: {
      country: "United States",
      state: "Colorado",
      stateSlug: "colorado",
      city: "Aspen",
      citySlug: "aspen",
    },
    slug: "private-professional-photoshoot-in-aspen-172188p151",
  },
  {
    engine: "engine4",
    bookingProvider: "viator",
    productCode: "74828P5",
    bookingUrl:
      "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5?pid=P00290915&mcid=42383&medium=link",
    heroImage:
      "https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg",
    destination: {
      country: "United States",
      state: "Colorado",
      stateSlug: "colorado",
      city: "Aspen",
      citySlug: "aspen",
    },
    slug: "aspen-east-end-light-hike",
  },
  {
    engine: "engine4",
    bookingProvider: "viator",
    productCode: "74828P4",
    bookingUrl:
      "https://www.viator.com/tours/Aspen/Aspens-Off-the-Beaten-Path-Tour/d26395-74828P4?pid=P00290915&mcid=42383&medium=link",
    heroImage:
      "https://media.tacdn.com/media/attractions-splice-spp-360x240/06/74/7c/8f.jpg",
    destination: {
      country: "United States",
      state: "Colorado",
      stateSlug: "colorado",
      city: "Aspen",
      citySlug: "aspen",
    },
    slug: "aspens-off-the-beaten-path-tour-74828p4",
  },
  {
    engine: "engine4",
    bookingProvider: "viator",
    productCode: "63657P1",
    bookingUrl:
      "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
    heroImage:
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/e0/69/caption.jpg?w=1100&h=800&s=1",
    destination: {
      country: "USA",
      state: "California",
      stateSlug: "california",
      city: "Santa Barbara",
      citySlug: "santa-barbara",
    },
    slug: "santa-barbara-vineyard-to-table-taste-tour-by-bike-63657p1",
  },
  {
    engine: "engine4",
    bookingProvider: "viator",
    productCode: "41410P10",
    bookingUrl:
      "https://www.viator.com/tours/Denver/Small-group-tour-of-Pikes-Peak-and-the-Garden-of-the-Gods-from-Denver/d4837-41410P10?pid=P00290915&mcid=42383&medium=link",
    heroImage:
      "https://dynamic-media.tacdn.com/media/photo-o/2f/0c/fe/02/caption.jpg?w=1100&h=800&s=1",
    destination: {
      country: "United States",
      state: "Colorado",
      stateSlug: "colorado",
      city: "Colorado Springs",
      citySlug: "colorado-springs",
    },
    slug: "small-group-tour-of-pikes-peak-and-the-garden-of-the-gods-from-denver-41410p10",
  },
];

export const engine4ViatorApiFallbackByProductCode: Record<
  string,
  Engine4ViatorApiTour
> = {
  "172188P151": {
    productCode: "172188P151",
    title: "Private Professional Photoshoot in Aspen",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Private-Professional-photoshoot-in-Aspen/d26395-172188P151",
    fromPrice: "$299.00",
    priceCurrency: "USD",
    duration: "1 hour",
    cancellationPolicy: "Non-refundable.",
    sourceDerivedImageUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/2e/d7/8f/5e/caption.jpg?w=1100&h=800&s=1",
    description:
      "Capture your Aspen visit with a private session led by a professional photographer.",
    descriptionLong:
      "A private photoshoot experience in Aspen pairs guests with a professional photographer who guides posing, framing, and location choices while exploring the town’s scenic backdrops. The session moves through picturesque downtown streets and mountain viewpoints, creating polished portraits and candid images against Aspen’s alpine setting. Participants receive direction on composition and style throughout the experience. The relaxed format allows couples, families, or solo travelers to capture memorable moments while enjoying the atmosphere of one of Colorado’s most iconic mountain towns.",
    overview:
      "A private photoshoot experience in Aspen pairs guests with a professional photographer who guides posing, framing, and location choices while exploring the town’s scenic backdrops. The session moves through picturesque downtown streets and mountain viewpoints, creating polished portraits and candid images against Aspen’s alpine setting. Participants receive direction on composition and style throughout the experience. The relaxed format allows couples, families, or solo travelers to capture memorable moments while enjoying the atmosphere of one of Colorado’s most iconic mountain towns.",
    highlights: [
      "Professional photographer guiding poses and composition",
      "Walk through photogenic Aspen locations",
      "Portrait session in scenic alpine surroundings",
      "Ideal for couples, families, or solo travelers",
      "Digital photos delivered after the session",
    ],
  },
  "74828P3": {
    productCode: "74828P3",
    title: "Glimpse of Aspen Tour",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Glimpse-of-Aspen-Tour/d26395-74828P3",
    fromPrice: "$55.00",
    priceCurrency: "USD",
    rating: 4.8,
    reviewCount: 14,
    duration: "2 hours",
    meetingPoint: "320 E Hyman Ave, Aspen, CO 81611, USA",
    sourceDerivedImageUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/74/7c/8d.jpg",
    description:
      "Get oriented in Aspen with a guided walk through historic blocks and cultural landmarks.",
    descriptionLong:
      "This small-group introduction covers Aspen's downtown stories, architecture, and mountain-town culture with regular photo and interpretation stops.",
    itinerary: [
      {
        title: "Wheeler Opera House",
        description: "Historic theater and local gathering point.",
      },
      {
        title: "Aspen Art Museum",
        description: "Contemporary arts stop with city context.",
      },
      {
        title: "Koch Park",
        description: "Scenic park area with mountain views.",
      },
    ],
    whatToExpect:
      "Expect a relaxed pace with commentary about Aspen history, neighborhoods, and notable landmarks.",
    inclusions: ["Local guide", "Walking route through downtown Aspen"],
    additionalInfo: [
      "Wear comfortable walking shoes",
      "Bring water for warm days",
    ],
    cancellationPolicy: "Free cancellation up to 24 hours in advance.",
  },
  "74828P5": {
    productCode: "74828P5",
    title: "Aspen East End Light Hike",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5",
    fromPrice: "$65.00",
    priceCurrency: "USD",
    rating: 4.7,
    reviewCount: 3,
    duration: "2 hours",
    startTime: "8:15 AM",
    meetingPoint: "Wheeler Opera House, 320 E Hyman Ave, Aspen, CO 81611",
    cancellationPolicy: "Free cancellation up to 24 hours in advance.",
    sourceDerivedImageUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg",
    description:
      "Join a light guided hike through Aspen's East End to explore local trails and residential history.",
    descriptionLong:
      "The route blends mellow elevation, neighborhood context, and mountain scenery while keeping the pace beginner-friendly.",
    itinerary: [
      { title: "Wheeler Opera House", description: "Meet and route briefing." },
      {
        title: "Ute Trail Access",
        description: "Intro segment through Aspen's East End.",
      },
      {
        title: "Smuggler Mountain Viewpoint",
        description: "Panoramic valley overlook.",
      },
    ],
    whatToExpect:
      "Expect moderate walking on maintained paths with frequent stops for scenery and local storytelling.",
    inclusions: ["Professional guide", "Trail interpretation"],
    exclusions: ["Hotel pickup and drop-off"],
    additionalInfo: ["Wear trail shoes", "Bring a refillable water bottle"],
    overview:
      "Explore Aspen’s East End on a guided light hike designed for travelers who want a shorter, approachable outing. This experience runs for about 2 hours and departs at 8:15 AM, with meeting at Wheeler Opera House, 320 E Hyman Ave in Aspen. The route focuses on the East End area and is led by a guide, making it a straightforward way to get outside without committing to a full-day trek. At booking time, this tour is listed from $65.00 per person and currently shows a 4.7 rating based on 3 reviews. If your plans change, you can cancel up to 24 hours before the start time for a full refund under the listed cancellation terms.",
    highlights: [
      "Guided light-hike format in Aspen’s East End",
      "Approximate duration of 2 hours",
      "Scheduled start time at 8:15 AM",
      "Central meeting point at Wheeler Opera House",
      "From price listed at $65.00 per person",
      "Free cancellation up to 24 hours before start",
    ],
    faqs: [
      {
        question: "Where do we meet for the Aspen East End Light Hike?",
        answer:
          "The meeting point is Wheeler Opera House, 320 E Hyman Ave, Aspen, CO 81611.",
      },
      {
        question: "How long is the hike?",
        answer: "The experience duration is approximately 2 hours.",
      },
      {
        question: "What is the cancellation policy?",
        answer: "This tour offers free cancellation up to 24 hours in advance.",
      },
    ],
  },
  "74828P4": {
    productCode: "74828P4",
    title: "Aspen's Off the Beaten Path Tour",
    sourceUrl:
      "https://www.viator.com/tours/Aspen/Aspens-Off-the-Beaten-Path-Tour/d26395-74828P4",
    fromPrice: "$145.00",
    priceCurrency: "USD",
    rating: 5,
    reviewCount: 42,
    duration: "3 hours",
    cancellationPolicy: "Free cancellation up to 24 hours in advance.",
    sourceDerivedImageUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-360x240/06/74/7c/8f.jpg",
    description:
      "Discover quieter Aspen corners with a local guide and scenic neighborhood route.",
    descriptionLong:
      "This outing focuses on less-traveled viewpoints, local stories, and flexible pacing for travelers seeking deeper context.",
    itinerary: [
      {
        title: "Historic West End",
        description: "Victorian-era district and architecture.",
      },
      {
        title: "Rio Grande Trail Segment",
        description: "Riverside perspective and local history.",
      },
      {
        title: "Hallam Lake Area",
        description: "Nature-focused stop with interpretation.",
      },
    ],
    whatToExpect:
      "Expect a conversational, small-group format with stops in areas many visitors miss.",
    inclusions: ["Guide", "Local insights"],
    additionalInfo: ["Dress in layers for mountain weather"],
    overview:
      "Aspen's Off the Beaten Path Tour explores lesser-known corners of Aspen with a local guide and a small-group format. The experience is designed for travelers who want a flexible, half-day outing that balances local context with scenic viewpoints around town. Current listing details show this tour from $145.00 per person, with an average 5.0 rating based on 42 reviews and a duration of approximately 3 hours. The listing also indicates free cancellation up to 24 hours in advance.",
    highlights: [
      "Small-group guided format focused on quieter Aspen areas",
      "Approximate duration of 3 hours",
      "From price listed at $145.00 per person",
      "Current listing rating of 5.0 based on 42 reviews",
      "Free cancellation up to 24 hours before start",
    ],
    faqs: [
      {
        question: "How long is Aspen's Off the Beaten Path Tour?",
        answer: "The listed duration is approximately 3 hours.",
      },
      {
        question: "What does the current listing show for price?",
        answer: "The listing shows a from price of $145.00 per person.",
      },
      {
        question: "Is free cancellation available?",
        answer:
          "Yes. The listing indicates free cancellation up to 24 hours in advance.",
      },
    ],
  },
  "41410P10": {
    productCode: "41410P10",
    title:
      "Small Group Tour of Pikes Peak and the Garden of the Gods from Denver",
    sourceUrl:
      "https://www.viator.com/tours/Denver/Small-group-tour-of-Pikes-Peak-and-the-Garden-of-the-Gods-from-Denver/d4837-41410P10",
    fromPrice: "$179.00",
    priceCurrency: "USD",
    rating: 5,
    reviewCount: 131,
    duration: "8 hours",
    startTime: "8:00 AM",
    meetingPoint: "1747 Wynkoop St, Denver, CO 80202, USA",
    cancellationPolicy: "Free cancellation up to 24 hours in advance.",
    sourceDerivedImageUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/2f/0c/fe/02/caption.jpg?w=1100&h=800&s=1",
    description:
      "Travel from Denver to two Front Range icons with guided stops at Garden of the Gods and the summit area of Pikes Peak.",
    descriptionLong:
      "This small-group day trip heads from Denver into the Front Range for a full day of mountain scenery and geologic landmarks. At Garden of the Gods, the route winds through towering red-rock formations with time for short walks, photos, and stories about how the sandstone fins were formed. The tour then climbs toward Pikes Peak, where high-elevation overlooks and alpine views open across the surrounding ranges. Along the way, guests ride with a local guide who shares regional history, mountain ecology, and context about Colorado Springs and the Pike National Forest corridor.",
    itinerary: [
      {
        title: "Garden of the Gods",
        description:
          "Walk among dramatic red-rock formations with guided commentary and dedicated photo stops.",
      },
      {
        title: "Pikes Peak Highway",
        description:
          "Ascend through changing forest and alpine zones on the scenic climb toward the summit area.",
      },
      {
        title: "Pikes Peak Summit Area",
        description:
          "Take in panoramic mountain views and free time at one of Colorado's signature high-elevation viewpoints.",
      },
    ],
    whatToExpect:
      "Expect an early departure from Denver, mountain driving with regular scenic stops, and a mix of guided interpretation and free time at major viewpoints.",
    inclusions: [
      "Professional guide",
      "Round-trip transportation from Denver",
      "Bottled water",
      "Entry and toll fees along the Pikes Peak route",
    ],
    exclusions: ["Lunch", "Guide gratuities"],
    additionalInfo: [
      "Weather can change quickly at high elevation—dress in layers.",
      "Not recommended for travelers with severe altitude sensitivity.",
    ],
  },
  "63657P1": {
    productCode: "63657P1",
    title: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
    sourceUrl:
      "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
    sourceDerivedImageUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/e0/69/caption.jpg?w=1100&h=800&s=1",
    description:
      "Ride an e-bike through Santa Barbara to visit a local vineyard and enjoy a guided farm-to-table tasting experience.",
    overview:
      "This guided e-bike experience pairs Santa Barbara sightseeing with a vineyard-to-table tasting itinerary. Guests ride electric-assist bikes on a relaxed route, then visit a local vineyard for wine and olive-oil tastings tied to regional producers. The experience includes a picnic-style lunch and transportation support for the tasting segment, creating a practical option for travelers who want both activity and culinary context in one outing. Along the way, guides share background on the area’s food-and-wine culture while keeping the pace approachable for a wide range of riders.",
    highlights: [
      "Guided e-bike ride through Santa Barbara",
      "Vineyard visit with local wine tasting",
      "Olive-oil tasting included",
      "Picnic-style lunch included",
      "Transportation support included for tour logistics",
      "Electric-assist bikes provided for an easier ride",
      "Small-group format with guide commentary",
    ],
  },
};
