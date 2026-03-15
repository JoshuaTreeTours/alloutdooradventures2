import { ENGINE6_HILO_PILOT_PRODUCT_CODE } from "../hiloPilot";

type Engine6ViatorTourDataResponse = {
  product: Record<string, unknown>;
  source: "api" | "bundled-module";
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

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

  try {
    const response = await fetch(
      `/api/engine5/viator-product?productCode=${encodeURIComponent(normalizedCode)}`
    );

    if (response.ok) {
      const payload = (await response.json()) as Record<string, unknown>;
      const product = isRecord(payload.product) ? payload.product : payload;
      if (isRecord(product)) {
        return { product, source: "api" };
      }
    }
  } catch {
    // fall through to module fallback
  }

  if (normalizedCode !== ENGINE6_HILO_PILOT_PRODUCT_CODE) {
    throw new Error(`Engine6 has no bundled payload for ${normalizedCode}`);
  }

  return {
    product: await getBundledEngine6Payload(),
    source: "bundled-module",
  };
};
