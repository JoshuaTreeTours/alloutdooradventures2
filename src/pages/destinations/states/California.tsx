import { Link } from "wouter";

export default function California() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section className="rounded-2xl bg-[#f7f3ea] p-10 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2f4a2f]">
          California
        </h1>
        <p className="mt-4 text-sm md:text-base text-[#405040]">Coming soon.</p>
        <Link href="/">
          <a className="mt-6 inline-flex w-fit items-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294129] transition">
            Back to Home
          </a>
        </Link>
      </section>
    </main>
  );
}
