export type Engine6ValidationFixture = {
  productCode: string;
  publicUrl: string;
  rawPayload: Record<string, unknown>;
};

export const ENGINE6_VALIDATION_FIXTURES: Engine6ValidationFixture[] = [
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
    productCode: "5119P13",
    publicUrl:
      "https://www.viator.com/tours/Las-Vegas/Grand-Canyon-West-6-in-1-Tour-with-Helicopter-and-Landing/d684-5119P13",
    rawPayload: {
      product: {
        productCode: "5119P13",
        productUrl:
          "https://www.viator.com/tours/Las-Vegas/Grand-Canyon-West-6-in-1-Tour-with-Helicopter-and-Landing/d684-5119P13",
        title: "Grand Canyon West 6-in-1 Tour with Helicopter and Landing",
        description: {
          text: "Depart Las Vegas for a full-day West Rim adventure with a small-group guide, scenic desert drive, and timed stops at Hoover Dam and a Joshua tree forest. At Grand Canyon West you can take in Eagle Point and Guano Point viewpoints, then elevate the day with an optional helicopter descent and landing near the Colorado River before returning to Las Vegas.",
        },
        location: { city: "Las Vegas", state: "Nevada" },
        priceFrom: "$399.00",
        reviews: { combinedAverageRating: 4.6, totalReviews: 163 },
        media: {
          images: [
            {
              isCover: true,
              variants: {
                FULL: {
                  url: "https://dynamic-media.tacdn.com/media/photo-o/2d/77/69/23/caption.jpg?w=1400&h=1000&s=1",
                  width: 1400,
                  height: 1000,
                },
              },
            },
          ],
        },
        highlights: [
          "West Rim access with time at Eagle Point and Guano Point",
          "Optional helicopter flight descending to the canyon floor",
          "Round-trip Las Vegas hotel pickup and drop-off included",
          "Breakfast snacks, lunch, and bottled water provided",
        ],
        logistics: {
          start: {
            description:
              "Pickup is available from many Las Vegas Strip and Downtown hotels. Exact pickup details are confirmed after booking.",
          },
        },
        itineraryItems: [
          {
            title: "Hoover Dam",
            description: "Photo stop and guide commentary",
            duration: "20 minutes",
          },
          {
            title: "Grand Canyon West",
            description: "Admission included",
            duration: "4 hours",
          },
          {
            title: "Eagle Point and Guano Point",
            description: "Viewpoint exploration",
            duration: "1 hour",
          },
          {
            title: "Colorado River Helicopter Landing",
            description: "Optional helicopter upgrade experience",
            duration: "4 hours",
          },
        ],
        qAndA: {
          items: [
            {
              question:
                "Is helicopter landing included in the standard tour option?",
              answer:
                "The helicopter landing component is included only when you book the package option that lists the helicopter upgrade.",
            },
            {
              question: "How long is the overall day from Las Vegas?",
              answer:
                "Most departures run roughly 10 to 11 hours including hotel transfers and Grand Canyon West stops.",
            },
          ],
        },
        additionalInfo: [
          "Confirmation will be received within 48 hours of booking, subject to availability",
          "Not wheelchair accessible",
          "Travelers should have a moderate physical fitness level",
          "Tour/activity has a maximum of 14 travelers",
        ],
      },
    },
  },
];
