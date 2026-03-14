import { describe, expect, it } from "vitest";

import { engine5ProofViatorRecord } from "./record";

describe("engine5ProofViatorRecord", () => {
  it("points to Hawaii Volcanoes proof product 11069P1 in Hilo, Hawaii", () => {
    expect(engine5ProofViatorRecord.productCode).toBe("11069P1");
    expect(engine5ProofViatorRecord.destination.stateSlug).toBe("hawaii");
    expect(engine5ProofViatorRecord.destination.citySlug).toBe("hilo");
  });
});
