const VIATOR_AFFILIATE_PID = "P00290915";
const VIATOR_AFFILIATE_MCID = "42383";
const VIATOR_AFFILIATE_MEDIUM = "link";

let hasLoggedInvalidViatorAffiliateUrl = false;

const isDev = () => Boolean(import.meta.env?.DEV);

const logInvalidViatorAffiliateUrlOnce = (url: string) => {
  if (!isDev() || hasLoggedInvalidViatorAffiliateUrl) {
    return;
  }

  hasLoggedInvalidViatorAffiliateUrl = true;
  console.warn(`[engine3] Unable to apply Viator affiliate params to URL: ${url}`);
};

export const withViatorAffiliateParams = (url: string): string => {
  if (typeof url !== "string" || url.trim().length === 0) {
    logInvalidViatorAffiliateUrlOnce(String(url));
    return url;
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.set("pid", VIATOR_AFFILIATE_PID);
    parsed.searchParams.set("mcid", VIATOR_AFFILIATE_MCID);
    parsed.searchParams.set("medium", VIATOR_AFFILIATE_MEDIUM);
    return parsed.toString();
  } catch {
    logInvalidViatorAffiliateUrlOnce(url);
    return url;
  }
};

const isCanonicalViatorTourPath = (pathname: string): boolean =>
  /\/d648-[^/]+$/i.test(pathname);

const isCanonicalViatorTourUrl = (url: string): boolean => {
  try {
    return isCanonicalViatorTourPath(new URL(url).pathname);
  } catch {
    return false;
  }
};

export const resolvePreferredViatorTourUrl = (
  candidateUrl: string,
  fallbackCanonicalUrl?: string
): string => {
  if (
    typeof fallbackCanonicalUrl === "string" &&
    fallbackCanonicalUrl.length > 0 &&
    isCanonicalViatorTourUrl(fallbackCanonicalUrl) &&
    !isCanonicalViatorTourUrl(candidateUrl)
  ) {
    return fallbackCanonicalUrl;
  }

  return candidateUrl;
};

