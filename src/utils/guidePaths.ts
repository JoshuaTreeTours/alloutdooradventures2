export const getStateGuidePath = (stateSlug: string) => `/guides/us/${stateSlug}`;

export const canonicalHref = (path: string) => {
  if (!path) {
    return "/";
  }

  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") {
    return "/";
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
};
