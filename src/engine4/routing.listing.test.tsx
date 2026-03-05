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
});
