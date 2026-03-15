import { ENGINE6_PILOT_PRODUCT_CODE } from "../routes";

export const getEngine6ViatorTourData = async () => {
  const response = await fetch(
    `/api/engine6/viator-product?productCode=${ENGINE6_PILOT_PRODUCT_CODE}`,
    {
      method: "GET",
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error ?? "Unable to load Viator product data.");
  }

  return (payload?.product ?? payload) as Record<string, unknown>;
};
