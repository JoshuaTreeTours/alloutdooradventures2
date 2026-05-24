import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import TourCard from "../components/TourCard";
import { getToursByCityUnified } from "../data/tours";
import {
  fetchEngine6LiveProductFields,
  mergeEngine6LiveFieldsIntoTour,
} from "./liveProductFields";

describe("engine6 city listing parity regression", () => {
  it("hydrates rendered San Francisco Napa/Sonoma card to match detail commercial values", async () => {
    const previousWindow = (globalThis as { window?: Window }).window;
    const previousLocation = (globalThis as { location?: Location }).location;
    (globalThis as { window?: Window }).window = {
      location: { pathname: "/destinations/california/san-francisco/tours", search: "" },
      history: { pushState: () => undefined },
    } as unknown as Window;
    (globalThis as { location?: Location }).location =
      (globalThis as { window?: Window }).window!.location as unknown as Location;
    const cityEntry = getToursByCityUnified("california", "san-francisco").find(
      entry => entry.tour.engine === "engine6" && entry.tour.productCode === "2660SFOWIN"
    );
    expect(cityEntry).toBeDefined();

    const fields = await fetchEngine6LiveProductFields(
      "2660SFOWIN",
      (async () =>
        ({
          ok: true,
          json: async () => ({
            extracted: {
              priceAmount: 156.75,
              priceFormatted: "From $156.75",
              aggregateRating: 4.3,
              reviewCount: 4512,
              durationText: "9 hours",
              meetingPointText: "Union Square",
            },
          }),
        }) as Response) as typeof fetch
    );

    const hydrated = mergeEngine6LiveFieldsIntoTour(cityEntry!.tour, fields ?? undefined);
    const html = renderToString(<TourCard tour={hydrated} href={cityEntry!.href} />);

    expect(html).toContain("$156.75");
    expect(html).toContain("4512");
    expect(html).toContain("4.3");

    (globalThis as { window?: Window }).window = previousWindow;
    (globalThis as { location?: Location }).location = previousLocation;
  });
});
