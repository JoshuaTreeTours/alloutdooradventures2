import { describe, expect, it } from "vitest";

import { resolveHighConfidenceFareHarborPrice } from "./pricePreview";

const payload = (customerTypes: Array<Record<string, unknown>>) => ({
  details: {
    currency: "usd",
    currency_decimal_places: 2,
  },
  items: [
    {
      price: {
        low: 4000,
        high: 8500,
        breakdown: {
          customer_types: customerTypes,
        },
      },
    },
  ],
});

describe("FareHarbor Commercial Reserve high-confidence resolver", () => {
  it("uses an explicit Adult rate instead of a lower Child rate", () => {
    expect(
      resolveHighConfidenceFareHarborPrice(
        payload([
          { singular: "Adult", price: 8500 },
          { singular: "Child", price: 4000 },
        ]),
      ),
    ).toEqual({
      startingPrice: 85,
      currency: "USD",
      basis: "adult",
      basisLabel: "Adult",
    });
  });

  it("ignores discounted Adult Member rates when a standard Adult rate exists", () => {
    expect(
      resolveHighConfidenceFareHarborPrice(
        payload([
          { singular: "Adult Member", price: 2500 },
          { singular: "Adult", price: 4000 },
        ]),
      )?.startingPrice,
    ).toBe(40);
  });

  it("rejects a member-only adult price", () => {
    expect(
      resolveHighConfidenceFareHarborPrice(
        payload([{ singular: "Adult Member", price: 2500 }]),
      ),
    ).toBeNull();
  });

  it("rejects accessory-only and child-only breakdowns", () => {
    expect(
      resolveHighConfidenceFareHarborPrice(
        payload([
          { singular: "Waterproof Bag", price: 300 },
          { singular: "Child", price: 2900 },
        ]),
      ),
    ).toBeNull();
  });

  it("rejects ambiguous multiple-item responses", () => {
    const ambiguous = payload([{ singular: "Adult", price: 8500 }]);
    ambiguous.items.push(ambiguous.items[0]);
    expect(resolveHighConfidenceFareHarborPrice(ambiguous)).toBeNull();
  });
});
