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

describe("/api/engine5/viator-product", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.VIATOR_API_KEY;
    delete process.env.VIATOR_BASE_URL;
  });

  it("returns bundled exact payload for 132218P209 when key is missing", async () => {
    const req = { method: "GET", query: { productCode: "132218P209" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers["X-Engine5-Source"]).toBe(
      "bundled-exact-product-payload"
    );
    expect((res.body as any).product.productCode).toBe("132218P209");
  });


  it("includes temporary structured diagnostics when fallback occurs before live fetch", async () => {
    const req = { method: "GET", query: { productCode: "421920P2" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).diagnostics).toEqual(
      expect.objectContaining({
        source: "bundled-fallback",
        reason: "missing-api-key",
        hasViatorApiKey: false,
        attemptedLiveFetch: false,
        upstreamStatus: null,
        upstreamContentType: null,
        upstreamOk: null,
        usedBundledFallbackBecause: "missing-api-key",
      })
    );
  });
  it("returns 500 when key is missing for non-bundled products", async () => {
    const req = { method: "GET", query: { productCode: "999999P001" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "VIATOR_API_KEY is not configured" });
  });

  it("does not use bundled fallback for 6896MOABCPARK when key is missing", async () => {
    const req = { method: "GET", query: { productCode: "6896MOABCPARK" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.headers["X-Engine5-Source"]).toBeUndefined();
    expect(res.body).toEqual({ error: "VIATOR_API_KEY is not configured" });
  });

  it("proxies product request using env base url and api key header", async () => {
    process.env.VIATOR_API_KEY = "server-key";
    process.env.VIATOR_BASE_URL = "https://api.viator.test/partner";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () => JSON.stringify({ product: { productCode: "132218P209" } }),
    } as Response);

    const req = { method: "GET", query: { productCode: "132218P209" } };
    const res = createRes();

    await handler(req, res);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.viator.test/partner/products/132218P209",
      expect.objectContaining({
        headers: expect.objectContaining({ "exp-api-key": "server-key" }),
      })
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ product: { productCode: "132218P209" } });
  });

  it("returns structured JSON success for 421920P2 via bundled fallback on upstream failure", async () => {
    process.env.VIATOR_API_KEY = "server-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      headers: new Headers({ "content-type": "application/json" }),
      text: async () => "upstream error",
    } as Response);

    const req = { method: "GET", query: { productCode: "421920P2" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers["X-Engine5-Source"]).toBe(
      "bundled-exact-product-payload"
    );
    expect((res.body as any).product.productCode).toBe("421920P2");
    expect((res.body as any).diagnostics).toEqual(
      expect.objectContaining({
        source: "bundled-fallback",
        reason: "upstream-not-ok",
        status: 502,
        hasViatorApiKey: true,
        attemptedLiveFetch: true,
        upstreamStatus: 502,
        upstreamOk: false,
        usedBundledFallbackBecause: "upstream-not-ok",
      })
    );
  });

  it("returns structured JSON failure when upstream is non-JSON for non-fallback product", async () => {
    process.env.VIATOR_API_KEY = "server-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html" }),
      text: async () => "<html>not-json</html>",
    } as Response);

    const req = { method: "GET", query: { productCode: "999999P001" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual(
      expect.objectContaining({
        error: "Viator API returned non-JSON payload",
      })
    );
  });

  it("accepts live 421920P2 payload when commercial price is nested under pricing.summary.fromPrice", async () => {
    process.env.VIATOR_API_KEY = "server-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () =>
        JSON.stringify({
          product: {
            productCode: "421920P2",
            title: "Epic Zipline Tour Over The Santa Ynez Valley",
            productUrl:
              "https://www.viator.com/tours/Santa-Barbara/Epic-Zipline-Tour-Over-The-Santa-Ynez-Valley/d4372-421920P2",
            pricing: {
              summary: {
                fromPrice: 139,
              },
              currency: "USD",
            },
          },
        }),
    } as Response);

    const req = { method: "GET", query: { productCode: "421920P2" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers["X-Engine5-Source"]).toBeUndefined();
    expect((res.body as any).product.pricing.summary.fromPrice).toBe(139);
  });

  it("reports diagnostics when live fetch succeeds but price extraction fails", async () => {
    process.env.VIATOR_API_KEY = "server-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () => JSON.stringify({ product: { productCode: "421920P2", media: { images: [{ isCover: true, variants: { FULL: { url: "https://dynamic-media.tacdn.com/media/photo-o/zipline-cover.jpg" } } }] } } }),
    } as Response);

    const req = { method: "GET", query: { productCode: "421920P2" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any).diagnostics).toEqual(
      expect.objectContaining({
        reason: "live-price-missing-or-zero",
        hasViatorApiKey: true,
        attemptedLiveFetch: true,
        upstreamStatus: 200,
        upstreamContentType: "application/json",
        upstreamOk: true,
        livePayloadPrice: null,
        livePriceFieldPath: null,
        heroImageFieldPath: "product.media.images[0].variants.FULL.url",
        usedBundledFallbackBecause: "live-price-missing-or-zero",
      })
    );
  });

});
