import { Link } from "wouter";

import { FAREHARBOR_PROOF_PRIMARY_CTA_LABEL } from "../data/fareharborLeadToGoldProof";

type FareHarborMobileStickyBookingBarProps = {
  href: string;
  priceLabel: string;
};

export const FAREHARBOR_MOBILE_STICKY_PAGE_PADDING =
  "@media (max-width: 767px) { body { padding-bottom: calc(6rem + env(safe-area-inset-bottom)); } }";

export default function FareHarborMobileStickyBookingBar({
  href,
  priceLabel,
}: FareHarborMobileStickyBookingBarProps) {
  return (
    <div
      data-testid="fareharbor-mobile-sticky-booking"
      role="region"
      aria-label="Booking"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[#f6f1e8]/95 pt-3 shadow-[0_-8px_24px_rgba(31,42,31,0.12)] backdrop-blur pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden"
    >
      <style>{FAREHARBOR_MOBILE_STICKY_PAGE_PADDING}</style>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <p
          className="min-w-0 truncate text-sm font-semibold text-[#1f2a1f]"
          data-testid="fareharbor-sticky-price"
        >
          {priceLabel}
        </p>
        <Link href={href}>
          <a
            rel="nofollow"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-md bg-[#2f8a3d] px-4 text-sm font-semibold text-white transition hover:bg-[#287a35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f2a1f]"
          >
            {FAREHARBOR_PROOF_PRIMARY_CTA_LABEL}
          </a>
        </Link>
      </div>
    </div>
  );
}
