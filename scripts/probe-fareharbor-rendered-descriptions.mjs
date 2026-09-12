import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const samples = [
  { key: "1097watersports:335952", title: "Canoe Rental", url: "https://fareharbor.com/embeds/book/1097watersports/items/335952/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { key: "360xplore:617973", title: "Ruta Singles Senderisme Niu de l'Àliga", url: "https://fareharbor.com/embeds/book/360xplore/items/617973/?asn=fhdn&asn-ref=alloutdooradventures&ref=https%3A%2F%2Fwww.alloutdooradventures.com&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&back=https%3A%2F%2Fwww.alloutdooradventures.com%2F" },
  { key: "abandonshoreboatrentals:629512", title: "Captained Charter", url: "https://fareharbor.com/embeds/book/abandonshoreboatrentals/items/629512/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { key: "adventure-outdoors:383501", title: "Foraging Workshops", url: "https://fareharbor.com/embeds/book/adventure-outdoors/items/383501/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { key: "adventure37:102139", title: "The Half Day'er", url: "https://fareharbor.com/embeds/book/adventure37/items/102139/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { key: "adventureexplorations:389693", title: "Kayaking Float Trip", url: "https://fareharbor.com/embeds/book/adventureexplorations/items/389693/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { key: "adventures-unlimited:72536", title: "Full Ocoee River Deluxe Trip", url: "https://fareharbor.com/embeds/book/adventures-unlimited/items/72536/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { key: "advoutwest:347707", title: "Sunrise Hot Air Balloon Adventure", url: "https://fareharbor.com/embeds/book/advoutwest/items/347707/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { key: "ak-tours:280073", title: "Hovercraft Eco Adventures", url: "https://fareharbor.com/embeds/book/ak-tours/items/280073/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { key: "akfinest:418451", title: "Matanuska Glacier Hike & Tour – Winter Edition", url: "https://fareharbor.com/embeds/book/akfinest/items/418451/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { key: "azsegwaytours:29167", title: "Historic Downtown Tour", url: "https://fareharbor.com/embeds/book/azsegwaytours/items/29167/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { key: "seamepaddle:556966", title: "Tour: Whitefish Lake Evening Tour", url: "https://fareharbor.com/embeds/book/seamepaddle/items/556966/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
];

const normalize = value => String(value ?? "").replace(/\s+/g, " ").trim();
const norm = value => normalize(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const collectDescriptionStrings = (value, pathParts = [], out = []) => {
  if (!value || out.length > 80) return out;
  if (Array.isArray(value)) {
    value.slice(0, 100).forEach((item, index) => collectDescriptionStrings(item, [...pathParts, String(index)], out));
    return out;
  }
  if (typeof value !== "object") return out;
  for (const [key, child] of Object.entries(value)) {
    const next = [...pathParts, key];
    if (typeof child === "string") {
      const text = normalize(child);
      if (text.length >= 80 && /(description|summary|content|details|about|overview|headline|caption|what)/i.test(key)) {
        out.push({ path: next.join("."), text: text.slice(0, 5000) });
      }
    } else {
      collectDescriptionStrings(child, next, out);
    }
  }
  return out;
};

const browser = await chromium.launch({ headless: true });
const results = [];

for (const sample of samples) {
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36 AOA-FH-Description-Probe/1.0",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  const jsonCandidates = [];
  const endpointSet = new Set();

  page.on("response", async response => {
    const url = response.url();
    const contentType = response.headers()["content-type"] || "";
    if (!/json/i.test(contentType)) return;
    if (!/fareharbor/i.test(url)) return;
    endpointSet.add(url.replace(/[?#].*$/, ""));
    try {
      const text = await response.text();
      if (text.length > 2_000_000) return;
      const payload = JSON.parse(text);
      const found = collectDescriptionStrings(payload);
      if (found.length) jsonCandidates.push({ url, found: found.slice(0, 20) });
    } catch {}
  });

  let status = null;
  let finalUrl = sample.url;
  let bodyText = "";
  let substantialBlocks = [];
  let descriptionBlocks = [];
  let error = null;
  try {
    const nav = await page.goto(sample.url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    status = nav?.status() ?? null;
    await page.waitForTimeout(9000);
    finalUrl = page.url();
    bodyText = normalize(await page.locator("body").innerText({ timeout: 10_000 }));

    const blocks = await page.locator("p, li, [class*='description' i], [class*='details' i], [class*='content' i]").evaluateAll(nodes =>
      nodes.map(node => (node.innerText || node.textContent || "").replace(/\s+/g, " ").trim()).filter(Boolean)
    );
    substantialBlocks = Array.from(new Set(blocks.filter(text => text.length >= 100))).slice(0, 25);
    descriptionBlocks = Array.from(new Set(blocks.filter(text => text.length >= 100 && !/fareharbor did not load properly|error code: no-assets/i.test(text)))).slice(0, 10);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const titleWords = norm(sample.title).split(" ").filter(Boolean).slice(0, 4).join(" ");
  const bodyNorm = norm(bodyText);
  const titleDetected = Boolean(titleWords) && bodyNorm.includes(titleWords);
  const likelyDescription = descriptionBlocks.find(text => {
    const n = norm(text);
    return n.length >= 100 && !n.includes("privacy policy") && !n.includes("terms and conditions");
  }) || null;

  results.push({
    ...sample,
    status,
    finalUrl,
    titleDetected,
    bodyTextLength: bodyText.length,
    likelyDescription,
    substantialBlocks,
    jsonCandidates,
    jsonEndpoints: Array.from(endpointSet).slice(0, 50),
    error,
  });

  console.info(`[fh-description-probe] ${sample.key} status=${status} title=${titleDetected} desc=${Boolean(likelyDescription)} json=${jsonCandidates.length}`);
  await context.close();
}

await browser.close();

const summary = {
  samples: results.length,
  status200: results.filter(r => r.status === 200).length,
  titleDetected: results.filter(r => r.titleDetected).length,
  withLikelyDescription: results.filter(r => r.likelyDescription).length,
  withDescriptionJson: results.filter(r => r.jsonCandidates.length > 0).length,
  uniqueJsonEndpoints: Array.from(new Set(results.flatMap(r => r.jsonEndpoints))).length,
};

await mkdir(path.resolve("reports"), { recursive: true });
await writeFile(path.resolve("reports/fareharbor-rendered-description-probe.json"), JSON.stringify({ summary, results }, null, 2), "utf8");
await writeFile(path.resolve("reports/fareharbor-rendered-description-probe.md"), [
  "# FareHarbor rendered description feasibility probe",
  "",
  `- Samples: ${summary.samples}`,
  `- HTTP 200: ${summary.status200}`,
  `- Product title visible after rendering: ${summary.titleDetected}`,
  `- Substantial likely description visible after rendering: ${summary.withLikelyDescription}`,
  `- Description-like fields found in FareHarbor JSON responses: ${summary.withDescriptionJson}`,
  `- Unique FareHarbor JSON endpoints observed: ${summary.uniqueJsonEndpoints}`,
  "",
  ...results.map(r => `## ${r.key}\n- Status: ${r.status}\n- Title detected: ${r.titleDetected}\n- Likely description: ${r.likelyDescription ? r.likelyDescription.slice(0, 800) : "NONE"}\n- JSON description responses: ${r.jsonCandidates.length}\n- Error: ${r.error ?? "none"}\n`),
].join("\n"), "utf8");
console.info(`[fh-description-probe] SUMMARY ${JSON.stringify(summary)}`);
