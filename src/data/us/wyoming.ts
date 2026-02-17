import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

export interface WyomingTour {
  id: string;
  title: string;
  city: string;
  description?: string;
  price?: string;
  image?: string;
}

export function loadWyomingTours(): WyomingTour[] {
  const filePath = path.join(process.cwd(), "data/wyoming.csv");

  if (!fs.existsSync(filePath)) {
    console.warn("⚠️ wyoming.csv not found");
    return [];
  }

  const file = fs.readFileSync(filePath, "utf8");

  const records = parse(file, {
    columns: true,
    skip_empty_lines: true,
  });

  return records.map((r: any) => ({
    id: r.id || r.tour_id,
    title: r.title,
    city: r.city,
    description: r.description,
    price: r.price,
    image: r.image,
  }));
}
