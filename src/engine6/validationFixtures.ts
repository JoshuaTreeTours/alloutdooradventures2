export type Engine6ValidationFixture = {
  productCode: string;
  publicUrl: string;
  rawPayload: Record<string, unknown>;
};

export const ENGINE6_VALIDATION_FIXTURES: Engine6ValidationFixture[] = [
  {
    productCode: "73781P4",
    publicUrl:
      "https://www.viator.com/tours/Las-Vegas/Red-Rock-Canyon-and-Seven-Magic-Mountains-Tour/d684-73781P4",
    rawPayload: {
      product: {
        productCode: "73781P4",
        productUrl:
          "https://www.viator.com/tours/Las-Vegas/Red-Rock-Canyon-and-Seven-Magic-Mountains-Tour/d684-73781P4",
        title:
          "Small Group Grand Canyon, Hoover Dam, 7 Magic Mountains VIP Tour",
        description: {
          text: "Experience the natural wonder of the Grand Canyon and the manmade marvel of Hoover Dam in one day with this small-group tour from Las Vegas. Make an early start to dodge the crowds and enjoy photo stops at the Welcome to Fabulous Las Vegas Sign and Seven Magic Mountains art installation on your way to Grand Canyon West. Enjoy an included walk across the Hoover Dam and upgrade to include a walk on the Grand Canyon Skywalk.",
        },
        location: { city: "Las Vegas", state: "Nevada" },
        priceFrom: "$189.99",
        reviews: { combinedAverageRating: 5, totalReviews: 3025 },
        media: {
          images: [
            {
              isCover: true,
              variants: {
                FULL: {
                  url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/74/c1/71.jpg",
                  width: 674,
                  height: 446,
                },
              },
            },
          ],
        },
        highlights: [
          "Incredible photo ops at Seven Magic Mountains and Hoover Dam",
          "Small-group day trip from Las Vegas with an early start to avoid crowds",
          "Walk across Hoover Dam and continue to Grand Canyon West",
          "Scenic desert viewpoints and included snacks throughout the day",
        ],
        logistics: {
          start: { description: "Pickup offered in Las Vegas." },
        },
        additionalInfo: [
          "Free cancellation up to 24 hours before the experience starts (local time)",
          "Reserve Now and Pay Later - Secure your spot while staying flexible",
        ],
      },
    },
  },
  {
    productCode: "63657P1",
    publicUrl:
      "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
    rawPayload: {
      product: {
        productCode: "63657P1",
        productUrl:
          "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
        title: "Santa Barbara Vineyard to Table Taste Tour by E-Bike",
        description: {
          text: "Ride through the towns and vineyards of the Santa Ynez Valley wine region on this e-bike tour with transport from Santa Barbara. With a guide, you'll pedal a Rad Power E-bike to wineries, a lavendar farm, the town of Solvang, and other spots for wine and olive-oil tastings and lunch. A bike tour allows you to enjoy better views of the scenery than from inside a car.",
        },
        location: { city: "Santa Barbara", state: "California" },
        priceFrom: "$199.00",
        reviews: { combinedAverageRating: 4.9, totalReviews: 177 },
        media: {
          images: [
            {
              isCover: true,
              variants: {
                FULL: {
                  url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/0f/56/92/6e.jpg",
                  width: 674,
                  height: 446,
                },
              },
            },
          ],
        },
        highlights: [
          "Bike and helmet provided for this tour through the Santa Ynez Valley wine region",
          "Stop for wine and olive-oil tastings and learn about lavendar oil production",
          "Enjoy a picnic lunch at a winery without packing food",
          "Hotel pickup and drop-off for transport to the riding location",
        ],
        logistics: {
          start: {
            description:
              "3850 State St, Santa Barbara, CA 93105, USA. Peppertree Inn with free parking.",
          },
        },
        itineraryItems: [
          {
            title: "I Bike Santa Barbara Wine Tours",
            description: "Admission Ticket Included",
            duration: "40 minutes",
          },
          {
            title: "Solvang",
            description: "Admission Ticket Free",
            duration: "20 minutes",
          },
          {
            title: "Rideau Vineyard",
            description: "Admission Ticket Included",
            duration: "1 hour",
          },
          {
            title: "Rancho Olivos",
            description: "Admission Ticket Free",
            duration: "1 hour",
          },
        ],
        additionalInfo: [
          "Confirmation will be received at time of booking",
          "Not wheelchair accessible",
          "A minimum of 2 people per booking is required",
          "Travelers should have a moderate physical fitness level",
          "This tour/activity will have a maximum of 8 travelers",
        ],
      },
    },
  },
  {
    productCode: "105668P1",
    publicUrl:
      "https://www.viator.com/tours/Maui/Waterfall-Adventure-Hike-Best-of-Maui/d671-105668P1",
    rawPayload: {
      product: {
        productCode: "105668P1",
        productUrl:
          "https://www.viator.com/tours/Maui/Waterfall-Adventure-Hike-Best-of-Maui/d671-105668P1",
        title: "Epic Waterfall Adventure, the Best of Maui",
        description: {
          text: "Discover the beauty of Maui’s waterfalls during a half-day tour. Meet your guide at a departure point for a small-group excursion that includes several waterfalls and optional cliff jumping. Go for a hike and admire views during the journey to reach the waterfalls. Swim, sunbathe, and jump off rocks during this adventurous tour. Go pro photography and videography are available for interested groups.",
        },
        location: { city: "Maui", state: "Hawaii" },
        priceFrom: "$249.00",
        reviews: { combinedAverageRating: 4.9, totalReviews: 280 },
        media: {
          images: [
            {
              isCover: true,
              variants: {
                FULL: {
                  url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/c9/66/84.jpg",
                  width: 674,
                  height: 446,
                },
              },
            },
          ],
        },
        highlights: [
          "Hike to see Maui’s scenic waterfalls",
          "Swim and sunbathe at your leisure",
          "Cliff jumping is available if interested",
          "Go Pro photography and videography are available for interested groups",
        ],
        logistics: {
          start: { description: "199 Lauo Lp, Kahului, HI 96732, USA" },
        },
        itineraryItems: [
          {
            title: "Hana Highway - Road to Hana",
            description: "Admission Ticket Free",
            duration: "3 hours",
          },
        ],
        additionalInfo: [
          "Confirmation will be received at time of booking, unless booked within 4 hours of travel. In this case confirmation will be received as soon as possible, subject to availability",
          "Not wheelchair accessible",
          "Near public transportation",
          "Travelers should have a moderate physical fitness level",
          "This is a private tour/activity. Only your group will participate",
        ],
      },
    },
  },
];
