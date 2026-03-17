import { describe, expect, it } from "vitest";

import {
  ENGINE5_PROOF_LISTING_PATH,
  ENGINE5_PROOF_TOUR_PATH,
  ENGINE5_PROOF_TOUR_ROUTE_PATTERN,
} from "./routes";

describe("engine5 proof routes", () => {
  it("defines listing and detail routes for preview", () => {
    expect(ENGINE5_PROOF_LISTING_PATH).toBe("/engine5/utah/springdale/tours");
    expect(ENGINE5_PROOF_TOUR_ROUTE_PATTERN).toBe(
      "/engine5/utah/springdale/tours/:tourSlug"
    );
    expect(ENGINE5_PROOF_TOUR_PATH.startsWith(ENGINE5_PROOF_LISTING_PATH)).toBe(
      true
    );
  });
});
