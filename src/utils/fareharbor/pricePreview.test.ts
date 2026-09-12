import { describe, expect, it } from "vitest";

import {
  resolveHighConfidenceFareHarborPrice,
  resolvePhase2FareHarborPrice,
  resolvePhase3FareHarborPrice,
} from "./pricePreview";

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

  it("accepts a plain age-qualified Adult rate", () => {
    expect(
      resolveHighConfidenceFareHarborPrice(
        payload([{ singular: "Adult (15+)", price: 8500 }]),
      )?.startingPrice,
    ).toBe(85);
  });

  it("accepts One Adult as a standard customer type", () => {
    expect(
      resolveHighConfidenceFareHarborPrice(
        payload([{ singular: "One Adult", price: 8500 }]),
      )?.startingPrice,
    ).toBe(85);
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

  it("rejects member, extra, group, and add-on Adult labels", () => {
    for (const label of [
      "Adult Member",
      "Extra Adult",
      "Additional Adult",
      "Group Adult Lesson",
      "Adult | Alcohol Included",
      "Priority Boarding (Adult)",
      "Adult • City Bike",
    ]) {
      expect(
        resolveHighConfidenceFareHarborPrice(
          payload([{ singular: label, price: 2500 }]),
        ),
        label,
      ).toBeNull();
    }
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

describe("FareHarbor Commercial Reserve Phase 2 resolver", () => {
  it("accepts a standard Person price when Adult is not used", () => {
    expect(
      resolvePhase2FareHarborPrice(
        payload([{ singular: "Person", price: 7900 }]),
      ),
    ).toEqual({
      startingPrice: 79,
      currency: "USD",
      basis: "standard-traveler",
      basisLabel: "Person",
      confidence: "medium",
    });
  });

  it("accepts Participant, Guest, Passenger, Rider, and General Admission labels", () => {
    for (const label of [
      "Participant",
      "Guest",
      "Passenger",
      "Rider",
      "General Admission",
    ]) {
      expect(
        resolvePhase2FareHarborPrice(
          payload([{ singular: label, price: 6500 }]),
        )?.startingPrice,
        label,
      ).toBe(65);
    }
  });

  it("accepts an age-qualified Person label", () => {
    expect(
      resolvePhase2FareHarborPrice(
        payload([{ singular: "Person (12+)", price: 6100 }]),
      )?.startingPrice,
    ).toBe(61);
  });

  it("does not duplicate a Phase 1 Adult price", () => {
    expect(
      resolvePhase2FareHarborPrice(
        payload([{ singular: "Adult", price: 8500 }]),
      ),
    ).toBeNull();
  });

  it("rejects qualified-looking labels with modifiers", () => {
    for (const label of [
      "Local Participant",
      "Member Guest",
      "Senior Passenger",
      "Additional Rider",
      "VIP Admission",
      "Ticket + Gear",
    ]) {
      expect(
        resolvePhase2FareHarborPrice(
          payload([{ singular: label, price: 3500 }]),
        ),
        label,
      ).toBeNull();
    }
  });

  it("rejects ambiguous multiple standard traveler rates", () => {
    expect(
      resolvePhase2FareHarborPrice(
        payload([
          { singular: "Person", price: 7900 },
          { singular: "Participant", price: 6900 },
        ]),
      ),
    ).toBeNull();
  });

  it("keeps non-traveler accessories outside the second cohort", () => {
    expect(
      resolvePhase2FareHarborPrice(
        payload([
          { singular: "Waterproof Bag", price: 300 },
          { singular: "Child", price: 2900 },
        ]),
      ),
    ).toBeNull();
  });
});

describe("FareHarbor Commercial Reserve Phase 3 audited resolver", () => {
  it("accepts multiple distinct standard traveler labels when every price agrees", () => {
    expect(
      resolvePhase3FareHarborPrice(
        payload([
          { singular: "Person", price: 7900 },
          { singular: "Participant", price: 7900 },
        ]),
      ),
    ).toEqual({
      startingPrice: 79,
      currency: "USD",
      basis: "standard-traveler-consensus",
      basisLabels: ["Participant", "Person"],
      confidence: "medium",
    });
  });

  it("accepts a three-label consensus while ignoring unrelated child rates", () => {
    expect(
      resolvePhase3FareHarborPrice(
        payload([
          { singular: "Guest", price: 6500 },
          { singular: "Passenger", price: 6500 },
          { singular: "Rider", price: 6500 },
          { singular: "Child", price: 3200 },
        ]),
      )?.startingPrice,
    ).toBe(65);
  });

  it("accepts audited structured-adult labels", () => {
    expect(
      resolvePhase3FareHarborPrice(
        payload([{ singular: "Traveler | Adult | Age 12+", price: 5500 }]),
      ),
    ).toEqual({
      startingPrice: 55,
      currency: "USD",
      basis: "structured-adult",
      basisLabels: ["Traveler | Adult | Age 12+"],
      confidence: "medium",
    });

    expect(
      resolvePhase3FareHarborPrice(
        payload([{ singular: "Adults", price: 9218 }]),
      ),
    ).toEqual({
      startingPrice: 92.18,
      currency: "USD",
      basis: "structured-adult",
      basisLabels: ["Adults"],
      confidence: "medium",
    });
  });

  it("accepts the audited coded Standard Ticket form", () => {
    expect(
      resolvePhase3FareHarborPrice(
        payload([{ singular: "(CGT) Standard Ticket", price: 8480 }]),
      ),
    ).toEqual({
      startingPrice: 84.8,
      currency: "USD",
      basis: "standard-ticket",
      basisLabels: ["(CGT) Standard Ticket"],
      confidence: "medium",
    });
  });

  it("rejects multiple standard traveler labels when their prices disagree", () => {
    expect(
      resolvePhase3FareHarborPrice(
        payload([
          { singular: "Person", price: 7900 },
          { singular: "Participant", price: 6900 },
        ]),
      ),
    ).toBeNull();
  });

  it("does not treat duplicated copies of one label as consensus", () => {
    expect(
      resolvePhase3FareHarborPrice(
        payload([
          { singular: "Person", price: 7900 },
          { singular: "Person", price: 7900 },
        ]),
      ),
    ).toBeNull();
  });

  it("keeps unsafe audited label families outside Phase 3", () => {
    for (const label of [
      "Adult | Alcohol Included",
      "Additional Adult",
      "Rider/Passenger",
      "Single Person",
      "Private Tour Guest",
      "Certified Diver",
      "Snorkeler",
    ]) {
      expect(
        resolvePhase3FareHarborPrice(
          payload([{ singular: label, price: 6500 }]),
        ),
        label,
      ).toBeNull();
    }
  });

  it("does not duplicate Phase 1 or Phase 2 cohorts", () => {
    expect(
      resolvePhase3FareHarborPrice(
        payload([{ singular: "Adult", price: 8500 }]),
      ),
    ).toBeNull();
    expect(
      resolvePhase3FareHarborPrice(
        payload([{ singular: "Person", price: 7900 }]),
      ),
    ).toBeNull();
  });
});
