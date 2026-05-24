Module Federation defines two roles per build: a *host* loads federated modules at runtime, and a *remote* exposes modules to be loaded. These are configuration roles, not architectural ones — a single build can be both, and in non-trivial setups usually is.

## The two roles

- **Host**: declares `remotes` it intends to consume. At runtime it fetches each remote's `remoteEntry.js`, initializes a shared scope, then `import('remote/Module')` resolves through that container.
- **Remote**: declares `exposes` mapping public names to internal modules, and emits a `remoteEntry.js` (the *container*) that lists those exposes plus its shared deps.

Both roles use the same `ModuleFederationPlugin`. The only difference is which fields are populated.

```cjs
// remote rspack config
new ModuleFederationPlugin({
  name: 'remote',
  filename: 'remoteEntry.js',
  exposes: { './Button': './src/Button' },
  shared: { react: { singleton: true } },
});

// host rspack config
new ModuleFederationPlugin({
  name: 'host',
  remotes: { remote: 'remote@http://localhost:3001/remoteEntry.js' },
  shared: { react: { singleton: true } },
});
```

## Bidirectional federation

Nothing prevents both sides from setting *both* `exposes` and `remotes`. A "checkout" build can expose `./MiniCart` for the shell to mount in the header *and* consume `./PriceTag` from the catalog remote.

```cjs
new ModuleFederationPlugin({
  name: 'checkout',
  filename: 'remoteEntry.js',
  exposes: { './MiniCart': './src/MiniCart' },
  remotes: { catalog: 'catalog@/catalog/remoteEntry.js' },
  shared: { react: { singleton: true } },
});
```

This is powerful and it is a trap. The dependency graph between builds is no longer a tree — it's a directed graph that can develop cycles. Cycles aren't fatal (the runtime resolves them lazily) but they make reasoning about deploys harder: if A depends on B's exposed module and B depends on A's, neither team can break the other's contract without coordinating.

## The shell pattern

The most maintainable topology is a strict tree with one host (the *shell*) at the root:

```
shell (host only)
 ├── header  (remote)
 ├── catalog (remote, may consume design-system)
 ├── checkout (remote, may consume design-system)
 └── design-system (remote only)
```

Why it works:

- One deployable owns routing, layout, auth, analytics.
- Remotes are leaves: they expose mount points, they don't import each other.
- A shared `design-system` remote is the one allowed exception — it's a remote-only leaf consumed by siblings, never the other way around.

When teams ask to "just consume each other's components," push back. That's how you end up with the cyclic graph and synchronized deploys you were trying to avoid.

## What the host owns

- The HTML document and `<head>` (CSP, fonts, analytics).
- Routing and history.
- Auth, session, user identity.
- Top-level error boundaries.
- The list of remotes and their URLs (build-time, env-time, or runtime).

## What a remote owns

- Its exposed components and their behavior.
- Its own dev server and tests.
- Its build pipeline and deploy cadence.
- The contract for each exposed module.

## Gotchas

- A remote that *also* runs standalone (its own `index.html`) needs to declare hosts' shared deps with sensible fallbacks — otherwise it can't dev in isolation.
- "Host" and "remote" are per-build labels, not per-team. One team can own several remotes plus the shell.
- Don't let remotes mutate global state (history, document title, body classes) without coordinating with the shell. That's a shell responsibility.
