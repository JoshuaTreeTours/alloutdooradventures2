import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import TourCard from "../components/TourCard";
import { getEngine4ListingEntries } from "./listing/getEngine4ListingEntries";
import { getEngine4TourBySlugs } from "./routing";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

describe("Engine4 Aspen routing/listing", () => {
  it("renders Engine4 cards with the mapped hero image URL", () => {
    const entries = getEngine4ListingEntries("colorado", "aspen");
    const target = entries.find(entry => entry.tour.productCode === "74828P5");

    expect(target?.tour.heroImage).toBeTruthy();

    const html = renderToStaticMarkup(
      <TourCard tour={target!.tour} href={target!.href} />
    );

    expect(html).toContain(target!.tour.heroImage!);
    expect(html).not.toContain("default-tour.jpg");
  });

  it("uses overview snippet for zipline card subtext instead of stop labels", () => {
    const entries = getEngine4ListingEntries("california", "santa-barbara");
    const target = entries.find(entry => entry.tour.productCode === "421920P2");

    const html = renderToStaticMarkup(
      <TourCard tour={target!.tour} href={target!.href} />
    );

    expect(html).toContain(
      "The Epic Zipline Tour over the Santa Ynez Valley is a guided aerial adventure"
    );
    expect(html).not.toContain("Stop:");
  });

  it("keeps pikes peak card blurb readable", () => {
    const entries = getEngine4ListingEntries("colorado", "colorado-springs");
    const target = entries.find(entry => entry.tour.productCode === "41410P10");

    const html = renderToStaticMarkup(
      <TourCard tour={target!.tour} href={target!.href} />
    );

    expect(html).toContain(
      "This small-group day trip heads from Denver into the Front Range"
    );
    expect(html).not.toContain("Stop:");
  });

  it("builds the 180019P2 route and exposes it in Colorado Springs listing", () => {
    const entries = getEngine4ListingEntries("colorado", "colorado-springs");
    const target = entries.find(entry => entry.tour.productCode === "180019P2");

    expect(target).toBeDefined();
    expect(target?.href).toBe(
      "/destinations/colorado/colorado-springs/tours/garden-of-the-gods-tour-180019p2"
    );

    const routed = getEngine4TourBySlugs(
      "colorado",
      "colorado-springs",
      "garden-of-the-gods-tour-180019p2"
    );

    expect(routed?.id).toBe("180019P2");
  });

  it("builds the 74828P4 route and exposes it in Aspen listing", () => {
    const entries = getEngine4ListingEntries("colorado", "aspen");
    const target = entries.find(entry => entry.tour.productCode === "74828P4");

    expect(target).toBeDefined();
    expect(target?.href).toBe(
      "/destinations/colorado/aspen/tours/aspens-off-the-beaten-path-tour-74828p4"
    );

    const routed = getEngine4TourBySlugs(
      "colorado",
      "aspen",
      "aspens-off-the-beaten-path-tour-74828p4"
    );

    expect(routed?.id).toBe("74828P4");
  });

  it("builds the 74828P3 route and exposes it in Aspen listing", () => {
    const entries = getEngine4ListingEntries("colorado", "aspen");
    const target = entries.find(entry => entry.tour.productCode === "74828P3");

    expect(target).toBeDefined();
    expect(target?.href).toBe(
      "/destinations/colorado/aspen/tours/glimpse-of-aspen-tour-74828p3"
    );

    const routed = getEngine4TourBySlugs(
      "colorado",
      "aspen",
      "glimpse-of-aspen-tour-74828p3"
    );

    expect(routed?.id).toBe("74828P3");
  });


  it("builds the 3454_B0016 route and exposes it in San Francisco listing", () => {
    const entries = getEngine4ListingEntries("california", "san-francisco");
    const target = entries.find(entry => entry.tour.productCode === "3454_B0016");

    expect(target).toBeDefined();
    expect(target?.href).toBe(
      "/destinations/california/san-francisco/tours/small-group-yosemite-tour-from-san-francisco-3454_b0016"
    );
    expect(target?.tour.heroImage).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2e/b5/09/65/caption.jpg?w=1100&h=800&s=1"
    );

    const routed = getEngine4TourBySlugs(
      "california",
      "san-francisco",
      "small-group-yosemite-tour-from-san-francisco-3454_b0016"
    );

    expect(routed?.id).toBe("3454_B0016");
    expect(routed?.images.hero).toBe(target?.tour.heroImage);
    expect(routed?.content.duration).toBe("14 hours");
    expect(routed?.content.meetingPoint.address).toBe(
      "Hilton San Francisco Union Square, 333 O'Farrell St, San Francisco, CA 94102, USA"
    );
    expect(routed?.content.cancellationPolicy).toBe(
      "Free cancellation up to 24 hours in advance."
    );
  });

  it("builds the 36001P1 route and exposes it in San Francisco listing", () => {
    const entries = getEngine4ListingEntries("california", "san-francisco");
    const target = entries.find(entry => entry.tour.productCode === "36001P1");

    expect(target).toBeDefined();
    expect(target?.href).toBe(
      "/destinations/california/san-francisco/tours/yosemite-in-a-day-tour-from-san-francisco-36001p1"
    );

    const routed = getEngine4TourBySlugs(
      "california",
      "san-francisco",
      "yosemite-in-a-day-tour-from-san-francisco-36001p1"
    );

    expect(routed?.id).toBe("36001P1");
  });

  it("builds the 335698P13 route and exposes it in Joshua Tree listing", () => {
    const entries = getEngine4ListingEntries("california", "joshua-tree");
    const target = entries.find(
      entry => entry.tour.productCode === "335698P13"
    );

    expect(target).toBeDefined();
    expect(target?.href).toBe(
      "/destinations/california/joshua-tree/tours/rock-scrambling-adventures-in-joshua-tree-national-park-335698p13"
    );

    const routed = getEngine4TourBySlugs(
      "california",
      "joshua-tree",
      "rock-scrambling-adventures-in-joshua-tree-national-park-335698p13"
    );

    expect(routed?.id).toBe("335698P13");
  });
  it("builds the 6740P7 route and exposes it in Joshua Tree listing", () => {
    const entries = getEngine4ListingEntries("california", "joshua-tree");
    const target = entries.find(entry => entry.tour.productCode === "6740P7");

    expect(target).toBeDefined();
    expect(target?.href).toBe(
      "/destinations/california/joshua-tree/tours/joshua-tree-scenic-tour-6740p7"
    );

    const routed = getEngine4TourBySlugs(
      "california",
      "joshua-tree",
      "joshua-tree-scenic-tour-6740p7"
    );

    expect(routed?.id).toBe("6740P7");
  });

  it("builds the 237571P2 route and exposes it in Joshua Tree listing", () => {
    const entries = getEngine4ListingEntries("california", "joshua-tree");
    const target = entries.find(entry => entry.tour.productCode === "237571P2");

    expect(target).toBeDefined();
    expect(target?.href).toBe(
      "/destinations/california/joshua-tree/tours/full-day-hike-in-joshua-tree-national-park-237571p2"
    );

    const routed = getEngine4TourBySlugs(
      "california",
      "joshua-tree",
      "full-day-hike-in-joshua-tree-national-park-237571p2"
    );

    expect(routed?.id).toBe("237571P2");
  });

  it("builds the 379799P1 route and keeps listing/page image aligned", () => {
    const entries = getEngine4ListingEntries("california", "los-angeles");
    const target = entries.find(entry => entry.tour.productCode === "379799P1");

    expect(target).toBeDefined();
    expect(target?.href).toBe(
      "/destinations/california/los-angeles/tours/mulholland-trail-horseback-tour-379799p1"
    );
    expect(target?.tour.heroImage).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2e/cc/c0/34/caption.jpg?w=1100&h=800&s=1"
    );
    expect(target?.tour.heroImage).not.toContain(
      "photo-o/2e/7d/2f/f4/caption.jpg"
    );

    const routed = getEngine4TourBySlugs(
      "california",
      "los-angeles",
      "mulholland-trail-horseback-tour-379799p1"
    );

    expect(routed?.id).toBe("379799P1");
    expect(routed?.images.hero).toBe(target?.tour.heroImage);
    expect(routed?.viatorReviewCount).toBe(232);
    expect(routed?.content.duration).toBe("1 hour");
    expect(routed?.content.meetingPoint.address).toBe(
      "3204 Beachwood Dr, Los Angeles, CA 90068, USA"
    );
    expect(routed?.content.cancellationPolicy).toBe(
      "This experience is non-refundable and cannot be changed for any reason."
    );
  });

  it("builds the 380141P5 route and exposes it in Bay Saint Louis listing", () => {
    const entries = getEngine4ListingEntries("mississippi", "bay-saint-louis");
    const target = entries.find(entry => entry.tour.productCode === "380141P5");

    expect(target).toBeDefined();
    expect(target?.href).toBe(
      "/destinations/mississippi/bay-saint-louis/tours/bay-saint-louis-discovery-boat-tour-380141p5"
    );
    expect(target?.tour.heroImage).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/31/c2/9b/8f/caption.jpg?w=1100&h=800&s=1"
    );

    const routed = getEngine4TourBySlugs(
      "mississippi",
      "bay-saint-louis",
      "bay-saint-louis-discovery-boat-tour-380141p5"
    );

    expect(routed?.id).toBe("380141P5");
    expect(routed?.images.hero).toBe(target?.tour.heroImage);
    expect(routed?.content.meetingPoint.address).toBe(
      "Bay St Louis, Mississippi, USA"
    );
  });

  it("owns 6896MOABCPARK under Utah/Moab route", () => {
    const entries = getEngine4ListingEntries("utah", "moab");
    const target = entries.find(
      entry => entry.tour.productCode === "6896MOABCPARK"
    );

    expect(target).toBeDefined();
    expect(target?.href).toBe(
      "/destinations/utah/moab/tours/canyonlands-national-park-half-day-tour-from-moab-6896moabcpark"
    );

    const routed = getEngine4TourBySlugs(
      "utah",
      "moab",
      "canyonlands-national-park-half-day-tour-from-moab-6896moabcpark"
    );

    expect(routed?.id).toBe("6896MOABCPARK");
    expect(routed?.sourceCitySlug).toBe("moab");
    expect(routed?.geo.region).toBe("Utah");
    expect(routed?.geo.city).toBe("Moab");
  });

});
