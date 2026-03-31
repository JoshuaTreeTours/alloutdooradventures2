import specimen63657Payload from "../../data/engine6/viator/63657P1.exact-product.json";
import specimen5119Payload from "../../data/engine6/viator/5119P13.exact-product.json";
import specimen32779Payload from "../../data/engine6/viator/32779P2.exact-product.json";
import specimen60136Payload from "../../data/engine6/viator/60136P1.exact-product.json";
import specimen26719Payload from "../../data/engine6/viator/26719P8.exact-product.json";
import specimen36001Payload from "../../data/engine6/viator/36001P1.exact-product.json";
import specimen100569Payload from "../../data/engine6/viator/100569P5.exact-product.json";
import specimen411138Payload from "../../data/engine6/viator/411138P3.exact-product.json";
import specimen53474Payload from "../../data/engine6/viator/53474P8.exact-product.json";
import specimen233384Payload from "../../data/engine6/viator/233384P2.exact-product.json";
import specimen414460Payload from "../../data/engine6/viator/414460P1.exact-product.json";
import specimen3156Payload from "../../data/engine6/viator/3156P13.exact-product.json";
import specimen383300p4Payload from "../../data/engine6/viator/383300P4.exact-product.json";
import specimen5144whalePayload from "../../data/engine6/viator/5144WHALE.exact-product.json";
import specimen3097sdzsp2visitPayload from "../../data/engine6/viator/3097SDZSP_2VISIT.exact-product.json";
import specimen447234p3Payload from "../../data/engine6/viator/447234P3.exact-product.json";
import specimen5584233p1Payload from "../../data/engine6/viator/5584233P1.exact-product.json";
import specimen327321p1Payload from "../../data/engine6/viator/327321P1.exact-product.json";
import specimen21165p1Payload from "../../data/engine6/viator/21165P1.exact-product.json";
import specimen31015p9Payload from "../../data/engine6/viator/31015P9.exact-product.json";
import specimen173946p1Payload from "../../data/engine6/viator/173946P1.exact-product.json";

import specimen5865p8Payload from "../../data/engine6/viator/5865P8.exact-product.json";
export type Engine6ValidationFixture = {
  productCode: string;
  publicUrl: string;
  rawPayload: Record<string, unknown>;
  heroImageUrl?: string;
  images?: Array<Record<string, unknown>>;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const hasFixtureImages = (product: Record<string, unknown>) => {
  const media = asRecord(product.media);
  const mediaImages = media?.images;
  const rootImages = product.images;

  return (
    (Array.isArray(mediaImages) && mediaImages.length > 0) ||
    (Array.isArray(rootImages) && rootImages.length > 0)
  );
};

export const buildEngine6FixtureRawPayload = (
  fixture: Engine6ValidationFixture
) => {
  const cloned = structuredClone(fixture.rawPayload);
  const root = asRecord(cloned);
  const product = asRecord(root?.product);

  if (!root || !product) {
    return fixture.rawPayload;
  }

  if (!hasFixtureImages(product)) {
    if (fixture.images && fixture.images.length > 0) {
      const media = asRecord(product.media) ?? {};
      media.images = fixture.images;
      product.media = media;
    } else if (fixture.heroImageUrl) {
      const media = asRecord(product.media) ?? {};
      media.images = [{ url: fixture.heroImageUrl, isCover: true }];
      product.media = media;
    }
  }

  if (fixture.heroImageUrl && typeof product.heroImageUrl !== "string") {
    product.heroImageUrl = fixture.heroImageUrl;
  }

  root.product = product;
  return root;
};

export const ENGINE6_VALIDATION_FIXTURES: Engine6ValidationFixture[] = [
  {
    productCode: "5865P8",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/Florida-Everglades-Airboat-Tour-and-Show-from-Fort-Lauderdale-Group/d660-5865P8",
    rawPayload: specimen5865p8Payload as Record<string, unknown>,
  },
  {
    productCode: "63657P1",
    publicUrl:
      "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Vineyard-to-Table-Taste-Tour-by-Bike/d4372-63657P1",
    rawPayload: specimen63657Payload as Record<string, unknown>,
  },
  {
    productCode: "5119P13",
    publicUrl:
      "https://www.viator.com/tours/Las-Vegas/Grand-Canyon-West-6-in-1-Tour-with-Helicopter-and-Landing/d684-5119P13",
    rawPayload: specimen5119Payload as Record<string, unknown>,
  },
  {
    productCode: "32779P2",
    publicUrl:
      "https://www.viator.com/tours/Los-Angeles/Catalina-Island-Semi-Submarine-Undersea-Tour/d645-32779P2",
    rawPayload: specimen32779Payload as Record<string, unknown>,
  },
  {
    productCode: "60136P1",
    publicUrl:
      "https://www.viator.com/tours/Las-Vegas/Antelope-Canyon-Horseshoe-Bend-Day-Tour-from-Las-Vegas/d684-60136P1",
    rawPayload: specimen60136Payload as Record<string, unknown>,
  },
  {
    productCode: "26719P8",
    publicUrl:
      "https://www.viator.com/tours/Las-Vegas/Emerald-Cave-Kayaking-Tour/d684-26719P8",
    rawPayload: specimen26719Payload as Record<string, unknown>,
  },
  {
    productCode: "36001P1",
    publicUrl:
      "https://www.viator.com/tours/San-Francisco/Yosemite-In-A-Day-Tour-from-San-Francisco/d651-36001P1",
    rawPayload: specimen36001Payload as Record<string, unknown>,
  },
  {
    productCode: "100569P5",
    publicUrl:
      "https://www.viator.com/tours/Anchorage/SUNSET-Wilderness-Wildlife-Glacier-and-Nature-Free-Photo-Lessons-May-Sept/d4152-100569P5",
    rawPayload: specimen100569Payload as Record<string, unknown>,
  },
  {
    productCode: "411138P3",
    publicUrl:
      "https://www.viator.com/tours/Anchorage/Private-Anchorage-Tour-and-Wilderness-Adventure/d4152-411138P3",
    rawPayload: specimen411138Payload as Record<string, unknown>,
  },
  {
    productCode: "53474P8",
    publicUrl:
      "https://www.viator.com/tours/Anchorage/Anchorage-Greenbelt-Bike-Tour/d4152-53474P8",
    rawPayload: specimen53474Payload as Record<string, unknown>,
  },
  {
    productCode: "233384P2",
    publicUrl:
      "https://www.viator.com/tours/New-York-City/Brooklyn-Bridge-Waterfront-Bike-Tour/d687-233384P2",
    rawPayload: specimen233384Payload as Record<string, unknown>,
  },
  {
    productCode: "414460P1",
    publicUrl:
      "https://www.viator.com/tours/New-York-City/Vip-Central-Park-Pedicab-Guided-Tours/d687-414460P1",
    rawPayload: specimen414460Payload as Record<string, unknown>,
  },
  {
    productCode: "3156P13",
    publicUrl:
      "https://www.viator.com/tours/New-York-City/Electric-Bike-Tour-Classic-Manhattan-and-more/d687-3156P13",
    rawPayload: specimen3156Payload as Record<string, unknown>,
  },
  {
    productCode: "383300P4",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/Guided-eBike-Tours-of-Fort-Lauderdale/d660-383300P4",
    rawPayload: specimen383300p4Payload as Record<string, unknown>,
  },
  {
    productCode: "5144WHALE",
    publicUrl:
      "https://www.viator.com/tours/San-Diego/Whale-Watching-Cruise-Guided-by-experts-from-Birch-Aquarium/d736-5144WHALE",
    rawPayload: specimen5144whalePayload as Record<string, unknown>,
  },
  {
    productCode: "3097SDZSP_2VISIT",
    publicUrl:
      "https://www.viator.com/tours/San-Diego/San-Diego-Zoo-and-Safari-Park-Combo-Tour/d736-3097SDZSP_2VISIT",
    rawPayload: specimen3097sdzsp2visitPayload as Record<string, unknown>,
  },
  {
    productCode: "447234P3",
    publicUrl:
      "https://www.viator.com/tours/San-Diego/Day-Trip-to-Joshua-Tree-National-Park-from-San-Diego/d736-447234P3",
    rawPayload: specimen447234p3Payload as Record<string, unknown>,
  },
  {
    productCode: "5584233P1",
    publicUrl:
      "https://www.viator.com/tours/San-Diego/Spectacular-Sunset-Sailing/d736-5584233P1",
    rawPayload: specimen5584233p1Payload as Record<string, unknown>,
  },
  {
    productCode: "21165P1",
    publicUrl:
      "https://www.viator.com/tours/San-Diego/Original-Sea-Cave-Kayak-Tour/d736-21165P1",
    rawPayload: specimen21165p1Payload as Record<string, unknown>,
  },
  {
    productCode: "31015P9",
    publicUrl:
      "https://www.viator.com/tours/San-Diego/Private-Sailing-Charter-on-San-Diego-Bay/d736-31015P9",
    rawPayload: specimen31015p9Payload as Record<string, unknown>,
  },
  {
    productCode: "173946P1",
    publicUrl:
      "https://www.viator.com/tours/San-Diego/Half-Day-4x4-Adventure/d736-173946P1",
    rawPayload: specimen173946p1Payload as Record<string, unknown>,
  },
  {
    productCode: "327321P1",
    publicUrl:
      "https://www.viator.com/tours/Palm-Springs/Mountain-Sunrise-Hike-and-Meditation/d648-327321P1",
    rawPayload: specimen327321p1Payload as Record<string, unknown>,
  },
];
