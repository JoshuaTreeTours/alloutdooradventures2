export type Engine5ViatorTourRecord = {
  engine: "engine5";
  bookingProvider: "viator";
  productCode: string;
  slug: string;
  bookingUrl: string;
  sourceUrl: string;
  destination: {
    country: string;
    state: string;
    stateSlug: string;
    city: string;
    citySlug: string;
  };
};

export type Engine5ViatorApiTour = {
  productCode: string;
  title?: string;
  sourceUrl?: string;
  fromPrice?: string;
  priceCurrency?: string;
  rating?: number;
  reviewCount?: number;
  duration?: string;
  startTime?: string;
  meetingPoint?: string;
  cancellationPolicy?: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  additionalInfo?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  itinerary?: Array<{ title: string; description?: string; duration?: string }>;
  whatToExpect?: string;
  overview?: string;
  descriptionLong?: string;
  sourceCode?: string;
  sourceDerivedImageUrl?: string;
  fallbackImageUrl?: string;
  primaryImageUrl?: string;
};


export const ENGINE5_FORCED_SOURCE_IMAGE_BY_PRODUCT_CODE: Record<string, string> = {
  "335698P13":
    "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1400&h=1000&s=1",
};

export type Engine5TourViewModel = {
  engine: "engine5";
  bookingProvider: "viator";
  productCode: string;
  slug: string;
  title: string;
  canonicalPath: string;
  bookingUrl: string;
  destination: Engine5ViatorTourRecord["destination"];
  primaryImage: string;
  imageSource: "source-code" | "fallback-record" | "destination-home-last-resort";
  facts: {
    priceFrom?: string;
    ratingValue?: number;
    reviewCount?: number;
    meetingPoint?: string;
    startTime?: string;
    duration?: string;
    cancellationPolicy?: string;
  };
  content: {
    overview: string;
    highlights: string[];
    inclusions: string[];
    exclusions: string[];
    whatToExpect?: string;
    additionalInfo: string[];
    faqs: Array<{ question: string; answer: string }>;
    itinerary: Array<{ title: string; description?: string; duration?: string }>;
  };
};

export const assertEngine5PrimaryImage = (primaryImage: string) => {
  if (!/^https:\/\/(dynamic-media|media)\.tacdn\.com\//i.test(primaryImage)) {
    throw new Error("Engine5 primaryImage must be a TACDN product image");
  }
};
