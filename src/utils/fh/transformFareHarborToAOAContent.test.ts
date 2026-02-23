import { describe, expect, it } from "vitest";

import { transformFareHarborToAOAContent } from "./transformFareHarborToAOAContent";

describe("transformFareHarborToAOAContent", () => {
  it("adds geology authority context for fault tours", () => {
    const content = transformFareHarborToAOAContent(
      "San Andreas Fault Jeep Tour",
      {
        rawHighlights: ["Travel with a guide"],
      },
      { tourSlug: "san-andreas-fault-jeep-tour" }
    );

    expect(content.highlights?.join(" ")).toMatch(
      /San Andreas|transform boundary/i
    );
    expect(content.whyThisLandscapeMatters?.length).toBeGreaterThan(0);
    expect(content.experienceInDepth?.length).toBeGreaterThanOrEqual(4);
  });

  it("maps jeep and hiking activity context into highlights", () => {
    const content = transformFareHarborToAOAContent(
      "Indian Canyons Hiking Jeep Tour",
      {
        rawHighlights: ["Guide-led route"],
      },
      { tourSlug: "indian-canyons-hiking-jeep-tour" }
    );

    const text = content.highlights?.join(" ") ?? "";
    expect(text).toMatch(/off-road desert terrain|Jeep routes/i);
    expect(text).toMatch(/Hiking segments make terrain/i);
  });

  it("varies opening sentence structure across Palm Springs tours", () => {
    const first = transformFareHarborToAOAContent(
      "San Andreas Fault Adventure",
      {},
      { tourSlug: "san-andreas-fault-adventure" }
    );
    const second = transformFareHarborToAOAContent(
      "Indian Canyons Oasis Walk",
      {},
      { tourSlug: "indian-canyons-oasis-walk" }
    );

    const firstOpening = first.whatYoullExperience?.split(".")[0];
    const secondOpening = second.whatYoullExperience?.split(".")[0];
    expect(firstOpening).toBeTruthy();
    expect(secondOpening).toBeTruthy();
    expect(firstOpening).not.toEqual(secondOpening);
  });
});
