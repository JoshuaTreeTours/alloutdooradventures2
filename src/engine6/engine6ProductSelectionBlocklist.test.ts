import { describe, expect, it } from "vitest";

import {
  collectEngine6ProductSelectionBlocklistAdditions,
  readEngine6ProductSelectionPermanentBlocklist,
  resolveEngine6ProductSelectionPermanentBlocklistPath,
  shouldPermanentlyBlocklistProductSelectionRejection,
} from "./engine6ProductSelectionBlocklist";

describe("engine6ProductSelectionBlocklist", () => {
  it("flags permanent rejection reasons for blocklist persistence", () => {
    expect(
      shouldPermanentlyBlocklistProductSelectionRejection({
        reason: "cross-destination",
        detail: "wrong destination",
      })
    ).toBe(true);

    expect(
      shouldPermanentlyBlocklistProductSelectionRejection({
        reason: "missing-commercial-fields",
        detail: "missing title",
      })
    ).toBe(false);
  });

  it("collects blocklist additions for permanently rejected products", () => {
    const additions = collectEngine6ProductSelectionBlocklistAdditions({
      rejected: [
        {
          productCode: "FAILP1",
          sourceUrl: "https://www.viator.com/tours/Example/d1-FAILP1",
          experienceType: "day-tour",
          reason: "inactive",
          detail: "Viator API reports inactive status INACTIVE",
        },
        {
          productCode: "FIXP1",
          sourceUrl: "https://www.viator.com/tours/Example/d1-FIXP1",
          experienceType: "day-tour",
          reason: "missing-commercial-fields",
          detail: "missing title",
        },
      ],
      destinationLabel: "Example National Park",
      generatedAt: "2026-07-01T00:00:00.000Z",
      candidateTitlesByCode: {
        FAILP1: "Failed Tour",
      },
    });

    expect(additions).toEqual([
      expect.objectContaining({
        productCode: "FAILP1",
        title: "Failed Tour",
      }),
    ]);
  });

  it("reads the default blocklist path in the repository", () => {
    expect(resolveEngine6ProductSelectionPermanentBlocklistPath()).toContain(
      "product-selection-permanent-blocklist.json"
    );
    expect(readEngine6ProductSelectionPermanentBlocklist()).toEqual({});
  });
});
