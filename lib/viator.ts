const BASE_URL =
  process.env.VIATOR_BASE_URL ||
  "https://api.viator.com/partner";

export async function fetchViatorProduct(productCode: string) {
  if (!process.env.VIATOR_API_KEY) {
    throw new Error("VIATOR_API_KEY not configured");
  }

  const response = await fetch(`${BASE_URL}/products/${productCode}`, {
    headers: {
      Accept: "application/json;version=2.0",
      "exp-api-key": process.env.VIATOR_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Viator API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
