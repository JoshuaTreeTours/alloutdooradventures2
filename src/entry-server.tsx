import React from "react";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";

import App from "./App";
import { createSeoCollector, SeoProvider } from "./components/SeoContext";

const createStaticLocationHook = (path: string) => () => [path, () => {}] as const;

export const renderApp = (path: string) => {
  const seoCollector = createSeoCollector(path);
  const appHtml = renderToString(
    <React.StrictMode>
      <SeoProvider value={seoCollector}>
        <Router hook={createStaticLocationHook(path)}>
          <App />
        </Router>
      </SeoProvider>
    </React.StrictMode>
  );

  return {
    appHtml,
    seo: seoCollector.get(),
  };
};
