import React, { useMemo } from "react";

import { buildFareharborEmbedUrl } from "../../lib/fareharbor";

type FareHarborEmbedProps = {
  title: string;
  baseUrl?: string;
  companySlug?: string;
  itemId?: string;
  onLoad?: () => void;
  className?: string;
};

export default function FareHarborEmbed({
  title,
  baseUrl,
  companySlug,
  itemId,
  onLoad,
  className,
}: FareHarborEmbedProps) {
  const embedUrl = useMemo(
    () =>
      buildFareharborEmbedUrl({
        baseUrl,
        companySlug,
        itemId,
      }),
    [baseUrl, companySlug, itemId],
  );

  if (!embedUrl) {
    return (
      <div
        className={
          className ??
          "rounded-2xl border border-dashed border-[#2f4a2f]/30 bg-white/80 p-6 text-sm text-[#405040]"
        }
      >
        We couldn’t load the embedded booking calendar. Use the booking button
        below to continue.
      </div>
    );
  }

  return (
    <iframe
      title={title}
      src={embedUrl}
      className={
        className ??
        "h-[720px] w-full rounded-xl border-0 md:h-[820px]"
      }
      allow="payment *; clipboard-read; clipboard-write; fullscreen; geolocation"
      sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
      onLoad={onLoad}
    />
  );
}
