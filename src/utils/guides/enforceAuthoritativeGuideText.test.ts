import { describe, expect, it } from "vitest";
import {
  cleanCannedPhrases,
  isTier1ProtectedGuide,
  rewriteCityIntroFromWiki,
  rewriteLandmarkFromWiki,
  rewriteOnlyForNonTier1,
} from "./enforceAuthoritativeGuideText";

const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

describe("cleanCannedPhrases", () => {
  it("removes banned canned phrases and source labels", () => {
    const cleaned = cleanCannedPhrases(
      "A prominent landmark with coverage for this district cites dated milestones. Source: https://example.com"
    );

    expect(cleaned).not.toMatch(/prominent landmark|coverage for|cites dated milestones/i);
    expect(cleaned).not.toMatch(/\bSource\b/i);
  });
});

describe("rewriteCityIntroFromWiki", () => {
  it("builds authoritative city intro without source language and within range", () => {
    const intro = rewriteCityIntroFromWiki({
      cityName: "Boston",
      stateName: "Massachusetts",
      wikiText:
        "Boston is the capital and most populous city of the Commonwealth of Massachusetts in the United States. It is one of the oldest municipalities in the nation and is known for major universities, historic neighborhoods, and a dense waterfront core. According to historical records, the city played a central role in the American Revolution and developed as a major Atlantic port. Today visitors explore compact districts, waterfront trails, museums, parks, and seasonal events across the metro area.",
    });

    expect(intro).not.toMatch(/\baccording to\b|\bSource\b/i);
    expect(intro).not.toMatch(/prominent landmark|the same article set|coverage for/i);
    expect(words(intro)).toBeLessThanOrEqual(180);
    expect(words(intro)).toBeGreaterThanOrEqual(100);
  });
});

describe("rewriteLandmarkFromWiki", () => {
  it("keeps tier1 output concise, factual, and source-free", () => {
    const text = rewriteLandmarkFromWiki({
      landmarkName: "Griffith Observatory",
      cityName: "Los Angeles",
      stateName: "California",
      tier: "tier1",
      wikiText:
        "Griffith Observatory is an observatory in Los Angeles, California, on the south-facing slope of Mount Hollywood in Griffith Park. Visitors come for planetarium shows, public telescopes, and wide views over the Los Angeles Basin and the Hollywood Sign. The building opened in 1935 and is known for its Art Deco design.",
    });

    expect(text).not.toMatch(/\baccording to\b|\bSource\b/i);
    expect(words(text)).toBeGreaterThanOrEqual(55);
    expect(words(text)).toBeLessThanOrEqual(100);
  });

  it("uses shorter bounds for tier2", () => {
    const text = rewriteLandmarkFromWiki({
      landmarkName: "Public Garden",
      cityName: "Boston",
      tier: "tier2",
      wikiText:
        "The Public Garden is a historic park in Boston. It is known for landscaped paths, lagoons, and central downtown access.",
    });

    expect(words(text)).toBeGreaterThanOrEqual(25);
    expect(words(text)).toBeLessThanOrEqual(70);
  });
});

describe("tier protection", () => {
  it("does not run rewrite for tier1 content", () => {
    const original = "Original Tier-1 city text with curated style.";
    const transformed = rewriteOnlyForNonTier1({
      tier: "tier1",
      originalText: original,
      rewrite: () => "rewritten",
    });

    expect(isTier1ProtectedGuide("tier1")).toBe(true);
    expect(transformed).toBe(original);
  });

  it("does not mutate image URLs when tier1 guide text is processed", () => {
    const tier1Guide = {
      tier: "tier1" as const,
      heroImage: "https://cdn.example.com/hero.jpg",
      cardImage: "https://cdn.example.com/card.jpg",
      landmarks: [
        {
          title: "Spot A",
          imageUrl: "https://cdn.example.com/a.jpg",
          description: "Original landmark copy",
        },
      ],
    };

    const next = {
      ...tier1Guide,
      landmarks: tier1Guide.landmarks.map(item => ({
        ...item,
        description: rewriteOnlyForNonTier1({
          tier: tier1Guide.tier,
          originalText: item.description,
          rewrite: text => cleanCannedPhrases(text),
        }),
      })),
    };

    expect(next.heroImage).toBe(tier1Guide.heroImage);
    expect(next.cardImage).toBe(tier1Guide.cardImage);
    expect(next.landmarks[0].imageUrl).toBe(tier1Guide.landmarks[0].imageUrl);
  });
});
