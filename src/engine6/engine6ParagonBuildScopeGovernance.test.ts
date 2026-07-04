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

const merchantFeedCsvFromRows = (rows: MerchantFeedCsvRow[]) => {
  const header =
    "id,title,description,link,image_link,availability,price,condition,brand,average_rating,rating_count,review_count";
  const body = rows
    .map(
      row =>
        `${row.id},${row.title},${row.description},${row.link},${row.image_link},${row.availability},${row.price},${row.condition},${row.brand},${row.average_rating},${row.rating_count},${row.review_count}`
    )
    .join("\n");
  return `${header}\n${body}\n`;
};

const baselineSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.alloutdooradventures.com/destinations/california/monterey/tours/existing-tour</loc></url>
  <url><loc>https://www.alloutdooradventures.com/destinations/california/monterey/tours/legacy-tour</loc></url>
</urlset>`;

describe("engine6ParagonBuildScopeGovernance", () => {
  it("blocks unrelated generated catalog changes outside deploy scope", () => {
    const fixtureReport = validateEngine6ParagonBuildScope({
      changedFiles: [
        {
          status: "M",
          path: "data/engine6/viator/5119P13.exact-product.json",
        },
        {
          status: "M",
          path: "data/engine6/viator/LEGACYP1.exact-product.json",
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

    const merchantFeedReport = validateEngine6ParagonBuildScope({
      changedFiles: [{ status: "M", path: "data/merchantFeed.csv" }],
      branchScopedProductCodes: new Set(),
    });

    expect(merchantFeedReport.pass).toBe(false);
    expect(merchantFeedReport.blockedFiles).toEqual([
      expect.objectContaining({
        path: "data/merchantFeed.csv",
        kind: "unrelated-generated-catalog",
      }),
    ]);
  });

  it("allows branch-scoped exact-product fixture changes", () => {
    const kind = classifyEngine6BuildScopeFileChange({
      file: {
        status: "M",
        path: "data/engine6/viator/NEWP1.exact-product.json",
      },
      branchScopedProductCodes: new Set(["NEWP1"]),
    });

    expect(kind).toBe("branch-scoped-generated");
  });

  it("enforces append-only merchant feed scope for legacy row rewrites", () => {
    const baselineRows = [
      {
        id: "LEGACYP1",
        title: "Legacy",
        description: "desc",
        link: "https://example.com/legacy",
        image_link: "https://example.com/a.jpg",
        availability: "in stock",
        price: "100 USD",
        condition: "new",
        brand: "Outdoor Adventures",
        average_rating: "5.0",
        rating_count: "10",
        review_count: "10",
      },
    ];
    const proposedRows = [
      {
        ...baselineRows[0],
        title: "Rewritten",
      },
      {
        id: "NEWP1",
        title: "New",
        description: "desc",
        link: "https://example.com/new",
        image_link: "https://example.com/b.jpg",
        availability: "in stock",
        price: "120 USD",
        condition: "new",
        brand: "Outdoor Adventures",
        average_rating: "5.0",
        rating_count: "1",
        review_count: "1",
      },
    ];

    const directResult = validateEngine6MerchantFeedAppendOnlyScope({
      baselineRows,
      proposedRows,
      branchScopedProductCodes: new Set(["NEWP1"]),
    });

    expect(directResult.pass).toBe(false);
    expect(directResult.violations[0]?.productCode).toBe("LEGACYP1");
    expect(directResult.appendedProductCodes).toEqual(["NEWP1"]);

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

    expect(directResult.pass).toBe(false);
    expect(directResult.violations[0]?.url).toContain("/monterey/tours/");
    expect(directResult.appendedUrls[0]).toContain("/chicago/tours/new");

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
      "SIBLINGP1",
      "LEGACYP1",
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
    expect(report.pass).toBe(true);

    const markdown = formatEngine6ParagonBuildScopeGovernanceReport(report);
    expect(markdown).toContain("Engine6 Paragon Build Scope Governance");
    expect(markdown).toContain("Pass: yes");
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
      "id,title,description,link,image_link,availability,price,condition,brand,average_rating,rating_count,review_count\n191303P1,Sample,Desc,https://example.com,https://img.example.com,in stock,10 USD,new,Viator,5.0,1,1"
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("191303P1");
  });
});
