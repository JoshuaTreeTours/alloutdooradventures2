import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("engine6 api import strategy", () => {
  it("does not import from src runtime paths", () => {
    const source = readFileSync(new URL("./viator-product.ts", import.meta.url), "utf8");
    expect(source.includes("../../src/")).toBe(false);
  });
});
