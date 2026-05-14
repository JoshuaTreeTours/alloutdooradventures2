import Seo from "../components/Seo";

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page not found | Outdoor Adventures, Inc."
        description="The page you requested could not be found."
        robots="noindex,nofollow"
        googlebot="noindex,nofollow"
      />
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-4 text-sm text-[#405040]">
          The page you requested could not be found.
        </p>
      </main>
    </>
  );
}
