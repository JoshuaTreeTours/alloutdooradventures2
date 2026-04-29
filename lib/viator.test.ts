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
    const execFileMock = vi.fn((_: string, args: string[], cb: Function) =>
      cb(null, '{"productCode":"2335P1"}\n__CURL_STATUS__:200', "")
    );
    vi.doMock("node:child_process", () => ({ execFile: execFileMock }));

    const { fetchViatorProduct } = await import("./viator");
    await fetchViatorProduct("2335P1");

    expect(execFileMock).toHaveBeenCalledTimes(1);
    const curlArgs = execFileMock.mock.calls[0]?.[1] as string[];
    expect(curlArgs).toContain("https://api.viator.com/partner/products/2335P1");
    expect(curlArgs.join(" ")).not.toContain("api.sandbox.viator.com");
  });

  it("uses curl as primary in Vercel runtime", async () => {
    process.env.VERCEL = "1";
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const execFileMock = vi.fn((_: string, __: string[], cb: Function) =>
      cb(null, '{"productCode":"2335P1"}\n__CURL_STATUS__:200', "")
    );
    vi.doMock("node:child_process", () => ({ execFile: execFileMock }));

    const { fetchViatorProduct } = await import("./viator");

    await fetchViatorProduct("2335P1");

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(execFileMock).toHaveBeenCalledTimes(1);
  });

  it("uses curl outside Vercel without relying on fetch fallback", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const execFileMock = vi.fn((_: string, __: string[], cb: Function) =>
      cb(null, '{"productCode":"2335P1"}\n__CURL_STATUS__:200', "")
    );
    vi.doMock("node:child_process", () => ({ execFile: execFileMock }));

    const { fetchViatorProduct } = await import("./viator");
    const result = await fetchViatorProduct("2335P1");

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(execFileMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ productCode: "2335P1" });
  });
});
