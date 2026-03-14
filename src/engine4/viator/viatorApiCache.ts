import type { Engine4ViatorApiTour } from "../types";
import { getEngine4ViatorTourData } from "./viatorApi";

const apiTourCache = new Map<string, Engine4ViatorApiTour | undefined>();
const pendingApiTourRequests = new Map<
  string,
  Promise<Engine4ViatorApiTour | undefined>
>();

const normalizeProductCode = (productCode: string) =>
  productCode.trim().toUpperCase();

export const peekEngine4ViatorApiTour = (productCode: string) => {
  const normalizedCode = normalizeProductCode(productCode);
  return apiTourCache.get(normalizedCode);
};

export const requestEngine4ViatorApiTour = async (productCode: string) => {
  const normalizedCode = normalizeProductCode(productCode);
  if (!normalizedCode) {
    return undefined;
  }

  const cached = apiTourCache.get(normalizedCode);
  if (cached) {
    return cached;
  }

  const inFlight = pendingApiTourRequests.get(normalizedCode);
  if (inFlight) {
    return inFlight;
  }

  const request = getEngine4ViatorTourData(normalizedCode)
    .then(result => {
      apiTourCache.set(normalizedCode, result);
      return result;
    })
    .finally(() => {
      pendingApiTourRequests.delete(normalizedCode);
    });

  pendingApiTourRequests.set(normalizedCode, request);
  return request;
};

export const setEngine4ViatorApiTourForTest = (
  productCode: string,
  tour: Engine4ViatorApiTour | undefined
) => {
  const normalizedCode = normalizeProductCode(productCode);
  if (!normalizedCode) {
    return;
  }

  if (typeof tour === "undefined") {
    apiTourCache.delete(normalizedCode);
    return;
  }

  apiTourCache.set(normalizedCode, tour);
};

export const resetEngine4ViatorApiTourCacheForTest = () => {
  apiTourCache.clear();
  pendingApiTourRequests.clear();
};
