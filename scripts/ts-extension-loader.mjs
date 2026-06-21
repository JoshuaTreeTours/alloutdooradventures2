import { pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  const candidates = [];

  if (specifier.endsWith(".js")) {
    candidates.push(specifier.replace(/\.js(?=$|\?)/, ".ts"));
  } else if (!specifier.includes(".") || !/\.[a-z]+$/i.test(specifier.split("/").at(-1) ?? "")) {
    candidates.push(`${specifier}.ts`);
  }

  for (const candidate of candidates) {
    try {
      return await nextResolve(candidate, context);
    } catch {
      // Try the next candidate.
    }
  }

  return nextResolve(specifier, context);
}
