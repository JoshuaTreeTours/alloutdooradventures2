import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { StructuredDataProvider } from "./components/StructuredDataProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StructuredDataProvider>
      <App />
    </StructuredDataProvider>
  </React.StrictMode>
);
