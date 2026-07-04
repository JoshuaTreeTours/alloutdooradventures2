import { describe, expect, it } from "vitest";

import {
  classifyEngine6BuildScopeFileChange,
  validateEngine6MerchantFeedAppendOnlyScope,
  validateEngine6ParagonBuildScope,
  validateEngine6SitemapAppendOnlyScope,
} from "./engine6ParagonBuildScopeGovernance";

describe("engine6ParagonBuildScopeGovernance", () => {
  it("blocks unrelated generated catalog changes", () => {
    const report = validateEngine6ParagonBuildScope({
      changedFiles: [
        {
          status: "M",
          path: "data/engine6/viator/5119P13.exact-product.json",
        },
      ],
      branchScopedProductCodes: new Set(["NEWP1"]),
    });

    expect(report.pass).toBe(false);
    expect(report.blockedFiles[0]?.kind).toBe("unrelated-generated-catalog");
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

  it("enforces append-only merchant feed scope", () => {
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

    const result = validateEngine6MerchantFeedAppendOnlyScope({
      baselineRows,
      proposedRows,
      branchScopedProductCodes: new Set(["NEWP1"]),
    });

    expect(result.pass).toBe(false);
    expect(result.violations[0]?.productCode).toBe("LEGACYP1");
    expect(result.appendedProductCodes).toEqual(["NEWP1"]);
  });

  it("enforces append-only sitemap scope", () => {
    const baselineXml = `
      <urlset>
        <url><loc>https://www.alloutdooradventures.com/destinations/california/monterey/tours/legacy</loc></url>
      </urlset>
    `;
    const proposedXml = `
      <urlset>
        <url><loc>https://www.alloutdooradventures.com/destinations/illinois/chicago/tours/new</loc></url>
      </urlset>
    `;

    const result = validateEngine6SitemapAppendOnlyScope({
      baselineXml,
      proposedXml,
    });

    expect(result.pass).toBe(false);
    expect(result.violations[0]?.url).toContain("/monterey/tours/legacy");
    expect(result.appendedUrls[0]).toContain("/chicago/tours/new");
  });
});
