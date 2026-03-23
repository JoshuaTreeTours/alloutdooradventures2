const normalizeDeploymentUrl = (value: string | null | undefined) => {
  const normalized = value?.trim();
  if (!normalized) {
    return null;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return `https://${normalized}`;
};

const readImportMetaEnv = (key: string) => {
  const env = import.meta.env as Record<string, string | undefined>;
  return env[key]?.trim() || null;
};

export const ENGINE6_DEPLOYMENT_INFO = {
  gitCommitSha: readImportMetaEnv("VITE_GIT_COMMIT_SHA"),
  gitBranch: readImportMetaEnv("VITE_GIT_BRANCH"),
  vercelEnv: readImportMetaEnv("VITE_VERCEL_ENV"),
  previewUrl: normalizeDeploymentUrl(readImportMetaEnv("VITE_VERCEL_URL")),
} as const;
