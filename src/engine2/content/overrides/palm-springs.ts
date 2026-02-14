import type { BuiltTourCopy } from "../templates/buildTourCopy";

type PalmSpringsTourOverride = {
  id: string;
  sourceCitySlug: string;
  slug: string;
  name: string;
  provider: {
    name: string;
    shortName: string;
    email?: string;
    phone?: string;
  };
  geo: {
    country: string;
    region: string;
    city: string;
    lat: number | null;
    lng: number | null;
  };
  seo: {
    title: string;
    description: string;
    canonicalPath: string;
    ogImage: string;
  };
  content: {
    experienceText: string;
    highlights: string[];
  };
  images: {
    hero: string;
    gallery: string[];
  };
  booking: {
    bookingUrl: string;
    fareharbor?: {
      shortname: string;
      itemId: string;
      refUrl: string;
      backUrl: string;
    };
  };
};

export const FH_ITEM_34849_URL =
  "https://fareharbor.com/embeds/book/red-jeep/items/34849/calendar/2026/02/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&marketplace=yes&flow=no&full-items=yes";

export const palmSpringsContentOverrides: Record<string, Partial<BuiltTourCopy>> = {
  "43915": {
    experienceText:
      "The Private San Andreas Fault Jeep Tour is a premium desert outing built for travelers who want a deeper look at Palm Springs geology with a more personal pace. You’ll head into dramatic fault-zone terrain with a professional guide from Desert Adventures Red Jeep Tours, learning how tectonic movement shaped canyons, ridgelines, and the Coachella Valley floor over millions of years. Because this is a private format, the route can feel more tailored, with extra room for questions, photos, and slower moments at scenic viewpoints. Along the way, expect engaging interpretation on desert ecology, native plants, and the human history connected to the region’s rugged landscapes. The experience is especially strong for couples, families, and small groups looking for a more focused day than a standard shared departure. If you want a polished Palm Springs adventure that balances education, scenery, and comfort, this private fault tour delivers a memorable way to experience one of California’s most distinctive desert environments.",
    highlights: [
      "Private Jeep format with personalized pacing and guide attention",
      "In-depth San Andreas Fault geology and desert ecology storytelling",
      "Excellent for small groups seeking a premium Palm Springs experience",
    ],
    metaDescription:
      "Private San Andreas Fault Jeep Tour in Palm Springs with Desert Adventures Red Jeep Tours. Personalized geology experience with scenic desert stops.",
  },
};

export const palmSpringsTourOverrides: Record<string, PalmSpringsTourOverride> = {
  "34849": {
    id: "34849",
    sourceCitySlug: "palm-springs",
    slug: "shared-san-andreas-fault-jeep-tour-34849",
    name: "Shared San Andreas Fault Jeep Tour",
    provider: {
      name: "Desert Adventures Red Jeep Tours",
      shortName: "red-jeep",
      email: "resv@red-jeep.com",
      phone: "(760) 324-5337",
    },
    geo: {
      country: "United States",
      region: "California",
      city: "Palm Springs",
      lat: 33.765378,
      lng: -116.238253,
    },
    seo: {
      title:
        "Shared San Andreas Fault Jeep Tour | Palm Springs, California Outdoor Tour",
      description:
        "Shared San Andreas Fault Jeep Tour in Palm Springs, California with Desert Adventures Red Jeep Tours. Guided experience, clear logistics, and memorable local stops.",
      canonicalPath:
        "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849",
      ogImage: "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa",
    },
    content: {
      experienceText:
        "Shared San Andreas Fault Jeep Tour with Desert Adventures Red Jeep Tours is designed for travelers who want more than a quick photo stop in Palm Springs. This experience combines local storytelling, practical route planning, and time to explore the landscapes that define Palm Springs, California. Expect a relaxed but well-paced outing where your guide helps you understand what makes each stop unique, from geology and neighborhood history to small details you might miss on your own. The pace works well for first-time visitors and return travelers who want a dependable, professionally operated day in the desert. Throughout the tour, your guide can share tips on timing, weather, and local recommendations so the rest of your trip in Palm Springs is even easier to plan. Desert Adventures Red Jeep Tours keeps the logistics simple, so you can focus on the experience itself and enjoy every segment with confidence. If you are comparing options, this is a strong fit when you want a shared san andreas fault jeep tour experience with reliable operations and memorable views. It is a polished way to enjoy shared san andreas fault jeep tour moments while making the most of your time in Palm Springs.",
      highlights: [
        "Guided Shared san andreas fault jeep tour experience in Palm Springs",
        "Operated by Desert Adventures Red Jeep Tours with straightforward booking",
        "Great fit for first-time and repeat visitors to California",
      ],
    },
    images: {
      hero: "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa",
      gallery: ["https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa"],
    },
    booking: {
      bookingUrl: FH_ITEM_34849_URL,
    },
  },
};
