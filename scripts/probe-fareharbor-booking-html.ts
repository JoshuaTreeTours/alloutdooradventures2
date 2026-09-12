import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const samples = [
  { group: "no-preview", key: "1097watersports:335952", title: "Canoe Rental", url: "https://fareharbor.com/embeds/book/1097watersports/items/335952/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { group: "no-preview", key: "360xplore:617973", title: "Ruta Singles Senderisme Niu de l'Àliga", url: "https://fareharbor.com/embeds/book/360xplore/items/617973/?asn=fhdn&asn-ref=alloutdooradventures&ref=https%3A%2F%2Fwww.alloutdooradventures.com&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&back=https%3A%2F%2Fwww.alloutdooradventures.com%2F" },
  { group: "no-preview", key: "abandonshoreboatrentals:629512", title: "Captained Charter", url: "https://fareharbor.com/embeds/book/abandonshoreboatrentals/items/629512/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { group: "no-preview", key: "adventure-outdoors:383501", title: "Foraging Workshops", url: "https://fareharbor.com/embeds/book/adventure-outdoors/items/383501/calendar/2026/02/?asn=fhdn&asn-ref=alloutdooradventures&flow=no&full-items=yes&g4=yes&ref=https%3A%2F%2Fwww.alloutdooradventures.com&back=https%3A%2F%2Fwww.alloutdooradventures.com%2F" },
  { group: "no-preview", key: "adventure37:102139", title: "The Half Day'er", url: "https://fareharbor.com/embeds/book/adventure37/items/102139/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { group: "no-preview", key: "adventureexplorations:389693", title: "Kayaking Float Trip", url: "https://fareharbor.com/embeds/book/adventureexplorations/items/389693/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { group: "no-preview", key: "adventures-unlimited:72536", title: "Full Ocoee River Deluxe Trip", url: "https://fareharbor.com/embeds/book/adventures-unlimited/items/72536/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { group: "no-preview", key: "advoutwest:347707", title: "Sunrise Hot Air Balloon Adventure", url: "https://fareharbor.com/embeds/book/advoutwest/items/347707/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { group: "no-preview", key: "ak-tours:280073", title: "Hovercraft Eco Adventures", url: "https://fareharbor.com/embeds/book/ak-tours/items/280073/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { group: "no-preview", key: "akfinest:418451", title: "Matanuska Glacier Hike & Tour – Winter Edition", url: "https://fareharbor.com/embeds/book/akfinest/items/418451/calendar/2026/09/?asn=fhdn&asn-ref=alloutdooradventures&flow=no&full-items=yes&g4=yes&ref=https%3A%2F%2Fwww.alloutdooradventures.com&back=https%3A%2F%2Fwww.alloutdooradventures.com%2F" },
  { group: "preview-400", key: "5starwhales:123505", title: "Marine Wildlife & Whale Watch Tour", url: "https://fareharbor.com/embeds/book/5starwhales/items/123505/calendar/2026/02/?asn=fhdn&asn-ref=alloutdooradventures&flow=no&full-items=yes&g4=yes&ref=https%3A%2F%2Fwww.alloutdooradventures.com&back=https%3A%2F%2Fwww.alloutdooradventures.com%2F" },
  { group: "preview-400", key: "actiontoursbigbear:12398", title: "Zipline Tour", url: "https://fareharbor.com/embeds/book/actiontoursbigbear/items/12398/calendar/2026/06/?asn=fhdn&asn-ref=alloutdooradventures&flow=no&full-items=yes&g4=yes&ref=https%3A%2F%2Fwww.alloutdooradventures.com&back=https%3A%2F%2Fwww.alloutdooradventures.com%2F" },
  { group: "preview-400", key: "adventurewesttours:400670", title: "Four Days in Beautiful San Diego, California", url: "https://fareharbor.com/embeds/book/adventurewesttours/items/400670/calendar/2026/06/?asn=fhdn&asn-ref=alloutdooradventures&flow=no&full-items=yes&g4=yes&ref=https%3A%2F%2Fwww.alloutdooradventures.com&back=https%3A%2F%2Fwww.alloutdooradventures.com%2F" },
  { group: "preview-400", key: "americanfossil:256208", title: "Two Hour Dig Package", url: "https://fareharbor.com/embeds/book/americanfossil/items/256208/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { group: "preview-400", key: "backstorytravelboston:677691", title: "Boston: Small Group Freedom Trail Walking Tour", url: "https://fareharbor.com/embeds/book/backstorytravelboston/items/677691/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { group: "preview-400", key: "balloonvermont:619662", title: "Views of Vermont Shared Basket Ride", url: "https://fareharbor.com/embeds/book/balloonvermont/items/619662/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { group: "preview-400", key: "beartoothtours:597705", title: "Beartooth Highway Tour", url: "https://fareharbor.com/embeds/book/beartoothtours/items/597705/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { group: "preview-400", key: "butterflyhouseaquarium:234153", title: "Daily Admission", url: "https://fareharbor.com/embeds/book/butterflyhouseaquarium/items/234153/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
  { group: "preview-400", key: "californiaclassicsail:180875", title: "2 Hour Private Sail from the Santa Cruz Harbor - Resolute", url: "https://fareharbor.com/embeds/book/californiaclassicsail/items/180875/calendar/2026/06/?asn=fhdn&asn-ref=alloutdooradventures&flow=no&full-items=yes&g4=yes&ref=https%3A%2F%2Fwww.alloutdooradventures.com&back=https%3A%2F%2Fwww.alloutdooradventures.com%2F" },
  { group: "preview-400", key: "chateauelan:61672", title: "Taste of Georgia", url: "https://fareharbor.com/embeds/book/chateauelan/items/61672/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no&branding=no" },
] as const;

const strip = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();

const normalize = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const main = async () => {
  const results = [];
  for (const sample of samples) {
    try {
      const response = await fetch(sample.url, {
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent": "Mozilla/5.0 AOA-FH-HTML-Probe/1.0",
        },
        redirect: "follow",
      });
      const html = await response.text();
      const text = strip(html);
      const titleWords = normalize(sample.title).split(" ").filter(Boolean).slice(0, 4).join(" ");
      const normText = normalize(text);
      const dollarMatches = Array.from(new Set(html.match(/\$\s?\d{1,5}(?:\.\d{1,2})?/g) ?? [])).slice(0, 20);
      const currencyMatches = Array.from(new Set(html.match(/\b(?:USD|EUR|CAD|GBP|AUD|MXN|NZD|NOK|SEK|DKK)\s?\d{1,6}(?:\.\d{1,2})?/g) ?? [])).slice(0, 20);
      const descriptionKeyCount = (html.match(/["']description["']\s*:/gi) ?? []).length;
      const titleIndex = normText.indexOf(titleWords);
      const textSnippet = titleIndex >= 0
        ? text.slice(Math.max(0, titleIndex - 200), Math.min(text.length, titleIndex + 900))
        : text.slice(0, 900);
      results.push({
        ...sample,
        status: response.status,
        finalUrl: response.url,
        htmlLength: html.length,
        visibleTextLength: text.length,
        titleDetected: titleIndex >= 0,
        descriptionKeyCount,
        dollarMatches,
        currencyMatches,
        hasPricePreviewString: /price-preview/i.test(html),
        hasCustomerTypesString: /customer_types/i.test(html),
        hasFullItemsString: /full-items/i.test(html),
        textSnippet,
      });
    } catch (error) {
      results.push({
        ...sample,
        status: null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const summary = {
    samples: results.length,
    status200: results.filter(r => r.status === 200).length,
    titleDetected: results.filter(r => "titleDetected" in r && r.titleDetected).length,
    withDollarPrice: results.filter(r => "dollarMatches" in r && r.dollarMatches.length > 0).length,
    withCurrencyPrice: results.filter(r => "currencyMatches" in r && r.currencyMatches.length > 0).length,
    withDescriptionKey: results.filter(r => "descriptionKeyCount" in r && r.descriptionKeyCount > 0).length,
    byGroup: Object.fromEntries(
      ["no-preview", "preview-400"].map(group => {
        const subset = results.filter(r => r.group === group);
        return [group, {
          samples: subset.length,
          status200: subset.filter(r => r.status === 200).length,
          titleDetected: subset.filter(r => "titleDetected" in r && r.titleDetected).length,
          withDollarPrice: subset.filter(r => "dollarMatches" in r && r.dollarMatches.length > 0).length,
          withDescriptionKey: subset.filter(r => "descriptionKeyCount" in r && r.descriptionKeyCount > 0).length,
        }];
      }),
    ),
  };

  await mkdir(path.resolve("reports"), { recursive: true });
  await writeFile(
    path.resolve("reports/fareharbor-booking-html-probe.json"),
    JSON.stringify({ summary, results }, null, 2),
    "utf8",
  );
  console.info(`[fh-html-probe] SUMMARY ${JSON.stringify(summary)}`);
};

main().catch(error => {
  console.error("[fh-html-probe] FATAL", error);
  process.exitCode = 1;
});
