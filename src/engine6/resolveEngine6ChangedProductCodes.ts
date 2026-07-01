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

export const extractEngine6ProductCodesFromCatalogDiff = (diff: string) => {
  const scoped = new Set<string>();
  const hunks = diff.split(/^@@/m).slice(1);

  for (const hunk of hunks) {
    const lines = hunk.split(/\r?\n/).slice(1);
    const plusCodes = new Set<string>();
    const minusCodes = new Set<string>();
    const contextCodes = new Set<string>();
    let hunkHasChange = false;

    for (const line of lines) {
      if (line.startsWith("+++") || line.startsWith("---")) {
        continue;
      }

      const codes = extractProductCodesFromText(line);
      if (line.startsWith("+")) {
        hunkHasChange = true;
        for (const code of codes) {
          plusCodes.add(code);
        }
      } else if (line.startsWith("-")) {
        hunkHasChange = true;
        for (const code of codes) {
          minusCodes.add(code);
        }
      } else if (line.startsWith(" ")) {
        for (const code of codes) {
          contextCodes.add(code);
        }
      }
    }

    if (!hunkHasChange) {
      continue;
    }

    for (const code of plusCodes) {
      scoped.add(code);
    }

    for (const code of contextCodes) {
      scoped.add(code);
    }

    for (const code of minusCodes) {
      if (plusCodes.has(code) || contextCodes.has(code)) {
        scoped.add(code);
      }
    }
  }

  return [...scoped];
};

export const extractEngine6ProductCodesFromChangedFiles = (args: {
  changedFiles: Engine6GitChangedFile[];
  catalogDiffs: Record<string, string>;
}) => {
  const scoped = new Set<string>();

  for (const file of args.changedFiles) {
    if (file.status === "D") {
      continue;
    }

    for (const code of extractEngine6ProductCodesFromExactProductPath(file.path)) {
      if (file.status === "A" || file.status === "M") {
        scoped.add(code);
      }
    }

    if (
      (file.status === "A" || file.status === "M") &&
      ENGINE6_CATALOG_DIFF_PATH.test(file.path) &&
      args.catalogDiffs[file.path]
    ) {
      for (const code of extractEngine6ProductCodesFromCatalogDiff(
        args.catalogDiffs[file.path]
      )) {
        scoped.add(code);
      }
    }
  }

  return [...scoped].sort();
};

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

export const resolveEngine6ProductCodesChangedSinceRef = (args: {
  baseRef: string;
  headRef?: string;
  execImpl?: typeof execSync;
  execFileImpl?: typeof execFileSync;
}) => {
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

  return extractEngine6ProductCodesFromChangedFiles({
    changedFiles,
    catalogDiffs,
  });
};
