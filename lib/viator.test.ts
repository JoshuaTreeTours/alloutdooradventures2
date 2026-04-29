import { beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const execFileMock = vi.fn();

vi.mock("node:child_process", () => ({
  execFile: execFileMock,
}));

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
  process.env.VIATOR_API_KEY = "test-key";
  execFileMock.mockReset();
  execFileMock.mockImplementation((_: string, __: string[], cb: Function) =>
    cb(null, '{"ok":true}', "")
  );
});

describe("fetchViatorProduct base URL defaults", () => {
  it("uses production Viator API URL by default", async () => {
    delete process.env.VIATOR_BASE_URL;

    const { fetchViatorProduct } = await import("./viator");
    await fetchViatorProduct("2335P1");

    expect(execFileMock).toHaveBeenCalledWith(
      "curl",
      expect.arrayContaining([
        "https://api.viator.com/partner/products/2335P1",
      ]),
      expect.any(Function)
    );

    const curlArgs = execFileMock.mock.calls[0][1] as string[];
    expect(curlArgs).not.toContain(
      "https://api.sandbox.viator.com/partner/products/2335P1"
    );
  });

  it("honors VIATOR_BASE_URL override when provided", async () => {
    process.env.VIATOR_BASE_URL = "https://api.viator.test/partner";

    const { fetchViatorProduct } = await import("./viator");
    await fetchViatorProduct("2335P1");

    expect(execFileMock).toHaveBeenCalledWith(
      "curl",
      expect.arrayContaining([
        "https://api.viator.test/partner/products/2335P1",
      ]),
      expect.any(Function)
    );
  });
});
