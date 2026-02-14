import type { PropsWithChildren } from "react";

type BookingCtaLinkProps = PropsWithChildren<{
  href: string;
  className?: string;
}>;

export default function BookingCtaLink({
  href,
  className,
  children,
}: BookingCtaLinkProps) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="nofollow noopener noreferrer"
    >
      {children}
    </a>
  );
}
