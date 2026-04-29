import { execFile } from "node:child_process";

const BASE_URL =
  process.env.VIATOR_BASE_URL ||
  "https://api.viator.com/partner";

type CurlResult = {
  status: number;
  body: string;
};

export async function fetchViatorWithCurl(
  url: string,
  apiKey: string,
  options: { method?: "GET" | "POST"; body?: string; timeoutSeconds?: number } = {}
): Promise<CurlResult> {
  const method = options.method ?? "GET";
  const timeoutSeconds = String(options.timeoutSeconds ?? 25);

  const stdout = await new Promise<string>((resolve, reject) => {
    const args = [
      "--silent",
      "--show-error",
      "--max-time",
      timeoutSeconds,
      "-X",
      method,
      "-H",
      "Accept: application/json;version=2.0",
      "-H",
      "Accept-Language: en-US",
      "-H",
      "Content-Type: application/json;version=2.0",
      "-H",
      `exp-api-key: ${apiKey}`,
    ];

    if (options.body) {
      args.push("--data", options.body);
    }

    args.push("--write-out", "\n__CURL_STATUS__:%{http_code}", url);

    execFile("curl", args, (execError, out) => {
      if (execError) {
        reject(execError);
        return;
      }
      resolve(out);
    });
  });

  const marker = "\n__CURL_STATUS__:";
  const markerIndex = stdout.lastIndexOf(marker);
  if (markerIndex < 0) {
    throw new Error("curl response missing status marker");
  }

  const body = stdout.slice(0, markerIndex);
  const statusRaw = stdout.slice(markerIndex + marker.length).trim();
  const status = Number.parseInt(statusRaw, 10);

  if (!Number.isFinite(status)) {
    throw new Error(`invalid curl status: ${statusRaw}`);
  }

  return { status, body };
}

export async function fetchViatorProduct(productCode: string) {
  if (!process.env.VIATOR_API_KEY) {
    throw new Error("VIATOR_API_KEY not configured");
  }

  const url = `${BASE_URL}/products/${productCode}`;
  console.log("USING CURL FETCH PATH");

  try {
    const { status, body } = await fetchViatorWithCurl(url, process.env.VIATOR_API_KEY);
    if (status < 200 || status >= 300) {
      throw new Error(`Viator API error ${status}: ${body.slice(0, 500)}`);
    }
    return JSON.parse(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Viator product fetch exception", { url, message });
    throw new Error(`Viator curl fetch failed for ${url}: ${message}`);
  }
}
