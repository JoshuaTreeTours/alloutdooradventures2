import { readFileSync } from "node:fs";

import type { Engine6DestinationBuildConfig } from "../src/engine6/engine6ProductSelectionGovernance";

export const readEngine6ParagonProductSelectionConfigFromArgv = () => {
  const configPath =
    process.env.ENGINE6_PRODUCT_SELECTION_SLOTS_PATH?.trim() ||
    process.argv.find(arg => arg.endsWith(".product-selection.json"));

  if (!configPath) {
    throw new Error(
      "Engine6 Paragon governance requires a *.product-selection.json config path."
    );
  }

  const parsed = JSON.parse(
    readFileSync(configPath, "utf8")
  ) as Engine6DestinationBuildConfig;

  if (!parsed.destinationLabel?.trim()) {
    throw new Error(
      `Invalid Engine6 Paragon config at ${configPath}: missing destinationLabel`
    );
  }

  if (!Array.isArray(parsed.slots) || parsed.slots.length === 0) {
    throw new Error(
      `Invalid Engine6 Paragon config at ${configPath}: expected non-empty slots array`
    );
  }

  return {
    configPath,
    config: parsed,
  };
};
