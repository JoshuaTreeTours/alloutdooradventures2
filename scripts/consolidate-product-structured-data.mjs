import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE = "https://www.alloutdooradventures.com";
const DIST = path.resolve("dist");
const SITEMAP = "sitemap-tours.xml";
const PRIMARY_SCRIPT_ID = "structured-data";
const REPAIR_SCRIPT_ID = "product-structured-data-route-repair";

const normalizePath = value => {
  const pathname = value || "/";
  const normalized = pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return normalized || "/";
};

const isTourProductUrl = pathname => {
  const p = normalizePath(pathname);
  if (/\/book$/i.test(p)) return false;
  if (/^\/destinations\/.+\/tours\/[^/]+$/i.test(p)) return true;
  if (/^\/tours\/(?:[^/]+|[^/]+\/[^/]+\/[^/]+)$/i.test(p)) return true;
  return false;
};

const outputCandidatesFor = pathname => {
  const clean = normalizePath(pathname).replace(/^\//, "");
  if (!clean) return [path.join(DIST, "index.html")];
  return [
    path.join(DIST, clean, "index.html"),
    path.join(DIST, `${clean}.html`),
  ];
};

const readFirstExisting = async pathname => {
  for (const candidate of outputCandidatesFor(pathname)) {
    try {
      return { path: candidate, html: await readFile(candidate, "utf8") };
    } catch {
      // Try the next supported prerender layout.
    }
  }
  return null;
};

const decodeXml = value =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const sitemapUrls = async () => {
  const xml = await readFile(path.join(DIST, SITEMAP), "utf8");
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map(match => decodeXml(match[1].trim()))
    .filter(Boolean);
};

const typeIncludes = (node, wanted) => {
  const type = node?.["@type"];
  return Array.isArray(type) ? type.includes(wanted) : type === wanted;
};

const collectTypedNodes = (value, wanted) => {
  const found = [];
  const visit = node => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeIncludes(node, wanted)) found.push(node);
    Object.values(node).forEach(visit);
  };
  visit(value);
  return found;
};

const productMatchesCanonical = (product, canonicalUrl) => {
  const canonical = canonicalUrl.replace(/\/$/, "");
  return [product?.url, product?.["@id"]]
    .filter(value => typeof value === "string")
    .map(value => value.split("#")[0].replace(/\/$/, ""))
    .includes(canonical);
};

const JSON_LD_PATTERN =
  /(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi;

const scriptIdFromOpeningTag = openingTag =>
  openingTag.match(/\bid=["']([^"']+)["']/i)?.[1] ?? null;

const parseJsonLdEntries = (html, canonicalUrl) => {
  const entries = [];
  let index = 0;
  for (const match of html.matchAll(JSON_LD_PATTERN)) {
    const raw = match[2].trim();
    let parsed = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        // The downstream structural audit owns malformed JSON-LD reporting.
      }
    }
    const products = parsed
      ? collectTypedNodes(parsed, "Product").filter(product =>
          productMatchesCanonical(product, canonicalUrl)
        )
      : [];
    entries.push({
      index,
      id: scriptIdFromOpeningTag(match[1]),
      parsed,
      canonicalProductCount: products.length,
    });
    index += 1;
  }
  return entries;
};

const canonicalProductCount = (html, canonicalUrl) =>
  parseJsonLdEntries(html, canonicalUrl).reduce(
    (total, entry) => total + entry.canonicalProductCount,
    0
  );

const REMOVE = Symbol("remove-canonical-product");

const stripCanonicalProducts = (value, canonicalUrl, state) => {
  if (Array.isArray(value)) {
    return value
      .map(child => stripCanonicalProducts(child, canonicalUrl, state))
      .filter(child => child !== REMOVE);
  }
  if (!value || typeof value !== "object") return value;

  if (typeIncludes(value, "Product") && productMatchesCanonical(value, canonicalUrl)) {
    if (state.keepOne && !state.keptOne) {
      state.keptOne = true;
    } else {
      return REMOVE;
    }
  }

  const next = {};
  for (const [key, child] of Object.entries(value)) {
    const rewritten = stripCanonicalProducts(child, canonicalUrl, state);
    if (rewritten === REMOVE) continue;
    next[key] = rewritten;
  }
  return next;
};

const hasMeaningfulStructuredData = value => {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (Array.isArray(value["@graph"])) {
    return value["@graph"].length > 0;
  }
  return Object.keys(value).some(key => key !== "@context");
};

const serializeJsonLd = value =>
  JSON.stringify(value).replace(/</g, "\\u003c");

const rewriteJsonLdScripts = ({
  html,
  canonicalUrl,
  authoritativeIndex,
  removeRepair,
  promoteRepairGraph,
}) => {
  let index = 0;
  let primarySeen = false;
  let promoted = false;

  let output = html.replace(
    JSON_LD_PATTERN,
    (full, openingTag, rawBody, closingTag) => {
      const currentIndex = index;
      index += 1;
      const id = scriptIdFromOpeningTag(openingTag);
      if (id === PRIMARY_SCRIPT_ID) primarySeen = true;

      if (id === REPAIR_SCRIPT_ID && removeRepair) {
        return "";
      }

      let parsed;
      try {
        parsed = JSON.parse(rawBody.trim());
      } catch {
        return full;
      }

      if (
        promoteRepairGraph &&
        id === PRIMARY_SCRIPT_ID &&
        !promoted
      ) {
        promoted = true;
        return `${openingTag}${serializeJsonLd(promoteRepairGraph)}${closingTag}`;
      }

      if (authoritativeIndex == null) {
        return full;
      }

      const state = {
        keepOne: currentIndex === authoritativeIndex,
        keptOne: false,
      };
      const rewritten = stripCanonicalProducts(parsed, canonicalUrl, state);
      if (!hasMeaningfulStructuredData(rewritten)) {
        return "";
      }
      return `${openingTag}${serializeJsonLd(rewritten)}${closingTag}`;
    }
  );

  if (promoteRepairGraph && !promoted) {
    const primaryScript = `<script id="${PRIMARY_SCRIPT_ID}" type="application/ld+json">${serializeJsonLd(promoteRepairGraph)}</script>`;
    output = /<\/head>/i.test(output)
      ? output.replace(/<\/head>/i, `${primaryScript}</head>`)
      : `${primaryScript}${output}`;
  }

  return { html: output, primarySeen };
};

const failures = [];
let inspected = 0;
let generated = 0;
let preserved = 0;
let deduplicated = 0;
let repairScriptsRemoved = 0;

const urls = [
  ...new Set(
    (await sitemapUrls()).filter(url =>
      isTourProductUrl(new URL(url).pathname)
    )
  ),
];

for (const url of urls) {
  const pathname = normalizePath(new URL(url).pathname);
  const artifact = await readFirstExisting(pathname);
  if (!artifact) continue;
  inspected += 1;

  const canonicalUrl = `${SITE}${pathname}`;
  const entries = parseJsonLdEntries(artifact.html, canonicalUrl);
  const repairEntries = entries.filter(entry => entry.id === REPAIR_SCRIPT_ID);
  const ordinaryEntries = entries.filter(entry => entry.id !== REPAIR_SCRIPT_ID);
  const ordinaryProductCount = ordinaryEntries.reduce(
    (total, entry) => total + entry.canonicalProductCount,
    0
  );
  const repairProductCount = repairEntries.reduce(
    (total, entry) => total + entry.canonicalProductCount,
    0
  );

  if (repairEntries.length > 1) {
    failures.push(
      `${pathname}: found ${repairEntries.length} route-repair JSON-LD scripts; expected at most 1`
    );
    continue;
  }

  // 0 Product -> promote the route-backed engine graph generated by the
  // preceding repair/finalization stages into the primary manifest.
  if (ordinaryProductCount === 0) {
    const repairEntry = repairEntries[0];
    if (
      !repairEntry?.parsed ||
      repairProductCount !== 1
    ) {
      failures.push(
        `${pathname}: found 0 canonical Product nodes and no single engine-generated repair Product to promote`
      );
      continue;
    }

    const { html } = rewriteJsonLdScripts({
      html: artifact.html,
      canonicalUrl,
      authoritativeIndex: null,
      removeRepair: true,
      promoteRepairGraph: repairEntry.parsed,
    });

    if (canonicalProductCount(html, canonicalUrl) !== 1) {
      failures.push(
        `${pathname}: generated engine Product did not survive promotion as exactly one canonical Product`
      );
      continue;
    }
    if (html.includes(`id="${REPAIR_SCRIPT_ID}"`) || html.includes(`id='${REPAIR_SCRIPT_ID}'`)) {
      failures.push(`${pathname}: route-repair JSON-LD script survived Product generation`);
      continue;
    }

    await writeFile(artifact.path, html, "utf8");
    generated += 1;
    repairScriptsRemoved += 1;
    continue;
  }

  // 1 Product -> preserve the existing engine Product exactly. The only
  // cleanup permitted here is removal of the temporary repair manifest.
  if (ordinaryProductCount === 1) {
    if (repairEntries.length === 0) {
      preserved += 1;
      continue;
    }

    const { html } = rewriteJsonLdScripts({
      html: artifact.html,
      canonicalUrl,
      authoritativeIndex: null,
      removeRepair: true,
      promoteRepairGraph: null,
    });
    if (canonicalProductCount(html, canonicalUrl) !== 1) {
      failures.push(
        `${pathname}: removing the temporary repair manifest changed the single canonical Product`
      );
      continue;
    }

    await writeFile(artifact.path, html, "utf8");
    preserved += 1;
    repairScriptsRemoved += 1;
    continue;
  }

  // 2+ Products -> preserve one authoritative canonical Product and strip
  // only duplicate canonical Product nodes from the remaining JSON-LD.
  const authoritativeEntry =
    ordinaryEntries.find(
      entry => entry.id === PRIMARY_SCRIPT_ID && entry.canonicalProductCount > 0
    ) ?? ordinaryEntries.find(entry => entry.canonicalProductCount > 0);

  if (!authoritativeEntry) {
    failures.push(
      `${pathname}: ${ordinaryProductCount} canonical Product nodes were counted but no authoritative manifest could be selected`
    );
    continue;
  }

  const { html } = rewriteJsonLdScripts({
    html: artifact.html,
    canonicalUrl,
    authoritativeIndex: authoritativeEntry.index,
    removeRepair: true,
    promoteRepairGraph: null,
  });

  const finalCount = canonicalProductCount(html, canonicalUrl);
  if (finalCount !== 1) {
    failures.push(
      `${pathname}: deduplication would leave ${finalCount} canonical Product nodes; expected exactly 1`
    );
    continue;
  }
  if (html.includes(`id="${REPAIR_SCRIPT_ID}"`) || html.includes(`id='${REPAIR_SCRIPT_ID}'`)) {
    failures.push(`${pathname}: route-repair JSON-LD script survived deduplication`);
    continue;
  }

  await writeFile(artifact.path, html, "utf8");
  deduplicated += 1;
  if (repairEntries.length) repairScriptsRemoved += 1;
}

if (failures.length) {
  console.error(
    `[product-schema-consolidation] FAILED: ${failures.length} route(s) could not be safely finalized.`
  );
  failures.slice(0, 100).forEach(failure => console.error(`  ${failure}`));
  if (failures.length > 100) {
    console.error(`  ... ${failures.length - 100} more`);
  }
  process.exit(1);
}

console.log(
  `[product-schema-consolidation] PASS: inspected ${inspected.toLocaleString()} tour artifacts; generated ${generated.toLocaleString()} missing Product manifests, preserved ${preserved.toLocaleString()} single-Product manifests, deduplicated ${deduplicated.toLocaleString()} multi-Product manifests, removed ${repairScriptsRemoved.toLocaleString()} temporary repair scripts.`
);
