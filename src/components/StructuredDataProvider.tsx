import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";

import {
  hasStructuredDataType,
} from "../utils/structuredData";
import { buildSchemaGraph, getDocumentSeoMetadata } from "../utils/schemaBuilders";

type StructuredDataNode = Record<string, unknown>;

type StructuredDataContextValue = {
  setNodes: (nodes: StructuredDataNode[] | null) => void;
};

const StructuredDataContext =
  createContext<StructuredDataContextValue | null>(null);

const SCRIPT_ID = "structured-data";

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
    setNodes(null);
  }, [location]);

  useEffect(() => {
    const seo = getDocumentSeoMetadata({
      locationPathname: location ?? "/",
    });
    const includeWebPage = !hasStructuredDataType(nodes, "WebPage");
    const normalized = buildSchemaGraph({
      seo,
      nodes,
      includeWebPage,
    });
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
