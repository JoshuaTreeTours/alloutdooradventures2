import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  auditEngine6DescriptionTitleGovernance,
  auditEngine6LiveViatorGovernanceFindings,
  auditEngine6MerchantFeedCommercialRefreshGovernance,
  auditEngine6MerchantFeedImageGovernanceFindings,
  auditEngine6RemovedProductSurfaceParity,
  buildEngine6Stage2GovernanceAudit,
  buildEngine6Stage2GovernanceAuditReport,
  classifyEngine6Stage2FindingSeverity,
  createEngine6Stage2GovernanceFinding,
  formatEngine6Stage2GovernanceAuditMarkdown,
  isEngine6Stage2StrictScopeProduct,
  parseSitemapTourPaths,
  resolveEngine6Stage2ScopedProductCodes,
} from "./engine6Stage2GovernanceAudit";
import {
  buildMerchantFeedBranchScopedGovernanceByProductCode,
  buildMerchantFeedPublishedBaselineCatalog,
} from "../../api/engine6/merchantFeedBaselineGovernance";
import type { Engine6Tour } from "./types";

const buildTour = (overrides: Partial<Engine6Tour> = {}): Engine6Tour =>
  ({
    productCode: "TESTP1",
    title: "Test Tour",
    seoTitle: "Test Tour",
    seoDescription: "Test description",
    description: "Test description",
    metaDescription: "Test description",
    city: "Monterey",
    state: "California",
    resolvedImageUrl: null,
    heroImageUrl:
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg",
    resolvedHero: null,
    priceAmount: 99,
    priceFormatted: "$99.00",
    aggregateRating: 4.8,
    reviewCount: 10,
    meetingPointText: "Meet at the pier",
    overviewText: "Overview",
    highlights: [],
    itinerary: [],
    faqs: [],
    included: [],
    requirements: [],
    primaryCategory: "adventure-tour",
    categories: ["adventure-tour"],
    primaryDisplayCategory: "Adventure",
    activityCategories: [],
    categoryLabel: "Adventure",
    pagePath: "/destinations/california/monterey/tours/test-tour",
    canonicalPath: "/destinations/california/monterey/tours/test-tour",
    bookingUrl: "https://example.com/book",
    ownership: {
      routeOwner: "viator",
      ctaOwner: "viator",
      presentationOwner: "engine6",
      commercialOwner: "viator",
      commercialFallbackReason: "none",
    },
    diagnostics: {} as Engine6Tour["diagnostics"],
    ...overrides,
  }) as Engine6Tour;

describe("engine6Stage2GovernanceAudit scope", () => {
  it("classifies only deploy-scoped products as blocking in pr-scoped mode", () => {
    expect(
      classifyEngine6Stage2FindingSeverity({
        governanceMode: "warn",
        mode: "pr-scoped",
        productCode: "LEGACYP1",
        scopedProductCodes: new Set(["NEWP1"]),
      })
    ).toBe("legacy");

    expect(
      classifyEngine6Stage2FindingSeverity({
        governanceMode: "warn",
        mode: "pr-scoped",
        productCode: "NEWP1",
        scopedProductCodes: new Set(["NEWP1"]),
      })
    ).toBe("blocking");

    expect(
      isEngine6Stage2StrictScopeProduct("NEWP1", new Set(["NEWP1"]))
    ).toBe(true);
    expect(
      isEngine6Stage2StrictScopeProduct("LEGACYP1", new Set(["NEWP1"]))
    ).toBe(false);
  });

  it("includes branch-modified product codes in scoped scope", () => {
    const resolution = resolveEngine6Stage2ScopedProductCodes({
      mode: "pr-scoped",
      branchModifiedProductCodes: new Set(["BRANCHP1"]),
    });

    expect(resolution.scopedProductCodes).toContain("BRANCHP1");
  });

  it("creates findings with expected severity", () => {
    const blocking = createEngine6Stage2GovernanceFinding({
      area: "description-title",
      productCode: "NEWP1",
      message: "example",
      governanceMode: "warn",
      mode: "pr-scoped",
      scopedProductCodes: new Set(["NEWP1"]),
    });
    const legacy = createEngine6Stage2GovernanceFinding({
      area: "description-title",
      productCode: "OLDP1",
      message: "example",
      governanceMode: "warn",
      mode: "pr-scoped",
      scopedProductCodes: new Set(["NEWP1"]),
    });

    expect(blocking.severity).toBe("blocking");
    expect(legacy.severity).toBe("legacy");
  });

  it("treats unchanged sibling destination products as legacy in removal-only PR scope", () => {
    const tour = buildTour({
      productCode: "7886P3",
      title: "Canonical Title",
    });
    const merchantRowsByProductCode = new Map([
      [
        "7886P3",
        {
          title: "Wrong Title",
          description: "Wrong description",
        },
      ],
    ]);
    const baselineCatalog = buildMerchantFeedPublishedBaselineCatalog([
      {
        id: "7886P3",
        price: "249 USD",
        average_rating: "5.0",
        rating_count: "177",
        review_count: "177",
      },
    ]);
    const governanceByProductCode =
      buildMerchantFeedBranchScopedGovernanceByProductCode(
        [
          {
            id: "7886P3",
            price: "249 USD",
            average_rating: "5.0",
            rating_count: "177",
            review_count: "177",
          },
        ],
        baselineCatalog,
        new Set(["108446P2"])
      );

    expect(governanceByProductCode.get("7886P3")).toBe(
      "unchanged-legacy-baseline"
    );

    const descriptionFindings = auditEngine6DescriptionTitleGovernance({
      tours: [tour],
      merchantRowsByProductCode,
      mode: "pr-scoped",
      scopedProductCodes: new Set(["108446P2"]),
    });
    const commercialFindings = auditEngine6MerchantFeedCommercialRefreshGovernance(
      {
        tours: [tour],
        merchantRowsByProductCode,
        baselineRows: [
          {
            id: "7886P3",
            price: "249 USD",
            average_rating: "5.0",
            rating_count: "177",
            review_count: "177",
          },
        ],
        governanceByProductCode,
        governanceMode: "warn",
        mode: "pr-scoped",
        scopedProductCodes: new Set(["108446P2"]),
      }
    );

    expect(
      descriptionFindings.every(finding => finding.severity === "legacy")
    ).toBe(true);
    expect(
      commercialFindings.every(finding => finding.severity === "legacy")
    ).toBe(true);
  });

  it("blocks incomplete removal cleanup for deleted deploy-scoped products", () => {
    const findings = auditEngine6RemovedProductSurfaceParity({
      removedProductCodes: new Set(["108446P2"]),
      merchantRowsByProductCode: new Map([
        [
          "108446P2",
          {
            link: "https://www.alloutdooradventures.com/destinations/arizona/grand-canyon-national-park/tours/biblical-creation-sunset-tour-108446P2",
          },
        ],
      ]),
      sitemapTourPaths: new Set([
        "/destinations/arizona/grand-canyon-national-park/tours/biblical-creation-sunset-tour-108446P2",
      ]),
      mode: "pr-scoped",
      scopedProductCodes: new Set(["108446P2"]),
    });

    expect(findings.some(finding => finding.severity === "blocking")).toBe(true);
    expect(findings.map(finding => finding.message)).toEqual(
      expect.arrayContaining([
        "removed product still has a merchantFeed.csv row",
        expect.stringContaining("removed product still appears in sitemap-tours.xml"),
      ])
    );
  });
});

describe("engine6Stage2GovernanceAudit helpers", () => {
  it("parses sitemap tour paths", () => {
    const paths = parseSitemapTourPaths(`
      <url><loc>https://www.alloutdooradventures.com/destinations/california/monterey/tours/example-123</loc></url>
    `);

    expect(paths.has("/destinations/california/monterey/tours/example-123")).toBe(
      true
    );
  });

  it("partitions live Viator failures into blocking and legacy findings", () => {
    const findings = auditEngine6LiveViatorGovernanceFindings({
      governanceMode: "warn",
      mode: "pr-scoped",
      scopedProductCodes: new Set(["NEWP1"]),
      report: {
        mode: "pr-scoped",
        governanceMode: "warn",
        passed: true,
        blockingPassed: true,
        skipped: false,
        skipReason: null,
        credentialsRequired: true,
        credentialsAvailable: true,
        scopedProductCodes: ["NEWP1"],
        validatedAt: "2026-07-01T00:00:00.000Z",
        results: [],
        failures: [],
        blockingFailures: [
          {
            productCode: "NEWP1",
            sourceUrl: "https://example.com",
            passed: false,
            publicPageAvailable: false,
            apiConfirmedActive: false,
            canonicalProductCodeMatches: true,
            merchantUrlMatches: true,
            bookable: false,
            knownUnavailableBlocklistHit: false,
            reason: "blocking failure",
          },
        ],
        legacyFailures: [
          {
            productCode: "LEGACYP1",
            sourceUrl: "https://example.com",
            passed: false,
            publicPageAvailable: false,
            apiConfirmedActive: false,
            canonicalProductCodeMatches: true,
            merchantUrlMatches: true,
            bookable: false,
            knownUnavailableBlocklistHit: false,
            reason: "legacy failure",
          },
        ],
      },
    });

    expect(findings).toEqual([
      expect.objectContaining({
        area: "live-viator",
        productCode: "NEWP1",
        severity: "blocking",
      }),
      expect.objectContaining({
        area: "live-viator",
        productCode: "LEGACYP1",
        severity: "legacy",
      }),
    ]);
  });

  it("flags description/title mismatches for scoped products only", () => {
    const tour = buildTour({
      productCode: "NEWP1",
      title: "Canonical Title",
    });
    const findings = auditEngine6DescriptionTitleGovernance({
      tours: [tour],
      merchantRowsByProductCode: new Map([
        [
          "NEWP1",
          {
            title: "Wrong Title",
            description: "Wrong description",
          },
        ],
      ]),
      mode: "pr-scoped",
      scopedProductCodes: new Set(["NEWP1"]),
    });

    expect(findings.some(finding => finding.severity === "blocking")).toBe(true);
  });

  it("formats a consolidated markdown report", () => {
    const markdown = formatEngine6Stage2GovernanceAuditMarkdown(
      buildEngine6Stage2GovernanceAuditReport({
        governanceMode: "warn",
        mode: "pr-scoped",
        scopedProductCodes: ["NEWP1"],
        scopedDestinationLabels: ["Monterey"],
        fullSiteValidation: false,
        findings: [
          {
            area: "live-viator",
            productCode: "LEGACYP1",
            severity: "legacy",
            message: "legacy failure",
          },
        ],
      })
    );

    expect(markdown).toContain("Engine6 Stage 2 Governance Audit");
    expect(markdown).toContain("Legacy findings (report-only)");
    expect(markdown).toContain("LEGACYP1");
  });
});

describe("buildEngine6Stage2GovernanceAudit", () => {
  it("audits the live catalog without mutating merchant feed data", async () => {
    const merchantFeedCsvContent = readFileSync("data/merchantFeed.csv", "utf8");
    const sitemapTourXmlContent = readFileSync(
      "public/sitemap-tours.xml",
      "utf8"
    );

    const report = await buildEngine6Stage2GovernanceAudit({
      tours: [],
      merchantFeedCsvContent,
      sitemapTourXmlContent,
      mode: "pr-scoped",
      scopedProductCodes: [],
      skipAsyncImageAudit: true,
    });

    expect(report.areaSummaries).toHaveLength(12);
    expect(report.totals.areasAudited).toBe(12);
    expect(report.mode).toBe("pr-scoped");
    expect(report.notes.some(note => note.includes("rating_count"))).toBe(true);
  });

  it("maps image governance failures to scoped blocking findings", () => {
    const findings = auditEngine6MerchantFeedImageGovernanceFindings({
      governanceMode: "warn",
      mode: "pr-scoped",
      scopedProductCodes: new Set(["NEWP1"]),
      report: {
        imagesValidated: 2,
        automaticallyRepaired: 0,
        requiringFallback: 0,
        unrecoverableFailures: 1,
        fallbackImageWarnings: 0,
        informationalLegacyInvalidImages: 1,
        informationalLegacyProductCodes: ["LEGACYP1"],
        invalidUrlsReported: [],
        failures: [
          {
            productCode: "NEWP1",
            attemptedUrls: ["https://example.com/bad.jpg"],
            lastReason: "http-error",
            failureReason: "broken-image-url",
          },
        ],
        warnings: [],
      },
    });

    expect(findings).toEqual([
      expect.objectContaining({
        productCode: "NEWP1",
        severity: "blocking",
      }),
      expect.objectContaining({
        productCode: "LEGACYP1",
        severity: "legacy",
      }),
    ]);
  });
});
