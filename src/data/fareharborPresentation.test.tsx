import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FareHarborProductSummary from "../components/FareHarborProductSummary";
import {
  buildFareHarborProofSchemaGraph,
  getFareHarborProofByItemId,
} from "./fareharborLeadToGoldProof";
import FareHarborProofSnapshot from "../components/FareHarborProofSnapshot";
import {
  fareHarborPartialPayment,
  fareHarborPriceLabel,
  fareHarborProductImage,
  fareHarborRating,
  fareHarborRatingParityErrors,
  fareHarborShortDescription,
  formatFareHarborRating,
} from "./fareharborPresentation";

describe("FareHarbor presentation parity", () => {
  it("uses the approved summary instead of the title or a clipped sentence", () => {
    expect(
      fareHarborShortDescription({
        title: "City Walk",
        schemaDescription: "City Walk",
        paragraphs: [
          "Guests walk the North End and hear how the neighborhood grew around its markets.",
        ],
      })
    ).toBe(
      "Guests walk the North End and hear how the neighborhood grew around its markets."
    );

    expect(
      fareHarborShortDescription({
        title: "City Walk",
        schemaDescription: "City Walk is a morning outing through the North End.",
        paragraphs: ["Unused because the summary already stands on its own."],
      })
    ).toBe("A morning outing through the North End.");

    const driving = getFareHarborProofByItemId("518095");
    expect(driving).toBeTruthy();
    expect(fareHarborShortDescription(driving!)).toBe(driving!.schemaDescription);
    expect(fareHarborShortDescription(driving!)).not.toContain(driving!.title);
    expect(fareHarborPriceLabel(driving!)).toBe("From $620.10");
    expect(fareHarborRating(driving!)).toEqual(driving!.aggregateRating);

    const deposit = getFareHarborProofByItemId("132331");
    expect(deposit?.visiblePriceLabel).toBe("From $14.99");
    expect(deposit?.offer?.price).toBe("14.99");
    expect(fareHarborPartialPayment(deposit)).toEqual({
      tourPriceLabel: "$45.00",
      depositLabel: "$14.99",
    });
    expect(fareHarborPriceLabel(deposit!)).toBe(
      "From $14.99 online deposit (tour price $45.00)"
    );
    const facts = renderToStaticMarkup(<FareHarborProofSnapshot proof={deposit!} />);
    expect(facts).toContain("From $14.99 online deposit (tour price $45.00)");
    expect(facts).toContain("Tour price $45.00");
    expect(facts).toContain("not the full tour price");
    expect(facts).toContain("$14.99 deposit");
    expect(facts).not.toContain("Price:</strong> From $14.99<");
  });

  it("omits zero or incomplete ratings instead of rendering placeholder stars", () => {
    expect(
      fareHarborRating({
        aggregateRating: {
          ratingValue: 0,
          reviewCount: 12,
          provider: "TripAdvisor",
        },
      })
    ).toBeNull();
    expect(
      fareHarborRating({
        aggregateRating: {
          ratingValue: 4.6,
          reviewCount: 0,
          provider: "TripAdvisor",
        },
      })
    ).toBeNull();
    expect(
      fareHarborRating({
        aggregateRating: {
          ratingValue: 4.9,
          reviewCount: 80,
          provider: "Google",
        },
      })
    ).toEqual({
      ratingValue: 4.9,
      reviewCount: 80,
      provider: "Google",
    });

    const proof = {
      ...getFareHarborProofByItemId("518095")!,
      aggregateRating: {
        ratingValue: 0,
        reviewCount: 0,
        provider: "TripAdvisor" as const,
      },
    };
    const html = renderToStaticMarkup(
      <FareHarborProductSummary proof={proof} tone="hero" />
    );
    expect(html).not.toContain("fareharbor-rating");
    expect(html).not.toContain("★");
    expect(
      fareHarborRatingParityErrors({
        proof,
        surfaces: [
          { name: "hero", html },
          { name: "schema", aggregateRating: undefined },
        ],
      })
    ).toEqual([]);
  });

  it("keeps a real FareHarbor rating identical on both surfaces and in Product schema", () => {
    const proof = {
      ...getFareHarborProofByItemId("518095")!,
      aggregateRating: {
        ratingValue: 4.6,
        reviewCount: 18,
        provider: "TripAdvisor" as const,
      },
    };
    const card = renderToStaticMarkup(
      <FareHarborProductSummary proof={proof} tone="card" />
    );
    const hero = renderToStaticMarkup(
      <FareHarborProductSummary proof={proof} tone="hero" />
    );
    const graph = buildFareHarborProofSchemaGraph(proof, {
      canonicalUrl: "https://www.alloutdooradventures.com/tours/example",
    });
    const productNode = graph["@graph"].find(node => node["@type"] === "Product");
    const tripNode = graph["@graph"].find(
      node => node["@type"] === "TouristTrip"
    );
    expect(card).toContain(formatFareHarborRating(proof.aggregateRating!));
    expect(hero).toContain("★ 4.6 (18 reviews) · TripAdvisor");
    expect(card).toContain('data-rating-provider="TripAdvisor"');
    expect(productNode?.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.6,
      reviewCount: 18,
      bestRating: 5,
      worstRating: 1,
      author: { "@type": "Organization", name: "TripAdvisor" },
    });
    expect(tripNode?.aggregateRating).toBeUndefined();
    expect(
      fareHarborRatingParityErrors({
        proof,
        surfaces: [
          { name: "card", html: card },
          { name: "page", html: hero },
          { name: "schema", aggregateRating: productNode?.aggregateRating },
        ],
      })
    ).toEqual([]);
  });

  it("detects a catalog rating that disagrees with the FareHarbor source", () => {
    const stored = getFareHarborProofByItemId("482166")!;
    expect(stored.visiblePriceLabel).toBeNull();
    const proof = { ...stored, aggregateRating: null };
    const card = `<p>★ 4.3 (1,080 reviews)</p>`;
    const errors = fareHarborRatingParityErrors({
      proof,
      surfaces: [
        { name: "card", html: card },
        {
          name: "schema",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: 4.3,
            reviewCount: 1080,
          },
        },
      ],
    });
    expect(errors.join("\n")).toContain("card shows a rating");
    expect(errors.join("\n")).toContain("schema rating");

    const rated = {
      ...proof,
      aggregateRating: {
        ratingValue: 4.8,
        reviewCount: 22,
        provider: "TripAdvisor" as const,
      },
    };
    const mismatch = fareHarborRatingParityErrors({
      proof: rated,
      surfaces: [
        {
          name: "page",
          html: `<p data-testid="fareharbor-rating" data-rating-value="4.3" data-review-count="1080">★ 4.3 (1,080 reviews)</p>`,
        },
      ],
    });
    expect(mismatch.join("\n")).toContain("disagrees");
  });

  it("uses an item image when the proof names one and keeps the catalog hero otherwise", () => {
    expect(
      fareHarborProductImage(
        { productImage: "https://cdn.filestackcontent.com/item-owned" },
        "https://cdn.filestackcontent.com/catalog"
      )
    ).toBe("https://cdn.filestackcontent.com/item-owned");
    expect(
      fareHarborProductImage(
        { productImage: null },
        "https://cdn.filestackcontent.com/catalog"
      )
    ).toBeNull();
    expect(
      fareHarborProductImage(
        { aggregateRating: null },
        "https://cdn.filestackcontent.com/catalog"
      )
    ).toBe("https://cdn.filestackcontent.com/catalog");
  });
});
