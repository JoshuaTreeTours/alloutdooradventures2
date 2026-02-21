import { describe, expect, it } from "vitest";
import { shouldPreserveGuideContent } from "./shouldPreserveGuideContent";

describe("shouldPreserveGuideContent", () => {
  it("returns false for plain text tier2 guides without image embeds", () => {
    expect(
      shouldPreserveGuideContent({
        tier: "tier2",
        thingsToDo: [{ title: "A", description: "Plain description" }],
      })
    ).toBe(false);
  });

  it("returns true when things-to-do include image fields", () => {
    expect(
      shouldPreserveGuideContent({
        tier: "tier2",
        thingsToDo: [
          { title: "A", description: "Desc", imageUrl: "https://img.jpg" },
        ],
      })
    ).toBe(true);
  });
});
