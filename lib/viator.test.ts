import { beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
  process.env.VIATOR_API_KEY = "test-key";
});

describe("fetchViatorProduct runtime strategy", () => {
  it("uses production Viator API URL by default (not sandbox)", async () => {
    delete process.env.VIATOR_BASE_URL;
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response);

    const { fetchViatorProduct } = await import("./viator");
    await fetchViatorProduct("2335P1");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.viator.com/partner/products/2335P1",
      expect.any(Object)
    );
    expect(fetchSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("api.sandbox.viator.com"),
      expect.anything()
    );
  });

  it("uses fetch as primary in Vercel runtime", async () => {
    process.env.VERCEL = "1";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response);

    const { fetchViatorProduct, fetchViatorWithCurl } = await import("./viator");
    const curlSpy = vi.spyOn({ fetchViatorWithCurl }, "fetchViatorWithCurl");

    await fetchViatorProduct("2335P1");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(curlSpy).not.toHaveBeenCalled();
  });

  it("falls back to curl outside Vercel after ENETUNREACH fetch failure", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("connect ENETUNREACH"));

    const execFileMock = vi.fn((_: string, __: string[], cb: Function) =>
      cb(null, '{"productCode":"2335P1"}\n__CURL_STATUS__:200', "")
    );
    vi.doMock("node:child_process", () => ({ execFile: execFileMock }));

    const { fetchViatorProduct } = await import("./viator");
    const result = await fetchViatorProduct("2335P1");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(execFileMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ productCode: "2335P1" });
  });
});
