import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  buildMerchantFeedPublishedBaselineCatalog,
  type MerchantFeedPublishedBaselineCatalog,
} from "./merchantFeedBaselineGovernance.js";

/** Last known production deploy before the Monterey Engine6 catalog expansion. */
export const DEFAULT_MERCHANT_FEED_PRODUCTION_DEPLOYMENT_GIT_REF = "cd7906a9";

export const DEFAULT_MERCHANT_FEED_MAIN_BASELINE_GIT_REF = "origin/main";

const MERCHANT_FEED_CSV_PATH = "data/merchantFeed.csv";

const ENGINE6_PRODUCT_CODE_EXPORT_PATTERN =
  /export const ENGINE6_[A-Z0-9_]+_PRODUCT_CODE = "([^"]+)"/g;

const BRANCH_NEW_ENGINE6_PRODUCT_CODE_DIFF_PATTERN =
  /^\s*\+\s*export const ENGINE6_[A-Z0-9_]+_PRODUCT_CODE = "([^"]+)"/gm;

export const extractEngine6ProductCodesFromRoutesSource = (
  routesSource: string
): ReadonlySet<string> => {
  const codes = new Set<string>();

  for (const match of routesSource.matchAll(
    ENGINE6_PRODUCT_CODE_EXPORT_PATTERN
  )) {
    codes.add(match[1].trim().toUpperCase());
  }

  return codes;
};

export const extractBranchNewEngine6ProductCodesFromRoutesDiff = (
  diffSource: string
): ReadonlySet<string> => {
  const codes = new Set<string>();

  for (const match of diffSource.matchAll(
    BRANCH_NEW_ENGINE6_PRODUCT_CODE_DIFF_PATTERN
  )) {
    codes.add(match[1].trim().toUpperCase());
  }

  return codes;
};

const loadEngine6ProductCodesFromGitRef = (
  gitRef: string
): ReadonlySet<string> | null => {
  try {
    const routesSource = execSync(`git show ${gitRef}:src/engine6/routes.ts`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const codes = extractEngine6ProductCodesFromRoutesSource(routesSource);
    return codes.size > 0 ? codes : null;
  } catch {
    return null;
  }
};

const resolveProductionDeploymentGitRef = () =>
  process.env.MERCHANT_FEED_PRODUCTION_DEPLOYMENT_GIT_REF?.trim() ||
  DEFAULT_MERCHANT_FEED_PRODUCTION_DEPLOYMENT_GIT_REF;

const resolveMainBaselineGitRef = () =>
  process.env.MERCHANT_FEED_MAIN_BASELINE_GIT_REF?.trim() ||
  DEFAULT_MERCHANT_FEED_MAIN_BASELINE_GIT_REF;

export const parseMerchantFeedCsvCommercialRows = (
  content: string
): Array<{
  id: string;
  price?: string;
  average_rating?: string;
  rating_count?: string;
  review_count?: string;
}> => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const [headers = [], ...bodyRows] = rows.filter(
    candidate => candidate.length > 1
  );

  return bodyRows.map(values =>
    Object.fromEntries(
      headers.map((header, headerIndex) => [header, values[headerIndex] ?? ""])
    )
  ) as Array<{
    id: string;
    price?: string;
    average_rating?: string;
    rating_count?: string;
    review_count?: string;
  }>;
};

const loadMerchantFeedCsvFromGitRef = (gitRef: string): string | null => {
  try {
    return execSync(`git show ${gitRef}:${MERCHANT_FEED_CSV_PATH}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
};

/**
 * Published merchantFeed.csv commercial snapshot from the main branch baseline.
 * Runtime parity blocking scope compares branch output against this catalog so
 * unchanged legacy products do not block unrelated deploys.
 */
export const loadMerchantFeedMainBaselineCatalog =
  (): MerchantFeedPublishedBaselineCatalog => {
    const gitRef = resolveMainBaselineGitRef();
    const gitContent = loadMerchantFeedCsvFromGitRef(gitRef);
    if (gitContent) {
      return buildMerchantFeedPublishedBaselineCatalog(
        parseMerchantFeedCsvCommercialRows(gitContent)
      );
    }

    try {
      const workspaceContent = readFileSync(
        path.resolve(process.cwd(), MERCHANT_FEED_CSV_PATH),
        "utf8"
      );
      return buildMerchantFeedPublishedBaselineCatalog(
        parseMerchantFeedCsvCommercialRows(workspaceContent)
      );
    } catch {
      return new Map();
    }
  };

export const extractBranchModifiedEngine6ProductCodesFromDiffNameOnly = (
  diffNameOnlySource: string,
  currentEligibleProductCodes: Iterable<string>
): ReadonlySet<string> => {
  const changedPaths = diffNameOnlySource
    .split(/\r?\n/)
    .map(line => line.trim().toUpperCase())
    .filter(Boolean)
    .filter(pathName => pathName !== MERCHANT_FEED_CSV_PATH.toUpperCase());
  const changed = new Set<string>();

  for (const productCode of currentEligibleProductCodes) {
    const normalizedProductCode = productCode.trim().toUpperCase();
    if (!normalizedProductCode) {
      continue;
    }

    if (
      changedPaths.some(pathName => pathName.includes(normalizedProductCode))
    ) {
      changed.add(normalizedProductCode);
    }
  }

  return changed;
};

export const loadMerchantFeedBranchModifiedProductCodes = (
  currentEligibleProductCodes: Iterable<string>
): ReadonlySet<string> => {
  try {
    const diffNameOnlySource = execSync(
      `${"git diff --name-only "}${resolveMainBaselineGitRef()}...HEAD`,
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    );

    return extractBranchModifiedEngine6ProductCodesFromDiffNameOnly(
      diffNameOnlySource,
      currentEligibleProductCodes
    );
  } catch {
    return new Set();
  }
};

/**
 * Product codes present in the current Engine6 catalog but not yet deployed to
 * production. Used to defer production runtime parity fetch failures until the
 * first live deploy without weakening runtime checks for already-published tours.
 */
export const loadMerchantFeedNotYetPublishedOnProductionProductCodes = (
  currentEligibleProductCodes: Iterable<string>
): ReadonlySet<string> => {
  const normalizedCurrent = [...currentEligibleProductCodes].map(code =>
    code.trim().toUpperCase()
  );

  const deployedCodes = loadEngine6ProductCodesFromGitRef(
    resolveProductionDeploymentGitRef()
  );
  if (deployedCodes) {
    return new Set(normalizedCurrent.filter(code => !deployedCodes.has(code)));
  }

  try {
    const diffSource = execSync(
      "git diff origin/main...HEAD -- src/engine6/routes.ts",
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    );
    const branchNew =
      extractBranchNewEngine6ProductCodesFromRoutesDiff(diffSource);
    if (branchNew.size > 0) {
      return branchNew;
    }
  } catch {
    // fall through
  }

  try {
    const currentRoutes = readFileSync(
      path.resolve(process.cwd(), "src/engine6/routes.ts"),
      "utf8"
    );
    const mainRoutes = execSync("git show origin/main:src/engine6/routes.ts", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const currentCodes =
      extractEngine6ProductCodesFromRoutesSource(currentRoutes);
    const mainCodes = extractEngine6ProductCodesFromRoutesSource(mainRoutes);
    return new Set([...currentCodes].filter(code => !mainCodes.has(code)));
  } catch {
    return new Set();
  }
};
