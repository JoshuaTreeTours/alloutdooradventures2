import { extractEngine6Product } from "../api/engine6/viatorExtractors";
import handler from "../api/engine6/viator-product";
import {
  resolveViatorApiKey,
  resolveViatorBaseUrl,
  VIATOR_ENV_SOURCES,
} from "../api/viator/runtimeConfig";

type HandlerResult = {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
};

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

const invokeEngine6Handler = async (productCode: string): Promise<HandlerResult> => {
  let statusCode = 200;
  let body: unknown = null;
  const headers: Record<string, string> = {};

  const req = {
    method: "GET",
    query: {
      productCode,
    },
  };

  const res = {
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = payload;
      return this;
    },
  };

  await handler(req, res);

  return { statusCode, body, headers };
};

const productCode = (process.argv[2] ?? "5615689P4").trim().toUpperCase();
const apiKey = resolveViatorApiKey();
const baseUrl = resolveViatorBaseUrl();

if (!apiKey) {
  const keyNames = VIATOR_ENV_SOURCES.apiKey.join(", ");
  throw new Error(
    `No Viator API key detected. Set one of: ${keyNames}.`
  );
}

const endpoint = `${baseUrl}/products/${encodeURIComponent(productCode)}`;
const upstreamResponse = await fetch(endpoint, {
  method: "GET",
  headers: buildHeaders(apiKey),
});
const upstreamText = await upstreamResponse.text();

if (!upstreamResponse.ok) {
  throw new Error(
    `Live Viator request failed (${upstreamResponse.status} ${upstreamResponse.statusText}) against ${endpoint}: ${upstreamText.slice(0, 500)}`
  );
}

let upstreamPayload: unknown;
try {
  upstreamPayload = JSON.parse(upstreamText);
} catch {
  throw new Error(`Live Viator request returned non-JSON payload from ${endpoint}`);
}

const extraction = extractEngine6Product(upstreamPayload);
const itineraryCount = extraction.extracted.itinerary.length;

const handlerResult = await invokeEngine6Handler(productCode);

const savedKey = process.env.VIATOR_API_KEY;
const savedPartnerKey = process.env.VIATOR_PARTNER_API_KEY;
const savedEngine6Key = process.env.ENGINE6_VIATOR_API_KEY;

delete process.env.VIATOR_API_KEY;
delete process.env.VIATOR_PARTNER_API_KEY;
delete process.env.ENGINE6_VIATOR_API_KEY;

const failLoudResult = await invokeEngine6Handler("NO_BUNDLED_PRODUCT_000");

if (typeof savedKey === "string") process.env.VIATOR_API_KEY = savedKey;
if (typeof savedPartnerKey === "string") process.env.VIATOR_PARTNER_API_KEY = savedPartnerKey;
if (typeof savedEngine6Key === "string") process.env.ENGINE6_VIATOR_API_KEY = savedEngine6Key;

console.log(
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      productCode,
      envResolution: {
        apiKeyVariablesChecked: VIATOR_ENV_SOURCES.apiKey,
        baseUrlVariablesChecked: VIATOR_ENV_SOURCES.baseUrl,
        resolvedBaseUrl: baseUrl,
      },
      liveFetch: {
        endpoint,
        authSucceeded: upstreamResponse.ok,
        title: extraction.extracted.title,
        price: extraction.extracted.priceFormatted,
        rating: extraction.extracted.aggregateRating,
        reviewCount: extraction.extracted.reviewCount,
        itineraryItemCount: itineraryCount,
        itineraryStructuredSourceUsed:
          extraction.diagnostics.itineraryStructuredSourceUsed ?? null,
      },
      engine6Handler: handlerResult,
      failLoudCheck: {
        statusCode: failLoudResult.statusCode,
        body: failLoudResult.body,
        passed:
          failLoudResult.statusCode >= 500 &&
          typeof (failLoudResult.body as { error?: unknown })?.error === "string",
      },
    },
    null,
    2
  )
);
