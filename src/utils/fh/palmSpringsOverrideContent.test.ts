import { describe, expect, it } from "vitest";

import { getEngine2TourByPath } from "../../engine2/data/loadEngine2";
import {
  getPalmSpringsImage2Url,
  getPalmSpringsOverrideContent,
} from "./palmSpringsPilotContent";
import { parseFareHarborHtml } from "./parseFareHarborHtml";
import {
  BOOK_PATH_34849,
  FAREHARBOR_URL_34849,
  fareHarborHtmlByUrl,
} from "./fareharborBookFixtures";
import { resolveFareHarborUrlFromBookPage } from "./resolveFareHarborUrlFromBookPage";

describe("Palm Springs 34849 override content", () => {
  it("provides a secondary image override URL only for tour 34849", () => {
    expect(getPalmSpringsImage2Url(34849)).toBe(
      "https://cdn.filestackcontent.com/UAlzyhkvRvKmb0Y8JQwU/convert?cache=true&compress=true&quality=90&format=webp&rotate=exif&w=1000&fit=max"
    );
    expect(getPalmSpringsImage2Url(34897)).toBeUndefined();
  });
  it("resolves the FareHarbor URL from book path", () => {
    expect(resolveFareHarborUrlFromBookPage(BOOK_PATH_34849)).toBe(
      FAREHARBOR_URL_34849
    );
  });

  it("parses FareHarbor HTML into structured content", () => {
    const parsed = parseFareHarborHtml(
      fareHarborHtmlByUrl[FAREHARBOR_URL_34849]
    );
    expect(parsed.title).toContain("Shared San Andreas Fault Jeep Tour");
    expect(parsed.duration).toBe("3 hours");
    expect(parsed.meetingPoint.addressLine1).toContain("38635 Monroe St");
    expect(parsed.category.primary).toContain("Jeep tour");
    expect(parsed.category.tags).toContain("geology");
    expect(parsed.pricing.join(" ")).toContain("$175");
    expect(parsed.priceLabel).toBe("$175 adult / $150 child");
    expect(parsed.priceAdult).toBe(175);
    expect(parsed.priceChild).toBe(150);
    expect(parsed.highlights.length).toBeGreaterThan(0);
  });

  it("returns enriched override copy and labels for tour 34849", () => {
    const tour = getEngine2TourByPath(
      "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849"
    );
    expect(tour).toBeTruthy();

    const override = getPalmSpringsOverrideContent(tour!);
    expect(override?.enabled).toBe(true);
    expect(override?.content.category?.primary).toContain("Jeep");
    expect(override?.content.durationLabel).toBe("3 hours");
    expect(override?.content.meetingPoint?.city).toBe("Indio");
    expect(override?.content.heroPriceText).toBe("$175 adult / $150 child");
    expect(override?.content.schemaPrice).toBe(175);
    expect(override?.content.durationISO).toBe("PT3H");
    expect(override?.content.pricing).toMatchObject({
      low: 150,
      high: 175,
      isAggregate: true,
    });
    expect(override?.content.canonicalPath).toBe(tour?.seo.canonicalPath);
    expect(override?.content.whatYoullExperience.length).toBeGreaterThanOrEqual(
      3
    );
    expect(override?.content.whatYoullExperience[0]).toContain(
      "San Andreas Fault"
    );
    expect(override?.content.schemaDescription).toContain("Coachella Valley");
    expect(override?.content.highlights.length).toBeGreaterThanOrEqual(8);
    expect(override?.content.faqs?.length).toBeLessThanOrEqual(5);
    expect(override?.content.faqs?.[0].answer).toContain("Palm Springs");
    expect(override?.content.faqs?.[0].answer).toContain("San Andreas Fault");
    expect(override?.content.whatYoullExperience.join(" ")).not.toContain(
      "OVERRIDE TEST SUCCESS"
    );
  });

  it("returns null override during prerender builds", () => {
    const tour = getEngine2TourByPath(
      "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849"
    );
    expect(tour).toBeTruthy();

    const previousPrerender = process.env.PRERENDER;
    process.env.PRERENDER = "1";

    try {
      const override = getPalmSpringsOverrideContent(tour!);
      expect(override).toBeNull();
    } finally {
      if (previousPrerender === undefined) {
        delete process.env.PRERENDER;
      } else {
        process.env.PRERENDER = previousPrerender;
      }
    }
  });
});
