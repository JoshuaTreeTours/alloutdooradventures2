const DEFAULT_VIATOR_BASE_URL = "https://api.viator.com/partner";

const firstNonEmpty = (values: Array<string | undefined>) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
};

export const resolveViatorApiKey = () =>
  firstNonEmpty([
    process.env.VIATOR_API_KEY,
    process.env.VIATOR_PARTNER_API_KEY,
    process.env.ENGINE6_VIATOR_API_KEY,
  ]);

export const resolveViatorBaseUrl = () =>
  (
    firstNonEmpty([
      process.env.VIATOR_API_BASE_URL,
      process.env.VIATOR_BASE_URL,
      process.env.VIATOR_PARTNER_BASE_URL,
      process.env.ENGINE6_VIATOR_API_BASE_URL,
    ]) ?? DEFAULT_VIATOR_BASE_URL
  ).replace(/\/$/, "");

export const VIATOR_ENV_SOURCES = {
  apiKey: [
    "VIATOR_API_KEY",
    "VIATOR_PARTNER_API_KEY",
    "ENGINE6_VIATOR_API_KEY",
  ],
  baseUrl: [
    "VIATOR_API_BASE_URL",
    "VIATOR_BASE_URL",
    "VIATOR_PARTNER_BASE_URL",
    "ENGINE6_VIATOR_API_BASE_URL",
  ],
} as const;
