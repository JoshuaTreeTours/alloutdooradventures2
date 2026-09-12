export type FareHarborEnrichment = {
  r: boolean;
  k: string;
  p?: string[];
  i?: string[];
};

export type FareHarborEnrichmentMap = Record<string, FareHarborEnrichment>;
