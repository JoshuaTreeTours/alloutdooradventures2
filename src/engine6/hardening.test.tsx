import { describe, expect, it } from "vitest";
import { getToursByCityUnified } from "../data/tours";
import {
  assertEngine6CtaIntegrity,
  assertEngine6DataSource,
  assertEngine6ImageDeterminism,
  assertEngine6NoFallbackContamination,
  assertEngine6RendererSupremacy,
} from "./hardening";

describe("engine6 hardening guards", () => {
  it("enforces renderer identity for engine6 routes", () => {
    expect(() =>
      assertEngine6RendererSupremacy({
        tourEngine: "engine6",
        renderer: "engine6",
      })
    ).not.toThrow();
    expect(() =>
      assertEngine6RendererSupremacy({
        tourEngine: "engine6",
        renderer: "engine4",
      })
    ).toThrow(/renderer must be engine6/i);
  });

  it("blocks fallback hero images and legacy contamination", () => {
    expect(() =>
      assertEngine6NoFallbackContamination({
        heroUrl: "https://cdn.viator.com/product.jpg",
        usesLegacyGallery: false,
        usesLegacyRenderer: false,
      })
    ).not.toThrow();
    expect(() =>
      assertEngine6NoFallbackContamination({
        heroUrl: "/hero.jpg",
        usesLegacyGallery: false,
        usesLegacyRenderer: false,
      })
    ).toThrow(/fallback hero image/i);
  });

  it("enforces image parity and source integrity assertions", () => {
    expect(() =>
      assertEngine6ImageDeterminism({
        heroImage: "https://cdn.viator.com/image.jpg",
        cardImage: "https://cdn.viator.com/image.jpg",
        schemaImage: "https://cdn.viator.com/image.jpg",
      })
    ).not.toThrow();
    expect(() =>
      assertEngine6DataSource("engine6-native")
    ).not.toThrow();
    expect(() =>
      assertEngine6DataSource("legacy-fh-migrated")
    ).toThrow(/engine6-native/i);

    expect(() =>
      assertEngine6ImageDeterminism({
        heroImage: "",
        cardImage: "",
        schemaImage: undefined,
      })
    ).not.toThrow();
    expect(() =>
      assertEngine6ImageDeterminism({
        heroImage: "",
        cardImage: "https://cdn.viator.com/other.jpg",
        schemaImage: undefined,
      })
    ).toThrow(/hero image must match listing card image/i);
  });

  it("enforces CTA integrity for product-level affiliate links", () => {
    expect(() =>
      assertEngine6CtaIntegrity(
        "https://www.viator.com/tours/San-Diego/Tour/d736-3097SDZSP_2VISIT?pid=P00290915&mcid=42383&medium=link"
      )
    ).not.toThrow();
    expect(() =>
      assertEngine6CtaIntegrity("https://www.viator.com/search/all?pid=P00290915")
    ).toThrow(/search/i);
    expect(() =>
      assertEngine6CtaIntegrity(
        "/destinations/california/san-diego/tours/art-of-balboa-park-walking-tour-651385/book"
      )
    ).not.toThrow();
  });

  it("keeps unified listings unique by canonical path with engine6 precedence", () => {
    const unified = getToursByCityUnified("california", "san-diego");
    const canonicalPaths = unified.map(entry => entry.href);
    expect(new Set(canonicalPaths).size).toBe(canonicalPaths.length);
  });
});
