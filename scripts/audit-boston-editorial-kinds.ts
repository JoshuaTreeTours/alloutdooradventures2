import { classifyEngine6EditorialActivityKind } from "../src/engine6/buildEngine6PremiumEditorialDescription";
import { resolveEngine6GovernedProductDescription } from "../src/engine6/governedEditorialDescriptions";
import { engine6ResolvedTours } from "../src/engine6/registry";
import { BOSTON_VIATOR_PUBLIC_PRODUCT_CODES } from "../src/engine6/bostonViatorPublicRatings";

for (const productCode of BOSTON_VIATOR_PUBLIC_PRODUCT_CODES) {
  const tour = engine6ResolvedTours.find(entry => entry.productCode === productCode);
  if (!tour) {
    console.log(productCode, "MISSING");
    continue;
  }

  const kind = classifyEngine6EditorialActivityKind({
    title: tour.title,
    city: tour.city,
    categoryLabel: tour.categoryLabel,
    overviewText: tour.overviewText ?? tour.description ?? "",
  });
  const governed = resolveEngine6GovernedProductDescription(tour);
  const bad =
    /vineyard|winery|valley cellars|NYC landmarks|panoramic bus route that pairs/i.test(
      governed
    );
  console.log(
    `${productCode}\t${kind}\t${tour.categoryLabel}\t${bad ? "BAD" : "ok"}\t${governed.slice(0, 80)}`
  );
}
