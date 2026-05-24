A bundler is mostly a coordinator: it discovers modules, runs them through transforms, and stitches the output into chunks. The transforms are loaders (per-file) and plugins (whole-build hooks). Webpack and Rspack share the same loader/plugin model. Rollup and Vite use a different, slightly simpler one. Unplugin is an abstraction layer that lets a single plugin run on all of them.

## Webpack/Rspack: loaders

A loader is a function that takes the source of one file and returns transformed source. They run right-to-left in the `use` array:

```js
{
  test: /\.scss$/,
  use: [
    'style-loader',    // 3. injects CSS into <style> tag
    'css-loader',      // 2. resolves @import, url(), returns JS module
    'sass-loader',     // 1. compiles SCSS to CSS
  ],
}
```

Each loader gets the previous one's output. The "last" loader (bottom of the array, first to run) receives the raw file content. Loaders can be sync or async, can emit additional files, and can attach metadata to the module.

```js
// minimal loader
module.exports = function (source) {
  return source.replace(/__VERSION__/g, this.query.version);
};
```

## Webpack/Rspack: plugins

A plugin hooks into the compiler lifecycle. They tap into events like `beforeCompile`, `emit`, `done`. Plugins can do anything — emit assets, modify the module graph, run side-channel work (uploading source maps, generating manifests).

```js
class ManifestPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('ManifestPlugin', (compilation, cb) => {
      const manifest = JSON.stringify(Object.keys(compilation.assets));
      compilation.assets['manifest.json'] = {
        source: () => manifest,
        size: () => manifest.length,
      };
      cb();
    });
  }
}
```

Compiler hooks are documented in tapable. The two namespaces:

- `compiler.hooks.*` — lifecycle of the whole build.
- `compilation.hooks.*` — per-compilation events (one per `compile`, multiple per watch run).

## Rollup/Vite: plugins

Rollup uses a single concept — *plugins* with named hooks. There are no separate loaders. A plugin can implement any subset of hooks like `resolveId`, `load`, `transform`, `buildEnd`.

```js
// rollup plugin
export default function myPlugin() {
  return {
    name: 'my-plugin',
    resolveId(source) {
      if (source === 'virtual:config') return source;
    },
    load(id) {
      if (id === 'virtual:config') return `export default ${JSON.stringify(config)}`;
    },
    transform(code, id) {
      if (id.endsWith('.svg')) return `export default ${JSON.stringify(code)}`;
    },
  };
}
```

Vite extends the Rollup plugin API with extra hooks like `configureServer`, `handleHotUpdate`, and the `enforce: 'pre' | 'post'` ordering field.

## Comparison

| | Webpack/Rspack | Rollup/Vite |
| --- | --- | --- |
| Per-file transforms | loaders | `transform` hook |
| Lifecycle hooks | plugins via tapable | plugins via named hooks |
| Virtual modules | `resolve` + custom loader | `resolveId` + `load` |
| Asset emission | `compilation.emitAsset` | `this.emitFile` |
| Plugin count for typical app | 5-15 + many loaders | 3-8, no loaders |

## Unplugin

Unplugin lets you write one plugin that works on Webpack, Rspack, Rollup, Vite, and esbuild. It exposes a unified subset of hooks (`resolveId`, `load`, `transform`, `buildStart`, `buildEnd`) and ships per-bundler adapters.

```ts
import { createUnplugin } from 'unplugin';

export default createUnplugin(() => ({
  name: 'my-unplugin',
  transformInclude(id) { return id.endsWith('.vue'); },
  transform(code) { return code.replace(/console\.log/g, '// log'); },
}));

// then:
import myPlugin from './my-unplugin';
export const webpack = myPlugin.webpack;
export const vite = myPlugin.vite;
export const rspack = myPlugin.rspack;
```

This is how tools like `unplugin-auto-import`, `unplugin-icons`, and `unplugin-vue-components` ship a single package for every bundler.

## What runs when in the compile graph

Webpack's high-level flow:

```text
1. compiler.run()
2. resolve entries
3. for each module:
     resolve dependencies (resolver)
     run loaders (right-to-left)
     parse AST
     walk dependencies
4. build module graph (compilation)
5. apply optimizations (tree-shake, chunk split)
6. emit assets to filesystem
```

Loaders run during step 3, on each file. Plugins can tap any step. Rollup is similar but its single-pass nature means `resolveId` -> `load` -> `transform` happens per module, then `renderChunk` / `generateBundle` run at output time.

## Common mistakes

- Writing a plugin when a loader would do. If you only need to transform one file's contents based on its content, that's a loader/transform.
- Loader order confusion — `use: ['style-loader', 'css-loader']` runs `css-loader` *first*. Read right-to-left.
- Mutating the source string in a Rollup `load` hook then forgetting to return a source map — error traces in dev will point at wrong lines.
- Async work in a loader without calling the async callback (`const cb = this.async()`) — the build hangs.
- Plugins that mutate global state across compilations break watch mode — store state on `compilation` instead.
- Trying to access `compilation.modules` before it's populated — use the right hook (`finishModules`, `afterOptimizeChunks`).
