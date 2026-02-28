const PRODUCT_CODE_RE = /^[0-9]+[A-Z0-9]+$/;

export const extractViatorProductCode = (viatorUrl?: string): string | null => {
  if (!viatorUrl) {
    return null;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(viatorUrl);
  } catch {
    return null;
  }

  const pathSegments = parsedUrl.pathname
    .split("/")
    .map(segment => segment.trim())
    .filter(Boolean);

  const lastSegment = pathSegments[pathSegments.length - 1];
  if (!lastSegment) {
    return null;
  }

  const token = lastSegment.split("-").pop()?.trim().toUpperCase();

  if (!token || !PRODUCT_CODE_RE.test(token)) {
    return null;
  }

  return token;
};
