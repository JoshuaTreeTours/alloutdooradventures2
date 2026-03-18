import { afterEach, describe, expect, it, vi } from "vitest";

import handler from "./viator-product";

const createRes = () => {
  const res: any = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

describe("/api/engine6/viator-product", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.VIATOR_API_KEY;
    delete process.env.VIATOR_API_BASE_URL;
    delete process.env.VIATOR_BASE_URL;
  });

  it("returns diagnostics-rich error when key is missing", async () => {
    const req = { method: "GET", query: { productCode: "163873P16" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect((res.body as any).diagnostics.hasViatorApiKey).toBe(false);
    expect((res.body as any).error).toContain("VIATOR_API_KEY");
  });

  it("uses VIATOR_API_BASE_URL precedence", async () => {
    process.env.VIATOR_API_KEY = "k";
    process.env.VIATOR_API_BASE_URL = "https://primary.viator.test/partner";
    process.env.VIATOR_BASE_URL = "https://secondary.viator.test/partner";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () => JSON.stringify({ product: { productCode: "163873P16", title: "Tour" } }),
    } as Response);

    const req = { method: "GET", query: { productCode: "163873P16" } };
    const res = createRes();

    await handler(req, res);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://primary.viator.test/partner/products/163873P16",
      expect.objectContaining({
        headers: expect.objectContaining({
          "exp-api-key": "k",
          Accept: "application/json;version=2.0",
        }),
      })
    );
    expect(res.statusCode).toBe(200);
    expect((res.body as any).source).toBe("live-api");
  });

  it("returns JSON body for specimen code", async () => {
    process.env.VIATOR_API_KEY = "k";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () =>
        JSON.stringify({
          product: {
            productCode: "163873P16",
            title: "East Zion Top of the World Jeep Tour",
            pricing: { summary: { fromPrice: 129 } },
          },
        }),
    } as Response);

    const req = { method: "GET", query: { productCode: "163873P16" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).rawProductCode).toBe("163873P16");
    expect((res.body as any).extracted.priceAmount).toBe(129);
  });
});
