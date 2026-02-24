import { getAllEngine2Tours } from "../src/engine2/data/loadEngine2";
import { tours } from "../src/data/tours";
import {
  buildJoshuaTreeTemplate,
  isJoshuaTreeTour,
} from "../src/utils/tours/buildJoshuaTreeTemplate";

const firstPersonPattern = /\b(I|my)\b/i;

const rows: Array<{ path: string; hasLowPrice: boolean; hasPriceLabel: boolean; cleanDescription: boolean; hasHighlights: boolean; hasItinerary: boolean; }> = [];

for (const tour of tours) {
  const path = `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;
  if (
    !isJoshuaTreeTour({
      citySlug: tour.destination.citySlug,
      city: tour.destination.city,
      canonicalPath: path,
      title: tour.title,
    })
  ) {
    continue;
  }
  const template = buildJoshuaTreeTemplate({
    title: tour.title,
    citySlug: tour.destination.citySlug,
    city: tour.destination.city,
    canonicalPath: path,
    lowPrice: tour.startingPrice,
    duration: tour.badges.duration,
    category: tour.primaryCategory,
    tags: [...(tour.tags ?? []), ...(tour.categories ?? [])],
  });
  rows.push({
    path,
    hasLowPrice: typeof tour.startingPrice === "number" && tour.startingPrice > 0,
    hasPriceLabel: Boolean(template.priceLabel),
    cleanDescription: !firstPersonPattern.test(template.description),
    hasHighlights: template.highlights.length > 0,
    hasItinerary: template.itinerarySteps.length > 0,
  });
}

for (const tour of getAllEngine2Tours()) {
  if (
    !isJoshuaTreeTour({
      citySlug: tour.sourceCitySlug,
      city: tour.geo.city,
      canonicalPath: tour.seo.canonicalPath,
      title: tour.name,
    })
  ) {
    continue;
  }
  const template = buildJoshuaTreeTemplate({
    title: tour.name,
    citySlug: tour.sourceCitySlug,
    city: tour.geo.city,
    canonicalPath: tour.seo.canonicalPath,
    lowPrice: tour.pricing?.price,
    highlights: tour.content.highlights,
  });
  rows.push({
    path: tour.seo.canonicalPath,
    hasLowPrice: Boolean(tour.pricing?.price),
    hasPriceLabel: Boolean(template.priceLabel),
    cleanDescription: !firstPersonPattern.test(template.description),
    hasHighlights: template.highlights.length > 0,
    hasItinerary: template.itinerarySteps.length > 0,
  });
}

for (const row of rows) {
  console.log(
    [
      row.path,
      `priceLabel=${row.hasPriceLabel ? "yes" : "no"}`,
      `priceExpected=${row.hasLowPrice ? "yes" : "no"}`,
      `descriptionNoFirstPerson=${row.cleanDescription ? "yes" : "no"}`,
      `highlights=${row.hasHighlights ? "yes" : "no"}`,
      `itinerary=${row.hasItinerary ? "yes" : "no"}`,
    ].join(" | ")
  );
}
