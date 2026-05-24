Code splitting is the practice of producing multiple smaller bundles instead of one big one, so the browser downloads only what it needs for the current view. Done well, it shrinks initial JS payload and parallelizes downloads. Done poorly, it produces a hundred tiny chunks and worse performance than a single bundle. The mental model: every `import()` call is a split point; everything statically imported from your entry is in the initial bundle.

## Static vs dynamic

```js
// static — included in the parent chunk
import { Heavy } from './Heavy';

// dynamic — bundler creates a new chunk
const Heavy = lazy(() => import('./Heavy'));
```

Static `import` is resolved at build time. Dynamic `import()` returns a Promise and tells the bundler "put this module and its dependencies in a separate file that loads on demand".

## Route-based splitting

The most common and highest-value split. Each route gets its own chunk:

```ts
import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/settings" element={<Settings />} />
</Routes>
```

Most meta-frameworks (Next.js, Remix, SvelteKit) do route splits automatically — you get one chunk per route file.

## Component-level splitting

Below the route, split anything that's heavy and not always shown:

- Modals, dialogs, drawers.
- Rich-text editors (TinyMCE, Lexical, ProseMirror).
- Charting libraries (Chart.js, ECharts, Recharts).
- Code editors (Monaco, CodeMirror).
- Markdown renderers with syntax highlighters.

```tsx
const Editor = lazy(() => import('./Editor'));

{showEditor && <Suspense fallback={<Spinner />}><Editor /></Suspense>}
```

## splitChunks (Webpack/Rspack)

The bundler also splits chunks automatically based on cache groups. The default config:

```js
optimization: {
  splitChunks: {
    chunks: 'all',
    minSize: 20_000,
    cacheGroups: {
      defaultVendors: {
        test: /[\\/]node_modules[\\/]/,
        priority: -10,
      },
    },
  },
}
```

This extracts `node_modules` into a `vendors` chunk shared across entries. Common tweaks:

```js
cacheGroups: {
  react: {
    test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
    name: 'react',
    priority: 20,
  },
  ui: {
    test: /[\\/]packages[\\/]design-system[\\/]/,
    name: 'ui',
    priority: 15,
  },
}
```

Separating React into its own chunk keeps it cacheable across deploys when only app code changes.

## manualChunks (Rollup/Vite)

Rollup's equivalent. Takes a function or an object:

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        react: ['react', 'react-dom'],
        charts: ['recharts', 'd3-scale'],
      },
    },
  },
}
```

Or function form for finer control:

```ts
manualChunks(id) {
  if (id.includes('node_modules/react')) return 'react';
  if (id.includes('node_modules')) return 'vendor';
}
```

## Magic comments (Webpack/Rspack)

Webpack/Rspack accept comments inside `import()` to control chunk names and behavior:

```js
import(/* webpackChunkName: "editor" */ './Editor');
import(/* webpackPrefetch: true */ './SettingsPage');
import(/* webpackPreload: true */ './CriticalLater');
```

- `prefetch` — browser fetches the chunk during idle time, after the page is interactive.
- `preload` — fetched in parallel with the parent chunk, higher priority.

Use prefetch for "likely next" routes; preload sparingly, only when you know the chunk is needed for the current view.

## Common anti-patterns

| Anti-pattern | Why it hurts |
| --- | --- |
| Splitting every component | HTTP overhead and waterfall dominate the win |
| Splitting tiny libraries (<10 KB) | Network round-trip costs more than the bytes saved |
| Dynamic-importing something already statically imported elsewhere | The bundler ends up duplicating it; you get no split |
| Splitting React into its own chunk on a static site with one page | Adds a request without benefit |
| `splitChunks: { chunks: 'all', minSize: 0 }` | Generates hundreds of micro-chunks |
| Importing all of `lodash` then lazy-loading users | The whole lodash is still in the lazy chunk |

## How to verify a split worked

1. Run `pnpm build`.
2. Open the output `dist/` or `build/` directory — count the JS files and check sizes.
3. Use `webpack-bundle-analyzer` or `rsdoctor` to see what's in each chunk.
4. Load the app in DevTools Network tab — confirm the lazy chunk doesn't load until you trigger it.

## Preloading vs prefetching vs lazy

```text
<link rel="preload">   high priority, blocks render less than sync script, current page
<link rel="prefetch">  low priority, future navigation
<link rel="modulepreload">  ESM-aware preload, includes dependency graph
```

The bundler can emit these automatically via plugins like `preload-webpack-plugin` or framework integrations.

## Gotchas

- A dynamic `import(varName)` where `varName` is fully runtime — the bundler can't statically build a chunk and will warn or fail. Use a static prefix: `` import(`./pages/${name}.tsx`) ``.
- Splits across Module Federation boundaries are different — see the Module Federation notes for shared-deps handling.
- `Suspense` fallback flashing — if the chunk loads in <200ms, the spinner appears and disappears jarringly. Consider a minimum-duration wrapper.
- Lazy components break SSR unless you use the framework's SSR-aware variant (`React.lazy` is client-only; Next.js has `next/dynamic`).
- Renaming a file invalidates the chunk hash and cascades into every chunk that imports it — keep `splitChunks` boundaries stable.
