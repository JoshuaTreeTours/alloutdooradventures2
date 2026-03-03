import { describe, expect, it } from "vitest";

import { buildEngine3BreadcrumbItems } from "../buildEngine3BreadcrumbItems";

describe("buildEngine3BreadcrumbItems", () => {
  it("builds Palm Springs breadcrumb pointing at tours listing URL", () => {
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
    expect(city?.href).toBe("/tours?state=california&city=palm-springs");
    expect(city?.href).not.toContain("%20");
  });

  it("normalizes encoded city slugs so Palm Springs never routes to %20 URLs", () => {
    const items = buildEngine3BreadcrumbItems({
      title: "San Andreas Fault Jeep Tour from Palm Springs",
      canonicalUrl:
        "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
      stateSlug: "california",
      citySlug: "palm%20springs",
      city: "Palm Springs",
      region: "California",
    });

    const city = items.find(item => item.label === "Palm Springs");
    expect(city?.href).toBe("/tours?state=california&city=palm-springs");
  });

  it("builds Palm Springs breadcrumb URL for 6740P7 routes", () => {
    const items = buildEngine3BreadcrumbItems({
      title: "Joshua Tree Backroads Hummer H2 Tour",
      canonicalUrl:
        "/destinations/california/palm-springs/tours/joshua-tree-backroads-hummer-h2-tour-6740p7",
      stateSlug: "california",
      citySlug: "Palm Springs",
      city: "Palm Springs",
      region: "California",
    });

    const city = items.find(item => item.label === "Palm Springs");
    expect(city?.href).toContain("city=palm-springs");
    expect(city?.href).toBe("/tours?state=california&city=palm-springs");
  });
});
