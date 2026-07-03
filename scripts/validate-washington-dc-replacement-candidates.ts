/**
 * Validate Washington D.C. replacement candidates via live Viator API.
 * Run: npx tsx scripts/validate-washington-dc-replacement-candidates.ts
 */
import { validateEngine6LiveViatorCandidate } from "../src/engine6/engine6LiveViatorProductionValidation";
import { resolveViatorApiConfig } from "../api/engine6/resolveEngine6ViatorProductCommercialExtract";

const KEEP_CODES = new Set([
  "67327P4",
  "7953P7",
  "149066P1",
  "255730P191",
  "67327P5",
  "41503P1",
  "41503P2",
  "67327P3",
  "6349DAYTOUR",
  "6349NIGHT",
  "6766P11",
  "41377P2",
  "60725P1",
  "14782P1",
  "5046WAS_MON",
  "6349VIPDC",
]);

const CANDIDATES: Array<{
  productCode: string;
  sourceUrl: string;
  replaces?: string;
  experienceType: string;
}> = [
  {
    productCode: "7812P219",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-walking-tasting-tour-with-Secret-Food-Tours/d657-7812P219",
    replaces: "5713P68",
    experienceType: "food-tour",
  },
  {
    productCode: "39348P6",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Georgetown-Food-Tour/d657-39348P6",
    replaces: "5713P68",
    experienceType: "food-tour",
  },
  {
    productCode: "13603P2",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Georgetown-Foodie-Tour/d657-13603P2",
    replaces: "5713P68",
    experienceType: "food-tour",
  },
  {
    productCode: "67327P1",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Washington-DC-Day-Tour/d657-67327P1",
    replaces: "32453P11",
    experienceType: "private-day-tour",
  },
  {
    productCode: "67327P2",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Washington-DC-Monuments-Tour/d657-67327P2",
    replaces: "32453P11",
    experienceType: "private-monuments",
  },
  {
    productCode: "67327P13",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Black-History-Tour-Washington-DC/d657-67327P13",
    replaces: "32453P11",
    experienceType: "private-black-history",
  },
  {
    productCode: "255730P179",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Private-Walking-Tour-of-Capitol-Hill-and-the-National-Mall/d657-255730P179",
    replaces: "32453P11",
    experienceType: "private-walking",
  },
  {
    productCode: "2890P1",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Arlington-National-Cemetery-Tour/d657-2890P1",
    replaces: "6349P24",
    experienceType: "arlington-cemetery",
  },
  {
    productCode: "6766SIGTOUR",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Guided-Tour-of-Washington-DC/d657-6766SIGTOUR",
    replaces: "2890P28",
    experienceType: "full-day-sightseeing",
  },
  {
    productCode: "6766P13",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Luxury-Day-Tour-With-Hotel-Pickup-Plus-Potomac-River-Cruise/d657-6766P13",
    replaces: "2890P28",
    experienceType: "full-day-sightseeing",
  },
  {
    productCode: "6766P29",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Full-Day-Capitol-Hill-Walking-Tour-DC-Bus-Tour-8-00AM/d657-6766P29",
    replaces: "6349P24",
    experienceType: "capitol-full-day",
  },
  {
    productCode: "6349P27",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/DC-Highlights-Sightseeing-Tour/d657-6349P27",
    replaces: "2890P28",
    experienceType: "half-day-sightseeing",
  },
  {
    productCode: "2384P20",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Bike-Tour-of-the-National-Mall/d657-2384P20",
    replaces: "2384P1",
    experienceType: "bike-tour",
  },
  {
    productCode: "2384P2",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Best-of-Capitol-Hill-Bike-Tour/d657-2384P2",
    replaces: "2384P1",
    experienceType: "bike-tour",
  },
  {
    productCode: "40048P18",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Small-Group-Walking-Tour-of-Capitol-Hill/d657-40048P18",
    replaces: "5713P68",
    experienceType: "capitol-walking",
  },
  {
    productCode: "40048P1",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-National-Mall-Walking-Tour/d657-40048P1",
    replaces: "5713P68",
    experienceType: "mall-walking",
  },
  {
    productCode: "5046PATRIOTS",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Hop-On-Hop-Off-Patriots-Trolley-Tour/d657-5046PATRIOTS",
    replaces: "2890P2",
    experienceType: "hop-on-hop-off",
  },
  {
    productCode: "3707SEGWAY",
    sourceUrl:
      "https://www.viator.com/tours/Washington-DC/Washington-DC-Segway-Tour/d657-3707SEGWAY",
    replaces: "2384P1",
    experienceType: "segway-tour",
  },
];

const main = async () => {
  const { apiKey } = resolveViatorApiConfig();
  if (!apiKey) {
    console.error("VIATOR_API_KEY is required.");
    process.exit(1);
  }

  const filtered = CANDIDATES.filter(
    candidate => !KEEP_CODES.has(candidate.productCode)
  );

  const results = [];
  for (const candidate of filtered) {
    const result = await validateEngine6LiveViatorCandidate({
      productCode: candidate.productCode,
      sourceUrl: candidate.sourceUrl,
    });
    results.push({ ...candidate, ...result });
    console.log(
      `${result.passed ? "PASS" : "FAIL"} ${candidate.productCode} (${candidate.experienceType}): ${result.reason ?? "ok"}`
    );
  }

  console.log("\nPassed candidates:");
  for (const entry of results.filter(entry => entry.passed)) {
    console.log(
      `- ${entry.productCode} replaces=${entry.replaces} type=${entry.experienceType}`
    );
  }

  process.exit(results.some(entry => entry.passed) ? 0 : 1);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
