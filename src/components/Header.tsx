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

        <Link href="/tours">
          <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294129] transition">
            Find an Adventure
          </a>
        </Link>
      </div>
    </header>
  );
}
