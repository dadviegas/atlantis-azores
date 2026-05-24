npm, yarn, and pnpm all install packages from the npm registry into `node_modules`, but their lockfile formats, install algorithms, and disk layouts differ in ways that affect install speed, disk usage, and correctness. The 2026 picture: pnpm is the technical favorite for monorepos, yarn (Berry) has a vocal minority using Plug'n'Play, and npm is the safe default for small projects. Bun is a newer entrant that's faster than all of them but with less ecosystem maturity.

## The contenders

| Manager | Lockfile | Layout | Speed | Notes |
| --- | --- | --- | --- | --- |
| npm | `package-lock.json` | hoisted flat tree | baseline | bundled with Node |
| yarn classic (1.x) | `yarn.lock` | hoisted flat tree | faster than npm | unmaintained but still used |
| yarn berry (2-4.x) | `yarn.lock` (different format) | PnP (no node_modules) or node_modules | fastest in PnP mode | controversial PnP |
| pnpm | `pnpm-lock.yaml` | symlinked content store | fast, low disk | strict isolation |
| Bun | `bun.lockb` (binary) | hoisted | fastest | newer, some compat edges |

## Lockfiles

A lockfile pins exact resolved versions and integrity hashes for every dependency in the tree, so installs are reproducible across machines.

- **`package-lock.json`** (npm) — JSON. Stable format. Verbose. Diffs are noisy.
- **`yarn.lock`** (classic) — custom format, human-readable. Berry uses YAML-ish.
- **`pnpm-lock.yaml`** — YAML. Compact. Stable diffs.
- **`bun.lockb`** — binary. Fastest to parse. Unreviewable in code review unless you also commit a text version.

You should commit your lockfile. Never delete it casually — it's how you guarantee that `pnpm install` next month produces the same tree as today.

## Install algorithms

### npm and yarn-classic — hoisted

They flatten the dependency tree into a single flat `node_modules/`, hoisting packages up to the top level when there's no version conflict:

```text
node_modules/
  react/         <- hoisted from many deps
  lodash/        <- hoisted
  some-dep/
    node_modules/
      lodash/    <- a different version, can't hoist
```

This makes resolution fast (one filesystem layer) but creates a hazard: your code can `import 'some-transitive-dep'` even if you never declared it. This is the *phantom dependency* problem.

### pnpm — symlinks + content store

pnpm stores every version of every package once in a global content-addressed store (`~/.local/share/pnpm/store`). Each project's `node_modules/` is a symlink tree pointing into that store:

```text
~/.local/share/pnpm/store/v3/files/
  ab/cd...  <- single copy of react-18.2.0
  ef/01...  <- single copy of lodash-4.17.21

project/node_modules/
  .pnpm/
    react@18.2.0/node_modules/react -> store/.../react
  react -> .pnpm/react@18.2.0/node_modules/react
```

Effects:

- Disk usage: 10x smaller for monorepos (no duplication).
- Strict by default: a package can only import what it directly declares. Phantom deps fail loudly.
- Slightly slower lookup because of symlink hops (offset by content cache being warm).

### yarn berry — Plug'n'Play

No `node_modules` at all. A `.pnp.cjs` file maps every import to a zip-archive location. Resolution is a hash lookup, faster than filesystem walk, smaller disk footprint than even pnpm.

The catch: not all tools handle PnP. Webpack/Rspack support it via a resolver; some build tools, IDE integrations, and patches break. PnP works best in greenfield projects with cooperative tooling.

## Performance comparison

For a clean install of a typical React monorepo (rough numbers):

| Manager | Cold install | Warm install (cache) | Disk |
| --- | --- | --- | --- |
| npm | 45 s | 20 s | 600 MB |
| yarn classic | 30 s | 15 s | 600 MB |
| yarn berry (PnP) | 15 s | 5 s | 100 MB |
| pnpm | 20 s | 8 s | 100 MB (with shared store) |
| bun | 5 s | 1 s | 600 MB |

Bun's speed comes from a native install algorithm and aggressive parallelism. Pnpm's disk wins come from the shared store across all projects on your machine.

## Peer dependencies

The eternal source of pain. Peer deps signal "I expect my consumer to provide this package, of approximately this version range".

| Manager | Default behavior |
| --- | --- |
| npm 7+ | auto-installs peer deps |
| yarn | warns, doesn't install |
| pnpm | warns, doesn't install, surfaces conflicts loudly |

pnpm's behavior catches real bugs but feels noisy. Configure expected mismatches:

```jsonc
// package.json
{
  "pnpm": {
    "peerDependencyRules": {
      "ignoreMissing": ["react"]
    }
  }
}
```

## Engines / Node version

```jsonc
// package.json
{
  "engines": { "node": ">=20", "pnpm": ">=8" }
}
```

Combine with `.nvmrc` or `.node-version` and `corepack` to pin the manager version per project:

```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

Corepack ships with Node and is the right way to lock the package manager version per repo.

## Scripts and lifecycle hooks

All three support `scripts` in `package.json` and ship a runner:

```bash
npm run build
yarn build
pnpm build
```

pnpm adds workspace-aware runs:

```bash
pnpm -r build                   # run build in every package
pnpm --filter host build        # run in host and its deps
pnpm --filter './packages/*' build
```

## Security: pre/post install scripts

A common attack vector — a compromised package runs malicious code at install time via `preinstall` / `install` / `postinstall` scripts. Mitigations:

- npm 11+ / pnpm 10+ ignore install scripts by default. Allow specific packages explicitly.
- Yarn berry has `enableScripts: false` mode.
- Audit `npm audit` / `pnpm audit` regularly.

```jsonc
// pnpm config — allow only these to run install scripts
{
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild", "@swc/core"]
  }
}
```

## Common mistakes

- Mixing managers in the same repo. Commit one lockfile, delete the others, document which to use.
- Editing `node_modules` directly. Use `patch-package` (yarn/npm) or `pnpm patch`.
- Running `npm install` in a pnpm repo regenerates `package-lock.json` and corrupts the tree.
- Ignoring "phantom dependency" warnings — they bite the moment you switch to a stricter manager or PnP.
- Not pinning the package manager version — different teammates get different lockfile output. Use corepack.
- Setting `shamefully-hoist: true` in pnpm to "fix" peer-dep warnings — it papers over real bugs in your dependency declarations.
- Committing `node_modules/.cache` or `node_modules/.pnpm` — always gitignore the whole `node_modules`.
- Trusting bundle size on `node_modules` size — they're unrelated; the bundler picks only what you import.
