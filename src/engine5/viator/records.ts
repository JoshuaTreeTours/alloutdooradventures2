import type { Engine5ProductRecord } from "../types";

export const ENGINE5_HILO_VOLCANO_RECORD: Engine5ProductRecord = {
  productCode: "11069P1",
  destination: {
    country: "United States",
    state: "Hawaii",
    stateSlug: "hawaii",
    city: "Hilo",
    citySlug: "hilo",
  },
};

export const engine5ViatorRecords: readonly Engine5ProductRecord[] = [
  ENGINE5_HILO_VOLCANO_RECORD,
];

export const engine5ProofViatorRecord = ENGINE5_HILO_VOLCANO_RECORD;
