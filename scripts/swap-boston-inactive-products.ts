/**
 * Swap 5 inactive Boston Viator products for active Boston-only replacements.
 * Run: npx tsx scripts/swap-boston-inactive-products.ts
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const SWAPS = [
  {
    from: "7167P68",
    to: "70284P1",
    productUrl:
      "https://www.viator.com/tours/Boston/The-Revolutionary-Story-Tour-An-Epic-Walking-Tour-of-Boston/d678-70284P1",
    title: "The Full Revolutionary Story Epic Small-Group Boston Walking Tour",
    heroSuffix: "15/6f/d3/9c.jpg",
    priceFrom: 59,
    rating: 5.0,
    reviewCount: 204,
    duration: "3 hours (approx.)",
    narrative:
      "Walk the Freedom Trail in chronological Revolutionary order on a small-group epic that connects Boston Common, Granary Burying Ground, Old South Meeting House, Faneuil Hall, Paul Revere House, and Old North Church with expert maps and visuals. Your guide follows the actual sequence of events from Boston's founding through independence rather than a checklist of granite markers. The three-hour immersive pace suits committed history travelers who want the complete story without costumes or gimmicks. Plan on 3 hours (approx.) for the outing.",
  },
  {
    from: "8841P14",
    to: "7812P18",
    productUrl:
      "https://www.viator.com/tours/Boston/Small-group-Guided-Walking-Food-Tour-in-Boston/d678-7812P18",
    title: "Boston North End Food Tour with Authentic Local Flavors & Dishes",
    heroSuffix: "r/32/7c/1f/90/caption.jpg",
    priceFrom: 74.99,
    rating: 4.9,
    reviewCount: 1200,
    duration: "2 to 3 hours (approx.)",
    narrative:
      "Taste authentic North End flavors on a small-group walking food tour through Boston Public Market and the Italian neighborhood's back streets. Sample New England clam chowder, brick-oven pizza, mini cannoli, and local specialties while your guide shares immigrant history beyond the tourist trail. Enough bites add up to a hearty meal without rushing between vendors. Plan on 2 to 3 hours (approx.) for the outing. You'll pause at Boston Public Market and North Square Park during scheduled stops.",
  },
  {
    from: "8647P466",
    to: "343490P3",
    productUrl:
      "https://www.viator.com/tours/Boston/PRIVATE-GROUP-Authentic-Revolutionary-Boston-walking-Tour/d678-343490P3",
    title: "Private Revolutionary History Boston Walking Tour",
    heroSuffix: "0f/34/05/c3.jpg",
    priceFrom: 75,
    rating: 4.9,
    reviewCount: 86,
    duration: "2 hours (approx.)",
    narrative:
      "Explore Revolutionary Boston on a private walking tour tailored to your group's pace and interests with a dedicated historian guide. The route covers Freedom Trail landmarks from Boston Common through Faneuil Hall, Paul Revere House, and Old North Church with authentic commentary focused on colonial politics and daily life. Private format means flexible stops and unhurried questions at each granite marker. Plan on 2 hours (approx.) for the outing.",
  },
  {
    from: "385595P5",
    to: "3978TOUR2",
    productUrl:
      "https://www.viator.com/tours/Boston/American-History-Tour-Cambridge-Lexington-and-Concord-Day-Trip-from-Boston/d678-3978TOUR2",
    title:
      "American History Bus Tour: Boston to Cambridge, Concord, and Lexington",
    heroSuffix: "07/b3/e4/c0.jpg",
    priceFrom: 89,
    rating: 4.7,
    reviewCount: 612,
    duration: "5 hours (approx.)",
    narrative:
      "Follow Paul Revere's midnight ride and the Battle Road Trail on a half-day American history bus tour from Boston to Cambridge, Lexington, and Concord. Visit Lexington Battle Green, Minute Man National Historical Park, Old North Bridge, and Harvard Square with round-trip coach transportation and expert narration connecting Revolutionary and literary history. Wheelchair-accessible coach with lavatory included. Plan on 5 hours (approx.) for the outing.",
  },
  {
    from: "3978TOUR5",
    to: "7167P80",
    productUrl:
      "https://www.viator.com/tours/Salem/Salem-Witch-Trials-from-Past-to-Present-Day-Tour-from-Boston/d22414-7167P80",
    title: "Salem Witch Trials Tour from Boston by Ferry with Small Group",
    heroSuffix: "10/45/6f/cc.jpg",
    priceFrom: 129,
    rating: 4.6,
    reviewCount: 342,
    duration: "8 hours 30 minutes (approx.)",
    narrative:
      "Day-trip from Boston to Salem on a small-group tour with round-trip ferry tickets and a guided walking route through witch-trial landmarks. Visit the Salem Witch Museum or Real Pirates Salem depending on the day, then explore Derby Street, memorial sites, and waterfront districts with free time before returning to Boston Harbor. Ferry transit replaces highway driving for a scenic North Shore outing. Plan on 8 hours 30 minutes (approx.) for the outing.",
  },
] as const;

const replaceInFile = (path: string, pairs: Array<[string, string]>) => {
  if (!existsSync(path)) return;
  let content = readFileSync(path, "utf8");
  for (const [from, to] of pairs) {
    content = content.split(from).join(to);
    content = content.split(from.toLowerCase()).join(to.toLowerCase());
  }
  writeFileSync(path, content, "utf8");
};

const patchGenerateFixtures = () => {
  const path = "scripts/generate-boston-engine6-fixtures.ts";
  let content = readFileSync(path, "utf8");
  for (const swap of SWAPS) {
    content = content.split(swap.from).join(swap.to);
    content = content.replace(
      new RegExp(
        `(productCode: "${swap.to}",\\s*productUrl:\\s*\\n\\s*")[^"]+(")`,
        "m"
      ),
      `$1${swap.productUrl}$2`
    );
    content = content.replace(
      new RegExp(`(productCode: "${swap.to}",[\\s\\S]*?title: ")[^"]+(")`, "m"),
      `$1${swap.title}$2`
    );
    content = content.replace(
      new RegExp(
        `(productCode: "${swap.to}",[\\s\\S]*?heroUrl: \\$\\{TACDN\\}/)[^"]+(")`,
        "m"
      ),
      `$1${swap.heroSuffix}$2`
    );
    content = content.replace(
      new RegExp(`(productCode: "${swap.to}",[\\s\\S]*?priceFrom: )[0-9.]+`, "m"),
      `$1${swap.priceFrom}`
    );
    content = content.replace(
      new RegExp(`(productCode: "${swap.to}",[\\s\\S]*?rating: )[0-9.]+`, "m"),
      `$1${swap.rating}`
    );
    content = content.replace(
      new RegExp(
        `(productCode: "${swap.to}",[\\s\\S]*?reviewCount: )[0-9]+`,
        "m"
      ),
      `$1${swap.reviewCount}`
    );
    content = content.replace(
      new RegExp(`(productCode: "${swap.to}",[\\s\\S]*?duration: ")[^"]+(")`, "m"),
      `$1${swap.duration}$2`
    );
  }
  writeFileSync(path, content, "utf8");
};

const patchNarratives = () => {
  const path = "src/engine6/bostonApprovedNarrativeDescriptions.ts";
  let content = readFileSync(path, "utf8");
  for (const swap of SWAPS) {
    content = content.split(`"${swap.from}"`).join(`"${swap.to}"`);
    content = content.replace(
      new RegExp(`("${swap.to}":\\s*\\n\\s*")[^"]+(")`, "m"),
      `$1${swap.narrative}$2`
    );
  }
  writeFileSync(path, content, "utf8");
};

const patchRatings = () => {
  const path = "src/engine6/bostonViatorPublicRatings.ts";
  let content = readFileSync(path, "utf8");
  for (const swap of SWAPS) {
    content = content.split(`"${swap.from}"`).join(`"${swap.to}"`);
    content = content.replace(
      new RegExp(`("${swap.to}": \\{ rating: )[0-9.]+(, reviewCount: )[0-9]+`, "m"),
      `$1${swap.rating}$2${swap.reviewCount}`
    );
  }
  writeFileSync(path, content, "utf8");
};

const patchSitemap = () => {
  const path = "public/sitemap-tours.xml";
  let content = readFileSync(path, "utf8");
  for (const swap of SWAPS) {
    content = content.split(swap.from).join(swap.to);
  }
  writeFileSync(path, content, "utf8");
};

const patchHeroPatches = () => {
  const path = "scripts/apply-boston-fixture-hero-patches.ts";
  if (!existsSync(path)) return;
  let content = readFileSync(path, "utf8");
  for (const swap of SWAPS) {
    if (content.includes(`"${swap.from}"`)) {
      content = content.replace(
        `"${swap.from}": "[^"]+"`,
        `"${swap.to}": "${swap.heroSuffix}"`
      );
      content = content.replace(
        new RegExp(`"${swap.from}": "[^"]+"`),
        `"${swap.to}": "${swap.heroSuffix}"`
      );
    }
  }
  for (const swap of SWAPS) {
    content = content.split(`"${swap.from}"`).join(`"${swap.to}"`);
    if (!content.includes(`"${swap.to}":`)) {
      content = content.replace(
        "const patches: Record<string, string> = {",
        `const patches: Record<string, string> = {\n  "${swap.to}": "${swap.heroSuffix}",`
      );
    } else {
      content = content.replace(
        new RegExp(`("${swap.to}": ")[^"]+(")`),
        `$1${swap.heroSuffix}$2`
      );
    }
  }
  writeFileSync(path, content, "utf8");
};

const filesToSwapCodes = [
  "src/engine6/routes.ts",
  "src/engine6/validationFixtures.ts",
  "scripts/replace-boston-merchant-feed-rows.ts",
  "scripts/append-boston-merchant-feed-rows.ts",
  "scripts/generate-boston-engine6-wiring.ts",
  "scripts/apply-boston-fixture-hero-patches.ts",
];

for (const swap of SWAPS) {
  const pairs: Array<[string, string]> = [[swap.from, swap.to]];
  for (const file of filesToSwapCodes) {
    replaceInFile(file, pairs);
  }
  const fixturePath = `data/engine6/viator/${swap.from}.exact-product.json`;
  if (existsSync(fixturePath)) {
    rmSync(fixturePath);
  }
}

patchGenerateFixtures();
patchNarratives();
patchRatings();
patchSitemap();
patchHeroPatches();

execSync("npx tsx scripts/generate-boston-engine6-fixtures.ts", {
  stdio: "inherit",
});

// Fix validationFixtures 7812P19/5769MTVN glue if wiring script corrupted it
let vf = readFileSync("src/engine6/validationFixtures.ts", "utf8");
vf = vf.replace(
  /  \},\s*\{\s*\n    productCode: "5769MTVN"/,
  `  },\n  {\n    productCode: "5769MTVN"`
);
writeFileSync("src/engine6/validationFixtures.ts", vf, "utf8");

execSync("npx tsx scripts/replace-boston-merchant-feed-rows.ts", {
  stdio: "inherit",
});

console.log("Swapped inactive Boston products:", SWAPS.map(s => `${s.from}->${s.to}`).join(", "));
