import {
  fareHarborLeadToGoldProofProducts,
  type FareHarborProofProduct,
} from "./fareharborLeadToGoldProof.generated";
import { fareHarborBostonLegacyProducts } from "./fareharborBostonLegacy.generated";
import { fareHarborChicagoLegacyProducts } from "./fareharborChicagoLegacy.generated";

/**
 * Canonical FareHarbor city batches.
 *
 * Cards, product pages, meta tags, and Product JSON-LD read the flattened
 * list. They do not branch on a city name or an item id. The next city is
 * added by generating a proof array and appending it here.
 */
export const fareHarborCityBatches: readonly (readonly FareHarborProofProduct[])[] =
  [
    fareHarborLeadToGoldProofProducts,
    fareHarborBostonLegacyProducts,
    fareHarborChicagoLegacyProducts,
  ];

export const fareHarborMigratedProducts: FareHarborProofProduct[] =
  fareHarborCityBatches.flat();

export const getFareHarborBostonLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborBostonLegacyProducts;

export const getFareHarborChicagoLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborChicagoLegacyProducts;
