export type Engine5ViatorApiTour = {
  productCode: string;
  title: string;
  sourceUrl: string;
  description: string;
  duration?: string;
  fromPrice?: string;
  priceCurrency?: string;
  rating?: number;
  reviewCount?: number;
  meetingPoint?: string;
  cancellationPolicy?: string;
  itinerary: Array<{ title: string; description?: string; duration?: string }>;
  inclusions: string[];
  exclusions: string[];
  additionalInfo: string[];
  primaryImageUrl: string;
  galleryImages: string[];
  provenance: {
    apiFetchAttempted: true;
    apiFetchSucceeded: boolean;
    heroImageSource: "api";
    listingImageSource: "api";
    descriptionSource: "api";
  };
};

export type Engine5ProductRecord = {
  productCode: "132218P209";
  destination: {
    country: string;
    state: string;
    stateSlug: string;
    city: string;
    citySlug: string;
  };
};
