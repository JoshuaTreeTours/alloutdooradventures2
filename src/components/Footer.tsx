import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-[#2f4a2f] text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 border-b border-white/15 pb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <img
                src="/logo.svg"
                alt="Outdoor Adventures logo"
                className="h-11 w-11"
                loading="lazy"
              />
              <div>
                <p className="text-lg font-semibold">Outdoor Adventures</p>
                <p className="text-sm text-white/85">
                  Curated outdoor experiences around the world.
                </p>
              </div>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Outdoor Adventures, Inc. — Founded in 1999
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 text-sm text-white/85 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Destinations
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/destinations">
                  <a className="transition hover:text-white">United States Tours</a>
                </Link>
              </li>
              <li>
                <Link href="/destinations/world/canada">
                  <a className="transition hover:text-white">Canada Tours</a>
                </Link>
              </li>
              <li>
                <Link href="/united-kingdom">
                  <a className="transition hover:text-white">
                    United Kingdom Tours
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/destinations/europe">
                  <a className="transition hover:text-white">Europe Tours</a>
                </Link>
              </li>
              <li>
                <Link href="/destinations/world/mexico">
                  <a className="transition hover:text-white">Mexico Tours</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Popular States
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/destinations/states/california/tours">
                  <a className="transition hover:text-white">California Tours</a>
                </Link>
              </li>
              <li>
                <Link href="/destinations/states/colorado/tours">
                  <a className="transition hover:text-white">Colorado Tours</a>
                </Link>
              </li>
              <li>
                <Link href="/destinations/states/arizona/tours">
                  <a className="transition hover:text-white">Arizona Tours</a>
                </Link>
              </li>
              <li>
                <Link href="/destinations/states/utah/tours">
                  <a className="transition hover:text-white">Utah Tours</a>
                </Link>
              </li>
              <li>
                <Link href="/destinations/states/oregon/tours">
                  <a className="transition hover:text-white">Oregon Tours</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Top Cities
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/destinations/states/california/cities/joshua-tree/tours">
                  <a className="transition hover:text-white">Joshua Tree Tours</a>
                </Link>
              </li>
              <li>
                <Link href="/destinations/states/california/cities/palm-springs/tours">
                  <a className="transition hover:text-white">Palm Springs Tours</a>
                </Link>
              </li>
              <li>
                <Link href="/destinations/states/arizona/cities/sedona/tours">
                  <a className="transition hover:text-white">Sedona Tours</a>
                </Link>
              </li>
              <li>
                <Link href="/destinations/states/california/cities/santa-barbara/tours">
                  <a className="transition hover:text-white">Santa Barbara Tours</a>
                </Link>
              </li>
              <li>
                <Link href="/destinations/states/colorado/cities/denver/tours">
                  <a className="transition hover:text-white">Denver Tours</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Support &amp; Company
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about">
                  <a className="transition hover:text-white">About</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="transition hover:text-white">Contact</a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="transition hover:text-white">FAQ</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="transition hover:text-white">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="transition hover:text-white">Terms of Use</a>
                </Link>
              </li>
              <li>
                <Link href="/cookies">
                  <a className="transition hover:text-white">Cookie Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/disclosure">
                  <a className="transition hover:text-white">Disclosure</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-6 md:flex md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-base font-semibold text-white">
              Plan something unforgettable.
            </p>
            <p className="text-sm text-white/85">
              Custom journeys, private groups, and multi-day adventures.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2 md:mt-0 md:items-end">
            <Link href="/contact">
              <a className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#2f4a2f]">
                Contact us for a Custom Tour
              </a>
            </Link>
            <a
              href="tel:+18553148687"
              aria-label="Call Outdoor Adventures at 855-314-TOUR"
              className="sr-only text-sm font-semibold text-white md:not-sr-only"
            >
              855-314-TOUR
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
