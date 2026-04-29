import { beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
  process.env.VIATOR_API_KEY = "test-key";
});

describe("fetchViatorProduct base URL defaults", () => {
  it("uses production Viator API URL by default", async () => {
    delete process.env.VIATOR_BASE_URL;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { fetchViatorProduct } = await import("./viator");
    await fetchViatorProduct("2335P1");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.viator.com/partner/products/2335P1",
      expect.any(Object)
    );
  });

  it("honors VIATOR_BASE_URL override when provided", async () => {
    process.env.VIATOR_BASE_URL = "https://api.viator.test/partner";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { fetchViatorProduct } = await import("./viator");
    await fetchViatorProduct("2335P1");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.viator.test/partner/products/2335P1",
      expect.any(Object)
    );
  });
});
