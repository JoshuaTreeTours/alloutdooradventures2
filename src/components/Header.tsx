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
            <Link href="/faqs">
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
              <Link href="/faqs">
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
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
