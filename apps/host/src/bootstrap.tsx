import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LeafyGreenProvider } from "@atlantis/design-system/atlas";
import "@atlantis/design-system/styles/tokens.css";
import "@atlantis/design-system/styles/components.css";
import { Dashboard } from "./Dashboard";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <LeafyGreenProvider>
        <Dashboard />
      </LeafyGreenProvider>
    </StrictMode>,
  );
}
