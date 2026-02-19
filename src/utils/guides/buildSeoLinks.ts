import { slugify } from "../slugify";

type SeoLinks = {
  wikipedia?: string;
  officialTourism?: string;
  reference?: string;
};

type BuildSeoLinksInput = {
  city: string;
  state: string;
  overrides?: SeoLinks;
};

const STATE_TOURISM_FALLBACKS: Record<string, string> = {
  "alaska": "https://www.travelalaska.com/",
  "arizona": "https://www.visitarizona.com/",
  "california": "https://www.visitcalifornia.com/",
  "colorado": "https://www.colorado.com/",
  "district-of-columbia": "https://washington.org/",
  "florida": "https://www.visitflorida.com/",
  "georgia": "https://www.exploregeorgia.org/",
  "hawaii": "https://www.gohawaii.com/",
  "illinois": "https://www.enjoyillinois.com/",
  "indiana": "https://www.visitindiana.com/",
  "louisiana": "https://www.explorelouisiana.com/",
  "maryland": "https://www.visitmaryland.org/",
  "massachusetts": "https://www.massvacation.com/",
  "michigan": "https://www.michigan.org/",
  "minnesota": "https://www.exploreminnesota.com/",
  "missouri": "https://www.visitmo.com/",
  "montana": "https://www.visitmt.com/",
  "nevada": "https://travelnevada.com/",
  "new-mexico": "https://www.newmexico.org/",
  "new-york": "https://www.iloveny.com/",
  "north-carolina": "https://www.visitnc.com/",
  "ohio": "https://www.ohiotheheartofitall.com/",
  "oregon": "https://traveloregon.com/",
  "pennsylvania": "https://www.visitpa.com/",
  "south-carolina": "https://discoversouthcarolina.com/",
  "tennessee": "https://www.tnvacation.com/",
  "texas": "https://www.traveltexas.com/",
  "utah": "https://www.visitutah.com/",
  "washington": "https://stateofwatourism.com/",
  "wisconsin": "https://www.travelwisconsin.com/",
  "wyoming": "https://travelwyoming.com/",
};

const isValidHttpUrl = (value?: string) =>
  Boolean(value && /^https?:\/\//.test(value));

export const buildSeoLinks = ({ city, state, overrides }: BuildSeoLinksInput) => {
  const stateSlug = slugify(state);
  const stateTourism = STATE_TOURISM_FALLBACKS[stateSlug];

  const wikipedia =
    overrides?.wikipedia ??
    `https://en.wikipedia.org/wiki/${encodeURIComponent(city.replace(/\s+/g, "_"))}`;

  const officialTourism = overrides?.officialTourism ?? stateTourism;
  const reference =
    overrides?.reference ??
    `https://www.britannica.com/place/${encodeURIComponent(city.replace(/\s+/g, "-"))}`;

  return {
    wikipedia: isValidHttpUrl(wikipedia) ? wikipedia : undefined,
    officialTourism: isValidHttpUrl(officialTourism)
      ? officialTourism
      : isValidHttpUrl(stateTourism)
        ? stateTourism
        : undefined,
    reference: isValidHttpUrl(reference)
      ? reference
      : isValidHttpUrl(stateTourism)
        ? stateTourism
        : undefined,
  };
};
