Rspack is a Rust-based bundler with deliberate Webpack API compatibility. Module Federation works on both, but the import paths, plugin packages, and runtime behaviors differ slightly. Knowing which knob lives where saves an afternoon.

## Two implementations, same protocol

Both Webpack and Rspack implement the Module Federation protocol — `remoteEntry.js` from a Webpack remote can be consumed by an Rspack host and vice versa, because the container interface (`init`/`get`) is the same. The differences are in:

- Which plugin package you import.
- How shared dep negotiation is wired internally.
- Build performance and behavior of certain edge cases.

| Aspect | Webpack | Rspack |
| --- | --- | --- |
| Plugin import | `webpack.container.ModuleFederationPlugin` | `@module-federation/enhanced/rspack` |
| Cold build | Slower | Significantly faster (Rust) |
| Watch rebuild | Fast | Faster |
| Plugin ecosystem | Mature, larger | Growing, Webpack-compat layer |
| Source map fidelity | Best | Very good |
| SWC integration | Optional | Built-in |
| HMR with MF | Works | Works |

## The plugin packages

Webpack ships the plugin in core:

```cjs
const { ModuleFederationPlugin } = require('webpack').container;
```

For modern federation features (enhanced runtime, `@mf-types`, plugin hooks), you use the enhanced package on top of either bundler:

```cjs
// works on Webpack
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

// works on Rspack
const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack');
```

The config object is the same shape across both. A `rspack.shared.cjs` that constructs the plugin config can be consumed by both builds:

```cjs
// rspack.shared.cjs
module.exports.sharedDeps = {
  react: { singleton: true, requiredVersion: '^19.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
};
```

Then in both `rspack.config.cjs` files:

```cjs
const { sharedDeps } = require('./rspack.shared.cjs');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack');

new ModuleFederationPlugin({
  name: 'host',
  remotes: { remote: 'remote@http://localhost:3001/remoteEntry.js' },
  shared: sharedDeps,
});
```

## Performance

Rspack's build times are typically 5–10x faster than Webpack on equivalent configs, more on large codebases. For federation specifically:

- `remoteEntry.js` is the same size regardless of bundler.
- HMR for federated code is similar.
- Cold start of a host that consumes 8+ remotes in dev is *noticeably* better on Rspack because each remote is its own dev server.

If you're moving to MF *and* feel build speed pain, jump straight to Rspack rather than landing on Webpack and migrating later.

## Compatibility gotchas

### Loader compatibility

Most Webpack loaders work in Rspack via its compat layer, but loaders that depend on Webpack internals (the compiler object, hooks deep in the compilation lifecycle) may not. For federation specifically this is rarely an issue because the federation plugin doesn't expose much custom loader API.

### Plugin compatibility

Rspack ships Rust ports of common plugins (`HtmlRspackPlugin`, `CopyRspackPlugin`). Webpack-only plugins that rely on tapable hooks deep in compilation may not work. The MF plugin itself is first-class on both.

### Asset modules

Rspack supports `type: 'asset'` and friends. Behavior matches Webpack 5 for the cases MF cares about (the federation runtime is JS, no asset oddities).

### Source maps

Both produce sourcemaps for federated chunks. Stack traces in errors crossing remote boundaries are sometimes truncated if a remote's sourcemap isn't served — make sure your remote's CDN serves `*.map` and the `SourceMap` header.

## Mixing bundlers

You can have a Webpack host with Rspack remotes (or vice versa) in production. The federation protocol doesn't care. Teams sometimes do this during a migration: ship one remote on Rspack, measure, then migrate the rest. The only constraint is that shared deps must reconcile to the same library versions — that's a runtime concern, not a bundler one.

## Vite as a third option

Vite has community federation plugins (`@originjs/vite-plugin-federation`, `@module-federation/vite`). They speak the same protocol but the dev-time story is different because Vite uses native ESM in dev. As of 2026, `@module-federation/vite` is the most mature option and supports the enhanced runtime.

| Bundler | Dev server | Prod build | Federation maturity |
| --- | --- | --- | --- |
| Webpack | Webpack | Webpack | Highest |
| Rspack | Rspack | Rspack | High |
| Vite | Native ESM | Rollup | Improving |

## Gotchas

- Importing the *wrong* `ModuleFederationPlugin` (Webpack's core version when you wanted enhanced) silently disables enhanced features like `dts`, `runtimePlugins`, manifest generation.
- Rspack's `experiments` config differs slightly from Webpack's. `outputModule` (ESM output) syntax is similar but check docs when enabling.
- A remote built with `target: 'web'` won't run on the server. Build server bundles separately with the SSR plugin.
- HMR for federated code requires both host and remote dev servers to be up. A remote that's down at boot means the host loads, the import throws, and HMR doesn't recover until you restart.
- Older `webpack-cli` versions don't pass through `--config` to Rspack the same way. Use each bundler's own CLI.
