Build performance is two distinct problems: cold builds (CI, first dev start) and incremental rebuilds (dev watch, HMR). The optimizations differ — cold builds benefit from parallelism and avoiding work; incremental builds benefit from caching what didn't change. The path to a fast build is measure-first, then attack the actual bottleneck. The biggest perf wins almost always come from removing work, not from threading or caching it.

## Profiling — find the bottleneck first

| Tool | Bundler | What it shows |
| --- | --- | --- |
| `webpack-bundle-analyzer` | Webpack/Rspack | bundle composition (output size, not build time) |
| `rsdoctor` | Rspack/Webpack | build time per loader/plugin, bundle composition, duplicate-deps |
| `speed-measure-webpack-plugin` | Webpack | per-loader/plugin time (older, sometimes inaccurate) |
| `statoscope` | Webpack/Rspack | full stats analysis, comparisons across builds |
| `vite --profile` | Vite | CPU profile of build |
| `tsc --extendedDiagnostics` | tsc | type-check breakdown |
| `--profile` then `chrome://tracing` | Webpack | flame graph of compile |

Rsdoctor is the most useful single tool in 2026 — it works across Rspack and Webpack and shows the breakdown by loader, plugin, and module.

```bash
# add rsdoctor
pnpm add -D @rsdoctor/rspack-plugin

# enable in config
plugins: [new RsdoctorRspackPlugin({})]

# open ./rsdoctor/report.html after build
```

## Caching

### Persistent filesystem cache

Webpack 5 and Rspack both support persistent caching to disk. The second build skips re-parsing and re-transforming modules that haven't changed:

```js
cache: {
  type: 'filesystem',
  buildDependencies: {
    config: [__filename], // bust cache when config changes
  },
}
```

First build: same as before. Second build: 5-20x faster typically. The cache lives in `node_modules/.cache/webpack` (or `.rspack`).

In CI, restore this cache between runs:

```yaml
- uses: actions/cache@v4
  with:
    path: node_modules/.cache
    key: ${{ runner.os }}-build-${{ hashFiles('pnpm-lock.yaml') }}
```

### Memory cache

Default for watch mode. No setup needed. Lost on process restart.

### Transpiler cache

`babel-loader` has its own cache (`cacheDirectory: true`). `swc-loader` doesn't need one — SWC is fast enough that re-transpilation isn't a bottleneck. Still, `node_modules/.cache/babel-loader` exists.

### Vite dep pre-bundling cache

`node_modules/.vite/deps/` — pre-bundled dependencies. Invalidated on lockfile change. `--force` clears manually.

## Parallelism

### thread-loader (Webpack)

```js
{
  test: /\.tsx?$/,
  use: ['thread-loader', 'babel-loader'],
}
```

Spawns worker threads to run subsequent loaders in parallel. Overhead is per-worker startup (~600ms) so it pays off only for large projects with expensive transforms. With SWC there's nothing to parallelize — it's already fast.

### SWC parallel mode

SWC parallelizes within a single process via Rust threading. No setup needed.

### Rspack

Built-in parallel parsing, transformation, and chunk emission. No threading config needed.

### TypeScript

`tsc` is single-threaded but `tsc --build` with project references parallelizes across packages in a monorepo. `fork-ts-checker-webpack-plugin` runs type-checking in a separate process so it doesn't block the bundle.

## Removing work — the highest leverage

| Action | Typical win |
| --- | --- |
| Replace Babel with SWC | 30-70% build time |
| Switch Webpack to Rspack | 50-90% build time |
| Enable persistent cache | 80-95% on warm builds |
| Drop unused polyfills (`target: ES2020`) | 10-20% build, 5-15% bundle |
| Skip type-checking in the bundle pipeline, run `tsc --noEmit` in parallel | 20-40% build |
| Disable source maps in non-debug builds | 30-60% build |
| Move tests out of the production build graph | varies |
| Reduce loader chain (drop `style-loader` -> `css-loader` -> `postcss-loader` if you don't need postcss) | 10-30% |

## Type-checking strategy

Don't type-check inside the bundler if you can avoid it. The fast pipeline:

```text
parallel:
  - bundler (SWC strips types, doesn't check)
  - tsc --noEmit (just checks, doesn't emit)
```

Both finish independently. The bundle is produced faster; the type-check completes (and fails the build if needed) in parallel. Tools like `concurrently` or Turborepo's task graph orchestrate this.

## Watch-mode tuning

- Exclude `node_modules` from filesystem watchers — they don't change.
- On macOS, the default watcher uses `fsevents` and is fine. On Linux/Docker, default polling is slow; use `WATCHPACK_POLLING=false` and configure inotify limits.
- Restrict the watcher to relevant dirs: `watchOptions: { ignored: ['**/node_modules', '**/dist'] }`.

## CI-specific perf

- Use `pnpm install --frozen-lockfile` — skips lockfile resolution.
- Run lint, type-check, test, build in parallel jobs.
- Cache: `node_modules/.pnpm`, `node_modules/.cache`, framework caches (`.next/cache`, etc.).
- Don't re-install on every job — use a single setup job that publishes a `node_modules` artifact (Turborepo / Nx do this automatically per-package).
- Pick a runner with enough RAM. Bundling a large app on a 4GB runner thrashes swap.

## Measuring correctly

- Cold-build baseline: delete `node_modules/.cache`, run twice, average the second-third runs.
- Warm-build baseline: keep cache, edit one file, time the rebuild.
- Compare same machine, same Node version, same flags. Cloud CI numbers vary wildly across runs.
- Use `time pnpm build` for quick checks; use the profiler for breakdown.

## Common mistakes

- Adding `thread-loader` to a small project — overhead outweighs gain.
- Enabling source maps in CI then not using them.
- Re-running the same expensive plugin in dev and prod builds when it's only needed in prod (e.g., compression, asset optimization).
- Letting `node_modules/.cache` grow unbounded — clear monthly or it can exceed disk.
- Bundling the type-checker into the dev loop — every keystroke costs.
- Optimizing the wrong stage — checking a 200ms type-check while a 30s minifier runs is the wrong priority.
- "It was slow on my laptop" without numbers — instrument before you spend a day.
