import { describe, expect, it } from "vitest";

import { buildEngine3BreadcrumbItems } from "../buildEngine3BreadcrumbItems";

describe("buildEngine3BreadcrumbItems", () => {
  it("builds Palm Springs city breadcrumb with slug href and no %20", () => {
    const items = buildEngine3BreadcrumbItems({
      title: "San Andreas Fault Jeep Tour from Palm Springs",
      canonicalUrl:
        "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
      stateSlug: "california",
      citySlug: "palm-springs",
      city: "Palm Springs",
      region: "California",
    });

    const city = items.find(item => item.label === "Palm Springs");
    expect(city?.href).toBe("/destinations/california/palm-springs");
    expect(city?.href).not.toContain("%20");
  });
});
