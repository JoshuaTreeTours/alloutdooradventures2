type StructuredDataNode = Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const toNodeArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [] as StructuredDataNode[];
  }

  return value.filter((item): item is StructuredDataNode => isRecord(item));
};

const mergeArrays = (left: unknown[], right: unknown[]) => {
  const merged = [...left];

  for (const item of right) {
    const serialized = JSON.stringify(item);
    if (!merged.some(existing => JSON.stringify(existing) === serialized)) {
      merged.push(item);
    }
  }

  return merged;
};

const mergeNodes = (
  first: StructuredDataNode,
  second: StructuredDataNode
): StructuredDataNode => {
  const merged: StructuredDataNode = { ...first };

  for (const [key, incomingValue] of Object.entries(second)) {
    const currentValue = merged[key];

    if (Array.isArray(currentValue) && Array.isArray(incomingValue)) {
      merged[key] = mergeArrays(currentValue, incomingValue);
      continue;
    }

    if (isRecord(currentValue) && isRecord(incomingValue)) {
      merged[key] = mergeNodes(currentValue, incomingValue);
      continue;
    }

    if (currentValue === undefined || currentValue === null || currentValue === "") {
      merged[key] = incomingValue;
      continue;
    }

    if (isRecord(currentValue) && !isRecord(incomingValue)) {
      continue;
    }

    if (Array.isArray(currentValue) && !Array.isArray(incomingValue)) {
      continue;
    }

    if (!Array.isArray(currentValue) && Array.isArray(incomingValue)) {
      merged[key] = incomingValue;
    }
  }

  return merged;
};

const nodeCompleteness = (node: StructuredDataNode) =>
  Object.values(node).filter(value => value !== undefined && value !== null).length;

export const dedupeStructuredData = (nodes: StructuredDataNode[]) => {
  const dedupedById = new Map<string, StructuredDataNode>();
  const passthrough: StructuredDataNode[] = [];

  for (const node of toNodeArray(nodes)) {
    const id = typeof node["@id"] === "string" ? node["@id"] : null;

    if (!id) {
      passthrough.push(node);
      continue;
    }

    const existing = dedupedById.get(id);
    if (!existing) {
      dedupedById.set(id, node);
      continue;
    }

    const merged = mergeNodes(existing, node);
    dedupedById.set(
      id,
      nodeCompleteness(merged) >= nodeCompleteness(existing) ? merged : existing
    );
  }

  return [...Array.from(dedupedById.values()), ...passthrough];
};
