import { writeFileSync, readFileSync, existsSync } from "node:fs";

/** Product URLs for browser CDP extraction — run EXTRACT_PRODUCT_JS from viatorBrowserExtract.ts on each. */
export const OLYMPIC_PRODUCT_URLS: Record<string, string> = {
  "88081P2":
    "https://www.viator.com/tours/Port-Angeles/Lake-Crescent-and-Marymere-Falls-Olympic-National-Park-Guided-Tour/d4390-88081P2",
  "88081P4":
    "https://www.viator.com/tours/Port-Angeles/Hoh-Rain-Forest-and-Pacific-Coast-Olympic-National-Park-Guided-Tour/d4390-88081P4",
  "88081P1":
    "https://www.viator.com/tours/Port-Angeles/Hurricane-Ridge-Olympic-National-Park-Guided-Tour/d4390-88081P1",
  "5412OLYM":
    "https://www.viator.com/tours/Seattle/Small-Group-Olympic-National-Park-Tour-from-Seattle/d704-5412OLYM",
  "132218P140":
    "https://www.viator.com/tours/Seattle/1-Day-Olympic-National-Park-Tour-Seattle-departure-SO1/d704-132218P140",
  "5557524P1":
    "https://www.viator.com/tours/Seattle/Olympic-National-Park-Highlight-Tour/d704-5557524P1",
  "3657P1":
    "https://www.viator.com/tours/Seattle/Olympic-National-Park-tour/d704-3657P1",
  "132218P405":
    "https://www.viator.com/tours/Seattle/Small-Group-Olympic-National-Park-Day-Tour-from-Seattle/d704-132218P405",
  "265766P23":
    "https://www.viator.com/tours/Olympic-National-Park/Small-Group-Hiking-Tour-of-Olympic-National-Park-West-Peninsula/d50807-265766P23",
  "5412P36":
    "https://www.viator.com/tours/Seattle/3-Days-in-Olympic-National-Park-from-Seattle-Hidden-Hikes/d704-5412P36",
  "318681P15":
    "https://www.viator.com/tours/Seattle/Explore-Olympic-National-Park-from-Seattle-in-SUV/d704-318681P15",
  "265766P14":
    "https://www.viator.com/tours/Port-Angeles/Full-Day-Private-Tour-and-Hike-in-Olympic-National-Park/d4390-265766P14",
  "265766P73":
    "https://www.viator.com/tours/Olympic-National-Park/Olympic-Two-Day-Private-Tour-and-Hike/d50807-265766P73",
  "383259P1":
    "https://www.viator.com/tours/Seattle/Olympic-Peninsula-Experience-the-spectacular-beauty-of-the-Pacific-Coastline/d704-383259P1",
};

export const OLYMPIC_SELECTED_PRODUCT_CODES = Object.keys(OLYMPIC_PRODUCT_URLS);

const OUTPUT = "scripts/olympic-live-product-data.json";

export const mergeOlympicLiveExtract = (extract: Record<string, unknown>) => {
  const existing = existsSync(OUTPUT)
    ? (JSON.parse(readFileSync(OUTPUT, "utf8")) as Record<string, unknown>[])
    : [];
  const code = String(extract.productCode ?? "");
  const next = existing.filter(row => row.productCode !== code);
  next.push(extract);
  next.sort((a, b) =>
    String(a.productCode).localeCompare(String(b.productCode))
  );
  writeFileSync(OUTPUT, `${JSON.stringify(next, null, 2)}\n`);
  return next.length;
};
