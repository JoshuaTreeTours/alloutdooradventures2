export function buildTourJsonLd(tour: {
  name: string;
  description?: string;
  url: string;
  image?: string;
  price?: number;
  priceCurrency?: string;
}) {
  const offer =
    tour.price && tour.priceCurrency
      ? {
          "@type": "Offer",
          price: String(tour.price),
          priceCurrency: tour.priceCurrency,
          url: tour.url,
          availability: "https://schema.org/InStock",
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tour.name,
    description: tour.description,
    image: tour.image ? [tour.image] : undefined,
    url: tour.url,
    isRelatedTo: {
      "@type": "TouristTrip",
      name: tour.name,
      description: tour.description,
      url: tour.url,
      offers: offer,
    },
    offers: offer,
  };
}
