import { afterEach, describe, expect, it, vi } from "vitest";

import { getEngine6ViatorTourData } from "./getEngine6ViatorTourData";

describe("getEngine6ViatorTourData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to bundled module payload when API is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    const result = await getEngine6ViatorTourData("11069P1");

    expect(result.source).toBe("bundled-module");
    expect(result.product.productCode).toBe("11069P1");
    expect(result.product.fromPrice).toBe("$299.00");
  });
});
