export default function Cookies() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-[#1f2a1f]">
      <p className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
        Cookie Policy
      </p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
        Cookies &amp; Tracking Technologies
      </h1>
      <p className="mt-4 text-sm text-[#405040] md:text-base">
        Cookies help us keep the site running smoothly and understand what
        travelers care about most. We keep this simple and privacy-first.
      </p>

      <section className="mt-10 space-y-6 text-sm text-[#405040] md:text-base">
        <div>
          <h2 className="text-lg font-semibold text-[#2f4a2f]">
            Essential cookies
          </h2>
          <p className="mt-2">
            These cookies remember your preferences and help core features work
            properly. Without them, some experiences may not load correctly.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#2f4a2f]">
            Analytics cookies
          </h2>
          <p className="mt-2">
            We use analytics to see which destinations, guides, and tours are
            most helpful. This data is aggregated and helps us improve content
            and navigation.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#2f4a2f]">
            Managing cookies
          </h2>
          <p className="mt-2">
            You can disable cookies in your browser settings. Doing so may limit
            some personalization or saved preferences, but you can continue to
            browse the site.
          </p>
        </div>
      </section>
    </main>
  );
}
