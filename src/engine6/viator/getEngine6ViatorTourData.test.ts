import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getEngine6ViatorTourData } from "./getEngine6ViatorTourData";

describe("getEngine6ViatorTourData", () => {
  const originalFallback = process.env.ENABLE_ENGINE6_BUNDLED_FALLBACK_11069P1;

  beforeEach(() => {
    delete process.env.ENABLE_ENGINE6_BUNDLED_FALLBACK_11069P1;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalFallback === undefined) {
      delete process.env.ENABLE_ENGINE6_BUNDLED_FALLBACK_11069P1;
    } else {
      process.env.ENABLE_ENGINE6_BUNDLED_FALLBACK_11069P1 = originalFallback;
    }
  });

  it("uses api payload when endpoint succeeds", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        product: { productCode: "11069P1", fromPrice: "$321.00" },
      }),
    } as Response);

    const result = await getEngine6ViatorTourData("11069P1");

    expect(result.source).toBe("api");
    expect(result.product.fromPrice).toBe("$321.00");
  });

  it("does not silently use fallback unless explicitly enabled", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    await expect(getEngine6ViatorTourData("11069P1")).rejects.toThrow(
      "ENABLE_ENGINE6_BUNDLED_FALLBACK_11069P1=true"
    );
  });

  it("uses bundled module only when fallback flag is enabled", async () => {
    process.env.ENABLE_ENGINE6_BUNDLED_FALLBACK_11069P1 = "true";

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
