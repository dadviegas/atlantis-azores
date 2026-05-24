This monorepo is a minimal but realistic Module Federation setup using pnpm workspaces and Rspack. The host runs on port 3000, the remote on port 3001, and the only thing federated across the boundary is a single mount function for a button. The whole wiring fits on one screen — the value is in seeing how the pieces connect.

## Repo layout

```
atlantis-azores/
├── apps/
│   ├── host/        # shell, port 3000, consumes remote
│   └── remote/      # micro-frontend, port 3001, exposes ./Button
├── packages/
│   └── design-system/   # shared, treated as a singleton
├── rspack.shared.cjs    # shared Rspack/MF config factory
└── pnpm-workspace.yaml
```

`pnpm dev` runs both apps in parallel; `pnpm build` builds the remote first, then the host.

## The shared config factory

Both apps build their Rspack config through one factory in `rspack.shared.cjs`. This is where federation, shared deps, and dev-server defaults live.

```cjs
// rspack.shared.cjs (essentials)
const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack');

function sharedDeps() {
  return {
    react: { singleton: true, requiredVersion: '^18.3.1' },
    'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
    '@atlantis/design-system': { singleton: true },
  };
}

function createConfig({ appDir, name, port, federation, devServer = {} }) {
  return {
    // ...entry, output, loaders elided...
    plugins: [
      new ModuleFederationPlugin({ name, shared: sharedDeps(), ...federation }),
      new rspack.HtmlRspackPlugin({ template: './public/index.html' }),
    ],
  };
}
```

Three singletons: React, React-DOM, and the design system. Each is critical state. React singleton prevents Invalid Hook errors. The design system singleton prevents two copies of Emotion's style cache and the LeafyGreen context provider from disagreeing on theme.

## The host config

```cjs
// apps/host/rspack.config.cjs
module.exports = createConfig({
  appDir: __dirname,
  name: 'host',
  port: 3000,
  federation: {
    remotes: {
      remote: 'remote@http://localhost:3001/remoteEntry.js',
    },
  },
});
```

The host declares one remote (`remote`) pointing at the dev server URL. In production this URL becomes a CDN URL, but the local alias `remote` stays the same so the import sites don't change.

## The remote config

```cjs
// apps/remote/rspack.config.cjs
module.exports = createConfig({
  appDir: __dirname,
  name: 'remote',
  port: 3001,
  federation: {
    filename: 'remoteEntry.js',
    exposes: { './Button': './src/Button.tsx' },
  },
  devServer: {
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
});
```

Three things to notice:

1. `filename: 'remoteEntry.js'` — the file the host fetches at runtime.
2. `exposes` maps the public name `./Button` to the local file.
3. CORS is wide open in dev so the host (on a different port) can fetch the entry.

## The mountButton pattern

The remote exposes a *mount function*, not a React component. The host calls it with a DOM node and the remote takes care of rendering inside.

```ts
// apps/remote/src/Button.tsx
import { StrictMode, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Button, LeafyGreenProvider } from '@atlantis/design-system/atlas';

function FederatedButton({ label }: { label: string }) {
  const [clicked, setClicked] = useState(false);
  return (
    <Button variant="primary" onClick={() => setClicked(true)}>
      {clicked ? `${label} (clicked)` : label}
    </Button>
  );
}

const roots = new WeakMap<HTMLElement, Root>();

export function mountButton(target: HTMLElement, label = 'Remote button'): void {
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
```

Why a mount function instead of `export default FederatedButton`:

- The remote owns its render tree, including its design-system provider. The host doesn't need to know about LeafyGreen.
- A `WeakMap<HTMLElement, Root>` caches roots so the host can call `mountButton` repeatedly without leaking.
- The contract (`(target, label) => void`) is framework-agnostic — if the host is later not React, the same function works.

## Types: `remote.d.ts`

Because this repo doesn't use the `@mf-types` auto-generation pipeline, the host hand-declares the contract.

```ts
// apps/host/src/remote.d.ts
declare module 'remote/Button' {
  export function mountButton(target: HTMLElement, label?: string): void;
}
```

That's the entire surface the host knows about. Add a new expose, declare another module here. If the remote's `mountButton` signature changes, the host's TypeScript will not notice — that's the price of hand-written declarations. For a single-export remote with one consumer it's acceptable; on a bigger surface, switch to generated `@mf-types`.

## The bootstrap pattern

```ts
// apps/host/src/index.ts
import('./bootstrap');
```

```tsx
// apps/host/src/bootstrap.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LeafyGreenProvider } from '@atlantis/design-system/atlas';
import { Dashboard } from './Dashboard';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <LeafyGreenProvider>
        <Dashboard />
      </LeafyGreenProvider>
    </StrictMode>,
  );
}
```

The `import('./bootstrap')` indirection is required: it puts the host's actual code in an async chunk, giving the federation runtime room to initialize the share scope before any federated module loads. Without it, the host's React would load before the share scope is ready and the remote would end up with its own copy.

## Calling the federated mount

A component in the host renders an element and calls `mountButton` from the remote on it:

```tsx
import { useEffect, useRef } from 'react';
import { mountButton } from 'remote/Button';

export function RemoteButtonSlot() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) mountButton(ref.current, 'Hello from host');
  }, []);
  return <div ref={ref} />;
}
```

When the host renders `RemoteButtonSlot`:

1. The bundler-generated code requests `http://localhost:3001/remoteEntry.js`.
2. The remote container registers on `window.remote`.
3. The share scope (`default`) is initialized; React/React-DOM/design-system versions are negotiated.
4. `container.get('./Button')` returns a factory.
5. The factory loads the chunk for `Button.tsx`.
6. `mountButton` becomes available and the effect calls it.

## What's not here yet (and where it'd go)

- **Error boundary around the mount** — see [error-boundaries](./error-boundaries.md). Worth adding before this remote does anything more critical than render a demo button.
- **`@mf-types` generation** — see [typescript-types](./typescript-types.md). The hand-written `remote.d.ts` works for one export, doesn't scale to a real surface.
- **Production URL strategy** — currently hard-coded to localhost. In a real deploy this becomes a CDN URL or a manifest lookup. See [production-considerations](./production-considerations.md).
- **A dynamic remote example** — `registerRemotes` from `@module-federation/enhanced/runtime` for cases where the URL isn't known at build. See [dynamic-remotes](./dynamic-remotes.md).

## Try it

```bash
pnpm install
pnpm dev
# open http://localhost:3000 — the button rendered by the host is loaded from the remote at runtime.
# stop the remote (Ctrl-C the port-3001 process) and reload — observe what happens.
```

Stopping the remote and reloading is the cheapest demo of why error boundaries matter.
