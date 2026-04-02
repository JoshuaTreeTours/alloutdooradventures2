import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import Engine6TourPage from "./components/Engine6TourPage";
import { engine6ResolvedTours, getEngine6NativeTourByCanonicalPath } from "./registry";

// SSR route-aware components expect location to exist in tests.
(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const EXPECTED_MIAMI_PRODUCT_CODES = [
  "8836P2",
  "231628P7",
  "5503P10",
  "438341P2",
  "120303P9",
  "10150P16",
];

describe("engine6 miami regression guard", () => {
  it("keeps pre-existing Miami tours registry-backed and routable", () => {
    const miamiTours = engine6ResolvedTours.filter(tour => tour.city === "Miami");
    const byCode = new Map(miamiTours.map(tour => [tour.productCode, tour]));

    for (const productCode of EXPECTED_MIAMI_PRODUCT_CODES) {
      const tour = byCode.get(productCode);
      expect(tour).toBeDefined();
      expect(tour?.canonicalPath).toContain("/florida/miami/tours/");
      expect(tour?.diagnostics.heroSourceFieldPath?.startsWith("product.media.images")).toBe(true);
      const routed = getEngine6NativeTourByCanonicalPath(tour!.canonicalPath);
      expect(routed?.productCode).toBe(productCode);
    }
  });

  it("keeps Miami tours renderable with strict page/card/schema hero parity prerequisites", () => {
    const miamiTours = engine6ResolvedTours.filter(
      tour => EXPECTED_MIAMI_PRODUCT_CODES.includes(tour.productCode)
    );

    for (const tour of miamiTours) {
      const html = renderToString(<Engine6TourPage tour={tour} />);
      expect(html).toContain(tour.title);
      expect(tour.heroImageUrl).toBeTruthy();
      expect(tour.heroImageUrl).not.toContain("/hero.jpg");
      expect(tour.diagnostics.heroSurfaceParity.page).toBe(true);
      expect(tour.diagnostics.heroSurfaceParity.card).toBe(true);
      expect(tour.diagnostics.heroSurfaceParity.schema).toBe(true);
    }
  });
});
