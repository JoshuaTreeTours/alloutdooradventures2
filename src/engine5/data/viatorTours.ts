import type { Engine5ViatorApiTour, Engine5ViatorTourRecord } from "../types";

export const engine5ViatorTours: readonly Engine5ViatorTourRecord[] = [
  {
    engine: "engine5",
    bookingProvider: "viator",
    productCode: "335698P13",
    slug: "rock-scrambling-adventures-in-joshua-tree-national-park-335698p13",
    bookingUrl:
      "https://www.viator.com/tours/Palm-Springs/Rock-Scrambling-Adventures-in-Joshua-Tree-National-Park/d648-335698P13?pid=P00290915&mcid=42383&medium=link",
    sourceUrl:
      "https://www.viator.com/tours/Palm-Springs/Rock-Scrambling-Adventures-in-Joshua-Tree-National-Park/d648-335698P13",
    destination: {
      country: "United States",
      state: "California",
      stateSlug: "california",
      city: "Joshua Tree",
      citySlug: "joshua-tree",
    },
  },
];

export const engine5ViatorApiFallbackByProductCode: Record<
  string,
  Engine5ViatorApiTour
> = {
  "335698P13": {
    productCode: "335698P13",
    title: "Rock Scrambling Adventures in Joshua Tree National Park",
    sourceUrl:
      "https://www.viator.com/tours/Palm-Springs/Rock-Scrambling-Adventures-in-Joshua-Tree-National-Park/d648-335698P13",
    fromPrice: "$199.00",
    priceCurrency: "USD",
    rating: 5,
    reviewCount: 26,
    duration: "6 hours",
    startTime: "8:00 AM",
    meetingPoint: "California Welcome Center, 660 Palm Canyon Dr, Palm Springs, CA 92264, USA",
    cancellationPolicy: "Free cancellation up to 24 hours before the experience starts (local time).",
    highlights: [
      "Scramble over granite formations with a guide in Joshua Tree National Park",
      "Learn efficient movement and route choices for desert rock terrain",
      "Small-group format keeps instruction personal and pace adaptable",
      "Great fit for active travelers who want more than a scenic drive",
    ],
    inclusions: [
      "Professional local guide",
      "National park entry fees",
      "Snacks and bottled water",
    ],
    exclusions: ["Guide gratuities", "Hotel pickup and drop-off"],
    additionalInfo: [
      "This is an active outdoor adventure and requires sure-footed movement on uneven surfaces.",
      "Wear closed-toe shoes with grip and bring sun protection for exposed terrain.",
      "Not recommended for travelers with serious mobility limitations.",
    ],
    faqs: [
      {
        question: "Do I need prior climbing experience?",
        answer:
          "No technical climbing background is required, but participants should be comfortable with moderate physical activity and stepping over rocks.",
      },
      {
        question: "What is the pace like?",
        answer:
          "Guides set a steady, instruction-focused pace with rest points while adapting route choices to current group ability.",
      },
    ],
    itinerary: [
      {
        title: "Meet in Palm Springs",
        description:
          "Meet your guide and group, review the day plan, and travel toward Joshua Tree.",
      },
      {
        title: "Joshua Tree scrambling segments",
        description:
          "Practice movement, route selection, and confidence-building scrambling on guided granite routes.",
        duration: "4 hours",
      },
      {
        title: "Wrap-up and return",
        description:
          "Debrief the day, hydrate, and return to the original meeting point.",
      },
    ],
    whatToExpect:
      "Expect a skills-focused day that mixes short hikes with repeated scrambling sections where your guide coaches movement, pacing, and terrain awareness.",
    overview:
      "Trade a standard sightseeing loop for a hands-on desert adventure in Joshua Tree National Park. This guided rock scrambling tour is built for active travelers who want to move through the landscape instead of just photographing it from turnouts. You’ll navigate granite features, learn practical movement techniques, and get route guidance designed to build confidence on uneven terrain. The outing blends instructional pacing with real trail-and-rock effort, so you can expect a physical but approachable challenge for fit beginners and experienced hikers alike. Along the way, your guide shares context on Joshua Tree’s distinctive geology and outdoor culture, helping each section feel connected to the park’s character. With small-group support, steady coaching, and frequent time on the stone, this experience stands out as a more immersive way to explore the high desert.",
    sourceDerivedImageUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1400&h=1000&s=1",
    fallbackImageUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1400&h=1000&s=1",
    primaryImageUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/11/99/80/42/api-gallery.jpg?w=1100&h=800&s=1",
    sourceCode: `
      <html>
        <head>
          <meta property="og:image" content="https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1400&h=1000&s=1" />
        </head>
        <body>
          <img src="https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1400&h=1000&s=1" alt="Rock scrambling in Joshua Tree" />
        </body>
      </html>
    `,
  },
};
