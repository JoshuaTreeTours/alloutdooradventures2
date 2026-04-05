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
import specimen7081nycdayPayload from "../../data/engine6/viator/7081NYCDAY.exact-product.json";
import specimen3156Payload from "../../data/engine6/viator/3156P13.exact-product.json";
import specimen62527p11Payload from "../../data/engine6/viator/62527P11.exact-product.json";
import specimen5250libertyellisPayload from "../../data/engine6/viator/5250LIBERTYELLIS.exact-product.json";
import specimen5614063p8Payload from "../../data/engine6/viator/5614063P8.exact-product.json";
import specimen3857phiPayload from "../../data/engine6/viator/3857PHI.exact-product.json";
import specimen43656p1Payload from "../../data/engine6/viator/43656P1.exact-product.json";
import specimen3097sdzsp2visitPayload from "../../data/engine6/viator/3097SDZSP_2VISIT.exact-product.json";
import specimen447234p3Payload from "../../data/engine6/viator/447234P3.exact-product.json";
import specimen5584233p1Payload from "../../data/engine6/viator/5584233P1.exact-product.json";
import specimen327321p1Payload from "../../data/engine6/viator/327321P1.exact-product.json";
import specimen21165p1Payload from "../../data/engine6/viator/21165P1.exact-product.json";
import specimen31015p9Payload from "../../data/engine6/viator/31015P9.exact-product.json";
import specimen173946p1Payload from "../../data/engine6/viator/173946P1.exact-product.json";
import specimen383300p6Payload from "../../data/engine6/viator/383300P6.exact-product.json";
import specimen76145p2Payload from "../../data/engine6/viator/76145P2.exact-product.json";
import specimen5559561p1Payload from "../../data/engine6/viator/5559561P1.exact-product.json";
import specimen118958p8Payload from "../../data/engine6/viator/118958P8.exact-product.json";
import specimen6331bahaPayload from "../../data/engine6/viator/6331BAHA.exact-product.json";
import specimen57834p1Payload from "../../data/engine6/viator/57834P1.exact-product.json";
import specimen10150p16Payload from "../../data/engine6/viator/10150P16.exact-product.json";

import specimen8836p2Payload from "../../data/engine6/viator/8836P2.exact-product.json";
import specimen231628p7Payload from "../../data/engine6/viator/231628P7.exact-product.json";
import specimen5503p10Payload from "../../data/engine6/viator/5503P10.exact-product.json";
import specimen7943p1Payload from "../../data/engine6/viator/7943P1.exact-product.json";
import specimen214880p12Payload from "../../data/engine6/viator/214880P12.exact-product.json";
import specimen44152p18Payload from "../../data/engine6/viator/44152P18.exact-product.json";
import specimen402171p1Payload from "../../data/engine6/viator/402171P1.exact-product.json";
import specimen408277p4Payload from "../../data/engine6/viator/408277P4.exact-product.json";
import specimen5503p21Payload from "../../data/engine6/viator/5503P21.exact-product.json";
import specimen342209p4Payload from "../../data/engine6/viator/342209P4.exact-product.json";

import specimen3587islquessPayload from "../../data/engine6/viator/3587ISLQUESS.exact-product.json";
import specimen5865p8Payload from "../../data/engine6/viator/5865P8.exact-product.json";
import specimen89173p8Payload from "../../data/engine6/viator/89173P8.exact-product.json";
import specimen89173p10Payload from "../../data/engine6/viator/89173P10.exact-product.json";
import specimen438341p2Payload from "../../data/engine6/viator/438341P2.exact-product.json";
import specimen5024manskyPayload from "../../data/engine6/viator/5024MANSKY.exact-product.json";
import specimen103533p1Payload from "../../data/engine6/viator/103533P1.exact-product.json";

export type Engine6ValidationFixture = {
  productCode: string;
  publicUrl: string;
  rawPayload: Record<string, unknown>;
};

export const ENGINE6_VALIDATION_FIXTURES: Engine6ValidationFixture[] = [
  {
    productCode: "3587ISLQUESS",
    publicUrl:
      "https://www.viator.com/tours/Miami/Millionaires-Row-Cruise/d662-3587ISLQUESS",
    rawPayload: specimen3587islquessPayload as Record<string, unknown>,
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
    productCode: "7943P1",
    publicUrl:
      "https://www.viator.com/tours/Miami/Biscayne-Bay-Jet-Ski-Tour/d662-7943P1",
    rawPayload: specimen7943p1Payload as Record<string, unknown>,
  },
  {
    productCode: "438341P2",
    publicUrl:
      "https://www.viator.com/tours/Miami/Sightseeing-tour-or-party-on-a-Monterey-32ft/d662-438341P2",
    rawPayload: specimen438341p2Payload as Record<string, unknown>,
  },
  {
    productCode: "5024MANSKY",
    publicUrl:
      "https://www.viator.com/tours/New-York-City/Manhattan-Sky-Tour-New-York-Helicopter-Flight/d687-5024MANSKY",
    rawPayload: specimen5024manskyPayload as Record<string, unknown>,
  },
  {
    productCode: "103533P1",
    publicUrl:
      "https://www.viator.com/tours/New-York-City/New-York-Media-Boat-Adventure-Sightseeing-Tour/d687-103533P1",
    rawPayload: specimen103533p1Payload as Record<string, unknown>,
  },
  {
    productCode: "214880P12",
    publicUrl:
      "https://www.viator.com/tours/Miami/3-days-amazing-tour-in-Miami/d662-214880P12",
    rawPayload: specimen214880p12Payload as Record<string, unknown>,
  },
  {
    productCode: "44152P18",
    publicUrl:
      "https://www.viator.com/tours/Miami/Everglades-to-Keys-Floridas-Ultimate-National-Parks-Expedition/d662-44152P18",
    rawPayload: specimen44152p18Payload as Record<string, unknown>,
  },
  {
    productCode: "402171P1",
    publicUrl:
      "https://www.viator.com/tours/Miami/Miami-Excursions-Luxury-Experience-Private/d662-402171P1",
    rawPayload: specimen402171p1Payload as Record<string, unknown>,
  },
  {
    productCode: "408277P4",
    publicUrl:
      "https://www.viator.com/tours/Miami/Real-Extreme-Off-Road-ATV-Miami-driver-license-required/d662-408277P4",
    rawPayload: specimen408277p4Payload as Record<string, unknown>,
  },
  {
    productCode: "5503P21",
    publicUrl:
      "https://www.viator.com/tours/Miami/All-Included-Combo-with-Miami-Watersports/d662-5503P21",
    rawPayload: specimen5503p21Payload as Record<string, unknown>,
  },
  {
    productCode: "342209P4",
    publicUrl:
      "https://www.viator.com/tours/Miami/SUP-Kayak-Wildlife-exploration-through-mangrove-jungle/d662-342209P4",
    rawPayload: specimen342209p4Payload as Record<string, unknown>,
  },
  {
    productCode: "5865P8",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/Florida-Everglades-Airboat-Tour-and-Show-from-Fort-Lauderdale-Group/d660-5865P8",
    rawPayload: specimen5865p8Payload as Record<string, unknown>,
  },
  {
    productCode: "89173P8",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/Reef-and-Snorkel-Paddle-Tour/d660-89173P8",
    rawPayload: specimen89173p8Payload as Record<string, unknown>,
  },
  {
    productCode: "89173P10",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/Fort-Lauderdales-Tropical-Kayak-Tour-and-Island-Adventure/d660-89173P10",
    rawPayload: specimen89173p10Payload as Record<string, unknown>,
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
    productCode: "7081NYCDAY",
    publicUrl:
      "https://www.viator.com/tours/New-York-City/New-York-in-One-Day-Guided-Sightseeing-Tour/d687-7081NYCDAY",
    rawPayload: specimen7081nycdayPayload as Record<string, unknown>,
  },
  {
    productCode: "62527P11",
    publicUrl:
      "https://www.viator.com/tours/New-York-City/Niagara-Falls-in-One-Day-from-New-York-City/d687-62527P11",
    rawPayload: specimen62527p11Payload as Record<string, unknown>,
  },
  {
    productCode: "5250LIBERTYELLIS",
    publicUrl:
      "https://www.viator.com/tours/New-York-City/Statue-of-Liberty-and-Ellis-Island-Guided-Tour/d687-5250LIBERTYELLIS",
    rawPayload: specimen5250libertyellisPayload as Record<string, unknown>,
  },
  {
    productCode: "5614063P8",
    publicUrl:
      "https://www.viator.com/tours/New-York/Washington-D-C-Tour-from-New-York/d5560-5614063P8",
    rawPayload: specimen5614063p8Payload as Record<string, unknown>,
  },
  {
    productCode: "3857PHI",
    publicUrl:
      "https://www.viator.com/tours/New-York-City/Philadelphia-and-Amish-Country-Day-Trip-from-New-York/d687-3857PHI",
    rawPayload: specimen3857phiPayload as Record<string, unknown>,
  },
  {
    productCode: "43656P1",
    publicUrl:
      "https://www.viator.com/tours/New-York-City/Private-Tour-of-the-Metropolitan-Museum-of-Art-in-New-York-City/d687-43656P1",
    rawPayload: specimen43656p1Payload as Record<string, unknown>,
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
  {
    productCode: "76145P2",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/Authentic-Private-Everglades-Airboat-Tour/d660-76145P2",
    rawPayload: specimen76145p2Payload as Record<string, unknown>,
  },
  {
    productCode: "5559561P1",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/JetCar-Fort-Lauderdale-Rental/d660-5559561P1",
    rawPayload: specimen5559561p1Payload as Record<string, unknown>,
  },
  {
    productCode: "118958P8",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/4-Hour-Shared-Big-Game-Fishing/d660-118958P8",
    rawPayload: specimen118958p8Payload as Record<string, unknown>,
  },
  {
    productCode: "6331BAHA",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/Bahamas-Ferry-Day-Trip-from-Miami-with-Transport/d660-6331BAHA",
    rawPayload: specimen6331bahaPayload as Record<string, unknown>,
  },
  {
    productCode: "57834P1",
    publicUrl:
      "https://www.viator.com/tours/Fort-Lauderdale/Venice-of-America-Fort-Lauderdale-Cruise/d660-57834P1",
    rawPayload: specimen57834p1Payload as Record<string, unknown>,
  },
  {
    productCode: "10150P16",
    publicUrl:
      "https://www.viator.com/tours/Miami/Miami-Raccoon-Island-Adventure/d662-10150P16",
    rawPayload: specimen10150p16Payload as Record<string, unknown>,
  },
];
