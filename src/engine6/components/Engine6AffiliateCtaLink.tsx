import type { PropsWithChildren } from "react";

type Engine6AffiliateCtaLinkProps = PropsWithChildren<{
  href: string;
  className?: string;
}>;

export default function Engine6AffiliateCtaLink({
  href,
  className,
  children,
}: Engine6AffiliateCtaLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      data-engine6-affiliate-cta="true"
      className={className}
    >
      {children}
    </a>
  );
}
