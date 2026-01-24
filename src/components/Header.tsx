import { Link } from "wouter";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#f6f1e8]/95 backdrop-blur border-b border-black/10">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
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
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]">
                    Day Tours
                  </p>
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
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]">
                    Multi-Day Adventures
                  </p>
                  <div className="mt-2">
                    <Link href="/tours/multi-day">
                      <a className="block hover:text-[#1f2a1f]">
                        Explore multi-day
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Link href="/guides">
            <a className="hover:text-[#1f2a1f]">Guides</a>
          </Link>
          <Link href="/faq">
            <a className="hover:text-[#1f2a1f]">FAQ</a>
          </Link>
          <Link href="/journeys">
            <a className="hover:text-[#1f2a1f]">Journeys</a>
          </Link>
          <Link href="/about">
            <a className="hover:text-[#1f2a1f]">About</a>
          </Link>
        </nav>

        <Link href="/tours">
          <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294129] transition">
            Find an Adventure
          </a>
        </Link>
      </div>
    </header>
  );
}
