Hot Module Replacement (HMR) is the dev-server feature that swaps a changed module into a running page without a full reload, preserving component state. It feels magical when it works and infuriating when it doesn't. Understanding the mechanics — accept boundaries, the update protocol, framework runtimes like React Refresh — is what separates "HMR is broken, I'll just hit reload" from a productive dev loop.

## What a dev server actually does

```text
1. Serve index.html
2. Open a WebSocket to the browser
3. Watch the filesystem for source changes
4. On change:
     a. Recompile the affected module(s)
     b. Send a message over the WS: { type: 'update', modules: [...] }
     c. The HMR runtime in the browser fetches and applies the new module
5. If no module along the dependency chain accepts the update, fall back to full reload
```

The HMR runtime is a small piece of JS the bundler injects into your bundle. It listens on the WebSocket and knows how to swap modules at runtime.

## Accept boundaries

A module *accepts* an HMR update when it tells the runtime "I know how to swap myself or a child without breaking anything":

```js
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // newModule.default is the updated export
    rerender(newModule.default);
  });
}
```

Or self-accept with no callback — meaning "re-execute me on update":

```js
if (import.meta.hot) {
  import.meta.hot.accept();
}
```

When the bundler detects an update, it walks *up* the import graph from the changed module until it finds an accept boundary. Everything from the change to that boundary is re-evaluated. If the walk reaches the root entry without finding one, the page reloads.

Webpack uses `module.hot.accept(...)` (older API); Vite and modern bundlers use `import.meta.hot.accept(...)`.

## React Refresh

You almost never write `accept` calls in a React app — `react-refresh` handles it. The runtime treats every component as an accept boundary and preserves state across updates:

```text
You edit Button.tsx
  -> bundler compiles new Button.tsx
  -> sends update to browser
  -> react-refresh swaps the component
  -> the parent re-renders with the new Button
  -> useState values inside Button are preserved
```

What `react-refresh` preserves:

- `useState` and `useReducer` values stay.
- Refs stay.
- Function components are swapped in place.

What breaks it:

- Editing a non-component export from a component file (`react-refresh` doesn't know how to handle mixed exports — does a full reload).
- Class components in some setups.
- HOCs that wrap on every render.
- Anonymous default exports (`export default () => ...`) — give them a name.

Setup:

- Vite: built-in via `@vitejs/plugin-react`.
- Webpack/Rspack: `@pmmmwh/react-refresh-webpack-plugin` + `react-refresh/babel` (or `swc-loader` with refresh enabled).

## Vue / Svelte / Solid

Each framework ships its own HMR runtime via its plugin (`@vitejs/plugin-vue`, `vite-plugin-svelte`, etc.). The pattern is the same — the plugin defines what counts as a boundary and how to swap.

## The protocol — what flies over the wire

A WebSocket connection from the dev server to the browser, with JSON messages:

```jsonc
// server -> client
{ "type": "update", "updates": [
  { "type": "js-update", "path": "/src/Button.tsx", "timestamp": 17... }
] }

// client fetches the updated module
GET /src/Button.tsx?t=17...

// server returns the new transformed source

// client applies it via dynamic import + accept callback
```

If the recompile fails the server sends `{ type: 'error', err: {...} }` and the client overlays the error.

## Module replacement vs full reload

| Update path | Result |
| --- | --- |
| Component file with React Refresh | swap, state preserved |
| Component file without Refresh | full reload |
| Non-component utility file | walks up, finds first component, swap from there |
| Anything in `node_modules` | full reload (usually) |
| `index.html` | full reload |
| `vite.config.ts` / `webpack.config.js` | dev server restart |
| CSS file | swap (no reload, no state lost) |

## Dev server features beyond HMR

- **Proxy**: forward `/api/*` to a backend during dev:
  ```ts
  server: {
    proxy: { '/api': 'http://localhost:8080' },
  }
  ```
- **HTTPS**: needed for some browser APIs (geolocation, getUserMedia, Service Worker).
- **CORS headers**: dev server usually permissive; production may need configuration.
- **History API fallback**: serve `index.html` for unknown routes (SPA routing).
- **Overlay**: in-browser error display for compile errors.

## Common breakage

| Symptom | Likely cause |
| --- | --- |
| State resets on every save | React Refresh boundary missing (mixed exports in file) |
| Full reload on component edit | Anonymous export, not detected as component |
| "Cannot find module" after save | Stale dev cache (`node_modules/.vite`, kill and restart) |
| HMR works for some files, not others | File extension not handled by a plugin |
| Updates apply but page doesn't change | A stale closure captured the old function — usually a memoization bug exposed by HMR |
| WebSocket connection fails | Reverse proxy stripping `Upgrade` header (configure your dev proxy to forward WS) |
| HMR loops, constantly reloading | Filesystem watcher seeing its own output (build emitting into watched dir) |

## Performance

HMR latency is dominated by:

1. Transpile time of the changed file.
2. Bundler graph update (Rspack and Vite both do this incrementally).
3. WebSocket round-trip (negligible on localhost).
4. Client-side module replacement (also fast).

Rust-based bundlers cut step 1-2 by 5-10x. For a typical TSX file, expect:

- Vite: 30-100 ms HMR update.
- Rspack: 50-150 ms.
- Webpack 5: 200-500 ms.

## Gotchas

- Mixing default and named exports in a component file disables React Refresh for that file. Keep components in their own file with a single default export, or use a tool like `eslint-plugin-react-refresh` to flag it.
- `import.meta.hot.accept()` with no callback re-runs the module — *side effects in the module body* (registering event listeners, setting timers) leak. Clean up with `import.meta.hot.dispose(...)`.
- Editing a context-provider file usually wipes context state for all consumers — annoying but correct, since the provider identity changed.
- Browser extensions can interfere with the HMR overlay or WebSocket; test in incognito if HMR seems broken.
- The dev server is not the production server — auth, routing, headers may all differ. Don't depend on dev-only behavior.
