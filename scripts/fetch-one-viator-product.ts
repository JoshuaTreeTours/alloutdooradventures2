import "dotenv/config";
import { fetchViatorProduct } from "../lib/viator";

const code = process.argv[2] ?? "162351P6";

const p = await fetchViatorProduct(code);
console.log(JSON.stringify(p, null, 2));
