import "dotenv/config";
import { fetchViatorProduct } from "../lib/viator";
import fs from "fs";
import path from "path";

async function sync() {
  const productCode = "2335P1";

  console.log("Syncing product:", productCode);

  const data = await fetchViatorProduct(productCode);

  const outputDir = path.join(process.cwd(), "data/viator");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `${productCode}.json`);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  console.log("Saved to:", filePath);
}

sync().catch((err) => {
  console.error(err);
  process.exit(1);
});
