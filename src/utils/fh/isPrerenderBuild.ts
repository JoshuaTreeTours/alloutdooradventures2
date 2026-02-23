export const isPrerenderBuild = (): boolean =>
  process.env.VERCEL === "1" ||
  process.env.CI === "true" ||
  process.env.PRERENDER === "1";

