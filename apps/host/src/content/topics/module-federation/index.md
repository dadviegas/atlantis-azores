Module Federation is a runtime architecture for splitting a frontend across independently built and deployed bundles that compose in the browser. Originally a Webpack 5 feature by Zack Jackson, it has evolved into `@module-federation/enhanced` — a cross-bundler implementation that works with Webpack, Rspack, Rsbuild, and Vite, and is the current recommended package as of 2026. The core idea: one app can `import` modules from another app at runtime, sharing dependencies like React without duplicating them in every bundle.

The notes below progress from motivation and configuration through runtime mechanics, TypeScript, SSR, and production concerns, ending with a concrete walkthrough of the host/remote wiring in this repository.

## Subtopics

| File | What it covers |
| --- | --- |
| [why-module-federation](./why-module-federation.md) | the multi-team problem, alternatives, tradeoffs |
| [host-vs-remote](./host-vs-remote.md) | roles, bidirectional federation, the shell pattern |
| [exposes](./exposes.md) | configuring exposes, naming, public-API discipline |
| [remotes](./remotes.md) | consuming remotes, the `remoteEntry.js` contract, scope syntax |
| [shared-dependencies](./shared-dependencies.md) | singleton, requiredVersion, eager, strictVersion |
| [versioning](./versioning.md) | semver across host+remotes, breaking changes, rollouts |
| [typescript-types](./typescript-types.md) | declare module, `@mf-types`, build vs runtime gap |
| [runtime-loading](./runtime-loading.md) | container init/get, share scope, async chunks |
| [dynamic-remotes](./dynamic-remotes.md) | unknown URLs at build time, `registerRemotes`, low-level APIs |
| [ssr](./ssr.md) | hydration, shared state, the SSR plugin, streaming |
| [rspack-vs-webpack](./rspack-vs-webpack.md) | compatibility, plugin imports, performance, gotchas |
| [error-boundaries](./error-boundaries.md) | remote load failures, fallbacks, retries, kill switches |
| [testing](./testing.md) | unit, mocking remotes, integration, contract tests |
| [production-considerations](./production-considerations.md) | caching, CDN, CSP, observability, security |
| [this-repo](./this-repo.md) | concrete walkthrough of the host/remote wiring here |
