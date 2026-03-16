import { afterEach, describe, expect, it, vi } from "vitest";

import handler from "./viator-product";

type MockResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  status: (code: number) => MockResponse;
  json: (payload: any) => void;
  setHeader: (name: string, value: string) => void;
};

const createMockRes = (): MockResponse => {
  const res: MockResponse = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
  };
  return res;
};

describe("/api/engine6/viator-product", () => {
  const originalKey = process.env.VIATOR_API_KEY;
  const originalFallback = process.env.ENABLE_ENGINE6_BUNDLED_FALLBACK_11069P1;

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalKey === undefined) delete process.env.VIATOR_API_KEY;
    else process.env.VIATOR_API_KEY = originalKey;

    if (originalFallback === undefined) {
      delete process.env.ENABLE_ENGINE6_BUNDLED_FALLBACK_11069P1;
    } else {
      process.env.ENABLE_ENGINE6_BUNDLED_FALLBACK_11069P1 = originalFallback;
    }
  });

  it("handles missing productCode", async () => {
    process.env.VIATOR_API_KEY = "test-key";
    const req = { method: "GET", query: {} };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe("PRODUCT_CODE_REQUIRED");
  });

  it("handles invalid productCode", async () => {
    process.env.VIATOR_API_KEY = "test-key";
    const req = { method: "GET", query: { productCode: "bad-code!" } };
    const res = createMockRes();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe("PRODUCT_CODE_INVALID");
  });

  it("returns 500 when VIATOR_API_KEY is missing", async () => {
    const req = { method: "GET", query: { productCode: "11069P1" } };
    const res = createMockRes();
    delete process.env.VIATOR_API_KEY;

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.code).toBe("VIATOR_API_KEY_MISSING");
  });

  it("returns structured upstream failure JSON", async () => {
    process.env.VIATOR_API_KEY = "test-key";
    const req = { method: "GET", query: { productCode: "11069P1" } };
    const res = createMockRes();

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      text: async () => "upstream down",
    } as Response);

    await handler(req, res);

    expect(res.statusCode).toBe(503);
    expect(res.body.code).toBe("VIATOR_API_ERROR");
    expect(res.body.details).toContain("upstream down");
  });

  it("returns structured unexpected payload JSON", async () => {
    process.env.VIATOR_API_KEY = "test-key";
    const req = { method: "GET", query: { productCode: "11069P1" } };
    const res = createMockRes();

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => null,
    } as Response);

    await handler(req, res);

    expect(res.statusCode).toBe(502);
    expect(res.body.code).toBe("VIATOR_PAYLOAD_INVALID");
  });

  it("returns api product payload when upstream succeeds", async () => {
    process.env.VIATOR_API_KEY = "test-key";
    const req = { method: "GET", query: { productCode: "11069P1" } };
    const res = createMockRes();

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        product: {
          productCode: "11069P1",
          pricing: { summary: { fromPriceFormatted: "$250.00" } },
        },
      }),
    } as Response);

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.source).toBe("api");
    expect(res.body.fallback).toBe(false);
    expect(res.body.product.productCode).toBe("11069P1");
  });
});
