import { describe, expect, it } from "vitest";

import {
  type MerchantFeedCsvRow,
  parseMerchantFeedCsvRows,
} from "../../api/engine6/merchantFeedChangeScopeGovernance";
import {
  classifyEngine6BuildScopeFileChange,
  classifyEngine6EditorialFindingSeverity,
  createEngine6GovernanceCleanupLoopState,
  detectEngine6GovernanceIdempotentFileWrites,
  ENGINE6_GOVERNANCE_CLEANUP_LOOP_MAX_MS,
  ENGINE6_PARAGON_REFERENCE_PRODUCT_CODES,
  ENGINE6_PUBLISHED_DESTINATION_SLUGS,
  formatEngine6ParagonBuildScopeGovernanceReport,
  isEngine6ParagonBuildScopeGovernanceAllowlistedPath,
  isEngine6ParagonReferenceProductPath,
  recordEngine6GovernanceCleanupCycle,
  resolveEngine6PrScopedDeployBlocking,
  validateEngine6ParagonBuildScope,
  validateEngine6SitemapAppendOnlyScope,
} from "./engine6ParagonBuildScopeGovernance";
import {
  ENGINE6_PARAGON_PRODUCT_CODE,
  ENGINE6_SPECIMEN_PRODUCT_CODE,
} from "./routes";

const sampleMerchantRow = (
  overrides: Partial<MerchantFeedCsvRow> = {}
): MerchantFeedCsvRow => ({
  id: "191303P1",
  title: "Sample Tour",
  description: "Governed merchant description for the sample tour.",
  link: "https://www.alloutdooradventures.com/tours/sample",
  image_link: "https://example.com/image.jpg",
  availability: "in stock",
  price: "89.00 USD",
  condition: "new",
  brand: "Viator",
  average_rating: "5.0",
  rating_count: "54",
  review_count: "54",
  ...overrides,
});

const baselineSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.alloutdooradventures.com/destinations/california/monterey/tours/existing-tour</loc></url>
  <url><loc>https://www.alloutdooradventures.com/destinations/california/monterey/tours/legacy-tour</loc></url>
</urlset>`;

describe("engine6ParagonBuildScopeGovernance", () => {
  it("rejects unrelated generated/catalog file changes", () => {
    const report = validateEngine6ParagonBuildScope({
      changedFiles: [
        {
          status: "M",
          path: "data/engine6/viator/LEGACYP1.exact-product.json",
        },
        {
          status: "M",
          path: "data/merchantFeed.csv",
        },
      ],
      branchScopedProductCodes: new Set(["NEWP1"]),
    });

    expect(report.pass).toBe(false);
    expect(report.blockedFiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "data/engine6/viator/LEGACYP1.exact-product.json",
          kind: "unrelated-generated-catalog",
        }),
        expect.objectContaining({
          path: "data/merchantFeed.csv",
          kind: "unrelated-generated-catalog",
        }),
      ])
    );
  });

  it("stops and reports when cleanup loops exceed 5 minutes or repeat the same fix cycle", () => {
    const startedAt = 1_000_000;
    let state = createEngine6GovernanceCleanupLoopState(startedAt);

    const firstCycle = recordEngine6GovernanceCleanupCycle(
      state,
      "repair-merchant-feed-row-191303P1",
      startedAt + 1_000
    );
    expect(firstCycle.stopped).toBe(false);

    const repeatedCycle = recordEngine6GovernanceCleanupCycle(
      firstCycle.state,
      "repair-merchant-feed-row-191303P1",
      startedAt + 2_000
    );
    expect(repeatedCycle.stopped).toBe(true);
    expect(repeatedCycle.reason).toContain("repeated the same fix cycle");

    state = createEngine6GovernanceCleanupLoopState(startedAt);
    const timeoutCycle = recordEngine6GovernanceCleanupCycle(
      state,
      "repair-sitemap-url",
      startedAt + ENGINE6_GOVERNANCE_CLEANUP_LOOP_MAX_MS + 1
    );
    expect(timeoutCycle.stopped).toBe(true);
    expect(timeoutCycle.reason).toContain("5 minute");
  });

  it("prevents Paragon fixture/route/mock changes unless explicitly scoped", () => {
    for (const productCode of ENGINE6_PARAGON_REFERENCE_PRODUCT_CODES) {
      expect(
        isEngine6ParagonReferenceProductPath(
          `data/engine6/viator/${productCode}.exact-product.json`,
          new Set(["NEWP1"])
        )
      ).toBe(true);
    }

    expect(
      classifyEngine6BuildScopeFileChange({
        file: {
          status: "M",
          path: `data/engine6/viator/${ENGINE6_PARAGON_PRODUCT_CODE}.exact-product.json`,
        },
        branchScopedProductCodes: new Set(["NEWP1"]),
      })
    ).toBe("paragon-reference-protected");

    expect(
      classifyEngine6BuildScopeFileChange({
        file: {
          status: "M",
          path: `data/engine6/viator/${ENGINE6_SPECIMEN_PRODUCT_CODE}.exact-product.json`,
        },
        branchScopedProductCodes: new Set(["NEWP1"]),
      })
    ).toBe("paragon-reference-protected");

    const report = validateEngine6ParagonBuildScope({
      changedFiles: [
        {
          status: "M",
          path: `data/engine6/viator/${ENGINE6_PARAGON_PRODUCT_CODE}.exact-product.json`,
        },
      ],
      branchScopedProductCodes: new Set(["NEWP1"]),
    });

    expect(report.blockedFiles).toEqual([
      expect.objectContaining({
        kind: "paragon-reference-modified",
        path: `data/engine6/viator/${ENGINE6_PARAGON_PRODUCT_CODE}.exact-product.json`,
      }),
    ]);
  });

  it("catches old merchant feed row rewrites with append-only enforcement", () => {
    const baseline = [sampleMerchantRow(), sampleMerchantRow({ id: "63657P1" })];
    const proposed = [
      sampleMerchantRow({ description: "Accidental rewrite during city PR." }),
      baseline[1]!,
    ];

    const report = validateEngine6ParagonBuildScope({
      changedFiles: [{ status: "M", path: "data/merchantFeed.csv" }],
      branchScopedProductCodes: new Set(["NEWP1"]),
      baselineMerchantFeedRows: baseline,
      proposedMerchantFeedRows: proposed,
    });

    expect(report.merchantFeed.pass).toBe(false);
    expect(report.blockedFiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "merchant-feed-row-rewritten",
          path: "data/merchantFeed.csv",
        }),
      ])
    );
  });

  it("catches old sitemap URL rewrites with append-only enforcement", () => {
    const proposedXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.alloutdooradventures.com/destinations/california/monterey/tours/legacy-tour</loc></url>
  <url><loc>https://www.alloutdooradventures.com/destinations/california/monterey/tours/existing-tour</loc></url>
</urlset>`;

    const validation = validateEngine6SitemapAppendOnlyScope({
      baselineXml: baselineSitemapXml,
      proposedXml,
    });

    expect(validation.pass).toBe(false);
    expect(validation.violations[0]?.detail).toContain("reordered");

    const report = validateEngine6ParagonBuildScope({
      changedFiles: [{ status: "M", path: "public/sitemap-tours.xml" }],
      branchScopedProductCodes: new Set(["NEWP1"]),
      baselineSitemapXml: baselineSitemapXml,
      proposedSitemapXml: proposedXml,
    });

    expect(report.sitemap.pass).toBe(false);
    expect(report.blockedFiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "sitemap-url-rewritten",
        }),
      ])
    );
  });

  it("limits PR-scoped deploy blocking to added/modified products and treats unchanged siblings as report-only", () => {
    const deployScope = resolveEngine6PrScopedDeployBlocking({
      addedOrModifiedProductCodes: ["NEWP1"],
      deployScopedProductCodes: ["NEWP1", "SIBLINGP1", "LEGACYP1"],
    });

    expect(deployScope.blockingProductCodes).toEqual(["NEWP1"]);
    expect(deployScope.reportOnlyProductCodes).toEqual([
      "LEGACYP1",
      "SIBLINGP1",
    ]);

    expect(
      deployScope.shouldBlockFinding("NEWP1", "merchant feed title mismatch")
    ).toBe(true);
    expect(
      deployScope.shouldBlockFinding(
        "SIBLINGP1",
        "unchanged legacy finding on sibling product"
      )
    ).toBe(false);
    expect(deployScope.isDeployScopedProduct("SIBLINGP1")).toBe(false);
  });

  it("classifies editorial keyword/style mismatches as warnings", () => {
    expect(
      classifyEngine6EditorialFindingSeverity("keyword/style mismatch in overview")
    ).toBe("warning");
    expect(
      classifyEngine6EditorialFindingSeverity(
        "first sentence missing destination name"
      )
    ).toBe("warning");
    expect(
      classifyEngine6EditorialFindingSeverity(
        "minor phrasing difference without meaning change"
      )
    ).toBe("warning");
    expect(
      classifyEngine6EditorialFindingSeverity(
        "cosmetic itinerary phrasing issue that does not change facts"
      )
    ).toBe("warning");
  });

  it("keeps wrong-destination bleed as blocking", () => {
    expect(
      classifyEngine6EditorialFindingSeverity(
        "cross-destination bleed: Viator URL points to Sedona but route is Yosemite"
      )
    ).toBe("blocking");
    expect(
      classifyEngine6EditorialFindingSeverity("wrong destination/city/park")
    ).toBe("blocking");

    const deployScope = resolveEngine6PrScopedDeployBlocking({
      addedOrModifiedProductCodes: ["NEWP1"],
      deployScopedProductCodes: ["NEWP1"],
    });

    expect(
      deployScope.shouldBlockFinding(
        "NEWP1",
        "cross-destination bleed detected in product binding"
      )
    ).toBe(true);
  });

  it("allows governance-only allowlisted files and emits a readable report", () => {
    expect(
      isEngine6ParagonBuildScopeGovernanceAllowlistedPath(
        "src/engine6/engine6ParagonBuildScopeGovernance.ts"
      )
    ).toBe(true);

    const report = validateEngine6ParagonBuildScope({
      changedFiles: [
        {
          status: "A",
          path: "src/engine6/engine6ParagonBuildScopeGovernance.ts",
        },
      ],
      branchScopedProductCodes: new Set(),
      generatedAt: "2026-07-03T00:00:00.000Z",
    });

    expect(report.blockedFiles).toEqual([]);
    expect(report.informational).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "src/engine6/engine6ParagonBuildScopeGovernance.ts",
        }),
      ])
    );

    const markdown = formatEngine6ParagonBuildScopeGovernanceReport(report);
    expect(markdown).toContain("Engine6 Paragon Build Scope Governance");
    expect(markdown).toContain("Blocked files (0)");
  });

  it("detects idempotent governance file rewrites", () => {
    const idempotency = detectEngine6GovernanceIdempotentFileWrites({
      priorWrites: [{ path: "reports/engine6-paragon-build-scope.json", content: "{}" }],
      proposedWrites: [
        { path: "reports/engine6-paragon-build-scope.json", content: "{}" },
      ],
    });

    expect(idempotency.pass).toBe(false);
    expect(idempotency.repeatedFileWrites).toEqual([
      "reports/engine6-paragon-build-scope.json",
    ]);
  });

  it("does not treat published destination slugs as branch-scoped by default", () => {
    for (const slug of ENGINE6_PUBLISHED_DESTINATION_SLUGS) {
      expect(slug.length).toBeGreaterThan(0);
    }

    expect(
      classifyEngine6BuildScopeFileChange({
        file: { status: "M", path: `scripts/generate-${ENGINE6_PUBLISHED_DESTINATION_SLUGS[0]}-engine6-fixtures.ts` },
        branchScopedProductCodes: new Set(),
      })
    ).toBe("published-destination-protected");
  });

  it("allows append-only merchant feed and sitemap additions for branch-scoped products", () => {
    const baselineRows = [sampleMerchantRow()];
    const proposedRows = [
      ...baselineRows,
      sampleMerchantRow({
        id: "NEWP1",
        title: "New Destination Tour",
        link: "https://www.alloutdooradventures.com/tours/new",
      }),
    ];

    const merchantReport = validateEngine6ParagonBuildScope({
      changedFiles: [{ status: "M", path: "data/merchantFeed.csv" }],
      branchScopedProductCodes: new Set(["NEWP1"]),
      baselineMerchantFeedRows: baselineRows,
      proposedMerchantFeedRows: proposedRows,
    });

    expect(merchantReport.merchantFeed.pass).toBe(true);
    expect(merchantReport.merchantFeed.appendedProductCodes).toEqual(["NEWP1"]);

    const proposedSitemap = `${baselineSitemapXml.replace(
      "</urlset>",
      ""
    )}
  <url><loc>https://www.alloutdooradventures.com/destinations/california/monterey/tours/new-tour</loc></url>
</urlset>`;

    const sitemapValidation = validateEngine6SitemapAppendOnlyScope({
      baselineXml: baselineSitemapXml,
      proposedXml: proposedSitemap,
    });

    expect(sitemapValidation.pass).toBe(true);
    expect(sitemapValidation.appendedUrls).toHaveLength(1);
  });

  it("parses merchant feed rows for append-only integration", () => {
    const rows = parseMerchantFeedCsvRows(
      'id,title,description,link,image_link,availability,price,condition,brand,average_rating,rating_count,review_count\n191303P1,Sample,Desc,https://example.com,https://img.example.com,in stock,10 USD,new,Viator,5.0,1,1'
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("191303P1");
  });
});
