const deniedStats = {
  blockedEmbeds: 0,
};

const isDev = import.meta.env.DEV;

export const OPT_OUT_OPERATOR_SLUGS = new Set([
  "red-jeep",
  "desert-adventures",
]);

export const recordBlockedFareharborEmbed = (operatorSlug: string) => {
  deniedStats.blockedEmbeds += 1;

  if (!isDev) {
    return;
  }

  console.info("[fareharbor-denylist] blocked embed", {
    operatorSlug,
    blockedEmbeds: deniedStats.blockedEmbeds,
  });
};
