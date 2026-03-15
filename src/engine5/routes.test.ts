import { describe, expect, it } from "vitest";

import {
  ENGINE5_PROOF_LISTING_PATH,
  ENGINE5_PROOF_TOUR_PATH,
  ENGINE5_PROOF_TOUR_ROUTE_PATTERN,
} from "./routes";

describe("engine5 proof routes", () => {
  it("defines listing and detail routes for preview", () => {
    expect(ENGINE5_PROOF_LISTING_PATH).toBe("/engine5/hawaii/hilo/tours");
    expect(ENGINE5_PROOF_TOUR_ROUTE_PATTERN).toBe(
      "/destinations/hawaii/hilo/tours/:tourSlug"
    );
    expect(ENGINE5_PROOF_TOUR_PATH).toBe(
      "/destinations/hawaii/hilo/tours/private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1"
    );
  });
});
