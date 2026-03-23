import { extractEngine6Product } from "../../api/engine6/viatorExtractors";

import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import type { Engine6ApiResponse } from "./types";

export const ENGINE6_BUNDLED_RAW_PRODUCTS: Record<
  string,
  Record<string, unknown>
> = {
  "163873P16": {
    product: {
      productCode: "163873P16",
      title: "East Zion Top of the World Jeep Tour",
      description: {
        text: "<p>Grab bird’s-eye views of Zion National Park on this Jeep tour. After meeting up with your guide, you’ll spend the next 1.5 hours climbing up, up, up the mountains—all on private land—to incredible views of the Coral Pink Sand Dunes, Cedar Mountain, and beyond. With reasonably groomed trails, this trek is perfect for families with small kids, and anyone looking for easy, effortless adventure with plenty of reward.</p>",
      },
      shortDescription: "Short fallback that should not win for the specimen.",
      highlights: [
        "Easy meetup at at Zion Ponderosa Ranch Resort",
        "Your local guide adds valuable insight on the area's geology, flora, fauna, and more",
        "See Zion National Park and its environs from above",
        "Limited to 8 travelers, you'll get an intimate East Zion experience",
      ],
      additionalInfo: [
        "Confirmation will be received at time of booking",
        "Not wheelchair accessible",
        "Not recommended for travelers with back problems",
        "Not recommended for pregnant travelers",
        "No heart problems or other serious medical conditions",
        "Most travelers can participate",
        "This tour/activity will have a maximum of 8 travelers",
      ],
      location: { city: "Springdale", state: "Utah" },
      priceFrom: "$105.09",
      durationText: "1 hour 30 minutes",
      language: "English",
      pricing: { summary: { fromPrice: 999 } },
      images: [
        {
          isCover: true,
          variants: [
            {
              url: "https://media.tacdn.com/media/attractions-splice-spp-360x240/12/26/61/64.jpg",
              width: 360,
              height: 240,
            },
            {
              url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/26/61/64.jpg",
              width: 674,
              height: 446,
            },
          ],
        },
      ],
      media: {
        images: [
          {
            isCover: true,
            variants: {
              XXLARGE: {
                url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/26/61/64.jpg",
                width: 1600,
                height: 1067,
              },
            },
          },
        ],
      },
      reviews: { combinedAverageRating: 5, totalReviews: 154 },
      logistics: { start: { description: "Meet us at Zion Mountain Ranch!" } },
      itineraryItems: [
        {
          title: "Zion National Park",
          description: "Admission Ticket Free",
          duration: "30 minutes",
        },
      ],
      qAndA: {
        items: [
          {
            q: "Is this tour good for families?",
            a: "Yes. The reasonably groomed trails make it approachable for families with small kids.",
          },
        ],
      },
      productUrl:
        "https://www.viator.com/tours/Utah/East-Zion-Top-of-the-World-Jeep-Tour/d785-163873P16",
    },
  },
  "132218P75": {
    product: {
      productCode: "132218P75",
      productUrl:
        "https://www.viator.com/tours/Las-Vegas/Grand-Canyon-Skywalk-Hoover-Dam-Day-Trip-W-Lunch-from-Las-Vegas/d684-132218P75",
      title:
        "Grand Canyon West, Hoover Dam Stop and Optional Lunch and Skywalk",
      description: {
        text: "Enjoy more time exploring the Grand Canyon and less time waiting around on this exclusive West Rim group day trip from Las Vegas. Relax in an air-conditioned vehicle and avoid waiting in long lines with a Grand Canyon Ambassador who scans your tickets right on board. Get direct access to Eagle Point and Guano Point and spend your time admiring the awe-inspiring views. For an even more unforgettable experience, customize your tour by adding lunch, a Grand Canyon Skywalk ticket, or a helicopter and boat ride, and lunch.",
      },
      location: { city: "Las Vegas", state: "Nevada" },
      priceFrom: "$109.00",
      durationText: "11 to 12 hours",
      pickup: "Pickup offered",
      pickupOffered: true,
      mobileTicket: true,
      language: "English",
      supplier: { name: "Jupiter Legend Corporation" },
      cancellationPolicy: {
        description:
          "You can cancel up to 24 hours in advance of the experience for a full refund.",
      },
      reviews: { combinedAverageRating: 4.9, totalReviews: 20734 },
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
          {
            variants: {
              FULL: {
                url: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80",
                width: 1200,
                height: 800,
              },
            },
          },
          {
            variants: {
              FULL: {
                url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
                width: 1200,
                height: 800,
              },
            },
          },
        ],
      },
      highlights: [
        "Skip the long lines at Grand Canyon West with VIP bus access",
        "Tour includes pickup and drop-off from select Las Vegas hotels",
        "Access great photo opportunities—including the Hoover Dam",
        "Option to include lunch, helicopter/pontoon boat ride, or Skywalk",
      ],
      inclusions: [
        "Grand Canyon West Rim Bus Tour",
        "Exclusive Bus Access at Grand Canyon West Rim",
        "Hot Lunch (if option selected): Hearty portions at your choice of three restaurants",
        "Helicopter Ride and 25-minute Pontoon Ride Down Colorado River (if option selected)",
        "Skywalk Ticket (if option selected)",
        "West Rim Airplane ride with aerial views of Grand Canyon West and Colorado River (if option selected)",
        "Pick-up and drop off at select hotels",
        "Bottled water",
        "Snacks",
        "Air-conditioned vehicle",
        "Professional Guide",
      ],
      exclusions: [
        "Gratuities (10%-20% recommended)",
        "Skywalk Ticket (if option not selected)",
        "Helicopter Ride and 25-minute Pontoon Ride Down Colorado River (if option not selected)",
        "West Rim Airplane ride with views of Grand Canyon West and Colorado River (if option not selected)",
        "Lunch (if option not selected)",
        "Additional National Park Entrance Fee for non-U.S. residents",
      ],
      logistics: {
        start: {
          description:
            "Pickup offered from select Las Vegas hotels. Arrive 5–10 minutes early and confirm the exact pickup point after booking.",
        },
      },
      itineraryItems: [
        {
          title: "Las Vegas Strip",
          description: "Early morning departure after hotel pickup.",
          duration: "30 minutes",
        },
        {
          title: "Arizona's Joshua Tree Forest",
          description:
            "Pass-by desert scenery on the drive toward Grand Canyon West.",
        },
        {
          title: "Grand Canyon West",
          description:
            "Main West Rim stop with time to explore the viewpoints.",
          duration: "3 hours 30 minutes",
        },
        {
          title: "Grand Canyon Skywalk",
          description: "Optional upgrade stop with glass bridge access.",
        },
        {
          title: "Eagle Point",
          description: "Included stop for dramatic canyon rim views.",
        },
        {
          title: "Guano Point",
          description: "Included stop with panoramic West Rim overlooks.",
        },
        {
          title: "Mike O'Callaghan–Pat Tillman Memorial Bridge",
          description:
            "Hoover Dam area photo stop with views over Black Canyon and Lake Mead.",
          duration: "30 minutes",
        },
      ],
      additionalInfo: [
        "Confirmation will be received at time of booking, unless booked within 1 day of travel.",
        "Not wheelchair accessible",
        "Stroller accessible",
        "Near public transportation",
        "Infants must sit on laps",
        "Most travelers can participate",
        "Luggage and large bags are not permitted on this tour due to security restrictions at the Hoover Dam",
        "Hotel pickup is available for this tour/activity. Exact pickup details will be provided upon reconfirmation with the local tour operator.",
        "This tour/activity will have a maximum of 57 travelers",
        "You can cancel up to 24 hours in advance of the experience for a full refund.",
      ],
      qAndA: {
        items: [
          {
            q: "Is hotel pickup included?",
            a: "Yes. Pickup and drop-off are offered from select Las Vegas hotels, with exact details confirmed after booking.",
          },
          {
            q: "Can I add the Skywalk or lunch?",
            a: "Yes. Travelers can choose options that add lunch, the Grand Canyon Skywalk, or other West Rim upgrades when booking.",
          },
        ],
      },
      categories: ["sightseeing-tour", "adventure-tour"],
    },
  },
};

export const buildBundledEngine6Payload = (
  productCode: string
): Engine6ApiResponse | null => {
  const rawPayload = ENGINE6_BUNDLED_RAW_PRODUCTS[productCode];
  if (!rawPayload) {
    return null;
  }

  const extraction = extractEngine6Product(rawPayload);

  return {
    source: "bundled-fallback",
    rawProductCode: productCode,
    rawProduct: extraction.product,
    diagnostics: {
      source: "bundled-fallback",
      resolvedProductUrl: null,
      resolvedHeroImageUrl: null,
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: null,
      upstreamOk: null,
      usedBundledFallbackBecause: "bundled-product-registry",
      ...extraction.diagnostics,
      bookingUrlSource:
        extraction.diagnostics.productUrlFieldPath ??
        "generated:viator-search-product-code",
      fieldLevelFallbackUsed: false,
      fallbackFieldNames: [],
    },
    extracted: extraction.extracted,
  };
};

export const getBundledEngine6Tour = (productCode: string) => {
  const payload = buildBundledEngine6Payload(productCode);
  return payload ? mapViatorToEngine6Tour(payload) : null;
};
