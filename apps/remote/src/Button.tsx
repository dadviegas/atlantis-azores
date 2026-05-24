import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, LeafyGreenProvider } from "@atlantis/design-system/atlas";

function FederatedButton({ label }: { label: string }) {
  const [clicked, setClicked] = useState(false);
  return (
    <Button variant="primary" onClick={() => setClicked(true)}>
      {clicked ? `${label} (clicked)` : label}
    </Button>
  );
}

export function mountButton(target: HTMLElement, label = "Remote button"): void {
  createRoot(target).render(
    <StrictMode>
      <LeafyGreenProvider>
        <FederatedButton label={label} />
      </LeafyGreenProvider>
    </StrictMode>,
  );
}
