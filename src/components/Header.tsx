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
          <Link href="/destinations">
            <a className="hover:text-[#1f2a1f]">Destinations</a>
          </Link>
          <Link href="/tours">
            <a className="hover:text-[#1f2a1f]">Tours</a>
          </Link>
          <Link href="/tours/cycling">
            <a className="hover:text-[#1f2a1f]">Cycling</a>
          </Link>
          <Link href="/tours/hiking">
            <a className="hover:text-[#1f2a1f]">Hiking</a>
          </Link>
          <Link href="/tours/canoeing">
            <a className="hover:text-[#1f2a1f]">Paddle Sports</a>
          </Link>
          <Link href="/about">
            <a className="hover:text-[#1f2a1f]">About</a>
          </Link>
        </nav>

        <div className="flex flex-col items-end gap-1">
          <Link href="/tours">
            <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294129] transition">
              Find an Adventure
            </a>
          </Link>
          <span className="text-sm font-medium text-[#405040] md:text-base">
            <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#2f4a2f]/10 text-[#2f4a2f]">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.66A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.86.35 1.7.68 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.25a2 2 0 0 1 2.11-.45c.8.33 1.64.56 2.5.68A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <a
              href="tel:+18553148687"
              className="font-semibold text-[#2f4a2f] underline decoration-[#2f4a2f]/70 underline-offset-2 transition hover:text-[#294129]"
            >
              855-314-TOUR
            </a>
          </span>
        </div>
      </div>
    </header>
  );
}
