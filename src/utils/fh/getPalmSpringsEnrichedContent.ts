import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { isPalmSpringsTour } from "../palmSprings/isPalmSpringsTour";
import { fetchFareHarborHtml } from "./fetchFareHarborHtml";
import { parseFareHarborHtml } from "./parseFareHarborHtml";
import {
  transformToAOAContent,
  type AOAEnrichedContent,
} from "./transformToAOAContent";
import { resolveFareHarborUrlFromBookPage } from "./resolveFareHarborUrlFromBookPage";

const ENRICHED_CACHE = new Map<string, Promise<AOAEnrichedContent | null>>();

const logPsp = (message: string) => {
  if (typeof window === "undefined") {
    console.info(message);
  }
};

const buildMinimalRewrite = (tour: Engine2Tour): AOAEnrichedContent => {
  const location = `${tour.geo.city}, ${tour.geo.region}`;
  const sentence = `${tour.name} in ${location} is organized as a guided outing with a clear route, practical pacing, and local context tailored to current conditions.`;
  return {
    whatYoullExperience: sentence,
    highlights: [
      `Structured itinerary in ${location}`,
      `Guide-led context specific to ${tour.geo.city}`,
      "Balanced timing for stops and interpretation",
      "Clear pre-trip logistics and meeting guidance",
      "Content tailored to current weather and route conditions",
    ],
    schemaDescription: sentence,
  };
};

export const getPalmSpringsEnrichedContent = async (
  tour: Engine2Tour,
  origin: string
): Promise<AOAEnrichedContent | null> => {
  const eligible = isPalmSpringsTour(tour, tour.seo.canonicalPath);
  logPsp(`PSP rewrite: eligible=${eligible}`);
  if (!eligible) {
    return null;
  }

  const cacheKey = `${tour.id}:${tour.seo.canonicalPath}`;
  const cached = ENRICHED_CACHE.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    try {
      const fhUrl = await resolveFareHarborUrlFromBookPage({
        origin,
        pathname: tour.seo.canonicalPath,
      });
      logPsp(`PSP rewrite: bookFetched=true`);
      logPsp(`PSP rewrite: fhUrlFound=${Boolean(fhUrl)}`);

      if (!fhUrl) {
        logPsp("PSP rewrite: fhFetched=false");
        logPsp("PSP rewrite: transformed=true");
        return buildMinimalRewrite(tour);
      }

      const fhHtml = await fetchFareHarborHtml(fhUrl);
      logPsp(`PSP rewrite: fhFetched=${Boolean(fhHtml)}`);
      if (!fhHtml) {
        logPsp("PSP rewrite: transformed=true");
        return buildMinimalRewrite(tour);
      }

      const parsed = parseFareHarborHtml(fhHtml);
      const transformed = transformToAOAContent(parsed, {
        title: tour.name,
        destination: `${tour.geo.city}, ${tour.geo.region}`,
      });
      logPsp("PSP rewrite: transformed=true");
      return transformed;
    } catch {
      logPsp("PSP rewrite: bookFetched=false");
      logPsp("PSP rewrite: fhUrlFound=false");
      logPsp("PSP rewrite: fhFetched=false");
      logPsp("PSP rewrite: transformed=true");
      return buildMinimalRewrite(tour);
    }
  })();

  ENRICHED_CACHE.set(cacheKey, promise);
  return promise;
};
