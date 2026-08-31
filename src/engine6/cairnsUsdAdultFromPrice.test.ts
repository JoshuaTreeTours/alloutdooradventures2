import { describe, expect, it } from "vitest";

import {
  extractCairnsUsdAdultFromPrice,
  looksLikeCairnsAudAmountVsUsdFrom,
  shouldApplyCairnsLiveUsdAdultFromPrice,
} from "./cairnsUsdAdultFromPrice";

describe("Cairns USD adult From extractor", () => {
  it("reads the product-widget From$ and ignores a related-card From$", () => {
    const html = `
      {"fromPrice": 520.74, "productCode": "3253P11"}
      <h1>Fitzroy Island Day Tour from Cairns</h1>
      <div>From $65.15</div>
      <div>per person</div>
      <h2>Overview</h2>
      <p>Ferry day from Cairns.</p>
      You might also like
      <div>From $520.74</div>
    `;

    const extracted = extractCairnsUsdAdultFromPrice({
      html,
      sourceUrl:
        "https://www.viator.com/tours/Cairns-and-the-Tropical-North/Fitzroy-Island-Day-Tour-from-Cairns/d754-5641FITZROY",
    });

    expect(extracted.amount).toBe(65.15);
    expect(extracted.currency).toBe("USD");
    expect(extracted.unit).toBe("per-person");
    expect(extracted.rejectedReason).toBeNull();
  });

  it("uses the $ leg of an A$100 / $65.15 dual-currency pair", () => {
    const html = `
      <h1>Fitzroy Island Day Tour from Cairns</h1>
      From A$100.00
      From $65.15
      per person
      ## Overview
    `;

    const extracted = extractCairnsUsdAdultFromPrice({ html });
    expect(extracted.amount).toBe(65.15);
    expect(extracted.source).toBe("dual-currency-usd-leg");
  });

  it("rejects an en-AU From$ that is AUD without a FromUS$ marker", () => {
    const html = `
      <h1>Full-Day Great Barrier Reef Sailing Trip from Cairns</h1>
      ## From$249.00
      per person
      ## Overview
    `;

    const extracted = extractCairnsUsdAdultFromPrice({
      html,
      sourceUrl:
        "https://www.viator.com/en-AU/tours/Cairns-and-the-Tropical-North/Reef-Daytripper-full-day-Great-Barrier-Reef-tour-20-passengers-maximum/d754-76865P1",
    });

    expect(extracted.amount).toBeNull();
    expect(extracted.rejectedReason).toBe("bare-from-dollar-on-non-usd-locale");
  });

  it("accepts FromUS$ on a non-US locale as verified USD adult From", () => {
    const html = `
      # Daintree Rainforest and Cape Tribulation Day Tour from Cairns
      ## FromUS$192.16
      per person
      ## Overview
    `;

    const extracted = extractCairnsUsdAdultFromPrice({
      html,
      sourceUrl:
        "https://www.viator.com/en-GB/tours/Cairns-and-the-Tropical-North/Daintree-and-Cape-Tribulation-Tour-from-Cairns/d754-2570CTR",
    });

    expect(extracted.amount).toBe(192.16);
    expect(extracted.source).toBe("from-us-dollar");
  });

  it("accepts FromUSD as verified USD adult From", () => {
    const html = `
      <h1>Skip the Line Kuranda Scenic Railway Gold Class and Skyrail Rainforest Cableway</h1>
      From USD 180.77
      per person
    `;

    const extracted = extractCairnsUsdAdultFromPrice({ html });
    expect(extracted.amount).toBe(180.77);
    expect(extracted.source).toBe("from-usd-word");
  });

  it("keeps the published From amount for a per-group adult package", () => {
    const html = `
      <h1>Great Barrier Reef Cruise - Gold Class VIP Lounge Package</h1>
      ## From$520.74
      per group (up to 2)
      ## Overview
    `;

    const extracted = extractCairnsUsdAdultFromPrice({
      html,
      sourceUrl:
        "https://www.viator.com/tours/Cairns-and-the-Tropical-North/Gold-Class-VIP-Great-Barrier-Reef-Experience-aboard-Evolution/d754-3253P11",
    });

    expect(extracted.amount).toBe(520.74);
    expect(extracted.unit).toBe("per-group");
  });

  it("rejects From£ as a USD adult From", () => {
    const html = `
      <h1>Great Barrier Reef 40 Minute Scenic Flight from Cairns - Reef Hopper</h1>
      ## From£128.01
      per person
    `;

    const extracted = extractCairnsUsdAdultFromPrice({ html });
    expect(extracted.amount).toBeNull();
    expect(extracted.rejectedReason).toBe("local-currency-from");
  });
});

describe("Cairns live AUD mislabel guard", () => {
  it("treats A$249 vs USD 162.21 as an AUD amount", () => {
    expect(looksLikeCairnsAudAmountVsUsdFrom(249, 162.21)).toBe(true);
    expect(looksLikeCairnsAudAmountVsUsdFrom(100, 65.15)).toBe(true);
    expect(looksLikeCairnsAudAmountVsUsdFrom(192.16, 192.24)).toBe(false);
  });

  it("blocks Cairns live overlay of AUD From$ without an AUD currency code", () => {
    expect(
      shouldApplyCairnsLiveUsdAdultFromPrice(
        "76865P1",
        { priceAmount: 249, priceFormatted: "From $249.00" },
        162.21
      )
    ).toBe(false);
  });

  it("allows a genuine USD From drift on a Cairns product", () => {
    expect(
      shouldApplyCairnsLiveUsdAdultFromPrice(
        "2570CTR",
        { priceAmount: 192.16, priceFormatted: "From US$192.16", priceCurrency: "USD" },
        192.24
      )
    ).toBe(true);
  });

  it("does not change live overlay decisions for other cities", () => {
    expect(
      shouldApplyCairnsLiveUsdAdultFromPrice(
        "184156P4",
        { priceAmount: 249, priceFormatted: "From $249.00" },
        162.21
      )
    ).toBe(true);
  });
});
