import { execFile } from "node:child_process";
import { promisify } from "node:util";

import handler from "../api/engine6/viator-product";
import { ENGINE6_CONFIGURED_PRODUCT_CODES } from "../src/engine6/routes";

const execFileAsync = promisify(execFile);

type HandlerBody = {
  source?: string;
  error?: string;
  details?: string;
  diagnostics?: Record<string, any>;
  extracted?: Record<string, any>;
};

type AuditRow = {
  productCode: string;
  httpStatus: number;
  authoritySource: "live-api" | "snapshot" | "fallback";
  apiSource: string | null;
  heroAuthority: string | null;
  fallbackReason: string | null;
  error: string | null;
  details: string | null;
  price: string | number | null;
  rating: number | null;
  reviewCount: number | null;
  duration: string | null;
  priceSource: string | null;
  ratingSource: string | null;
  reviewCountSource: string | null;
  durationSource: string | null;
  foreignProductUrlRejections: number;
  foreignProductUrlExamples: string[];
};

type SimpleResponse = {
  ok: boolean;
  status: number;
  headers: { get: (name: string) => string | null };
  text: () => Promise<string>;
  json: () => Promise<unknown>;
};

class SimpleHeaders {
  private values = new Map<string, string>();

  constructor(init: Record<string, string>) {
    Object.entries(init).forEach(([key, value]) => {
      this.values.set(key.toLowerCase(), value);
    });
  }

  get(name: string) {
    return this.values.get(name.toLowerCase()) ?? null;
  }
}

const parseCurlResponse = (output: string): SimpleResponse => {
  const parts = output.split(/\r?\n\r?\n/);
  const lastHeaderIndex = parts.findLastIndex(block =>
    /^HTTP\/\d(?:\.\d)?\s+\d{3}/i.test(block.trim())
  );
  if (lastHeaderIndex < 0) {
    throw new Error("curl response did not include an HTTP status line");
  }

  const headerBlock = parts[lastHeaderIndex] ?? "";
  const body = parts.slice(lastHeaderIndex + 1).join("\n\n");
  const lines = headerBlock.split(/\r?\n/).filter(Boolean);
  const status = Number(lines[0]?.match(/\s(\d{3})\s/)?.[1]);
  const headers: Record<string, string> = {};
  for (const line of lines.slice(1)) {
    const separator = line.indexOf(":");
    if (separator <= 0) continue;
    headers[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }

  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new SimpleHeaders(headers),
    text: async () => body,
    json: async () => JSON.parse(body),
  };
};

const fetchWithCurl = async (
  url: string,
  options?: { headers?: Record<string, string> }
): Promise<SimpleResponse> => {
  const args = ["-sS", "-i"];
  for (const [key, value] of Object.entries(options?.headers ?? {})) {
    args.push("-H", `${key}: ${value}`);
  }
  args.push(url);
  const { stdout } = await execFileAsync("curl", args, {
    maxBuffer: 20 * 1024 * 1024,
  });
  return parseCurlResponse(stdout);
};

const installCurlFetch = () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((url: URL | RequestInfo, options?: RequestInit) => {
    const headers: Record<string, string> = {};
    const inputHeaders = options?.headers;
    if (inputHeaders instanceof Headers) {
      inputHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(inputHeaders)) {
      for (const [key, value] of inputHeaders) {
        headers[key] = value;
      }
    } else if (inputHeaders && typeof inputHeaders === "object") {
      Object.assign(headers, inputHeaders as Record<string, string>);
    }

    return fetchWithCurl(String(url), {
      headers,
    }) as unknown as Promise<Response>;
  }) as typeof fetch;

  return () => {
    globalThis.fetch = originalFetch;
  };
};

const callHandler = async (productCode: string) => {
  const req = { method: "GET", query: { productCode } };
  const res: any = {
    headers: {} as Record<string, string>,
    statusCode: 200,
    body: undefined as HandlerBody | undefined,
    setHeader(name: string, value: string) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: HandlerBody) {
      this.body = payload;
      return this;
    },
  };

  await handler(req, res);
  return {
    statusCode: res.statusCode as number,
    headers: res.headers,
    body: res.body,
  };
};

const classifyAuthority = (
  statusCode: number,
  headers: Record<string, string>,
  body?: HandlerBody
): AuditRow["authoritySource"] => {
  if (
    body?.source === "live-api" ||
    headers["x-engine6-source"] === "live-api"
  ) {
    return statusCode >= 200 && statusCode < 300 ? "live-api" : "fallback";
  }
  if (
    body?.source === "bundled-fallback" ||
    headers["x-engine6-source"] === "bundled-exact-product-payload"
  ) {
    return "snapshot";
  }
  return "fallback";
};

const toAuditRow = (
  productCode: string,
  statusCode: number,
  headers: Record<string, string>,
  body?: HandlerBody
): AuditRow => {
  const diagnostics = body?.diagnostics ?? {};
  const extracted = body?.extracted ?? {};
  const rejected = Array.isArray(diagnostics.rejectedForeignHeroCandidates)
    ? (diagnostics.rejectedForeignHeroCandidates as Array<
        Record<string, unknown>
      >)
    : [];
  const foreignProductUrlRejected = rejected.filter(
    candidate => candidate.reason === "foreign-product-url"
  );
  const authoritySource = classifyAuthority(statusCode, headers, body);

  return {
    productCode,
    httpStatus: statusCode,
    authoritySource,
    apiSource: typeof body?.source === "string" ? body.source : null,
    heroAuthority: headers["x-engine6-hero-authority"] ?? null,
    fallbackReason:
      typeof diagnostics.usedBundledFallbackBecause === "string"
        ? diagnostics.usedBundledFallbackBecause || null
        : null,
    error: typeof body?.error === "string" ? body.error : null,
    details: typeof body?.details === "string" ? body.details : null,
    price:
      typeof extracted.priceFormatted === "string"
        ? extracted.priceFormatted
        : typeof extracted.priceAmount === "number"
          ? extracted.priceAmount
          : null,
    rating:
      typeof extracted.aggregateRating === "number"
        ? extracted.aggregateRating
        : null,
    reviewCount:
      typeof extracted.reviewCount === "number" ? extracted.reviewCount : null,
    duration:
      typeof extracted.durationText === "string"
        ? extracted.durationText
        : null,
    priceSource:
      typeof diagnostics.commercialPriceFieldPath === "string"
        ? diagnostics.commercialPriceFieldPath
        : null,
    ratingSource:
      typeof diagnostics.ratingFieldPath === "string"
        ? diagnostics.ratingFieldPath
        : null,
    reviewCountSource:
      typeof diagnostics.reviewCountFieldPath === "string"
        ? diagnostics.reviewCountFieldPath
        : null,
    durationSource:
      typeof diagnostics.durationFieldPath === "string"
        ? diagnostics.durationFieldPath
        : null,
    foreignProductUrlRejections: foreignProductUrlRejected.length,
    foreignProductUrlExamples: foreignProductUrlRejected
      .map(candidate => String(candidate.url ?? ""))
      .filter(Boolean)
      .slice(0, 3),
  };
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
  const restoreFetch = installCurlFetch();
  const rows: AuditRow[] = [];

  try {
    const productCodes = [...new Set(ENGINE6_CONFIGURED_PRODUCT_CODES)];
    for (const [index, productCode] of productCodes.entries()) {
      if (index > 0) {
        await sleep(250);
      }
      try {
        const { statusCode, headers, body } = await callHandler(productCode);
        rows.push(toAuditRow(productCode, statusCode, headers, body));
      } catch (error) {
        rows.push({
          productCode,
          httpStatus: 0,
          authoritySource: "fallback",
          apiSource: null,
          heroAuthority: null,
          fallbackReason: "handler-threw",
          error: error instanceof Error ? error.message : String(error),
          details: null,
          price: null,
          rating: null,
          reviewCount: null,
          duration: null,
          priceSource: null,
          ratingSource: null,
          reviewCountSource: null,
          durationSource: null,
          foreignProductUrlRejections: 0,
          foreignProductUrlExamples: [],
        });
      }
    }
  } finally {
    restoreFetch();
  }

  const liveRows = rows.filter(row => row.authoritySource === "live-api");
  const nonLiveRows = rows.filter(row => row.authoritySource !== "live-api");
  const http422Rows = rows.filter(row => row.httpStatus === 422);
  const foreignProductUrlRejections = rows.reduce(
    (total, row) => total + row.foreignProductUrlRejections,
    0
  );

  const examplesNowLiveBesides6740P7 = liveRows
    .filter(row => row.productCode !== "6740P7")
    .slice(0, 10)
    .map(row => ({
      productCode: row.productCode,
      price: row.price,
      rating: row.rating,
      reviewCount: row.reviewCount,
      duration: row.duration,
      heroAuthority: row.heroAuthority ?? "live-api",
    }));

  const examplesStillFallingBack = nonLiveRows.slice(0, 15).map(row => ({
    productCode: row.productCode,
    httpStatus: row.httpStatus,
    authoritySource: row.authoritySource,
    fallbackReason: row.fallbackReason,
    error: row.error,
    details: row.details,
    foreignProductUrlRejections: row.foreignProductUrlRejections,
  }));

  console.log(
    JSON.stringify(
      {
        totals: {
          totalEngine6PagesChecked: rows.length,
          liveApiAuthorityCount: liveRows.length,
          snapshotFallbackCount: nonLiveRows.length,
          http422Count: http422Rows.length,
          foreignProductUrlRejectionsCount: foreignProductUrlRejections,
          foreignProductUrlRejectedPagesCount: rows.filter(
            row => row.foreignProductUrlRejections > 0
          ).length,
        },
        product6740P7: rows.find(row => row.productCode === "6740P7") ?? null,
        examplesNowLiveBesides6740P7,
        examplesStillFallingBack,
        http422ProductCodes: http422Rows.map(row => ({
          productCode: row.productCode,
          error: row.error,
          details: row.details,
        })),
      },
      null,
      2
    )
  );
};

main().catch(error => {
  console.error(
    error instanceof Error ? (error.stack ?? error.message) : String(error)
  );
  process.exitCode = 1;
});
