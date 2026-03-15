import { describe, expect, it, vi } from "vitest";

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
  it("returns 500 when VIATOR_API_KEY is missing", async () => {
    const req = { method: "GET", query: { productCode: "11069P1" } };
    const res = createMockRes();

    const original = process.env.VIATOR_API_KEY;
    delete process.env.VIATOR_API_KEY;

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toContain("VIATOR_API_KEY is not configured");

    if (original === undefined) delete process.env.VIATOR_API_KEY;
    else process.env.VIATOR_API_KEY = original;
  });

  it("returns api product payload when upstream succeeds", async () => {
    const req = { method: "GET", query: { productCode: "11069P1" } };
    const res = createMockRes();

    const original = process.env.VIATOR_API_KEY;
    process.env.VIATOR_API_KEY = "test-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        product: { productCode: "11069P1", fromPrice: "$250.00" },
      }),
    } as Response);

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.source).toBe("api");
    expect(res.body.product.fromPrice).toBe("$250.00");

    vi.restoreAllMocks();
    if (original === undefined) delete process.env.VIATOR_API_KEY;
    else process.env.VIATOR_API_KEY = original;
  });
});
