import { describe, expect, it } from "vitest";
import {
  cleanLandmarkText,
  ensureLength,
  LANDMARK_MAX_WORDS,
  LANDMARK_MIN_WORDS,
} from "./cleanLandmarkText";

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
const sentenceCount = (text: string) =>
  text.split(/(?<=[.!?])\s+/).filter(Boolean).length;

describe("cleanLandmarkText", () => {
  it("removes canned boilerplate and third-party reference language", () => {
    const cleaned = cleanLandmarkText(
      "City Museum is in the downtown core with architecture from the early twentieth century. The same article set references nearby sources. Coverage for this attraction cites dated milestones. According to Wikipedia says this page is essential. Visitors can tour galleries and learn local history in one stop.",
      { landmarkName: "City Museum", city: "Portland", state: "Oregon" }
    );

    expect(cleaned).not.toMatch(
      /article|coverage|dataset|design briefs|archives|records|source\s*:|according to|wikipedia says|this page|this article/i
    );
    expect(cleaned).toMatch(/City Museum|Visitors can tour galleries/i);
    expect(sentenceCount(cleaned)).toBeGreaterThanOrEqual(2);
  });

  it("falls back to a clean two-sentence authoritative description", () => {
    const cleaned = cleanLandmarkText(
      "Source: Wikipedia says this article has coverage data and archives records.",
      {
        landmarkName: "Riverfront Walk",
        city: "Portland",
        state: "Oregon",
      }
    );

    expect(cleaned).toContain("Riverfront Walk is a well-known stop in Portland, Oregon");
    expect(sentenceCount(cleaned)).toBeGreaterThanOrEqual(2);
    expect(cleaned).not.toMatch(/source|wikipedia says|according to|article|coverage/i);
  });
});

describe("ensureLength", () => {
  it("keeps cleaned text inside the configured word count range", () => {
    const short = cleanLandmarkText(
      "Old Town Plaza includes article set boilerplate. Visitors can walk the historic blocks and local storefronts.",
      {
        landmarkName: "Old Town Plaza",
        city: "Santa Fe",
        state: "New Mexico",
      }
    );

    const ensured = ensureLength(short, "Santa Fe", "New Mexico", "district");
    const words = wordCount(ensured);

    expect(words).toBeGreaterThanOrEqual(LANDMARK_MIN_WORDS);
    expect(words).toBeLessThanOrEqual(LANDMARK_MAX_WORDS);
  });
});
