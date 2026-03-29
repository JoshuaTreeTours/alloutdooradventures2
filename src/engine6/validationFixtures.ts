import specimen63657Payload from "../../data/engine6/viator/63657P1.exact-product.json";
import specimen5119Payload from "../../data/engine6/viator/5119P13.exact-product.json";
import specimen32779Payload from "../../data/engine6/viator/32779P2.exact-product.json";
import specimen60136Payload from "../../data/engine6/viator/60136P1.exact-product.json";
import specimen26719Payload from "../../data/engine6/viator/26719P8.exact-product.json";
import specimen3454Payload from "../../data/engine6/viator/3454_B0016.exact-product.json";

export type Engine6ValidationFixture = {
  productCode: string;
  publicUrl: string;
  rawPayload: Record<string, unknown>;
};

export const ENGINE6_VALIDATION_FIXTURES: Engine6ValidationFixture[] = [
  {
    productCode: "3454_B0016",
    publicUrl:
      "https://www.viator.com/tours/San-Francisco/Small-Group-Yosemite-Tour-from-San-Francisco/d651-3454_B0016",
    rawPayload: specimen3454Payload as Record<string, unknown>,
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
];
