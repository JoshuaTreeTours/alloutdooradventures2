import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

/** Last known production deploy before the Monterey Engine6 catalog expansion. */
export const DEFAULT_MERCHANT_FEED_PRODUCTION_DEPLOYMENT_GIT_REF = "cd7906a9";

const ENGINE6_PRODUCT_CODE_EXPORT_PATTERN =
  /export const ENGINE6_[A-Z0-9_]+_PRODUCT_CODE = "([^"]+)"/g;

const BRANCH_NEW_ENGINE6_PRODUCT_CODE_DIFF_PATTERN =
  /^\s*\+\s*export const ENGINE6_[A-Z0-9_]+_PRODUCT_CODE = "([^"]+)"/gm;

export const extractEngine6ProductCodesFromRoutesSource = (
  routesSource: string
): ReadonlySet<string> => {
  const codes = new Set<string>();

  for (const match of routesSource.matchAll(ENGINE6_PRODUCT_CODE_EXPORT_PATTERN)) {
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
    const currentCodes = extractEngine6ProductCodesFromRoutesSource(currentRoutes);
    const mainCodes = extractEngine6ProductCodesFromRoutesSource(mainRoutes);
    return new Set([...currentCodes].filter(code => !mainCodes.has(code)));
  } catch {
    return new Set();
  }
};
