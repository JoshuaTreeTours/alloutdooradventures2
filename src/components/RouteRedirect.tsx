import { useEffect } from "react";

type RouteRedirectProps = {
  to: string;
};

export default function RouteRedirect({ to }: RouteRedirectProps) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
      <h1 className="text-2xl font-semibold">Redirecting…</h1>
      <p className="mt-4 text-sm text-[#405040]">Taking you to the latest listing URL.</p>
    </main>
  );
}
