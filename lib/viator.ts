import { execFile } from "node:child_process";

const BASE_URL =
  process.env.VIATOR_BASE_URL ||
  "https://api.viator.com/partner";

export async function fetchViatorProduct(productCode: string) {
  if (!process.env.VIATOR_API_KEY) {
    throw new Error("VIATOR_API_KEY not configured");
  }

  const url = `${BASE_URL}/products/${productCode}`;

  try {
    const stdout = await new Promise<string>((resolve, reject) => {
      execFile("curl", [
      "--silent",
      "--show-error",
      "--fail-with-body",
      "--max-time",
      "25",
      "-H",
      "Accept: application/json;version=2.0",
      "-H",
      "Accept-Language: en-US",
      "-H",
      `exp-api-key: ${process.env.VIATOR_API_KEY}`,
      url,
      ], (execError, out) => {
        if (execError) {
          reject(execError);
          return;
        }
        resolve(out);
      });
    });

    return JSON.parse(stdout);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Viator product fetch exception", { url, message });
    throw new Error(`Viator curl fetch failed for ${url}: ${message}`);
  }
}
