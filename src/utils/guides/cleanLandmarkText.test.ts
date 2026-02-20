import { describe, expect, it } from "vitest";
import {
  cleanLandmarkText,
  ensureLength,
  LANDMARK_MAX_WORDS,
  LANDMARK_MIN_WORDS,
} from "./cleanLandmarkText";

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

describe("cleanLandmarkText", () => {
  it("removes canned dataset and article boilerplate", () => {
    const cleaned = cleanLandmarkText(
      "The city has a major waterfront park. Coverage for this landmark includes key facts. The same article set references linked sources. Distinct article language appears in this paragraph."
    );

    expect(cleaned).toBe("The city has a major waterfront park.");
  });

  it("removes source-style wording and fake metrics", () => {
    const cleaned = cleanLandmarkText(
      "Harbor Walk is a practical stop with references and archives notes, plus cross-links for context. The route covers 12 miles and the venue has capacity of 5,000 for events."
    );

    expect(cleaned).not.toMatch(/references|archives|cross-links/i);
    expect(cleaned).not.toMatch(/\b\d[\d,]*(?:\.\d+)?\s*(?:acres?|miles?)\b/i);
    expect(cleaned).not.toMatch(/capacity\s*(?:of\s*)?\d/i);
  });
});

describe("ensureLength", () => {
  it("keeps cleaned text inside the configured word count range", () => {
    const short = cleanLandmarkText(
      "Old Town Plaza includes article set boilerplate and coverage notes with 400 acres mentioned in the fake template."
    );

    const ensured = ensureLength(short, "Santa Fe", "New Mexico", "district");
    const words = wordCount(ensured);

    expect(words).toBeGreaterThanOrEqual(LANDMARK_MIN_WORDS);
    expect(words).toBeLessThanOrEqual(LANDMARK_MAX_WORDS);
    expect(ensured).not.toMatch(/coverage|article set|sources|references/i);
    expect(ensured).not.toMatch(/\b\d[\d,]*(?:\.\d+)?\s*(?:acres?|miles?)\b/i);
  });
});
