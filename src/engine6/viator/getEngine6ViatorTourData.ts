import {
  ENGINE6_HILO_PILOT_API_PATH,
  ENGINE6_HILO_PILOT_PRODUCT_CODE,
} from "../hiloPilot";

type Engine6ViatorTourDataResponse = {
  product: Record<string, unknown>;
  source: "api" | "bundled-module";
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const canUseBundledFallback = () =>
  typeof process !== "undefined" &&
  process.env.ENABLE_ENGINE6_BUNDLED_FALLBACK_11069P1 === "true";

const getBundledEngine6Payload = async (): Promise<Record<string, unknown>> => {
  const module = await import("../../../data/engine6/viator/11069P1.product");
  const payload = module.default;

  if (!isRecord(payload)) {
    throw new Error("Engine6 bundled payload is not an object module export");
  }

  return payload;
};

export const getEngine6ViatorTourData = async (
  productCode: string
): Promise<Engine6ViatorTourDataResponse> => {
  const normalizedCode = productCode.trim().toUpperCase();

  let apiError: string | null = null;
  try {
    const response = await fetch(
      `${ENGINE6_HILO_PILOT_API_PATH}?productCode=${encodeURIComponent(normalizedCode)}`
    );

    if (!response.ok) {
      apiError = `status=${response.status}`;
    } else {
      const payload = (await response.json()) as Record<string, unknown>;
      const product = isRecord(payload.product) ? payload.product : payload;
      if (isRecord(product)) {
        return { product, source: "api" };
      }
      apiError = "payload-not-object";
    }
  } catch (error) {
    apiError = error instanceof Error ? error.message : String(error);
  }

  if (
    canUseBundledFallback() &&
    normalizedCode === ENGINE6_HILO_PILOT_PRODUCT_CODE
  ) {
    return {
      product: await getBundledEngine6Payload(),
      source: "bundled-module",
    };
  }

  throw new Error(
    `Engine6 failed to load Viator product ${normalizedCode} from ${ENGINE6_HILO_PILOT_API_PATH}${apiError ? ` (${apiError})` : ""}. Set ENABLE_ENGINE6_BUNDLED_FALLBACK_11069P1=true to force local fallback.`
  );
};
