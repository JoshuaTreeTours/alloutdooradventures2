import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const target = path.resolve("src/engine2/data/loadEngine2.ts");
let source = await readFile(target, "utf8");

const importLine =
  'import { getFareHarborEditorialForBookingUrl } from "../../data/fareharborEditorial";';

if (!source.includes(importLine)) {
  const anchor =
    'import { isHardDeletedLegacyTour } from "../../utils/tours/hardDeleteLegacyTours";';
  if (!source.includes(anchor)) {
    throw new Error("Could not find Engine2 import anchor");
  }
  source = source.replace(anchor, `${anchor}\n${importLine}`);
}

const overlayMarker = "[fh-editorial] catalog overlay";
if (!source.includes(overlayMarker)) {
  const marker = "  });\n\nconst byPath = new Map(";
  const markerIndex = source.lastIndexOf(marker);
  if (markerIndex < 0) {
    throw new Error("Could not find Engine2 map terminator");
  }

  const replacement = `  })\n  .map(tour => {\n    // [fh-editorial] catalog overlay — generated editorial replaces legacy boilerplate.\n    if ((tour.bookingProvider ?? "fareharbor") !== "fareharbor") {\n      return tour;\n    }\n    const editorial = getFareHarborEditorialForBookingUrl(\n      tour.bookingUrl ?? tour.booking.bookingUrl\n    );\n    if (!editorial) {\n      return tour;\n    }\n    return {\n      ...tour,\n      seo: {\n        ...tour.seo,\n        description: editorial.metaDescription,\n      },\n      content: {\n        ...tour.content,\n        experienceText: editorial.overview,\n        overview: editorial.overview,\n        highlights: editorial.highlights,\n      },\n    };\n  });\n\nconst byPath = new Map(`;

  source = `${source.slice(0, markerIndex)}${replacement}${source.slice(markerIndex + marker.length)}`;
}

await writeFile(target, source, "utf8");
console.info("[fh-editorial] Engine2 editorial wiring present");
