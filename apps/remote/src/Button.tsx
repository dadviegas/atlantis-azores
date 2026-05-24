import { StrictMode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Button, LeafyGreenProvider } from "@atlantis/design-system/atlas";

function FederatedButton({ label }: { label: string }) {
  const [clicked, setClicked] = useState(false);
  return (
    <Button variant="primary" onClick={() => setClicked(true)}>
      {clicked ? `${label} (clicked)` : label}
    </Button>
  );
}

const roots = new WeakMap<HTMLElement, Root>();

export function mountButton(target: HTMLElement, label = "Remote button"): void {
  let root = roots.get(target);
  if (!root) {
    root = createRoot(target);
    roots.set(target, root);
  }
  root.render(
    <StrictMode>
      <LeafyGreenProvider>
        <FederatedButton label={label} />
      </LeafyGreenProvider>
    </StrictMode>,
  );
}
