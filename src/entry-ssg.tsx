import React from "react";
import { ViteSSG } from "vite-ssg";
import { Router } from "wouter";

import App from "./App";
import { StructuredDataProvider } from "./components/StructuredDataProvider";

const SsgRoot = () => (
  <Router ssrPath={typeof window === "undefined" ? "/" : undefined}>
    <StructuredDataProvider>
      <App />
    </StructuredDataProvider>
  </Router>
);

export const createApp = ViteSSG(SsgRoot);
