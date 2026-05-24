Rspack is a Rust reimplementation of Webpack that exposes Webpack's JS-facing APIs — the same `entry`, `output`, `module.rules`, `plugins`, and loader contract. The pitch is "keep your config, get 5-10x faster builds". It is largely true for typical app configs, but the compatibility layer has limits, and a handful of Webpack plugins that reach into internal modules will not work. As of 2026 Rspack 1.x is stable and used in production by ByteDance, Microsoft, Alibaba, and Discord.

## What's the same

- `entry`, `output`, `resolve`, `module.rules`, `plugins` — same shape.
- Most loaders work unchanged: `babel-loader`, `swc-loader`, `css-loader`, `style-loader`, `postcss-loader`, `sass-loader`, `mini-css-extract-plugin`.
- `splitChunks`, `runtimeChunk`, `optimization.minimize` — same options, same effect.
- Module Federation: `@module-federation/enhanced/rspack` provides the same federation primitives.
- Source map options, dev server options, HMR — same API.

```js
// webpack.config.js becomes rspack.config.js with a single import swap
const { rspack } = require('@rspack/core');

module.exports = {
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: { loader: 'builtin:swc-loader', options: { /* swc opts */ } },
      },
    ],
  },
  plugins: [new rspack.HtmlRspackPlugin({ template: './index.html' })],
};
```

## What's different

| Concern | Webpack | Rspack |
| --- | --- | --- |
| Transpiler default | `babel-loader` | `builtin:swc-loader` (built in) |
| HTML plugin | `html-webpack-plugin` | `HtmlRspackPlugin` (built in) |
| Define plugin | `webpack.DefinePlugin` | `rspack.DefinePlugin` |
| CSS minimizer | `css-minimizer-webpack-plugin` | `LightningCssMinimizerRspackPlugin` |
| Stats output | very verbose, JSON-serializable | structured, smaller by default |
| Persistent cache | filesystem cache to disk | filesystem cache, different format |

The general pattern: anything prefixed `webpack-*` has either a built-in equivalent (`rspack.*`) or a `builtin:*` loader. Some third-party plugins ship a separate Rspack version; others just work because they only touch the public `compiler.hooks` API.

## Plugins that won't work

Plugins that reach into Webpack's internal module classes (`NormalModule`, `Compilation` private methods, internal AST) generally don't work. Common offenders:

- Plugins that mutate `module._source` directly.
- Plugins that walk Webpack's internal dependency graph nodes.
- Some older plugins from the Webpack 4 era that were never updated for Webpack 5's hooks.

The Rspack team maintains a compatibility list. Before migrating, audit your plugin list against it.

## Performance — what to actually expect

| Metric | Webpack | Rspack | Notes |
| --- | --- | --- | --- |
| Cold prod build, 1k modules | baseline | 5-10x faster | Rust + parallel parsing |
| Cold prod build, 10k modules | baseline | 10-20x faster | Gap widens with scale |
| Incremental dev rebuild | baseline | 2-5x faster | Dev server, post-cache |
| Memory usage | high | lower per module | Rust avoids V8 GC pressure |
| HMR update latency | 200-500ms typical | 50-150ms typical | |

Numbers vary wildly by project — minified CSS pipelines and heavy Babel transforms exaggerate the gap; trivial apps show smaller differences.

## SWC vs Babel inside the build

Rspack ships `builtin:swc-loader` and most migrations swap `babel-loader` for it. SWC is also Rust-based and faster than Babel by 10-50x for transpilation. The catch:

- Babel plugins do **not** transfer. If you depend on a custom Babel plugin (codemods, macros, emotion's source-map tricks), it has to be ported or replaced with an SWC plugin.
- SWC's plugin API is younger and smaller.
- Some frameworks (Emotion, styled-components) provide SWC plugins; verify yours exists.

## When to stay on Webpack

- You depend on a Webpack plugin that has no Rspack equivalent and rewriting it isn't worth it.
- You have a heavy Babel plugin stack that you can't port to SWC.
- Your build is already fast enough — incremental builds under 500ms — and the migration risk outweighs the win.
- You're on Webpack 4 (Rspack targets Webpack 5 semantics; upgrade to 5 first).

## Migration story

1. Get to Webpack 5 if you're not already there.
2. Swap `babel-loader` for `swc-loader` under Webpack first — this isolates the transpiler change from the bundler change.
3. Replace `webpack` and `webpack-cli` with `@rspack/core` and `@rspack/cli`.
4. Replace the handful of plugins that need the `Rspack`-prefixed equivalent (`HtmlRspackPlugin`, `DefinePlugin` import path).
5. Run your build, fix the small set of incompatibilities.
6. Benchmark, then verify the production output is functionally identical (smoke-test, visual diff, bundle-size diff).

## Gotchas

- `process.env.NODE_ENV` defaults differ — set `mode` explicitly.
- Some loaders silently no-op if they expect Webpack internals; check your output.
- Source map quality with `builtin:swc-loader` is excellent but not byte-identical to Babel — verify your error-tracking ingestion still resolves frames.
- Rspack's default stats are quieter — turn up verbosity if you're debugging the graph.
- Module Federation on Rspack uses `@module-federation/enhanced/rspack`, not the bundler's built-in `ModuleFederationPlugin`. Don't mix the two.
