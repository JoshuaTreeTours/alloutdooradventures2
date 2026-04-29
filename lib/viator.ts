import { lookup } from "node:dns/promises";

const BASE_URL =
  process.env.VIATOR_BASE_URL ||
  "https://api.viator.com/partner";

export async function fetchViatorProduct(productCode: string) {
  if (!process.env.VIATOR_API_KEY) {
    throw new Error("VIATOR_API_KEY not configured");
  }

  const url = `${BASE_URL}/products/${productCode}`;
  const controller = new AbortController();
  const timeoutMs = 25_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let dnsResolved: boolean | null = null;

  try {
    const hostname = new URL(url).hostname;
    await lookup(hostname);
    dnsResolved = true;
  } catch {
    dnsResolved = false;
  }

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json;version=2.0",
        "exp-api-key": process.env.VIATOR_API_KEY,
        "Accept-Language": "en-US",
      },
    });

    if (!response.ok) {
      console.error("Viator product fetch failed", {
        url,
        dnsResolved,
        status: response.status,
      });
      throw new Error(
        `Viator API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error
        ? (error as { status?: unknown }).status
        : undefined;

    console.error("Viator product fetch exception", {
      url,
      dnsResolved,
      status,
      message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
