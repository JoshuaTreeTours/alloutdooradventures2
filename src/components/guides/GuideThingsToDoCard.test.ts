import { describe, expect, it } from "vitest";
import { getImageUrl } from "./GuideThingsToDoCard";

describe("getImageUrl", () => {
  it("returns undefined for missing or empty values", () => {
    expect(getImageUrl({ title: "A", description: "B" })).toBeUndefined();
    expect(
      getImageUrl({ title: "A", description: "B", imageUrl: "   " })
    ).toBeUndefined();
  });

  it("returns trimmed urls from known image fields", () => {
    expect(
      getImageUrl({
        title: "A",
        description: "B",
        imageURL: " https://example.com/1.jpg ",
      })
    ).toBe("https://example.com/1.jpg");

    expect(
      getImageUrl({
        title: "A",
        description: "B",
        image_link: "https://example.com/2.jpg",
      })
    ).toBe("https://example.com/2.jpg");
  });
});
