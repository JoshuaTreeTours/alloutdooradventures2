import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "wouter";

import {
  getSiteStructuredDataNodes,
  normalizeStructuredData,
} from "../utils/structuredData";

type StructuredDataNode = Record<string, unknown>;

type StructuredDataContextValue = {
  setNodes: (nodes: StructuredDataNode[] | null) => void;
};

const StructuredDataContext =
  createContext<StructuredDataContextValue | null>(null);

const StructuredDataScript = ({
  nodes,
}: {
  nodes: StructuredDataNode[] | null;
}) => {
  const graph = useMemo(() => {
    const baseNodes = getSiteStructuredDataNodes();
    const extraNodes = nodes?.length ? nodes : [];
    return {
      "@context": "https://schema.org",
      "@graph": [...baseNodes, ...extraNodes],
    };
  }, [nodes]);

  const normalized = useMemo(() => normalizeStructuredData(graph), [graph]);

  if (!normalized) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(normalized) }}
    />
  );
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

  return (
    <StructuredDataContext.Provider value={{ setNodes }}>
      {children}
      <StructuredDataScript nodes={nodes} />
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
