import { describe, expect, it } from "vitest";
import { isJTreeHikeTemplate } from "./isJTreeHikeTemplate";

describe("isJTreeHikeTemplate", () => {
  it("matches only the target slug or id", () => {
    expect(isJTreeHikeTemplate({ slug: "hike-and-climb-459591" })).toBe(true);
    expect(isJTreeHikeTemplate({ tourId: "459591" })).toBe(true);
    expect(isJTreeHikeTemplate({ slug: "other-joshua-tree-tour" })).toBe(false);
    expect(isJTreeHikeTemplate({ tourId: "123456" })).toBe(false);
  });
});
