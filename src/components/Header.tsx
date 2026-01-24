import { useState } from "react";
import { Link } from "wouter";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f1e8]/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between gap-4 py-4">
          <Link href="/">
            <a className="flex items-center gap-3 text-lg font-semibold text-[#1f2a1f]">
              <img
                src="/logo.svg"
                alt="Outdoor Adventures logo"
                className="h-10 w-10"
                loading="lazy"
              />
              Outdoor Adventures
            </a>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-[#405040]">
            <div className="relative group">
              <Link href="/tours">
                <a className="hover:text-[#1f2a1f]">Tours</a>
              </Link>
              <div className="absolute left-0 top-full hidden w-64 rounded-2xl border border-black/10 bg-white p-4 shadow-lg group-hover:block">
                <div className="space-y-4 text-sm text-[#405040]">
                  <div>
                    <Link href="/tours/day">
                      <a className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b] hover:text-[#1f2a1f]">
                        Day Tours
                      </a>
                    </Link>
                    <div className="mt-2 space-y-2">
                      <Link href="/tours/day/cycling">
                        <a className="block hover:text-[#1f2a1f]">Cycling</a>
                      </Link>
                      <Link href="/tours/day/hiking">
                        <a className="block hover:text-[#1f2a1f]">Hiking</a>
                      </Link>
                      <Link href="/tours/day/paddle">
                        <a className="block hover:text-[#1f2a1f]">
                          Paddle Sports
                        </a>
                      </Link>
                    </div>
                  </div>
                  <div>
                    <Link href="/tours/multi-day">
                      <a className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b] hover:text-[#1f2a1f]">
                        Multi-Day Adventures
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <Link href="/guides">
              <a className="hover:text-[#1f2a1f]">Guides</a>
            </Link>
            <Link href="/faq">
              <a className="hover:text-[#1f2a1f]">FAQs</a>
            </Link>
            <Link href="/journeys">
              <a className="hover:text-[#1f2a1f]">Journeys</a>
            </Link>
            <Link href="/about">
              <a className="hover:text-[#1f2a1f]">About</a>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="tel:+18553148687"
              aria-label="1-855-314-TOUR"
              className="hidden items-center text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] md:inline-flex"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="mr-2 h-3.5 w-3.5 text-[#2f4a2f]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              855-314-TOUR
            </a>
            <Link href="/tours">
              <a className="hidden items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129] sm:inline-flex">
                Find an Adventure
              </a>
            </Link>
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
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
                  <Link href="/tours">
                    <a onClick={closeMobileMenu} className="block font-medium">
                      All Tours
                    </a>
                  </Link>
                  <details className="rounded-xl border border-black/10 bg-white p-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-[#1f2a1f]">
                      Day Tours
                      <span className="text-[#7a8a6b]">▾</span>
                    </summary>
                    <div className="mt-3 space-y-2 pl-3 text-sm">
                      <Link href="/tours/day">
                        <a onClick={closeMobileMenu} className="block">
                          Day Tours Overview
                        </a>
                      </Link>
                      <Link href="/tours/day/cycling">
                        <a onClick={closeMobileMenu} className="block">
                          Cycling
                        </a>
                      </Link>
                      <Link href="/tours/day/hiking">
                        <a onClick={closeMobileMenu} className="block">
                          Hiking
                        </a>
                      </Link>
                      <Link href="/tours/day/paddle">
                        <a onClick={closeMobileMenu} className="block">
                          Paddle Sports
                        </a>
                      </Link>
                    </div>
                  </details>
                  <Link href="/tours/multi-day">
                    <a onClick={closeMobileMenu} className="block font-medium">
                      Multi-Day Adventures
                    </a>
                  </Link>
                </div>
              </details>
              <Link href="/guides">
                <a onClick={closeMobileMenu} className="font-medium text-[#1f2a1f]">
                  Guides
                </a>
              </Link>
              <Link href="/faq">
                <a onClick={closeMobileMenu} className="font-medium text-[#1f2a1f]">
                  FAQs
                </a>
              </Link>
              <Link href="/journeys">
                <a onClick={closeMobileMenu} className="font-medium text-[#1f2a1f]">
                  Journeys
                </a>
              </Link>
              <Link href="/about">
                <a onClick={closeMobileMenu} className="font-medium text-[#1f2a1f]">
                  About
                </a>
              </Link>
              <Link href="/tours">
                <a
                  onClick={closeMobileMenu}
                  className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white"
                >
                  Find an Adventure
                </a>
              </Link>
              <a
                href="tel:18553148687"
                aria-label="Contact us for a Multi-Day Adventure"
                onClick={closeMobileMenu}
                className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 text-left"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-4 w-4 text-[#2f4a2f]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="text-sm font-semibold text-[#1f2a1f]">
                  Contact us for a Multi-Day Adventure
                </span>
              </a>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
