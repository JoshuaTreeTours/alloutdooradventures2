import {
  fareHarborLeadToGoldProofProducts,
  type FareHarborProofProduct,
} from "./fareharborLeadToGoldProof.generated";
import { fareHarborBostonLegacyProducts } from "./fareharborBostonLegacy.generated";
import { fareHarborChicagoLegacyProducts } from "./fareharborChicagoLegacy.generated";
import { fareHarborLosAngelesLegacyProducts } from "./fareharborLosAngelesLegacy.generated";
import { fareHarborSanDiegoLegacyProducts } from "./fareharborSanDiegoLegacy.generated";
import { fareHarborSanFranciscoLegacyProducts } from "./fareharborSanFranciscoLegacy.generated";
import { fareHarborJoshuaTreeLegacyProducts } from "./fareharborJoshuaTreeLegacy.generated";
import { fareHarborRedondoBeachLegacyProducts } from "./fareharborRedondoBeachLegacy.generated";
import { fareHarborCoronadoLegacyProducts } from "./fareharborCoronadoLegacy.generated";
import { fareHarborCalistogaLegacyProducts } from "./fareharborCalistogaLegacy.generated";
import { fareHarborDelMarLegacyProducts } from "./fareharborDelMarLegacy.generated";
import { fareHarborSantaMonicaLegacyProducts } from "./fareharborSantaMonicaLegacy.generated";
import { fareHarborMarinaDelReyLegacyProducts } from "./fareharborMarinaDelReyLegacy.generated";
import { fareHarborOakhurstLegacyProducts } from "./fareharborOakhurstLegacy.generated";
import { fareHarborLagunaBeachLegacyProducts } from "./fareharborLagunaBeachLegacy.generated";
import { fareHarborHealdsburgLegacyProducts } from "./fareharborHealdsburgLegacy.generated";
import { fareHarborAvalonLegacyProducts } from "./fareharborAvalonLegacy.generated";

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
    fareHarborLosAngelesLegacyProducts,
    fareHarborSanDiegoLegacyProducts,
    fareHarborSanFranciscoLegacyProducts,
    fareHarborJoshuaTreeLegacyProducts,
    fareHarborRedondoBeachLegacyProducts,
    fareHarborCoronadoLegacyProducts,
    fareHarborCalistogaLegacyProducts,
    fareHarborDelMarLegacyProducts,
    fareHarborSantaMonicaLegacyProducts,
    fareHarborMarinaDelReyLegacyProducts,
    fareHarborOakhurstLegacyProducts,
    fareHarborLagunaBeachLegacyProducts,
    fareHarborHealdsburgLegacyProducts,
    fareHarborAvalonLegacyProducts,
  ];

export const fareHarborMigratedProducts: FareHarborProofProduct[] =
  fareHarborCityBatches.flat();

export const getFareHarborBostonLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborBostonLegacyProducts;

export const getFareHarborChicagoLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborChicagoLegacyProducts;

export const getFareHarborLosAngelesLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborLosAngelesLegacyProducts;

export const getFareHarborSanDiegoLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborSanDiegoLegacyProducts;

export const getFareHarborSanFranciscoLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborSanFranciscoLegacyProducts;

export const getFareHarborJoshuaTreeLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborJoshuaTreeLegacyProducts;

export const getFareHarborRedondoBeachLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborRedondoBeachLegacyProducts;

export const getFareHarborCoronadoLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborCoronadoLegacyProducts;

export const getFareHarborCalistogaLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborCalistogaLegacyProducts;

export const getFareHarborDelMarLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborDelMarLegacyProducts;

export const getFareHarborSantaMonicaLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborSantaMonicaLegacyProducts;

export const getFareHarborMarinaDelReyLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborMarinaDelReyLegacyProducts;

export const getFareHarborOakhurstLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborOakhurstLegacyProducts;

export const getFareHarborLagunaBeachLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborLagunaBeachLegacyProducts;

export const getFareHarborHealdsburgLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborHealdsburgLegacyProducts;

export const getFareHarborAvalonLegacyProducts = (): FareHarborProofProduct[] =>
  fareHarborAvalonLegacyProducts;
