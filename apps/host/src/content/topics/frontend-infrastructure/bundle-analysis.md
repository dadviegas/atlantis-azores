Bundle analysis is the practice of looking at what's actually inside your production bundle — which modules, how big each is, where the bytes came from — and using that to make targeted reductions. Without analysis, "the bundle is too big" is an unsolvable problem. With it, you usually find one or two oversized dependencies, an accidentally-imported polyfill, or a duplicate of React being pulled in twice, and a few hours of work cuts the bundle in half.

## The tools

| Tool | Bundler | Output | Best for |
| --- | --- | --- | --- |
| `webpack-bundle-analyzer` | Webpack/Rspack | interactive treemap | first-look exploration |
| `rsdoctor` | Rspack/Webpack | full HTML report, build perf + bundle | most comprehensive in 2026 |
| `source-map-explorer` | any (uses .map files) | treemap | works on any bundler with source maps |
| `statoscope` | Webpack/Rspack | rich JSON+UI, compares builds | diffing two builds |
| `vite-bundle-visualizer` | Vite | treemap | Vite projects |
| `rollup-plugin-visualizer` | Rollup/Vite | treemap | Rollup output |
| `bundlephobia.com` | any (per-package) | weight per npm package | evaluating a dep before adding |
| `npmgraph.js.org` | any | dep graph | finding the source of a transitive dep |

## webpack-bundle-analyzer

The classic. Add the plugin, build, open the HTML:

```js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
  ],
};
```

Produces `report.html` with three views:

- **Stat size** — raw size before minification.
- **Parsed size** — what the browser parses (after minification).
- **Gzip size** — what the browser actually downloads.

Look at gzip. That's what users pay for.

## rsdoctor

Newer, more capable. Works on both Rspack and Webpack. Adds build-perf instrumentation on top of bundle analysis:

```js
const { RsdoctorRspackPlugin } = require('@rsdoctor/rspack-plugin');

module.exports = {
  plugins: [new RsdoctorRspackPlugin({})],
};
```

Outputs an HTML report that includes:

- Bundle composition (treemap, sunburst).
- Duplicate-package detection (multiple versions of the same dep).
- Build-time breakdown (which loaders/plugins took how long).
- Module reasons (why is X included).

The duplicate-package detection alone is worth running on any large monorepo.

## source-map-explorer

Bundler-agnostic. Reads your output `.js` and `.js.map` files:

```bash
pnpm dlx source-map-explorer dist/assets/index-*.js
```

Produces an HTML treemap. Works for Vite, Webpack, esbuild, anything that produces source maps. Doesn't require a plugin so it's the fastest way to inspect a production build.

## What to actually look for

### Oversized single dependencies

In the treemap, anything that's >10% of the bundle deserves justification. Common offenders:

| Dep | Size | Alternatives |
| --- | --- | --- |
| `moment` | 70 KB | `date-fns`, `dayjs`, native `Intl.DateTimeFormat` |
| `lodash` (full) | 70 KB | `lodash-es` named imports, native methods |
| `chart.js` + adapters | 200 KB | lazy-load, or lighter lib (uPlot) |
| `@material-ui` full | 300+ KB | tree-shakable v5+, or alternative |
| `firebase` SDK full | 400+ KB | modular SDK (subpackages) |
| `react-icons` full | huge | per-pack import: `react-icons/fa` |
| `aws-sdk` v2 full | 1+ MB | v3 modular clients |

### Duplicate packages

Two versions of the same package shipped in the same bundle is pure waste. Causes:

- Different transitive deps pinning different versions.
- A workspace package built against a different React than the host.
- A package shipping its own bundled copy of a runtime (`react` inside a UI lib).

```bash
pnpm why react        # show every package that depends on react
pnpm dedupe           # collapse to a single version where possible
```

### Polyfills you didn't ask for

A common surprise: `core-js` accounting for 50+ KB. Caused by Babel's `useBuiltIns: 'usage'` + an old browserslist target. Fix by tightening `target: 'ES2020'` or higher.

### Locale data

Date and number formatters often ship every locale by default:

- `moment` ships all locales unless you use `moment-locales-webpack-plugin`.
- `date-fns` ships per-locale modules; only import the ones you need.
- `Intl` is browser-native — no shipped locale data.

### Source map files in the bundle

Sometimes a published package accidentally includes its `.map` files in the main build output. They show up in the treemap and add nothing useful.

## Performance budgets

A budget is a hard ceiling on bundle size, enforced in CI. Common shapes:

```jsonc
// .size-limit.json
[
  { "name": "main bundle", "path": "dist/assets/index-*.js", "limit": "150 KB" },
  { "name": "vendor bundle", "path": "dist/assets/vendor-*.js", "limit": "120 KB" },
  { "name": "first paint CSS", "path": "dist/assets/*.css", "limit": "20 KB" }
]
```

Tools:

- `size-limit` — runs in CI, comments on PRs with size diffs.
- `bundlewatch` — similar, slightly different config.
- Webpack's built-in `performance: { hints: 'error', maxAssetSize: 200000 }` — fails the build.

Combine with a PR comment showing diff vs base branch — that's how you catch regressions before merge.

## Deduplication

After identifying a duplicate:

```bash
pnpm dedupe                            # try automatic dedup
pnpm overrides                         # force one version (in package.json)
```

```jsonc
// package.json
{
  "pnpm": {
    "overrides": {
      "react": "18.2.0",
      "react-dom": "18.2.0"
    }
  }
}
```

For yarn: `resolutions`. For npm 8+: `overrides`.

## A typical bundle-reduction session

```text
1. Build prod: pnpm build
2. Run analyzer (rsdoctor / source-map-explorer)
3. Sort modules by gzip size desc
4. For the top 3 modules:
     - Is it actually used everywhere or only one place?
       -> If one place, lazy-load it (see code-splitting)
     - Is there a smaller equivalent?
       -> Swap and re-measure
     - Is it imported wholesale instead of by name?
       -> Switch to named imports
5. Check duplicates: pnpm why <package> for anything suspicious
6. Re-build, re-measure
7. Add budget to CI to prevent regression
```

## Gotchas

- "Stat size" is misleading — your users download gzip. Always sort by gzip.
- The analyzer shows the bundle *after* the bundler ran. Doesn't show what tree-shaking removed (that's the unseen win).
- Per-package treemap can hide the real problem if many small files are bundled into a single chunk — drill into the chunk.
- A single huge SVG/JSON file imported as code shows up as "code" in the analyzer. Use `asset/resource` for big static data.
- Module Federation remotes have separate bundles — analyze each one independently.
- A build that fits the budget on your machine may not on a teammate's (different package manager, different lockfile). CI is the source of truth.
- Reducing bundle size by 50 KB matters less than removing a 200 ms blocking script on critical path. Measure perceived load, not just bytes.
