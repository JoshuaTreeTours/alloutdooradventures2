export const getEngine6ViatorTourData = async (productCode: string) => {
  const normalizedCode = productCode.trim().toUpperCase();
  if (!normalizedCode) {
    throw new Error("Engine6 requires a Viator product code");
  }

  const response = await fetch(
    `/api/engine6/viator-product?productCode=${encodeURIComponent(normalizedCode)}`
  );

  if (!response.ok) {
    throw new Error(
      `Engine6 Viator API unavailable for ${normalizedCode}: ${response.status} ${await response.text()}`
    );
  }

  return (await response.json()) as Record<string, unknown>;
};
