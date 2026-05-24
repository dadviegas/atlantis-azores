Frontend infrastructure is the layer between the source code a developer writes and the JavaScript, CSS, and assets a browser actually executes. It includes the bundler that produces the artifact, the transpiler that lowers modern syntax, the dev server that serves it during development, the package manager that resolves dependencies, and the CI pipeline that builds and ships it. None of this is application logic, but all of it determines how fast a team can iterate and how small the production bundle ends up.

The notes below cover the bundler landscape as it stands in 2026 (Webpack, Rspack, Vite, esbuild, Rollup, Turbopack), the transpilers underneath them, the mechanics of code-splitting and tree-shaking, dev-server and HMR internals, and the monorepo, package-manager, and CI concerns that sit around the build.

## Subtopics

| File | What it covers |
| --- | --- |
| [bundlers-landscape](./bundlers-landscape.md) | Webpack, Rspack, Vite, esbuild, Rollup, Parcel, Turbopack — roles and decision matrix |
| [webpack-vs-rspack](./webpack-vs-rspack.md) | API compatibility, ecosystem, performance, migration story |
| [vite](./vite.md) | ESM-native dev server, Rollup for prod, Rolldown direction |
| [transpilers](./transpilers.md) | Babel vs SWC vs tsc vs esbuild, downlevel tradeoffs |
| [loaders-and-plugins](./loaders-and-plugins.md) | bundler plugin models, unplugin, the compile graph |
| [code-splitting](./code-splitting.md) | dynamic import, splitChunks/manualChunks, route splits |
| [tree-shaking](./tree-shaking.md) | ESM preconditions, sideEffects, /\*#\_\_PURE\_\_\*/, silent failures |
| [source-maps](./source-maps.md) | variant tradeoffs, prod stripping, Sentry upload pattern |
| [assets](./assets.md) | images, fonts, SVG, CSS strategies, asset modules, public path |
| [dev-server-and-hmr](./dev-server-and-hmr.md) | accept boundaries, React Refresh, HMR protocol, breakage |
| [build-performance](./build-performance.md) | profiling, persistent caching, parallelism |
| [monorepos](./monorepos.md) | workspaces, Turborepo/Nx/Moon, shared configs, remote cache |
| [package-managers](./package-managers.md) | npm vs yarn vs pnpm, lockfile, hoisting, peer deps |
| [ci-cd](./ci-cd.md) | caching, build artifacts, preview deploys, bottlenecks |
| [bundle-analysis](./bundle-analysis.md) | analyzers, large-dep hunting, dedup, performance budgets |
