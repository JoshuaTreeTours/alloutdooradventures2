import { describe, expect, it } from "vitest";

import {
  buildInternationalGuideCanonicalizationAudit,
  normalizeDestinationName,
  type InternationalGuideCandidate,
} from "./international-guide-canonicalization-audit-core";

const candidate = (
  country: string,
  countrySlug: string,
  cityName: string,
  citySlug: string,
  tourCount = 1
): InternationalGuideCandidate => ({
  country,
  countrySlug,
  cityName,
  citySlug,
  tourCount,
  sourceLabel: "sample regression inventory",
  guideUrl: `/guides/world/${countrySlug}/${citySlug}`,
  destinationUrl: `/destinations/world/${countrySlug}/cities/${citySlug}`,
});

const sampleCandidates: InternationalGuideCandidate[] = [
  candidate("Portugal", "portugal", "Lisbon", "lisbon", 3),
  candidate("Portugal", "portugal", "Lisboa", "lisboa", 2),
  candidate("Austria", "austria", "Vienna", "vienna", 3),
  candidate("Austria", "austria", "Wien", "wien", 2),
  candidate("Germany", "germany", "Munich", "munich", 3),
  candidate("Germany", "germany", "München", "munchen", 2),
  candidate("Netherlands", "netherlands", "The Hague", "the-hague", 3),
  candidate("Netherlands", "netherlands", "Den Haag", "den-haag", 2),
  candidate("Denmark", "denmark", "Copenhagen", "copenhagen", 3),
  candidate("Denmark", "denmark", "København", "kobenhavn", 2),
  candidate("Poland", "poland", "Krakow", "krakow", 3),
  candidate("Poland", "poland", "Kraków", "krakow-accented", 2),
  candidate("Latvia", "latvia", "Riga", "riga", 3),
  candidate("Latvia", "latvia", "Rīga", "riga-accented", 2),
  candidate("France", "france", "Paris", "paris", 5),
];

describe("international guide canonicalization audit", () => {
  it("normalizes case, diacritics, punctuation, and whitespace conservatively", () => {
    expect(normalizeDestinationName("  Rīga!! ")).toBe("riga");
    expect(normalizeDestinationName("København")).toBe("kobenhavn");
    expect(normalizeDestinationName("The   Hague")).toBe("the hague");
  });

  it("flags native-language, English, transliteration, and diacritic sample duplicate city guides", () => {
    const report = buildInternationalGuideCanonicalizationAudit(
      sampleCandidates,
      "2026-06-12T00:00:00.000Z"
    );

    const clustersByCountry = new Map(
      report.clusters.map(cluster => [cluster.countrySlug, cluster])
    );

    expect(clustersByCountry.get("portugal")?.duplicateVariantSlugs).toEqual([
      "lisboa",
      "lisbon",
    ]);
    expect(clustersByCountry.get("austria")?.duplicateVariantSlugs).toEqual([
      "vienna",
      "wien",
    ]);
    expect(clustersByCountry.get("germany")?.duplicateVariantSlugs).toEqual([
      "munchen",
      "munich",
    ]);
    expect(clustersByCountry.get("netherlands")?.duplicateVariantSlugs).toEqual(
      ["den-haag", "the-hague"]
    );
    expect(clustersByCountry.get("denmark")?.duplicateVariantSlugs).toEqual([
      "copenhagen",
      "kobenhavn",
    ]);
    expect(clustersByCountry.get("poland")?.duplicateVariantSlugs).toEqual([
      "krakow",
      "krakow-accented",
    ]);
    expect(clustersByCountry.get("latvia")?.duplicateVariantSlugs).toEqual([
      "riga",
      "riga-accented",
    ]);
    expect(clustersByCountry.has("france")).toBe(false);
  });

  it("keeps matching scoped to the same country", () => {
    const report = buildInternationalGuideCanonicalizationAudit([
      candidate("Portugal", "portugal", "Lisbon", "lisbon"),
      candidate("Canada", "canada", "Lisbon", "lisbon"),
    ]);

    expect(report.clusters).toHaveLength(0);
  });
});
