The `exposes` map defines a remote's public API. Each entry maps a *public name* (what consumers import) to an *internal file path* (what the bundler resolves). Treat this map the way you'd treat the `exports` field of a published npm package: stable, intentional, and small.

## Configuring exposes

```cjs
new ModuleFederationPlugin({
  name: 'remote',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/Button',
    './Form':   './src/Form',
    './hooks':  './src/hooks/index.ts',
  },
  shared: { react: { singleton: true } },
});
```

Consumers then write:

```ts
const { Button } = await import('remote/Button');
const { useForm } = await import('remote/hooks');
```

The public name always begins with `./`. The leading dot is required by spec; the rest is yours to pick.

## Naming conventions

| Convention | Looks like | Use when |
| --- | --- | --- |
| Component per entry | `./Button`, `./Modal` | Small, mountable surfaces |
| Feature bundle | `./checkout`, `./search` | A whole feature mounted by route |
| Namespace | `./hooks`, `./utils` | Re-export multiple things from one entry |
| Default mount fn | `./mount` | Framework-agnostic mount point |

Pick one and be consistent. `./Button` and `./button-component` in the same remote is the same kind of papercut as inconsistent npm package names.

## What to expose, what not to

Expose:

- Top-level components or features the host or other remotes need to mount.
- Stable hooks that are part of the contract (auth, analytics, feature flags from a platform remote).
- A `./mount` function for framework-neutral hosts.

Do not expose:

- Internal helpers, leaf components, utilities used only inside the remote.
- Anything whose signature you'd change without thinking.
- A barrel that re-exports everything (`./index`) — defeats tree-shaking and turns every internal refactor into a contract change.

```cjs
// avoid
exposes: { './index': './src/index.ts' }

// prefer
exposes: {
  './Button': './src/Button',
  './Modal':  './src/Modal',
}
```

## Treating exposes as a public API

Each exposed entry has:

- A name (don't rename without a major).
- A default export *or* named exports — don't switch shapes.
- A type signature (see [typescript-types](./typescript-types.md)).
- Side effects on import (ideally none).

Document each one. The cheapest documentation is a `.d.ts` for the entry and a one-line comment on what it does. The next cheapest is a contract test that imports it the way a consumer would.

## Lazy by default

Exposed modules are loaded on `import()`. Don't import them eagerly from the remote's own entry — that pulls them into the remote's main chunk and removes the streaming benefit.

```ts
// good (lazy)
const Button = lazy(() => import('remote/Button'));

// bad (eager, in the remote's own bootstrap)
import { Button } from './Button';
```

## Mount-function pattern

Framework-neutral hosts (or hosts that don't know whether a remote is React, Vue, or web components) often standardize on a mount function instead of a component:

```ts
// in remote/src/mount.ts
export function mount(el: HTMLElement, props: Props) {
  const root = createRoot(el);
  root.render(<App {...props} />);
  return () => root.unmount();
}
```

```cjs
exposes: { './mount': './src/mount.ts' }
```

The host gets a stable `(el, props) => unmount` contract regardless of internals.

## Gotchas

- Renaming an exposed key is a breaking change. Add the new name first, deprecate the old, remove later.
- An expose pointing at a file that imports a remote of its own creates a build-time graph that's fine but a runtime graph that requires both remotes to be reachable on boot. Lazy-load.
- Exposing a default export and later adding named exports is fine; the reverse (default → named) breaks consumers silently.
- An expose can be a JSON file, a CSS module, or any asset the bundler understands — but assets shared across remotes deduplicate poorly. Use `shared` for libraries, not assets.
