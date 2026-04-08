import { afterEach, describe, expect, it } from "vitest";

import { resolveViatorApiKey, resolveViatorBaseUrl } from "./runtimeConfig";

const reset = () => {
  delete process.env.VIATOR_API_KEY;
  delete process.env.VIATOR_PARTNER_API_KEY;
  delete process.env.ENGINE6_VIATOR_API_KEY;
  delete process.env.VIATOR_API_BASE_URL;
  delete process.env.VIATOR_BASE_URL;
  delete process.env.VIATOR_PARTNER_BASE_URL;
  delete process.env.ENGINE6_VIATOR_API_BASE_URL;
};

afterEach(reset);

describe("viator runtimeConfig", () => {
  it("prefers VIATOR_API_KEY before aliases", () => {
    process.env.VIATOR_PARTNER_API_KEY = "partner";
    process.env.VIATOR_API_KEY = "primary";

    expect(resolveViatorApiKey()).toBe("primary");
  });

  it("falls back to partner/engine aliases", () => {
    process.env.VIATOR_PARTNER_API_KEY = "partner";
    expect(resolveViatorApiKey()).toBe("partner");

    delete process.env.VIATOR_PARTNER_API_KEY;
    process.env.ENGINE6_VIATOR_API_KEY = "engine6";
    expect(resolveViatorApiKey()).toBe("engine6");
  });

  it("normalizes configured base URL and supports aliases", () => {
    process.env.VIATOR_PARTNER_BASE_URL = "https://api.viator.test/partner/";
    expect(resolveViatorBaseUrl()).toBe("https://api.viator.test/partner");
  });
});
