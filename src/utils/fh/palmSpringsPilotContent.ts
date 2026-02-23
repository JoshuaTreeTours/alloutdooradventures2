import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { fetchFareHarborHtml } from "./fetchFareHarborHtml";
import { parseFareHarborHtml } from "./parseFareHarborHtml";
import { resolveFareHarborUrlFromBookPage } from "./resolveFareHarborUrlFromBookPage";
import {
  transformToAOAContent,
  type AOAEnrichedContent,
} from "./transformToAOAContent";

const parsedFareHarborCache = new Map<string, AOAEnrichedContent | null>();

export const isPalmSpringsTour = (tour: Engine2Tour) =>
  tour.sourceCitySlug === "palm-springs" ||
  tour.seo.canonicalPath.startsWith(
    "/destinations/california/palm-springs/tours/"
  );

export const getPalmSpringsPilotContent = async (
  tour: Engine2Tour,
  origin: string
): Promise<AOAEnrichedContent | null> => {
  if (!isPalmSpringsTour(tour)) {
    return null;
  }

  if (parsedFareHarborCache.has(tour.seo.canonicalPath)) {
    return parsedFareHarborCache.get(tour.seo.canonicalPath) ?? null;
  }

  try {
    const resolvedFareHarborUrl = await resolveFareHarborUrlFromBookPage({
      origin,
      pathname: tour.seo.canonicalPath,
    });

    if (!resolvedFareHarborUrl) {
      const fallback = transformToAOAContent({
        tourName: tour.name,
        city: tour.geo.city,
      });
      parsedFareHarborCache.set(tour.seo.canonicalPath, fallback);
      return fallback;
    }

    const html = await fetchFareHarborHtml(resolvedFareHarborUrl);
    if (!html) {
      const fallback = transformToAOAContent({
        tourName: tour.name,
        city: tour.geo.city,
      });
      parsedFareHarborCache.set(tour.seo.canonicalPath, fallback);
      return fallback;
    }

    const parsed = parseFareHarborHtml(html);
    const transformed = transformToAOAContent({
      tourName: tour.name,
      city: tour.geo.city,
      parsed,
    });
    parsedFareHarborCache.set(tour.seo.canonicalPath, transformed);
    return transformed;
  } catch {
    const fallback = transformToAOAContent({
      tourName: tour.name,
      city: tour.geo.city,
    });
    parsedFareHarborCache.set(tour.seo.canonicalPath, fallback);
    return fallback;
  }
};
