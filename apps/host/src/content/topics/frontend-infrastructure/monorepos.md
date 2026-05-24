A monorepo holds multiple packages or apps in a single git repo, sharing tooling, types, and often runtime dependencies. The minimum ingredient is a workspace-aware package manager that links sibling packages instead of fetching them from npm. Beyond that, a task runner (Turborepo, Nx, Moon) orchestrates builds, tests, and lints across packages with caching and dependency awareness. Remote caching extends that cache across machines and CI runs.

## Workspaces — the foundation

All three package managers support workspaces. They symlink sibling packages into each other's `node_modules` so `import { Button } from 'ui'` resolves to the local source.

### pnpm

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### yarn / npm

```jsonc
// package.json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

Once configured, `pnpm install` (or `yarn` / `npm install`) walks every workspace package, resolves dependencies, and creates the symlink graph.

Reference workspace packages in `dependencies` with the workspace protocol:

```jsonc
// apps/host/package.json
{
  "dependencies": {
    "ui": "workspace:*"
  }
}
```

`workspace:*` resolves to the in-repo version at install time. When you publish, the package manager rewrites it to a concrete version range.

## Task runners

The package manager handles installs. The task runner handles builds. A monorepo of 30 packages where you only changed one file should not rebuild all 30.

| Tool | Language | Killer feature | Notes |
| --- | --- | --- | --- |
| Turborepo | Rust (Go originally) | dead-simple config, fast | owned by Vercel |
| Nx | TS | richest plugin ecosystem, project graph | heavy if you don't use the integrations |
| Moon | Rust | very strict typed config, supports many languages | smaller community |
| Lerna | JS | legacy, now Nx-powered | historical |
| Bazel | many | hermetic builds across languages | overkill for most JS shops |

For a pure JS/TS monorepo, Turborepo is the most popular default. Nx is best if you want generators, migration runners, and integrated framework support. Moon is worth a look for polyglot repos.

### Turborepo config

```jsonc
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {}
  }
}
```

`^build` means "build of upstream dependencies first". Running `turbo run build` orders tasks correctly and caches outputs.

```bash
turbo run build         # builds all packages
turbo run build --filter=host  # builds host and its deps
turbo run test lint --parallel # runs in parallel
```

## Caching

Both Turborepo and Nx hash the inputs to a task (source files, env vars, lockfile, dependencies' outputs) and cache the outputs. A second run with no changes is near-instant — it replays cached `stdout` and restores cached files.

```text
turbo run build
  cache hit (local), replaying logs
  Tasks: 12 successful, 12 total
  Cached: 12 cached, 12 total
  Time: 200ms
```

## Remote caching

Local cache is per-machine. Remote cache shares it across machines:

```bash
turbo login
turbo link
```

Now a CI build that succeeds uploads its outputs to the remote cache. A teammate's local build with the same inputs downloads them instead of recomputing. CI runs benefit most — each PR builds only what changed.

Providers:

- Vercel Remote Cache (free for Turborepo).
- Nx Cloud.
- Self-hosted (Turborepo's protocol is documented; community implementations exist).

## Shared configs

A common pattern — put shared tooling in a `packages/config/` package:

```text
packages/
  config/
    eslint.cjs
    tsconfig.base.json
    prettier.cjs
```

Then in each app/package:

```jsonc
// tsconfig.json
{ "extends": "config/tsconfig.base.json" }

// .eslintrc.cjs
module.exports = { extends: ['./packages/config/eslint.cjs'] };
```

This keeps formatting, linting, and TS settings consistent without copying.

## Versioning and releases

For library packages, two main models:

| Model | Tool | Notes |
| --- | --- | --- |
| Fixed (all packages share a version) | Lerna, Nx | Lockstep, simple |
| Independent (per-package versions) | Changesets, semantic-release | Most flexible |

Changesets is the dominant choice as of 2026. Contributors add a `.changeset/foo.md` file describing their change and bump type; a release workflow consumes them, bumps versions, generates changelogs, and publishes.

```bash
pnpm changeset       # interactive: pick packages, bump type, summary
pnpm changeset version  # bumps versions, updates changelogs
pnpm changeset publish  # publishes to npm
```

## Code organization patterns

```text
apps/                # deployable applications
  host/
  remote/
  admin/
packages/            # reusable libraries
  ui/                # shared design system
  utils/             # plain functions, no UI
  config/            # tsconfig, eslint, prettier
  types/             # cross-app type definitions
```

Rule of thumb: an `app/` has its own deploy target. A `package/` is consumed by something else.

## Cross-cutting concerns

- **TypeScript project references** (`tsconfig.json` with `references: [...]`) enable `tsc --build` to compile in topological order with caching. Pairs well with Turborepo.
- **ESLint** — use a single root config that extends per-package overrides. Avoid per-package ESLint installs.
- **Tests** — Vitest and Jest both support workspace mode; one command runs all package tests.

## Gotchas

- pnpm's strict isolation surfaces missing peer-deps that hoisted setups hide. Fix the real bug instead of working around it with `shamefully-hoist`.
- A workspace package's `main` / `exports` field needs to point at *built* output, not source — or set `"types": "src/index.ts"` and let consumers transpile on the fly (build-on-the-fly works in Vite/Rspack with proper `transpilePackages` config).
- Circular dependencies between packages compile but break test runners and bundlers in subtle ways. `madge --circular packages` to detect.
- Remote cache misses on env-variable changes look like cache poisoning bugs — Turborepo's `globalEnv` and per-task `env` declarations are essential.
- Turborepo doesn't run tasks for unaffected packages by default — verify with `--dry-run` if a CI step seems to skip work.
- Some tools (`tsc`, ESLint) read configs by walking up the directory tree — workspace symlinks can confuse this. Use absolute `extends` paths if you see weird config resolution.
