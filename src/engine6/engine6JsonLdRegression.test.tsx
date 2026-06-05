import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import Engine6TourPage from "./components/Engine6TourPage";
import { engine6SpecimenTour } from "./listing";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import { buildEngine6Seo } from "./seo";
import { ENGINE6_SPECIMEN_ROUTE } from "./routes";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

describe("Engine6 JSON-LD regression guard", () => {
  it("keeps representative detail-page Product, TouristTrip, WebPage, canonical, meta, and hero output intact", () => {
    const tour = engine6SpecimenTour;
    const html = renderToString(<Engine6TourPage tour={tour} />);
    const seo = buildEngine6Seo(tour);
    const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
      Record<string, unknown>
    >;
    const schemaTypes = new Set(graph.map(node => node["@type"]));

    expect(html).not.toContain("Engine6 specimen unavailable");
    expect(schemaTypes.has("Product")).toBe(true);
    expect(schemaTypes.has("TouristTrip")).toBe(true);
    expect(schemaTypes.has("WebPage")).toBe(true);
    expect(seo.url).toBe(ENGINE6_SPECIMEN_ROUTE);
    expect(seo.description).toBeTruthy();
    expect(html).toContain('data-testid="engine6-hero-banner"');
    expect(html).toContain(`src="${tour.heroImageUrl.replace(/&/g, "&amp;")}"`);
  });
});
