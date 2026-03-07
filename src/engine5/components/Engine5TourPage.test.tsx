import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Engine5TourPage from "./Engine5TourPage";
import {
  engine5ViatorApiFallbackByProductCode,
  engine5ViatorTours,
} from "../data/viatorTours";
import { mapViatorToEngine5Tour } from "../viator/mapViatorToEngine5Tour";
import { getEngine5ListingEntries } from "../listing/getEngine5ListingEntries";
import { getEngine5TourBySlugs } from "../routing";
import { buildEngine5SchemaGraph } from "../schema/buildEngine5SchemaGraph";

const FORCED_JT_IMAGE =
  "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1400&h=1000&s=1";

if (!(globalThis as { location?: Location }).location) {
  Object.defineProperty(globalThis, "location", {
    value: new URL("https://www.example.com/") as unknown as Location,
    configurable: true,
  });
}

describe("Engine5TourPage", () => {
  const record = engine5ViatorTours[0]!;
  const vm = mapViatorToEngine5Tour({
    record,
    apiTour: engine5ViatorApiFallbackByProductCode[record.productCode],
  });

  it("uses exact forced image for hero, listing card, og:image, and schema images", () => {
    const listing = getEngine5ListingEntries("california", "joshua-tree").find(
      entry => entry.tour.productCode === record.productCode
    );
    const routeTour = getEngine5TourBySlugs(
      "california",
      "joshua-tree",
      record.slug
    );
    const schema = buildEngine5SchemaGraph(vm);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const productNode = graph.find(node => node["@type"] === "Product")!;
    const tripNode = graph.find(node => node["@type"] === "TouristTrip")!;

    expect(vm.primaryImage).toBe(FORCED_JT_IMAGE);
    expect(listing?.tour.heroImage).toBe(FORCED_JT_IMAGE);
    expect(listing?.tour.primaryImageUrl).toBe(FORCED_JT_IMAGE);
    expect(routeTour?.seo.ogImage).toBe(FORCED_JT_IMAGE);
    expect(productNode.image).toBe(FORCED_JT_IMAGE);
    expect(tripNode.image).toBe(FORCED_JT_IMAGE);
  });

  it("renders non-blank hero with forced image and paragon fact block", () => {
    const html = renderToString(<Engine5TourPage tour={vm} />);

    expect(html).toContain("From:");
    expect(html).toContain("Rating:");
    expect(html).toContain("Meeting point:");
    expect(html).toContain("Start time:");
    expect(html).toContain("Duration:");
    expect(html).toContain("Cancellation:");
    expect(html).toContain("Book This Tour");
    expect(html).toContain(FORCED_JT_IMAGE.replace(/&/g, "&amp;"));
    expect(html).not.toContain("/hero.jpg");
  });
});
