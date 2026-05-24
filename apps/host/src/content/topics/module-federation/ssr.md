Module Federation in the browser is well-understood at this point. SSR — rendering federated modules on the server and hydrating them on the client — is where the sharp edges live. The fundamental problem: containers, share scopes, and `window` globals are browser concepts. The server needs an equivalent that does the same negotiation, plus the result of the server render has to *match* what the client will produce when it loads the same remotes.

## What changes on the server

| Concern | Browser | Server |
| --- | --- | --- |
| Container source | `<script src>` | `require`/dynamic `import` from URL or filesystem |
| Share scope | `window.__webpack_share_scopes__` | A module-level singleton in Node |
| Module evaluation | Browser realm | Node realm (different globals) |
| Caching | HTTP/CDN | Process memory + filesystem |
| Lifetime | Per page load | Per worker, across requests |

The plugin has to handle each of these and present an API that lets you say "render this remote on the server" without you re-implementing the runtime.

## The SSR plugin in `@module-federation/enhanced`

The enhanced package ships a Node-side runtime that:

- Loads `remoteEntry.js` over HTTP (or filesystem) into a Node module.
- Maintains a server-side share scope across requests.
- Provides `loadRemote` that works the same as on the client.
- Integrates with the bundler so server bundles know about federated modules.

```ts
// server.ts
import { init, loadRemote } from '@module-federation/enhanced/runtime';
import React from 'react';
import { renderToString } from 'react-dom/server';

init({
  name: 'host-ssr',
  remotes: [{ name: 'remote', entry: 'http://localhost:3001/remoteEntry.js' }],
  shared: { react: { version: '19.0.0', shareConfig: { singleton: true } } },
});

app.get('/page', async (req, res) => {
  const { Button } = await loadRemote<{ Button: React.ComponentType }>('remote/Button');
  const html = renderToString(<Button label="hi" />);
  res.send(template(html));
});
```

## Hydration matching

The server rendered some HTML using `remote/Button@2.3.0`. The browser will hydrate with whatever `remote/Button` currently resolves to — possibly a newer build. Mismatches cause hydration warnings or, worse, broken interactivity.

Strategies:

- **Pin versions per request**: the server records the exact remoteEntry URL it used (with hash), passes it to the client in a `<script id="__MF__">` payload, and the client loads *that* URL even if a newer one exists. Reliable, costs you the freshness of late-bound updates.
- **Atomic deploys**: both server and CDN flip to the new remote at the same instant. Cheaper for low-traffic, fragile at scale.
- **Re-render on mismatch**: detect the version skew on the client and re-render the federated subtree. Avoids hydration but loses interactivity briefly.

## Shared state hazards

Server runtime is shared across requests. A federated module that caches data at module scope leaks across users. Two rules:

- Treat module-level mutable state as a bug in any module that may be loaded on the server.
- Singletons (React, store, theme) are fine because they're stateless or per-render.

The enhanced runtime resets its own caches per request when configured for SSR; *your* code is your responsibility.

## Streaming SSR

React 18+ streaming (`renderToPipeableStream`) interacts with federation in two ways:

- A remote whose chunks aren't loaded yet causes a Suspense boundary to stay in the fallback until the chunk arrives. With federation, that chunk may need a network fetch from the remote's origin even *server-side*. Pre-warm remotes you know you'll need.
- The streamed HTML can include `<script>` tags that pre-load remoteEntry on the client so hydration doesn't wait. The enhanced SSR plugin can inject these for you.

## Edge SSR

Workers (Cloudflare, Vercel Edge) have limited Node compat. Module Federation on the edge works if:

- The remote ships an ESM build (no `require`).
- The runtime uses `import()` not `eval` for module loading.
- No `vm.runInNewContext` in the loader path.

The enhanced runtime has an ESM-friendly mode that meets these. Older Webpack 5 federation does not.

## Per-request isolation pattern

```ts
app.get('*', async (req, res) => {
  const requestScope = createSharedScope(); // per-request scope
  await initSharedScope(requestScope);
  const mod = await loadRemoteInScope('remote/App', requestScope);
  res.send(renderToString(<mod.App />));
});
```

This pattern (newer enhanced API) trades memory for safety: a per-request scope means no cross-request state leaks. Use it when remotes are not under your control.

## Gotchas

- "Works in dev, breaks in prod" usually means dev is doing client-only rendering and prod is doing SSR with a different code path. Test SSR locally.
- React 19 hydration is stricter about HTML mismatches. Hydration warnings that you ignored in 18 become broken UIs in 19.
- A remote built without the SSR plugin won't work on the server even if your host has the plugin — the remote's emitted code might use browser-only globals.
- CSS-in-JS engines that rely on `document` (some Emotion configs) need either a server-aware setup or `@emotion/server` to extract styles before flushing.
- Per-request `loadRemote` calls without caching will hammer the remote's origin. Cache the *factory*, not the rendered output.
- CDN caching at the edge for the *server-rendered* HTML must invalidate when the remote URL changes, or you ship hydration mismatches for cached responses.
