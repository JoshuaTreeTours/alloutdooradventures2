import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";

import {
  buildWebPageStructuredData,
  getSiteStructuredDataNodes,
  normalizeStructuredData,
  sanitizeSchemaName,
} from "../utils/structuredData";
import { buildCanonicalUrl, DEFAULT_SEO } from "../utils/seo";

type StructuredDataNode = Record<string, unknown>;

type StructuredDataContextValue = {
  setNodes: (nodes: StructuredDataNode[] | null) => void;
};

const StructuredDataContext =
  createContext<StructuredDataContextValue | null>(null);

const SCRIPT_ID = "structured-data";

const hasNodeType = (nodes: StructuredDataNode[] | null, type: string) =>
  Boolean(
    Array.isArray(nodes) && nodes.some((node) => {
      if (!node || typeof node !== "object") {
        return false;
      }
      const nodeType = (node as { "@type"?: string | string[] })["@type"];
      if (Array.isArray(nodeType)) {
        return nodeType.includes(type);
      }
      return nodeType === type;
    }),
  );


const dedupeGraphNodesById = (nodes: StructuredDataNode[]) => {
  const byId = new Map<string, StructuredDataNode>();
  const withoutId: StructuredDataNode[] = [];

  nodes.forEach(node => {
    const nodeId =
      typeof node?.["@id"] === "string" ? (node["@id"] as string) : null;

    if (!nodeId) {
      withoutId.push(node);
      return;
    }

    const existing = byId.get(nodeId);
    if (!existing) {
      byId.set(nodeId, node);
      return;
    }

    const mergedSameAs = Array.from(
      new Set([
        ...((Array.isArray(existing.sameAs) ? existing.sameAs : []) as string[]),
        ...((Array.isArray(node.sameAs) ? node.sameAs : []) as string[]),
      ]),
    );

    byId.set(nodeId, {
      ...existing,
      ...node,
      ...(mergedSameAs.length ? { sameAs: mergedSameAs } : {}),
    });
  });

  return [...byId.values(), ...withoutId];
};

const upsertStructuredDataScript = (json: StructuredDataNode | null) => {
  let script = document.head.querySelector<HTMLScriptElement>(
    `script#${SCRIPT_ID}`,
  );

  if (!json) {
    if (script) {
      script.remove();
    }
    return;
  }

  if (!script) {
    script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  script.text = JSON.stringify(json);
};

export const StructuredDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [nodes, setNodes] = useState<StructuredDataNode[] | null>(null);
  const [location] = useLocation();

  useEffect(() => {
    const baseNodes = getSiteStructuredDataNodes();
    const pageNodes = nodes?.length ? nodes : [];
    const canonicalUrl =
      document.head
        .querySelector<HTMLLinkElement>("link[rel=\"canonical\"]")
        ?.getAttribute("href") ?? buildCanonicalUrl(location ?? "/");
    const description =
      document.head
        .querySelector<HTMLMetaElement>("meta[name=\"description\"]")
        ?.getAttribute("content") ?? DEFAULT_SEO.description;
    const title = sanitizeSchemaName(document.title || DEFAULT_SEO.title);

    const defaultWebPageNode = hasNodeType(nodes, "WebPage")
      ? []
      : [
          buildWebPageStructuredData({
            url: canonicalUrl,
            name: title,
            description,
          }),
        ];

    const mergedNodes = dedupeGraphNodesById([
      ...baseNodes,
      ...pageNodes,
      ...defaultWebPageNode,
    ]);

    const graph = {
      "@context": "https://schema.org",
      "@graph": mergedNodes,
    };

    const normalized = normalizeStructuredData(graph);
    upsertStructuredDataScript(
      normalized ? (normalized as StructuredDataNode) : null,
    );
  }, [location, nodes]);

  return (
    <StructuredDataContext.Provider value={{ setNodes }}>
      {children}
    </StructuredDataContext.Provider>
  );
};

export const useStructuredData = (nodes: StructuredDataNode[] | null) => {
  const context = useContext(StructuredDataContext);

  useEffect(() => {
    if (!context) {
      return;
    }
    context.setNodes(nodes);

    return () => {
      context.setNodes(null);
    };
  }, [context, nodes]);
};
