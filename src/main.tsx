import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { StructuredDataProvider } from "./components/StructuredDataProvider";

const root = document.getElementById("root")!;
const app = (
  <React.StrictMode>
    <StructuredDataProvider>
      <App />
    </StructuredDataProvider>
  </React.StrictMode>
);

if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root, app);
} else {
  ReactDOM.createRoot(root).render(app);
}
