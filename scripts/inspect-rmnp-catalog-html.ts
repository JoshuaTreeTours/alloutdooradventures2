import { writeFileSync } from "node:fs";
import { fetchViatorPublicPage } from "../src/engine6/viatorPublicAvailability";

const url = "https://www.viator.com/Rocky-Mountain-National-Park/d51194-ttd";
const page = await fetchViatorPublicPage(url);
writeFileSync("scripts/rmnp-catalog-sample.html", page.html.slice(0, 500000), "utf8");
const codes = [...page.html.matchAll(/d51194-([A-Z0-9_]+)/gi)].map(m => m[1]);
console.log("status", page.httpStatus, "len", page.html.length);
console.log("unique codes", [...new Set(codes)].length, [...new Set(codes)].slice(0, 20));
const anyCodes = [...page.html.matchAll(/\/d(\d+)-([A-Z0-9_]+)/gi)].map(m => `${m[1]}-${m[2]}`);
console.log("any dest codes sample", [...new Set(anyCodes)].slice(0, 30));
