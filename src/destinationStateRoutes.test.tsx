import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { destinations } from "./data/destinations";
import StateLandingRoute from "./pages/destinations/StateLandingRoute";

const repoRoot = process.cwd();

Object.defineProperty(globalThis, "location", {
  value: { pathname: "/destinations", search: "", hash: "" },
  configurable: true,
});

const readRepoFile = (path: string) =>
  readFileSync(join(repoRoot, path), "utf8");

const obsoleteStateToursPattern =
  /\/destinations\/(?:states\/|united-states\/)?[a-z-]+\/tours(?=$|["'`\s?<])/;
const obsoleteStateToursTemplatePattern =
  /\/destinations\/(?:states\/|united-states\/)?\$\{[^}]+\}\/tours/;

const publicInternalLinkSources = [
  "src/components/Footer.tsx",
  "src/data/destinations.ts",
  "src/data/tourIndex.ts",
  "src/pages/destinations/DestinationsIndex.tsx",
  "src/templates/StateTemplate.tsx",
];

describe("destination state-level route integrity", () => {
  it("does not emit obsolete state-level tours routes from internal link builders", () => {
    const offenders = publicInternalLinkSources.flatMap(file => {
      const source = readRepoFile(file);
      return obsoleteStateToursPattern.test(source) ||
        obsoleteStateToursTemplatePattern.test(source)
        ? [file]
        : [];
    });

    expect(offenders).toEqual([]);
  });

  it("does not publish obsolete state-level tours routes in destination sitemaps", () => {
    const sitemap = readRepoFile("public/sitemap-destinations.xml");

    expect(sitemap.match(obsoleteStateToursPattern) ?? []).toEqual([]);
    expect(sitemap).toContain("/destinations/california");
    expect(sitemap).not.toContain("/destinations/states/alaska/tours");
    expect(sitemap).not.toContain("/destinations/united-states/alaska/tours");
  });

  it("redirects obsolete state-level tours route patterns to canonical state destinations", () => {
    const vercelConfig = JSON.parse(readRepoFile("vercel.json")) as {
      redirects?: Array<{
        source: string;
        destination: string;
        permanent: boolean;
      }>;
    };

    expect(vercelConfig.redirects).toEqual(
      expect.arrayContaining([
        {
          source: "/destinations/:stateSlug/tours",
          destination: "/destinations/:stateSlug",
          permanent: true,
        },
        {
          source: "/destinations/states/:stateSlug/tours",
          destination: "/destinations/:stateSlug",
          permanent: true,
        },
        {
          source: "/destinations/united-states/:stateSlug/tours",
          destination: "/destinations/:stateSlug",
          permanent: true,
        },
      ])
    );
  });

  it("renders every internally linked canonical state destination without not-found copy", () => {
    const linkedStateSlugs = destinations
      .map(destination => {
        const match = destination.href.match(/^\/destinations\/([^/]+)$/);
        return match?.[1] ?? null;
      })
      .filter((slug): slug is string => Boolean(slug));

    expect(linkedStateSlugs).toContain("california");

    const notFoundRoutes = linkedStateSlugs.filter(stateSlug => {
      const html = renderToString(<StateLandingRoute params={{ stateSlug }} />);
      return /State not found|City not found|Destination not found/.test(html);
    });

    expect(notFoundRoutes).toEqual([]);
  });

  it("renders known fallback state destinations such as Alaska without not-found copy", () => {
    const html = renderToString(
      <StateLandingRoute params={{ stateSlug: "alaska" }} />
    );

    expect(html).not.toMatch(
      /State not found|City not found|Destination not found/
    );
  });
});
