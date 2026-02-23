import { describe, expect, it } from "vitest";

import { getEngine2TourByPath } from "../../engine2/data/loadEngine2";
import { getPalmSpringsOverrideContent } from "./palmSpringsPilotContent";
import { parseFareHarborHtml } from "./parseFareHarborHtml";
import {
  BOOK_PATH_34849,
  FAREHARBOR_URL_34849,
  fareHarborHtmlByUrl,
} from "./fareharborBookFixtures";
import { resolveFareHarborUrlFromBookPage } from "./resolveFareHarborUrlFromBookPage";

describe("Palm Springs 34849 override content", () => {
  it("resolves the FareHarbor URL from book path", () => {
    expect(resolveFareHarborUrlFromBookPage(BOOK_PATH_34849)).toBe(
      FAREHARBOR_URL_34849
    );
  });

  it("parses FareHarbor HTML into structured content", () => {
    const parsed = parseFareHarborHtml(fareHarborHtmlByUrl[FAREHARBOR_URL_34849]);
    expect(parsed.title).toContain("Shared San Andreas Fault Jeep Tour");
    expect(parsed.duration).toBe("3 hours");
    expect(parsed.highlights.length).toBeGreaterThan(0);
    expect(parsed.faq.length).toBeGreaterThan(0);
  });

  it("returns non-test override copy for tour 34849", () => {
    const tour = getEngine2TourByPath(
      "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849"
    );
    expect(tour).toBeTruthy();

    const override = getPalmSpringsOverrideContent(tour!);
    expect(override?.enabled).toBe(true);
    expect(override?.content.whatYoullExperience[0]).not.toContain(
      "OVERRIDE TEST SUCCESS"
    );
    expect(override?.content.highlights.length).toBeGreaterThan(0);
  });
});
