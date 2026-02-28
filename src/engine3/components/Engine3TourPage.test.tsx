import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Engine3TourPage from "./Engine3TourPage";
import type { Engine3TourViewModel } from "../types";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const posterChildTour: Engine3TourViewModel = {
  tourId: "2335P1",
  title: "San Andreas Fault Jeep Tour from Palm Springs",
  country: "usa",
  city: "palm-springs",
  region: "california",
  canonicalPath:
    "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
  bookingUrl: "https://www.viator.com/tours/Palm-Springs/example",
};

describe("Engine3TourPage", () => {
  it("renders unique Engine3 structured data script id and breadcrumb links", () => {
    const html = renderToStaticMarkup(
      <Engine3TourPage tour={posterChildTour} />
    );

    expect(html).toContain('id="structured-data-engine3-viator"');
    expect(html).toContain("/destinations");
    expect(html).toContain("/destinations/california");
    expect(html).toContain("/destinations/california/palm-springs");
  });
});
