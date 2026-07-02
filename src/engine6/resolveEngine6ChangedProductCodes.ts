import { execFileSync, execSync } from "node:child_process";

const EXACT_PRODUCT_JSON_PATH =
  /^data\/engine6\/viator\/([A-Z0-9_]+)\.exact-product\.json$/i;

const ENGINE6_CATALOG_DIFF_PATH =
  /^(?:src\/engine6\/(?:validationFixtures\.ts|routes\.ts|.*ViatorPublicRatings\.ts)|data\/merchantFeed\.csv)$/;

const VIATOR_PRODUCT_CODE_FIELD = /productCode:\s*["']([A-Z0-9_]+)["']/gi;

const VIATOR_EXACT_PRODUCT_IMPORT =
  /viator\/([A-Z0-9_]+)\.exact-product\.json/gi;

const VIATOR_URL_PRODUCT_CODE = /\/d\d+-([A-Z0-9_]+)(?:[/?#]|$)/gi;

export type Engine6GitChangedFile = {
  status: string;
  path: string;
};

export const normalizeEngine6ProductCode = (value: string) =>
  value.trim().toUpperCase();

export const parseGitNameStatusOutput = (output: string): Engine6GitChangedFile[] =>
  output
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [status, ...pathParts] = line.split(/\s+/);
      return {
        status: status.replace(/\d+$/, ""),
        path: pathParts.join(" "),
      };
    });

const extractProductCodesFromText = (text: string) => {
  const codes = new Set<string>();

  for (const match of text.matchAll(VIATOR_PRODUCT_CODE_FIELD)) {
    codes.add(normalizeEngine6ProductCode(match[1]));
  }

  for (const match of text.matchAll(VIATOR_EXACT_PRODUCT_IMPORT)) {
    codes.add(normalizeEngine6ProductCode(match[1]));
  }

  for (const match of text.matchAll(VIATOR_URL_PRODUCT_CODE)) {
    codes.add(normalizeEngine6ProductCode(match[1]));
  }

  return codes;
};

export const extractEngine6ProductCodesFromExactProductPath = (filePath: string) => {
  const match = filePath.match(EXACT_PRODUCT_JSON_PATH);
  return match ? [normalizeEngine6ProductCode(match[1])] : [];
};

/** Stable record identity for a catalog diff line (CSV id, productCode field, ratings key). */
export const extractEngine6CatalogDiffLineIdentity = (line: string) => {
  const csvMatch = line.match(/^[ +-]([A-Z0-9_]+),/);
  if (csvMatch) {
    return normalizeEngine6ProductCode(csvMatch[1]);
  }

  const productCodeMatch = line.match(/productCode:\s*["']([A-Z0-9_]+)["']/i);
  if (productCodeMatch) {
    return normalizeEngine6ProductCode(productCodeMatch[1]);
  }

  const ratingsKeyMatch = line.match(/^[ +-]\s*["']([A-Z0-9_]+)["']\s*:\s*\{/);
  if (ratingsKeyMatch) {
    return normalizeEngine6ProductCode(ratingsKeyMatch[1]);
  }

  return null;
};

const collectEngine6CatalogDiffLineCodes = (line: string, activeRecordCode: string | null) => {
  const codes = new Set<string>();
  const identity = extractEngine6CatalogDiffLineIdentity(line);

  if (identity) {
    codes.add(identity);
  } else if (activeRecordCode) {
    codes.add(activeRecordCode);
  }

  for (const code of extractProductCodesFromText(line)) {
    codes.add(code);
  }

  return codes;
};

export type Engine6CatalogDiffProductScope = {
  addedOrModified: string[];
  removedOnly: string[];
  deployScoped: string[];
};

export const resolveEngine6CatalogDiffProductScope = (
  diff: string
): Engine6CatalogDiffProductScope => {
  const plusLineCodes = new Set<string>();
  const minusLineCodes = new Set<string>();
  const hunks = diff.split(/^@@/m).slice(1);

  for (const hunk of hunks) {
    const lines = hunk.split(/\r?\n/).slice(1);
    let activeRecordCode: string | null = null;

    for (const line of lines) {
      if (line.startsWith("+++") || line.startsWith("---")) {
        continue;
      }

      const identity = extractEngine6CatalogDiffLineIdentity(line);

      if (line.startsWith(" ")) {
        if (identity) {
          activeRecordCode = identity;
        }
        continue;
      }

      if (line.startsWith("+")) {
        for (const code of collectEngine6CatalogDiffLineCodes(line, activeRecordCode)) {
          plusLineCodes.add(code);
        }
        if (identity) {
          activeRecordCode = identity;
        }
        continue;
      }

      if (line.startsWith("-")) {
        for (const code of collectEngine6CatalogDiffLineCodes(line, activeRecordCode)) {
          minusLineCodes.add(code);
        }
      }
    }
  }

  const addedOrModified = new Set<string>();
  for (const code of plusLineCodes) {
    addedOrModified.add(code);
  }
  for (const code of minusLineCodes) {
    if (plusLineCodes.has(code)) {
      addedOrModified.add(code);
    }
  }

  const removedOnly = new Set<string>();
  for (const code of minusLineCodes) {
    if (!plusLineCodes.has(code)) {
      removedOnly.add(code);
    }
  }

  const deployScoped = new Set([...plusLineCodes, ...minusLineCodes]);

  return {
    addedOrModified: [...addedOrModified].sort(),
    removedOnly: [...removedOnly].sort(),
    deployScoped: [...deployScoped].sort(),
  };
};

export const extractEngine6ProductCodesFromCatalogDiff = (diff: string) =>
  resolveEngine6CatalogDiffProductScope(diff).deployScoped;

export type Engine6ChangedFileProductScope = {
  deployScoped: string[];
  addedOrModified: string[];
  removedOnly: string[];
};

export const resolveEngine6ProductScopeFromChangedFiles = (args: {
  changedFiles: Engine6GitChangedFile[];
  catalogDiffs: Record<string, string>;
}): Engine6ChangedFileProductScope => {
  const deployScoped = new Set<string>();
  const addedOrModified = new Set<string>();
  const removedOnly = new Set<string>();

  for (const file of args.changedFiles) {
    if (file.status === "D") {
      for (const code of extractEngine6ProductCodesFromExactProductPath(file.path)) {
        removedOnly.add(code);
        deployScoped.add(code);
      }
      continue;
    }

    for (const code of extractEngine6ProductCodesFromExactProductPath(file.path)) {
      if (file.status === "A") {
        addedOrModified.add(code);
        deployScoped.add(code);
      }
    }

    if (
      (file.status === "A" || file.status === "M") &&
      ENGINE6_CATALOG_DIFF_PATH.test(file.path) &&
      args.catalogDiffs[file.path]
    ) {
      const scope = resolveEngine6CatalogDiffProductScope(
        args.catalogDiffs[file.path]
      );
      for (const code of scope.deployScoped) {
        deployScoped.add(code);
      }
      for (const code of scope.addedOrModified) {
        addedOrModified.add(code);
      }
      for (const code of scope.removedOnly) {
        removedOnly.add(code);
      }
    }
  }

  return {
    deployScoped: [...deployScoped].sort(),
    addedOrModified: [...addedOrModified].sort(),
    removedOnly: [...removedOnly].sort(),
  };
};

export const extractEngine6ProductCodesFromChangedFiles = (args: {
  changedFiles: Engine6GitChangedFile[];
  catalogDiffs: Record<string, string>;
}) => resolveEngine6ProductScopeFromChangedFiles(args).deployScoped;

export type Engine6LiveViatorValidationBaseRefResolution = {
  baseRef: string | null;
  attemptedRefs: string[];
  warning: string | null;
};

export type Engine6ProductCodesChangedSinceRefResult =
  Engine6LiveViatorValidationBaseRefResolution & {
    productCodes: string[];
  };

export const verifyGitRefExists = (
  ref: string,
  execFileImpl: typeof execFileSync = execFileSync
): boolean => {
  const normalizedRef = ref.trim();
  if (!normalizedRef) {
    return false;
  }

  try {
    execFileImpl("git", ["rev-parse", "--verify", `${normalizedRef}^{commit}`], {
      encoding: "utf8",
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
};

/** Candidate order: explicit env, Vercel previous deploy SHA, then origin/main for CI. */
export const resolveEngine6LiveViatorValidationBaseRefCandidates = (): string[] => {
  const candidates: string[] = [];
  const addCandidate = (value: string | undefined) => {
    const normalized = value?.trim();
    if (!normalized || candidates.includes(normalized)) {
      return;
    }
    candidates.push(normalized);
  };

  addCandidate(process.env.ENGINE6_LIVE_VIATOR_VALIDATION_BASE_REF);

  const previousSha = process.env.VERCEL_GIT_PREVIOUS_SHA?.trim();
  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

  if (isVercel) {
    addCandidate(previousSha);
  }

  addCandidate("origin/main");

  if (!isVercel) {
    addCandidate(previousSha);
  }

  return candidates;
};

export const resolveVerifiedEngine6LiveViatorValidationBaseRef = (args?: {
  execFileImpl?: typeof execFileSync;
}): Engine6LiveViatorValidationBaseRefResolution => {
  const execFileImpl = args?.execFileImpl ?? execFileSync;
  const attemptedRefs = resolveEngine6LiveViatorValidationBaseRefCandidates();

  for (const candidate of attemptedRefs) {
    if (verifyGitRefExists(candidate, execFileImpl)) {
      return {
        baseRef: candidate,
        attemptedRefs,
        warning: null,
      };
    }
  }

  return {
    baseRef: null,
    attemptedRefs,
    warning:
      "Engine6 live Viator validation could not resolve a git base ref " +
      `(${attemptedRefs.join(", ")}). Deploy-scoped blocking is disabled; ` +
      "full-catalog validation continues with legacy failures report-only.",
  };
};

export const resolveEngine6ProductCodesChangedSinceRefSafe = (args?: {
  headRef?: string;
  execImpl?: typeof execSync;
  execFileImpl?: typeof execFileSync;
}): Engine6ProductCodesChangedSinceRefResult => {
  const baseRefResolution = resolveVerifiedEngine6LiveViatorValidationBaseRef({
    execFileImpl: args?.execFileImpl,
  });

  if (!baseRefResolution.baseRef) {
    return {
      ...baseRefResolution,
      productCodes: [],
    };
  }

  return {
    ...baseRefResolution,
    warning: null,
    productCodes: resolveEngine6ProductCodesChangedSinceRef({
      baseRef: baseRefResolution.baseRef,
      headRef: args?.headRef,
      execImpl: args?.execImpl,
    }),
  };
};

export type Engine6ProductScopeChangedSinceRefResult =
  Engine6LiveViatorValidationBaseRefResolution &
    Engine6ChangedFileProductScope;

export const resolveEngine6ProductScopeChangedSinceRef = (args: {
  baseRef: string;
  headRef?: string;
  execImpl?: typeof execSync;
  execFileImpl?: typeof execFileSync;
}): Engine6ChangedFileProductScope => {
  const headRef = args.headRef ?? "HEAD";
  const execImpl = args.execImpl ?? execSync;
  const execFileImpl = args.execFileImpl ?? execFileSync;

  if (!verifyGitRefExists(args.baseRef, execFileImpl)) {
    throw new Error(
      `Engine6 git diff base ref is unavailable: ${args.baseRef.trim()}`
    );
  }

  if (!verifyGitRefExists(headRef, execFileImpl)) {
    throw new Error(`Engine6 git diff head ref is unavailable: ${headRef.trim()}`);
  }

  const range = `${args.baseRef}...${headRef}`;
  const nameStatusOutput = execImpl(`git diff --name-status ${range}`, {
    encoding: "utf8",
  });
  const changedFiles = parseGitNameStatusOutput(nameStatusOutput);
  const catalogDiffs: Record<string, string> = {};

  for (const file of changedFiles) {
    if (
      (file.status === "A" || file.status === "M") &&
      ENGINE6_CATALOG_DIFF_PATH.test(file.path)
    ) {
      catalogDiffs[file.path] = execImpl(`git diff ${range} -- ${file.path}`, {
        encoding: "utf8",
      });
    }
  }

  return resolveEngine6ProductScopeFromChangedFiles({
    changedFiles,
    catalogDiffs,
  });
};

export const resolveEngine6ProductCodesChangedSinceRef = (args: {
  baseRef: string;
  headRef?: string;
  execImpl?: typeof execSync;
  execFileImpl?: typeof execFileSync;
}) =>
  resolveEngine6ProductScopeChangedSinceRef(args).deployScoped;
