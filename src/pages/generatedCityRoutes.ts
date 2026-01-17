import type { ComponentType } from "react";

type CityRoute = {
  path: string;
  component: ComponentType;
};

type CityRoutesModule = {
  cityTourRoutes?: CityRoute[];
};

const modules = import.meta.glob("./**/cityTourRoutes.tsx", {
  eager: true,
}) as Record<string, CityRoutesModule>;

export const generatedCityRoutes = Object.values(modules).flatMap(
  (module) => module.cityTourRoutes ?? [],
);
