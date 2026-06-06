import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type HttpProbeResponse = {
  status: number;
  headers: Map<string, string>;
  bodyText: string;
};

type ProbeResult = {
  productCode: string;
  apiRequestMade: boolean;
  apiStatus: number | string;
  authoritySource: "live-api" | "snapshot" | "fallback";
  heroAuthority: string;
  priceSource: string;
  ratingSource: string;
  reviewCountSource: string;
  durationSource: string;
  explanation?: string;
};

const DEFAULT_BASE_URL =
  "https://alloutdooradventures3-git-codex-a-f3630-gerard-sybers-projects.vercel.app";
const PRODUCT_CODE = "6740P7";
const PAGE_PATH =
  "/destinations/california/joshua-tree/tours/joshua-tree-scenic-tour-6740p7";

const getArgValue = (name: string) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const baseUrl = trimTrailingSlash(
  getArgValue("--base-url") ??
    process.env.ENGINE6_PREVIEW_BASE_URL ??
    DEFAULT_BASE_URL
);
const pageUrl = `${baseUrl}${PAGE_PATH}`;
const apiUrl = `${baseUrl}/api/engine6/viator-product?productCode=${encodeURIComponent(
  PRODUCT_CODE
)}`;

const parseCurlResponse = (output: string): HttpProbeResponse => {
  const parts = output.split(/\r?\n\r?\n/);
  const lastHeaderIndex = parts.findLastIndex(block =>
    /^HTTP\/\d(?:\.\d)?\s+\d{3}/i.test(block.trim())
  );
  if (lastHeaderIndex < 0) {
    throw new Error("curl response did not include an HTTP status line");
  }

  const headerBlock = parts[lastHeaderIndex] ?? "";
  const bodyText = parts.slice(lastHeaderIndex + 1).join("\n\n");
  const lines = headerBlock.split(/\r?\n/).filter(Boolean);
  const status = Number(lines[0]?.match(/\s(\d{3})\s/)?.[1]);
  const headers = new Map<string, string>();
  for (const line of lines.slice(1)) {
    const separator = line.indexOf(":");
    if (separator <= 0) continue;
    headers.set(
      line.slice(0, separator).trim().toLowerCase(),
      line.slice(separator + 1).trim()
    );
  }

  return { status, headers, bodyText };
};

const requestWithCurl = async (url: string): Promise<HttpProbeResponse> => {
  const { stdout } = await execFileAsync("curl", ["-sS", "-i", url], {
    maxBuffer: 10 * 1024 * 1024,
  });
  return parseCurlResponse(stdout);
};

const requestUrl = async (url: string): Promise<HttpProbeResponse> => {
  try {
    const response = await fetch(url, { method: "GET" });
    const headers = new Map<string, string>();
    response.headers.forEach((value, key) => headers.set(key.toLowerCase(), value));
    return {
      status: response.status,
      headers,
      bodyText: await response.text(),
    };
  } catch {
    return requestWithCurl(url);
  }
};

const parseJsonSafely = (text: string): Record<string, any> | null => {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const fieldSource = (
  diagnostics: Record<string, any>,
  fieldPathName: string,
  authoritySource: ProbeResult["authoritySource"]
) => {
  const path = diagnostics[fieldPathName];
  if (typeof path === "string" && path.trim()) {
    return `${authoritySource}:${path}`;
  }
  return `${authoritySource}:unavailable`;
};

const resolveAuthoritySource = (
  payload: Record<string, any> | null,
  response: HttpProbeResponse
): ProbeResult["authoritySource"] => {
  const headerSource = response.headers.get("x-engine6-source") ?? "";
  const payloadSource = payload?.source;
  if (payloadSource === "live-api" || headerSource === "live-api") {
    return "live-api";
  }
  if (
    payloadSource === "bundled-fallback" ||
    headerSource === "bundled-exact-product-payload"
  ) {
    return "snapshot";
  }
  return "fallback";
};

const explainNonLiveAuthority = (args: {
  pageStatus: number | string;
  apiStatus: number | string;
  payload: Record<string, any> | null;
  bodyText: string;
  authoritySource: ProbeResult["authoritySource"];
}) => {
  if (args.authoritySource === "live-api") {
    return undefined;
  }

  const diagnostics = args.payload?.diagnostics ?? {};
  const reason = diagnostics.usedBundledFallbackBecause;
  if (typeof reason === "string" && reason.trim()) {
    return [
      `Snapshot authority selected because API diagnostics usedBundledFallbackBecause=${reason}.`,
      `hasViatorApiKey=${String(diagnostics.hasViatorApiKey)}, attemptedLiveFetch=${String(
        diagnostics.attemptedLiveFetch
      )}, upstreamStatus=${String(diagnostics.upstreamStatus)}, upstreamOk=${String(
        diagnostics.upstreamOk
      )}.`,
    ].join(" ");
  }

  if (args.apiStatus === 404 && /DEPLOYMENT_NOT_FOUND/i.test(args.bodyText)) {
    return `Fallback authority because the preview deployment URL returned Vercel DEPLOYMENT_NOT_FOUND before the Engine6 API route could execute. Page status=${args.pageStatus}, api status=${args.apiStatus}.`;
  }

  if (!args.payload) {
    return `Fallback authority because the Engine6 API response was not JSON. Page status=${args.pageStatus}, api status=${args.apiStatus}.`;
  }

  return `Fallback authority because the Engine6 API did not return live-api authority. Page status=${args.pageStatus}, api status=${args.apiStatus}.`;
};

const probe = async (): Promise<ProbeResult> => {
  let pageStatus: number | string = "not-requested";
  try {
    const pageResponse = await requestUrl(pageUrl);
    pageStatus = pageResponse.status;
  } catch (error) {
    pageStatus = error instanceof Error ? error.message : String(error);
  }

  let apiResponse: HttpProbeResponse;
  try {
    apiResponse = await requestUrl(apiUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      productCode: PRODUCT_CODE,
      apiRequestMade: true,
      apiStatus: message,
      authoritySource: "fallback",
      heroAuthority: "fallback:api-request-failed",
      priceSource: "fallback:api-request-failed",
      ratingSource: "fallback:api-request-failed",
      reviewCountSource: "fallback:api-request-failed",
      durationSource: "fallback:api-request-failed",
      explanation: `Fallback authority because the Engine6 API request failed: ${message}. Page status=${pageStatus}.`,
    };
  }

  const payload = parseJsonSafely(apiResponse.bodyText);
  const diagnostics = payload?.diagnostics ?? {};
  const authoritySource = resolveAuthoritySource(payload, apiResponse);
  const heroHeader = apiResponse.headers.get("x-engine6-hero-authority");
  const heroAuthority = heroHeader
    ? `${authoritySource}:${heroHeader}`
    : fieldSource(diagnostics, "heroSourceFieldPath", authoritySource);

  return {
    productCode: PRODUCT_CODE,
    apiRequestMade: true,
    apiStatus: apiResponse.status,
    authoritySource,
    heroAuthority,
    priceSource: fieldSource(
      diagnostics,
      "commercialPriceFieldPath",
      authoritySource
    ),
    ratingSource: fieldSource(diagnostics, "ratingFieldPath", authoritySource),
    reviewCountSource: fieldSource(
      diagnostics,
      "reviewCountFieldPath",
      authoritySource
    ),
    durationSource: fieldSource(
      diagnostics,
      "durationFieldPath",
      authoritySource
    ),
    explanation: explainNonLiveAuthority({
      pageStatus,
      apiStatus: apiResponse.status,
      payload,
      bodyText: apiResponse.bodyText,
      authoritySource,
    }),
  };
};

const printResult = (result: ProbeResult) => {
  console.log(`productCode: ${result.productCode}`);
  console.log("");
  console.log(`apiRequestMade: ${result.apiRequestMade}`);
  console.log(`apiStatus: ${result.apiStatus}`);
  console.log(`authoritySource: ${result.authoritySource}`);
  console.log(`heroAuthority: ${result.heroAuthority}`);
  console.log("");
  console.log(`priceSource: ${result.priceSource}`);
  console.log(`ratingSource: ${result.ratingSource}`);
  console.log(`reviewCountSource: ${result.reviewCountSource}`);
  console.log(`durationSource: ${result.durationSource}`);
  if (result.explanation) {
    console.log("");
    console.log(`explanation: ${result.explanation}`);
  }
};

probe()
  .then(printResult)
  .catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
