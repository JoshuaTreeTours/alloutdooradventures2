import type { Engine4ViatorApiTour, Engine4ViatorTourRecord } from "../types";

export const engine4ViatorTours: readonly Engine4ViatorTourRecord[] = [
  {
    engine: "engine4",
    bookingProvider: "viator",
    productCode: "76007P1",
    bookingUrl:
      "https://www.viator.com/tours/Denver/Best-of-Denver-Tour-and-City-Lights-Tour/d4837-76007P1?pid=P00290915&mcid=42383&medium=link",
    heroImage:
      "https://dynamic-media.tacdn.com/media/photo-o/2b/b9/77/8f/caption.jpg?w=1100&h=800&s=1",
    destination: {
      country: "United States",
      state: "Colorado",
      stateSlug: "colorado",
      city: "Denver",
      citySlug: "denver",
    },
    slug: "best-of-denver-tour-and-city-lights-tour-76007p1",
  },
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
];

export const engine4ViatorApiFallbackByProductCode: Record<
  string,
  Engine4ViatorApiTour
> = {
  "76007P1": {
    productCode: "76007P1",
    title: "Best of Denver Tour and City Lights Tour",
    sourceUrl:
      "https://www.viator.com/tours/Denver/Best-of-Denver-Tour-and-City-Lights-Tour/d4837-76007P1",
    sourceDerivedImageUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/2b/b9/77/8f/caption.jpg?w=1100&h=800&s=1",
    description:
      "See Denver highlights by day and skyline viewpoints after dark on a guided city tour.",
    descriptionLong:
      "This guided Denver experience combines a daytime highlights tour with an evening city-lights segment, covering major landmarks and neighborhoods while your guide shares local context and history. Expect multiple stops for photos and short walks, with time to take in skyline viewpoints after dark. The format is designed for visitors who want a broad introduction to the city in a single outing, with transportation between key sights and a structured route that balances orientation, scenery, and commentary.",
    overview:
      "This guided Denver experience combines a daytime highlights tour with an evening city-lights segment, covering major landmarks and neighborhoods while your guide shares local context and history. Expect multiple stops for photos and short walks, with time to take in skyline viewpoints after dark. The format is designed for visitors who want a broad introduction to the city in a single outing, with transportation between key sights and a structured route that balances orientation, scenery, and commentary.",
    highlights: [
      "Guided overview of Denver’s key neighborhoods and landmarks",
      "Photo stops and short walks at scenic points",
      "Evening city-lights segment with skyline views",
      "Narrated local history and context from your guide",
      "Efficient way to see a broad cross-section of Denver",
    ],
  },
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
};
