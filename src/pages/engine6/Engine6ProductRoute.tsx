import Engine6TourPage from "../../engine6/components/Engine6TourPage";
import { getBundledEngine6Tour } from "../../engine6/bundledProducts";

export default function Engine6ProductRoute({
  productCode,
}: {
  productCode: string;
}) {
  const tour = getBundledEngine6Tour(productCode);

  if (!tour) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-950">
          <h1 className="text-2xl font-semibold">
            Engine6 product unavailable
          </h1>
          <p className="mt-3 text-sm leading-6">
            No bundled Engine6 source was found for product code {productCode}.
          </p>
        </div>
      </main>
    );
  }

  return <Engine6TourPage tour={tour} />;
}
