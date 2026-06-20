import { describe, expect, it } from "vitest";

import { auditEngine6ItineraryTitle } from "./itineraryTitleIntegrityAudit";

const knownGoodTitles = [
  "Jackson Square",
  "Faubourg Marigny",
  "Bywater District",
  "Treme",
  "Guano Point",
  "St. Louis Cathedral",
  "French Quarter",
];

const knownBadTitles = [
  "Then",
  "Pass",
  "Your full-day guided Grand Canyon West Tour includes an unforgettable Hoover Dam photo stop, complete with an informative and engaging commentary",
  "Your adventure continues as you journey through the stunning high desert of Northern Arizona, passing an extinct volcano and caldera, before reaching the 900-year-old Joshua Tree Forest",
  'At Eagle Point, keep an eye out for the "eagle in the rock" and explore the Native American dwellings',
  "At Grand Canyon West, you’ll be treated to stunning views of the mighty Colorado River winding through the canyon floor",
];

describe("auditEngine6ItineraryTitle", () => {
  it.each(knownGoodTitles)("does not flag known good POI title %s", title => {
    expect(
      auditEngine6ItineraryTitle({
        title,
        description: `${title} is a concise point-of-interest stop name.`,
      })
    ).toEqual([]);
  });

  it.each(knownBadTitles)(
    "flags known bad prose or generic title %s",
    title => {
      expect(
        auditEngine6ItineraryTitle({
          title,
          description: title,
        })
      ).not.toEqual([]);
    }
  );

  it("flags visit-prefix titles when the remaining title duplicates the description start", () => {
    expect(
      auditEngine6ItineraryTitle({
        title: "Visit Jackson Square and hear stories from your guide",
        description: "Jackson Square and hear stories from your guide.",
      })
    ).toContain("visit-prefix-matches-description");
  });

  it("flags missing and very short titles", () => {
    expect(auditEngine6ItineraryTitle({ title: "" })).toContain(
      "missing-or-too-short"
    );
    expect(auditEngine6ItineraryTitle({ title: "At" })).toContain(
      "missing-or-too-short"
    );
  });
});
