import { describe, expect, it } from "vitest";

import { engine6ResolvedTours } from "../registry";
import { buildEngine6SchemaGraph } from "./buildEngine6SchemaGraph";

const SANTA_BARBARA_PRODUCT_CODE = "447486P8";

describe("Engine6 rich-result schema polish", () => {
  it("keeps the runtime breadcrumb aligned with the canonical destination hierarchy", () => {
    const tour = engine6ResolvedTours.find(
      candidate => candidate.productCode === SANTA_BARBARA_PRODUCT_CODE
    );
    expect(tour).toBeDefined();

    const graph = buildEngine6SchemaGraph(tour!)["@graph"] as Array<
      Record<string, unknown>
    >;
    const breadcrumb = graph.find(node => node["@type"] === "BreadcrumbList");
    const items = breadcrumb?.itemListElement as Array<Record<string, unknown>>;

    expect(items.map(item => item.name)).toEqual([
      "Destinations",
      "California",
      "Santa Barbara",
      "Tours",
      tour!.title,
    ]);
    expect(items.map(item => item.position)).toEqual([1, 2, 3, 4, 5]);
    expect(items.map(item => item.item)).toEqual([
      "https://www.alloutdooradventures.com/destinations",
      "https://www.alloutdooradventures.com/destinations/california",
      "https://www.alloutdooradventures.com/destinations/california/santa-barbara",
      "https://www.alloutdooradventures.com/destinations/california/santa-barbara/tours",
      "https://www.alloutdooradventures.com/destinations/california/santa-barbara/tours/discover-santa-barbara-cruise-narrated-coastal-yacht-experience",
    ]);
  });

  it("uses a Google-compatible Brand object on the Product node", () => {
    const tour = engine6ResolvedTours.find(
      candidate => candidate.productCode === SANTA_BARBARA_PRODUCT_CODE
    );
    expect(tour).toBeDefined();

    const graph = buildEngine6SchemaGraph(tour!)["@graph"] as Array<
      Record<string, unknown>
    >;
    const product = graph.find(node => node["@type"] === "Product");

    expect(product?.brand).toEqual({
      "@type": "Brand",
      name: "All Outdoor Adventures",
    });
  });
});
