import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SITE_BRAND_NAME } from "../utils/site";

export const toursMenuItems = [
  { label: "Day Tours", href: "/activities" },
  { label: "Multi-Day Adventures", href: "/tours/multi-day" },
] as const;

const navItems = [
  { label: "Activities", href: "/activities" },
  { label: "Guides", href: "/guides" },
  { label: "FAQs", href: "/faqs" },
  { label: "Journeys", href: "/journeys" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

const pagesWithSectionLogo = new Set(["/guides", "/faqs", "/journeys", "/contact"]);

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const showSectionLogo = pagesWithSectionLogo.has(location);
  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f1e8]/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between gap-4 py-4">
            <Link href="/">
              <a className="flex items-center gap-3 text-lg font-semibold text-[#1f2a1f]">
                <img
                  src="/logo.svg"
                  alt={`${SITE_BRAND_NAME} logo`}
                  className="h-10 w-10"
                  loading="lazy"
                />
                {SITE_BRAND_NAME}
              </a>
            </Link>

            <nav className="hidden items-center gap-6 text-sm text-[#405040] md:flex">
              <div className="group relative">
                <Link href="/tours">
                  <a className="hover:text-[#1f2a1f]">Tours</a>
                </Link>
                <div className="absolute left-0 top-full hidden w-64 rounded-2xl border border-black/10 bg-white p-4 shadow-lg group-hover:block">
                  <div className="space-y-3 text-sm text-[#405040]">
                    {toursMenuItems.map(item => (
                      <Link key={item.label} href={item.href}>
                        <a className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b] hover:text-[#1f2a1f]">
                          {item.label}
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              {navItems.map(item => (
                <Link key={item.href} href={item.href}>
                  <a className="hover:text-[#1f2a1f]">{item.label}</a>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/tours">
                <a className="hidden items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129] sm:inline-flex">
                  Find an Adventure
                </a>
              </Link>
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(open => !open)}
                className="inline-flex items-center justify-center rounded-md border border-[#2f4a2f]/30 p-2 text-[#2f4a2f] transition hover:bg-[#2f4a2f]/10 md:hidden"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {mobileOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {mobileOpen ? (
            <div className="border-t border-black/10 pb-6 pt-4 md:hidden">
              <nav className="flex flex-col gap-4 text-sm text-[#405040]">
                <details className="rounded-2xl border border-black/10 bg-white/80 p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-[#1f2a1f]">
                    Tours
                    <span className="text-[#7a8a6b]">▾</span>
                  </summary>
                  <div className="mt-3 space-y-3">
                    {toursMenuItems.map(item => (
                      <Link key={item.label} href={item.href}>
                        <a onClick={closeMobileMenu} className="block font-medium">
                          {item.label}
                        </a>
                      </Link>
                    ))}
                  </div>
                </details>
                {navItems.map(item => (
                  <Link key={item.href} href={item.href}>
                    <a
                      onClick={closeMobileMenu}
                      className="font-medium text-[#1f2a1f]"
                    >
                      {item.label}
                    </a>
                  </Link>
                ))}
                <Link href="/tours">
                  <a
                    onClick={closeMobileMenu}
                    className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Find an Adventure
                  </a>
                </Link>
              </nav>
            </div>
          ) : null}
        </div>
      </header>

      {showSectionLogo ? (
        <div className="section-logo pointer-events-none absolute left-8 top-32 z-10 hidden lg:block xl:left-[calc(50%-45rem)] xl:top-28">
          <Link href="/">
            <a
              className="pointer-events-auto inline-flex"
              aria-label={`${SITE_BRAND_NAME} home`}
            >
              <img
                src="/images/Outdoor-Adventures-Logo-Transparent.png"
                alt={`${SITE_BRAND_NAME} circular logo with outdoor activities`}
                className="h-auto w-32"
              />
            </a>
          </Link>
        </div>
      ) : null}

      <style>{`
        @media (min-width: 1024px) and (max-width: 1279px) {
          .section-logo + main > section:first-child > div:first-child {
            padding-left: 11rem;
          }

          .section-logo + main > p:first-child,
          .section-logo + main > h1:first-of-type,
          .section-logo + main > h1:first-of-type + p,
          .section-logo + main > h1:first-of-type + div {
            margin-left: 10rem;
          }
        }
      `}</style>
    </>
  );
}
