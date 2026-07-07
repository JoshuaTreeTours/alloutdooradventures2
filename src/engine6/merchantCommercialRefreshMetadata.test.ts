import { describe, expect, it } from "vitest";

import {
  assertMerchantCommercialRefreshFresh,
  assessMerchantCommercialRefreshStaleness,
  buildMerchantCommercialRefreshMetadata,
} from "./merchantCommercialRefreshMetadata";

describe("merchant commercial refresh metadata", () => {
  it("fails stale commercial refresh metadata older than the allowed window", () => {
    const stale = buildMerchantCommercialRefreshMetadata(
      new Date("2026-06-28T00:00:00.000Z")
    );
    const now = new Date("2026-07-06T00:00:00.000Z");

    const result = assessMerchantCommercialRefreshStaleness(stale, now, 7);

    expect(result.pass).toBe(false);
    expect(result.message).toContain("stale");
    expect(() => assertMerchantCommercialRefreshFresh(stale, now, 7)).toThrow(
      /stale/
    );
  });
});
