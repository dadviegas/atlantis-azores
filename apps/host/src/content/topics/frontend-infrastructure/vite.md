Vite is two tools wearing one name: a native-ESM dev server that serves source files on demand without bundling, and a Rollup-based production builder that produces a conventional bundled artifact. The dev server is what made it famous — cold start measured in milliseconds even for large apps, because nothing is bundled until the browser asks for it. The tradeoff is that dev and prod use different pipelines, which occasionally produces "works in dev, broken in prod" bugs.

## How dev works

The Vite dev server is a small HTTP server that does three things:

1. Serves your `index.html` and rewrites `<script type="module">` tags to point at source files.
2. Intercepts requests for `.ts`, `.tsx`, `.jsx`, `.vue`, `.svelte` — transforms them on the fly using esbuild for JS/TS and framework plugins for the rest.
3. Pre-bundles `node_modules` dependencies once into ESM (also via esbuild) and caches them.

```text
Browser requests App.tsx
  -> Vite dev server transforms TSX via esbuild
  -> Returns ESM with import statements rewritten to /node_modules/.vite/react.js
  -> Browser fetches each import as a separate request
  -> HTTP/2 + filesystem cache makes this fast
```

This is fundamentally different from Webpack's "build everything upfront, then serve" model. Cold start does not scale with app size — only the modules the browser actually requests get transformed.

## How prod works

`vite build` uses Rollup. Rollup bundles, tree-shakes, code-splits, and minifies. This is a real bundling pipeline and looks like any other production build — chunks, hashed filenames, a manifest.

```bash
$ vite build
# dist/assets/index-3a8f.js   124 KB
# dist/assets/vendor-9c2d.js  88 KB
# dist/assets/index-7b1c.css  12 KB
```

## The dev/prod gap

Because dev uses esbuild and prod uses Rollup, a few things differ:

| Concern | Dev | Prod |
| --- | --- | --- |
| Module format | ESM, unbundled | Bundled chunks |
| Tree-shaking | none | full Rollup |
| CSS extraction | inline `<style>` | extracted to `.css` |
| Asset URLs | served from project root | hashed, in `/assets/` |
| `import.meta.glob` | runs at request time | resolved at build time |

Bugs that bite in prod but not dev:

- Side-effectful imports that get tree-shaken away.
- Code that depends on import order — esbuild and Rollup don't always emit the same order.
- Dynamic imports built from runtime strings — Rollup can't statically analyze them and won't include them in the output.

## Rolldown — the next phase

Rolldown is a Rust rewrite of Rollup, also from the Vite team. As of 2026, Vite is in the middle of migrating its production builder from Rollup to Rolldown. The plugin API is Rollup-compatible — most Rollup plugins work unchanged. The win: production builds get 5-10x faster, and the dev/prod tooling gap narrows because esbuild is also slated to be replaced by Rolldown for dev transforms in a unified pipeline ("Vite 6 + Rolldown").

## When Vite shines

- Greenfield SPAs and SSR apps.
- Frameworks built on it: SvelteKit, Nuxt, Remix (post-Vite move), Astro, SolidStart, Qwik.
- Demo apps and tooling where startup speed matters.
- Library development with `vite build --watch` and Vitest for testing.

## When Vite hurts

- Massive Webpack configs you'd have to rewrite as Vite plugins — Rspack is a smaller migration.
- Module Federation: Vite has it through `@module-federation/enhanced/vite` but the ecosystem and tooling are less mature than Rspack/Webpack.
- Apps with thousands of source files that get loaded immediately — the dev-server "lazy transform" advantage disappears when the browser requests everything at once.
- Cases where dev-prod parity is critical and you can't tolerate the two-pipeline split.

## Config shape

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom'] },
      },
    },
  },
});
```

Notice how thin this is compared to a Webpack config. Vite leans hard on convention — assets in `public/`, env vars prefixed `VITE_`, `index.html` as the entry. Fighting the conventions is painful; following them is great.

## Gotchas

- `process.env` does not exist in client code — use `import.meta.env`.
- Dynamic imports must be statically analyzable: `import(`/pages/${name}.ts`)` works, but `import(buildPathAtRuntime())` does not.
- CSS pre-processors (Sass, Less) need their package installed but no plugin — Vite auto-wires them.
- HMR boundaries are inferred from file extensions and framework plugins; if your custom file type breaks HMR, you likely need an `accept` hook.
- `optimizeDeps` pre-bundling cache (`node_modules/.vite`) gets stale after a dependency change — `--force` clears it.
- SSR has its own module resolver (`ssr.noExternal`); Node-only packages need to be listed if they ship ESM-only.
