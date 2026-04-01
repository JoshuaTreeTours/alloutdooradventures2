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
import specimen3097sdzsp2visitPayload from "../../data/engine6/viator/3097SDZSP_2VISIT.exact-product.json";
import specimen447234p3Payload from "../../data/engine6/viator/447234P3.exact-product.json";
import specimen5584233p1Payload from "../../data/engine6/viator/5584233P1.exact-product.json";
import specimen327321p1Payload from "../../data/engine6/viator/327321P1.exact-product.json";
import specimen21165p1Payload from "../../data/engine6/viator/21165P1.exact-product.json";
import specimen31015p9Payload from "../../data/engine6/viator/31015P9.exact-product.json";
import specimen173946p1Payload from "../../data/engine6/viator/173946P1.exact-product.json";
import specimen383300p6Payload from "../../data/engine6/viator/383300P6.exact-product.json";

import specimen8836p2Payload from "../../data/engine6/viator/8836P2.exact-product.json";
import specimen231628p7Payload from "../../data/engine6/viator/231628P7.exact-product.json";
import specimen5503p10Payload from "../../data/engine6/viator/5503P10.exact-product.json";
import specimen21428p2Payload from "../../data/engine6/viator/21428P2.exact-product.json";
import specimen5221evergladesPayload from "../../data/engine6/viator/5221EVERGLADES.exact-product.json";
import specimen35834p1Payload from "../../data/engine6/viator/35834P1.exact-product.json";
import specimen5441boatPayload from "../../data/engine6/viator/5441BOAT.exact-product.json";
import specimen3587islquessPayload from "../../data/engine6/viator/3587ISLQUESS.exact-product.json";
import specimen120303p9Payload from "../../data/engine6/viator/120303P9.exact-product.json";
import specimen8836p1Payload from "../../data/engine6/viator/8836P1.exact-product.json";
import specimen5304havanaPayload from "../../data/engine6/viator/5304HAVANA.exact-product.json";
import specimen51540p1Payload from "../../data/engine6/viator/51540P1.exact-product.json";

import specimen5865p8Payload from "../../data/engine6/viator/5865P8.exact-product.json";
export type Engine6ValidationFixture = {
  productCode: string;
  publicUrl: string;
  rawPayload: Record<string, unknown>;
};

export const ENGINE6_VALIDATION_FIXTURES: Engine6ValidationFixture[] = [
  {
    productCode: "21428P2",
    publicUrl:
      "https://www.viator.com/tours/Miami/Everglades-Tour-from-Miami-with-Transportation/d662-21428P2",
    rawPayload: specimen21428p2Payload as Record<string, unknown>,
  },
  {
    productCode: "5221EVERGLADES",
    publicUrl:
      "https://www.viator.com/tours/Miami/Miami-Everglades-Airboat-Adventure-with-Transport/d662-5221EVERGLADES",
    rawPayload: specimen5221evergladesPayload as Record<string, unknown>,
  },
  {
    productCode: "35834P1",
    publicUrl:
      "https://www.viator.com/tours/Miami/Speedboat-Sightseeing-Tour-in-Miami/d662-35834P1",
    rawPayload: specimen35834p1Payload as Record<string, unknown>,
  },
  {
    productCode: "5441BOAT",
    publicUrl:
      "https://www.viator.com/tours/Miami/Miami-Speedboat-Tour/d662-5441BOAT",
    rawPayload: specimen5441boatPayload as Record<string, unknown>,
  },
  {
    productCode: "3587ISLQUESS",
    publicUrl:
      "https://www.viator.com/tours/Miami/Millionaires-Row-Cruise/d662-3587ISLQUESS",
    rawPayload: specimen3587islquessPayload as Record<string, unknown>,
  },
  {
    productCode: "120303P9",
    publicUrl:
      "https://www.viator.com/tours/Miami/Millionaires-Row-Cruise/d662-120303P9",
    rawPayload: specimen120303p9Payload as Record<string, unknown>,
  },
  {
    productCode: "8836P1",
    publicUrl:
      "https://www.viator.com/tours/Miami/Sightseeing-Cruise-of-Biscayne-Bay/d662-8836P1",
    rawPayload: specimen8836p1Payload as Record<string, unknown>,
  },
  {
    productCode: "5304HAVANA",
    publicUrl:
      "https://www.viator.com/tours/Miami/Little-Havana-Food-and-Walking-Tour-in-Miami/d662-5304HAVANA",
    rawPayload: specimen5304havanaPayload as Record<string, unknown>,
  },
  {
    productCode: "51540P1",
    publicUrl:
      "https://www.viator.com/tours/Miami/Little-Havana-Cultural-Walking-and-Food-Tour/d662-51540P1",
    rawPayload: specimen51540p1Payload as Record<string, unknown>,
  },
  {
    productCode: "8836P2",
    publicUrl:
      "https://www.viator.com/tours/Miami/Pirates-Adventures-Sightseeing-Tour-from-Miami/d662-8836P2",
    rawPayload: specimen8836p2Payload as Record<string, unknown>,
  },
  {
    productCode: "231628P7",
    publicUrl:
      "https://www.viator.com/tours/Miami/Taste-of-Miami-Helicopter-Tour/d662-231628P7",
    rawPayload: specimen231628p7Payload as Record<string, unknown>,
  },
  {
    productCode: "5503P10",
    publicUrl:
      "https://www.viator.com/tours/Miami/Parasailing-with-Miami-Watersports/d662-5503P10",
    rawPayload: specimen5503p10Payload as Record<string, unknown>,
  },
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
  {
    productCode: "383300P6",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/Guided-Electric-Bike-Tours-of-Greater-Fort-Lauderdale/d660-383300P6",
    rawPayload: specimen383300p6Payload as Record<string, unknown>,
  },
];
