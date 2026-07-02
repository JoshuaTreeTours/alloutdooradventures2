import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  formatEngine6ParagonGovernancePipelineReport,
  requireEngine6ParagonGovernanceBeforeArtifacts,
  runEngine6ParagonGovernancePipeline,
} from "./engine6ParagonGovernancePipeline";
import { parseEngine6ParagonProductSelectionConfigFromJson } from "./normalizeEngine6ParagonProductSelectionConfig";
import type { Engine6LiveViatorValidationResult } from "./engine6LiveViatorProductionValidation";

const GLACIER_CONFIG_PATH = path.resolve(
  "scripts/glacier-product-selection.json"
);

const buildValidationResult = (
  productCode: string,
  sourceUrl: string
): Engine6LiveViatorValidationResult => ({
  productCode,
  sourceUrl,
  passed: true,
  publicPageAvailable: true,
  apiConfirmedActive: true,
  canonicalProductCodeMatches: true,
  merchantUrlMatches: true,
  bookable: true,
  knownUnavailableBlocklistHit: false,
  reason: null,
});

describe("Glacier product selection strict validation", () => {
  it("normalizes the Glacier Paragon product selection config", () => {
    const parsed = parseEngine6ParagonProductSelectionConfigFromJson(
      readFileSync(GLACIER_CONFIG_PATH, "utf8")
    );

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      throw new Error(parsed.issues.map(issue => issue.detail).join("; "));
    }

    expect(parsed.config.destinationLabel).toBe("Glacier National Park");
    expect(parsed.config.stateSlug).toBe("montana");
    expect(parsed.config.citySlug).toBe("glacier-national-park");
    expect(parsed.config.slots.length).toBeGreaterThanOrEqual(4);
    expect(
      parsed.config.slots.some(slot => slot.experienceType === "driving-tour")
    ).toBe(true);
  });

  it("runs the shared Paragon pipeline with hero integrity before fixture binding", async () => {
    const configJson = readFileSync(GLACIER_CONFIG_PATH, "utf8");
    const normalized = parseEngine6ParagonProductSelectionConfigFromJson(configJson);
    expect(normalized.ok).toBe(true);
    if (!normalized.ok) {
      throw new Error("config normalization failed");
    }

    const report = await runEngine6ParagonGovernancePipeline({
      config: normalized.config,
      mode: "strict",
      validateCandidate: async candidate =>
        buildValidationResult(candidate.productCode, candidate.sourceUrl),
      liveProductHeroUrls: {
        "GLACIER-DRIVE-PRIMARY": {
          primaryHeroUrl:
            "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/drive/01/01.jpg",
        },
        "GLACIER-DRIVE-BACKUP": {
          primaryHeroUrl:
            "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/drive/02/02.jpg",
        },
        "GLACIER-HIKE-PRIMARY": {
          primaryHeroUrl:
            "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/8d/68/f9.jpg",
        },
        "GLACIER-RAFT-PRIMARY": {
          primaryHeroUrl:
            "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/7f/49/38.jpg",
        },
        "GLACIER-BOAT-PRIMARY": {
          primaryHeroUrl:
            "https://media.tacdn.com/media/attractions-splice-spp-674x446/bb/oat/01/01.jpg",
        },
      },
      currentHeroUrlsByProductCode: {
        "GLACIER-DRIVE-PRIMARY":
          "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/7f/49/38.jpg",
      },
      assertBuildGates: true,
      targetBuildStage: "fixtures",
      priorCompletedBuildStages: [],
    });

    expect(report.passed).toBe(true);
    expect(report.heroIntegrityPassed).toBe(true);
    expect(report.productBinding?.passed).toBe(true);
    expect(report.productSelection?.productsAccepted).toBe(5);
    expect(
      report.heroIntegrity?.resolutions.find(
        entry => entry.productCode === "GLACIER-DRIVE-PRIMARY"
      )?.resolvedHeroUrl
    ).toContain("/aa/drive/01/01.jpg");
    expect(
      report.heroIntegrity?.resolutions.find(
        entry => entry.productCode === "GLACIER-DRIVE-PRIMARY"
      )?.replacedHeroUrl
    ).toContain("/0a/7f/49/38.jpg");
    expect(report.duplicateValidationLogicIntroduced).toBe(false);
    expect(formatEngine6ParagonGovernancePipelineReport(report)).toContain(
      "Hero integrity passed: true"
    );
  });

  it("blocks artifact generation when Paragon governance fails", async () => {
    const report = await runEngine6ParagonGovernancePipeline({
      config: {
        destinationLabel: "Invalid",
        stateSlug: "",
        citySlug: "",
        slots: [],
      },
      mode: "strict",
    });

    expect(report.passed).toBe(false);
    expect(() =>
      requireEngine6ParagonGovernanceBeforeArtifacts({
        paragonReport: report,
        artifactKind: "fixtures",
      })
    ).toThrow(/Paragon governance must pass/);
  });
});
