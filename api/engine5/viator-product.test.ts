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

  it("returns 500 when key is missing", async () => {
    const req = { method: "GET", query: { productCode: "132218P209" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "VIATOR_API_KEY is not configured" });
  });

  it("proxies product request using env base url and api key header", async () => {
    process.env.VIATOR_API_KEY = "server-key";
    process.env.VIATOR_BASE_URL = "https://api.viator.test/partner";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ product: { productCode: "132218P209" } }),
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
});
