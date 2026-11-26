import { afterEach, describe, expect, it, vi } from "vitest";
import { getFareHarborProofBookingUrl } from "../data/fareharborProofBooking";
import { getFareHarborProofProducts } from "../data/fareharborLeadToGoldProof";
import { getProofBackedFareHarborTourByCanonicalPath } from "./legacyFh/registry";
import { isFareHarborEmbedsBookingUrl } from "./fareharborLightframe";

describe("Engine6 FareHarbor Lightframe eligibility and inventory", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("recognizes FareHarbor embed-book URLs without classifying other providers", () => {
    expect(
      isFareHarborEmbedsBookingUrl(
        "https://fareharbor.com/embeds/book/sample/items/12345/?asn=fhdn"
      )
    ).toBe(true);
    expect(
      isFareHarborEmbedsBookingUrl("https://www.viator.com/tours/example")
    ).toBe(false);
    expect(
      isFareHarborEmbedsBookingUrl(
        "/destinations/new-york/new-york/tours/sample/book"
      )
    ).toBe(false);
  });

  it("maps every active FareHarbor proof product to its exact attributed Engine6 booking link", () => {
    const products = getFareHarborProofProducts();
    expect(products.length).toBeGreaterThan(0);

    for (const product of products) {
      const tour = getProofBackedFareHarborTourByCanonicalPath(
        product.publicPath
      );
      const expectedUrl = getFareHarborProofBookingUrl(product);

      expect(tour, product.publicPath).not.toBeNull();
      expect(tour?.ownership.ctaOwner, product.publicPath).toBe("fareharbor");
      expect(tour?.bookingUrl, product.publicPath).toBe(expectedUrl);
      expect(
        isFareHarborEmbedsBookingUrl(expectedUrl),
        product.publicPath
      ).toBe(true);

      const url = new URL(expectedUrl);
      expect(url.pathname).toBe(
        `/embeds/book/${product.company}/items/${product.itemId}/`
      );
      expect(url.searchParams.get("asn")).toBe("fhdn");
      expect(url.searchParams.get("asn-ref")).toBe("alloutdooradventures");
      expect(url.searchParams.get("ref")).toBe(
        "https://www.alloutdooradventures.com"
      );
      expect(url.searchParams.get("marketplace")).toBe("yes");
    }
  });

  it("covers a 10-operator pilot sample before enabling the full dynamic inventory", () => {
    const products = getFareHarborProofProducts();
    const seenOperators = new Set<string>();
    const pilot = products
      .filter(product => {
        if (seenOperators.has(product.company)) return false;
        seenOperators.add(product.company);
        return true;
      })
      .slice(0, 10);

    expect(pilot).toHaveLength(10);
    for (const product of pilot) {
      const tour = getProofBackedFareHarborTourByCanonicalPath(
        product.publicPath
      );
      expect(tour?.ownership.ctaOwner, product.company).toBe("fareharbor");
      expect(tour?.bookingUrl, product.company).toBe(
        getFareHarborProofBookingUrl(product)
      );
    }
  });

  it("loads the API on intent and scopes Lightframe to the exact affiliate link", async () => {
    const listeners = new Map<string, () => void>();
    const autoLightframe = vi.fn();
    const script = {
      addEventListener: vi.fn((name: string, callback: () => void) => {
        listeners.set(name, callback);
      }),
      removeEventListener: vi.fn((name: string) => listeners.delete(name)),
      remove: vi.fn(),
    };
    const fakeWindow: { FH?: { autoLightframe: typeof autoLightframe } } = {};
    const fakeDocument = {
      querySelector: vi.fn(() => null),
      createElement: vi.fn(() => script),
      head: {
        appendChild: vi.fn(() => {
          fakeWindow.FH = { autoLightframe };
          listeners.get("load")?.();
        }),
      },
    };

    vi.stubGlobal("window", fakeWindow);
    vi.stubGlobal("document", fakeDocument);
    vi.resetModules();
    const { prepareFareHarborLightframe } =
      await import("./fareharborLightframe");
    const viatorLink = {
      href: "https://www.viator.com/tours/example",
      isConnected: true,
    } as HTMLAnchorElement;
    const fareHarborLink = {
      href: "https://fareharbor.com/embeds/book/sample/items/12345/?asn=fhdn",
      isConnected: true,
    } as HTMLAnchorElement;

    expect(await prepareFareHarborLightframe(viatorLink)).toBe(false);
    expect(fakeDocument.createElement).not.toHaveBeenCalled();

    expect(await prepareFareHarborLightframe(fareHarborLink)).toBe(true);
    expect(fakeDocument.createElement).toHaveBeenCalledTimes(1);
    expect(fakeDocument.head.appendChild).toHaveBeenCalledTimes(1);
    expect(autoLightframe).toHaveBeenCalledTimes(1);
    expect(autoLightframe).toHaveBeenCalledWith({ container: fareHarborLink });
    expect(await prepareFareHarborLightframe(fareHarborLink)).toBe(true);
    expect(autoLightframe).toHaveBeenCalledTimes(1);
  });
});
