import { afterEach, describe, expect, it, vi } from "vitest";

const getEngine4ViatorTourDataMock = vi.hoisted(() => vi.fn());

vi.mock("../../src/engine4/viator/viatorApi", () => ({
  getEngine4ViatorTourData: getEngine4ViatorTourDataMock,
}));

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

describe("/api/engine4/viator-product", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    getEngine4ViatorTourDataMock.mockReset();
  });

  it("returns strict error when live api is unavailable for 421920P2", async () => {
    getEngine4ViatorTourDataMock.mockResolvedValue({
      productCode: "421920P2",
      title: "Epic Zipline Tour Over The Santa Ynez Valley",
      sourceUrl: "https://www.viator.com/tours/Santa-Barbara/Epic-Zipline",
      fromPrice: "US$199.00",
      provenance: {
        apiFetchAttempted: true,
        apiFetchSucceeded: false,
        fallbackUsed: true,
      },
    });

    const req = { method: "GET", query: { productCode: "421920P2" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(502);
    expect((res.body as any).error).toContain("Live Viator API fetch failed");
  });

  it("returns strict error when api price is missing or zero", async () => {
    getEngine4ViatorTourDataMock.mockResolvedValue({
      productCode: "421920P2",
      title: "Epic Zipline Tour Over The Santa Ynez Valley",
      sourceUrl: "https://www.viator.com/tours/Santa-Barbara/Epic-Zipline",
      fromPrice: "0.00",
      provenance: {
        apiFetchAttempted: true,
        apiFetchSucceeded: true,
        fallbackUsed: false,
      },
    });

    const req = { method: "GET", query: { productCode: "421920P2" } };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(422);
    expect((res.body as any).error).toContain("price is missing or invalid");
  });

  it("returns tour payload for strict product when live api succeeds", async () => {
    getEngine4ViatorTourDataMock.mockResolvedValue({
      productCode: "421920P2",
      title: "Epic Zipline Tour Over The Santa Ynez Valley",
      sourceUrl: "https://www.viator.com/tours/Santa-Barbara/Epic-Zipline",
      fromPrice: "US$199.00",
      provenance: {
        apiFetchAttempted: true,
        apiFetchSucceeded: true,
        fallbackUsed: false,
      },
    });

    const req = { method: "GET", query: { productCode: "421920P2" } };
    const res = createRes();

    await handler(req, res);

    expect(getEngine4ViatorTourDataMock).toHaveBeenCalledWith("421920P2");
    expect(res.statusCode).toBe(200);
    expect((res.body as any).tour.productCode).toBe("421920P2");
    expect(res.headers["Cache-Control"]).toContain("s-maxage=300");
  });
});
