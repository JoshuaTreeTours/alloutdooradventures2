import { describe, expect, it } from "vitest";

import {
  ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS,
  assessViatorPublicPageAvailability,
  assertViatorPublicPageAvailability,
  validateEngine6CityProductAvailability,
} from "./viatorPublicAvailability";

const ACTIVE_PRODUCT_HTML = `
<html>
  <head><title>Yosemite Highlights Small Group Tour</title></head>
  <body>
    <h1>Yosemite Highlights Small Group Tour</h1>
    <button>Check availability</button>
    <script type="application/json">
      {"productCode":"391021P1","title":"Yosemite Highlights Small Group Tour","productStatus":"ACTIVE"}
    </script>
  </body>
</html>
`;

describe("Engine6 Viator public availability governance", () => {
  it("accepts an active public product page for the selected product code", () => {
    const assessment = assessViatorPublicPageAvailability({
      productCode: "391021P1",
      sourceUrl:
        "https://www.viator.com/tours/Yosemite-National-Park/Yosemite-Highlights-Small-Group-Tours/d5265-391021P1",
      finalUrl:
        "https://www.viator.com/tours/Yosemite-National-Park/Yosemite-Highlights-Small-Group-Tours/d5265-391021P1",
      html: ACTIVE_PRODUCT_HTML,
      httpStatus: 200,
    });

    expect(assessment.available).toBe(true);
    expect(assessment.reason).toBeNull();
  });

  it("rejects unavailable wording without depending on one exact phrase", () => {
    const assessment = assessViatorPublicPageAvailability({
      productCode: "3454P41",
      sourceUrl: ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS["3454P41"].sourceUrl,
      finalUrl: ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS["3454P41"].sourceUrl,
      html: "<html><body>This product is no longer available.</body></html>",
      httpStatus: 200,
    });

    expect(assessment.available).toBe(false);
    expect(assessment.reason).toMatch(/unavailable/i);
  });

  it("rejects redirects to a different canonical product code", () => {
    expect(() =>
      assertViatorPublicPageAvailability({
        productCode: "18808P1",
        sourceUrl: ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS["18808P1"].sourceUrl,
        finalUrl:
          "https://www.viator.com/tours/Yosemite-National-Park/Semi-Private-Yosemite-Tour/d5265-18808P14",
        html: ACTIVE_PRODUCT_HTML.replace(/391021P1/g, "18808P14"),
        httpStatus: 200,
      })
    ).toThrow(/18808P1.*18808P14/i);
  });

  it("rejects similar-experiences landing pages that do not resolve to the selected product", () => {
    const assessment = assessViatorPublicPageAvailability({
      productCode: "391021P3",
      sourceUrl: ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS["391021P3"].sourceUrl,
      finalUrl:
        "https://www.viator.com/Yosemite-National-Park/d5265/similar-experiences",
      html: "<html><body><h1>Similar experiences in Yosemite National Park</h1></body></html>",
      httpStatus: 200,
    });

    expect(assessment.available).toBe(false);
    expect(assessment.reason).toMatch(/similar-experiences|replacement/i);
  });

  it("rejects inactive product status markers embedded in public page JSON", () => {
    const assessment = assessViatorPublicPageAvailability({
      productCode: "3454P41",
      sourceUrl: ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS["3454P41"].sourceUrl,
      finalUrl: ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS["3454P41"].sourceUrl,
      html: `<html><script>{"productCode":"3454P41","productStatus":"UNAVAILABLE"}</script></html>`,
      httpStatus: 200,
    });

    expect(assessment.available).toBe(false);
    expect(assessment.reason).toMatch(/inactive|unavailable/i);
  });

  it("returns clear per-product errors for city candidate validation", () => {
    const rejections = validateEngine6CityProductAvailability([
      {
        productCode: "3454P41",
        sourceUrl: ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS["3454P41"].sourceUrl,
        finalUrl: ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS["3454P41"].sourceUrl,
        html: "<html><body>Sorry, this product is unavailable.</body></html>",
      },
      {
        productCode: "391021P1",
        sourceUrl:
          "https://www.viator.com/tours/Yosemite-National-Park/Yosemite-Highlights-Small-Group-Tours/d5265-391021P1",
        finalUrl:
          "https://www.viator.com/tours/Yosemite-National-Park/Yosemite-Highlights-Small-Group-Tours/d5265-391021P1",
        html: ACTIVE_PRODUCT_HTML,
      },
    ]);

    expect(rejections).toHaveLength(1);
    expect(rejections[0]?.productCode).toBe("3454P41");
    expect(rejections[0]?.sourceUrl).toBe(
      ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS["3454P41"].sourceUrl
    );
    expect(String(rejections[0]?.message)).toMatch(/3454P41/);
  });

  it("documents legacy unavailable Viator products removed from Engine6", () => {
    expect(ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS["5765P7"]).toBeDefined();
    expect(ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS["191303P1"]).toBeDefined();
    expect(ENGINE6_KNOWN_UNAVAILABLE_VIATOR_PRODUCTS["118744P4"]).toBeDefined();
  });
});
