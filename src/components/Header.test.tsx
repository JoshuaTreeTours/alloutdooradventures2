import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Router } from "wouter";
import Header, { toursMenuItems } from "./Header";

describe("Header tours navigation", () => {
  it("limits the Tours dropdown to Day Tours and Multi-Day Adventures", () => {
    expect(toursMenuItems).toEqual([
      { label: "Day Tours", href: "/activities" },
      { label: "Multi-Day Adventures", href: "/activities" },
    ]);

    const html = renderToString(
      <Router hook={() => ["/", () => undefined]}>
        <Header />
      </Router>
    );

    expect(html).toContain('href="/activities"');
    expect(html).toContain("Day Tours");
    expect(html).toContain("Multi-Day Adventures");
    expect(html).not.toContain("Cycling");
    expect(html).not.toContain("Hiking");
    expect(html).not.toContain("Paddle Sports");
  });
});
