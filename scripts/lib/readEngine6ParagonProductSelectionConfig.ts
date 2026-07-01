import { readFileSync } from "node:fs";

import { normalizeEngine6ParagonProductSelectionConfig } from "../../src/engine6/normalizeEngine6ParagonProductSelectionConfig";
import type { Engine6DestinationBuildConfig } from "../../src/engine6/engine6ProductSelectionGovernance";

export { normalizeEngine6ParagonProductSelectionConfig } from "../../src/engine6/normalizeEngine6ParagonProductSelectionConfig";

const readDestinationLabelOverride = () => {
  const flagIndex = process.argv.indexOf("--destination");
  if (flagIndex >= 0) {
    return process.argv[flagIndex + 1]?.trim() || null;
  }

  return process.env.ENGINE6_PRODUCT_SELECTION_DESTINATION?.trim() || null;
};

export const readEngine6ParagonProductSelectionConfigFromPath = (args: {
  configPath: string;
  destinationLabelOverride?: string | null;
}): {
  configPath: string;
  config: Engine6DestinationBuildConfig;
} => {
  const raw = JSON.parse(readFileSync(args.configPath, "utf8")) as unknown;

  return {
    configPath: args.configPath,
    config: normalizeEngine6ParagonProductSelectionConfig({
      configPath: args.configPath,
      raw,
      destinationLabelOverride:
        args.destinationLabelOverride ?? readDestinationLabelOverride(),
    }),
  };
};

export const readEngine6ParagonProductSelectionConfigFromArgv = () => {
  const configPath =
    process.env.ENGINE6_PRODUCT_SELECTION_SLOTS_PATH?.trim() ||
    process.argv.find(arg => arg.endsWith(".product-selection.json"));

  if (!configPath) {
    throw new Error(
      "Engine6 Paragon governance requires a *.product-selection.json config path."
    );
  }

  return readEngine6ParagonProductSelectionConfigFromPath({ configPath });
};
