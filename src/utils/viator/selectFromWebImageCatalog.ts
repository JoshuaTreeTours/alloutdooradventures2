import catalogRaw from "../../../data/viatorWebImageCatalog.json";

type CatalogRule = {
  match: {
    titleIncludesAny?: string[];
    titleIncludesAll?: string[];
    operatorIncludesAny?: string[];
  };
  images: {
    hero: string;
    bottom?: string;
  };
};

const catalog = catalogRaw as CatalogRule[];

const includesAny = (hay: string, needles?: string[]) =>
  !needles?.length || needles.some(value => hay.includes(value.toLowerCase()));

const includesAll = (hay: string, needles?: string[]) =>
  !needles?.length || needles.every(value => hay.includes(value.toLowerCase()));

export function selectFromWebImageCatalog(input: {
  title: string;
  operatorName?: string;
}): { hero: string; bottom?: string } | undefined {
  const title = input.title.toLowerCase();
  const operator = (input.operatorName ?? "").toLowerCase();

  for (const rule of catalog) {
    const matchesTitleAny = includesAny(title, rule.match.titleIncludesAny);
    const matchesTitleAll = includesAll(title, rule.match.titleIncludesAll);
    const matchesOperatorAny =
      !rule.match.operatorIncludesAny?.length ||
      (operator ? includesAny(operator, rule.match.operatorIncludesAny) : true);

    if (matchesTitleAny && matchesTitleAll && matchesOperatorAny) {
      return rule.images;
    }
  }

  return undefined;
}
