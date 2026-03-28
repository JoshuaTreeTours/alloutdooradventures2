import specimen63657Payload from "../../data/engine6/viator/63657P1.exact-product.json";
import specimen5119Payload from "../../data/engine6/viator/5119P13.exact-product.json";

export type Engine6ValidationFixture = {
  productCode: string;
  publicUrl: string;
  rawPayload: Record<string, unknown>;
};

export const ENGINE6_VALIDATION_FIXTURES: Engine6ValidationFixture[] = [
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
];
