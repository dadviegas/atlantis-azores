# atlantis-azores

A minimal **micro-frontend** scaffold: two TypeScript apps built with **Rspack** and wired together at runtime via **Module Federation**, managed as a **pnpm workspace** monorepo.

```
atlantis-azores/
├── apps/
│   ├── host/      → shell app    (http://localhost:3000)
│   └── remote/    → exposes UI   (http://localhost:3001)
├── rspack.shared.cjs   → shared Rspack config factory
├── tsconfig.base.json  → shared TS compiler options
├── eslint.config.js    → flat ESLint config (workspace-wide)
└── pnpm-workspace.yaml
```

---

## The tech, piece by piece

### pnpm workspaces

The repo is a monorepo: one git repo, multiple independently-versioned packages under [apps/](apps/). [pnpm-workspace.yaml](pnpm-workspace.yaml) tells pnpm which directories are workspace members.

Why pnpm over npm/yarn:
- **Disk-efficient**: dependencies are hard-linked from a content-addressed store, not copied per project.
- **Strict by default**: a package can only import what it explicitly declares in its `package.json` — no accidental reliance on hoisted deps.
- **Fast** workspace-aware scripts: `pnpm -r --parallel run dev` runs `dev` in every package at once.

Because pnpm doesn't hoist, each app declares its own build deps (`@rspack/*`, `ts-loader`, etc.). Only tooling shared across the whole repo (eslint, prettier, typescript) lives at the root.

### Rspack

[Rspack](https://rspack.dev) is a Rust-based bundler with a Webpack-compatible API. We use it for two reasons:

1. **Speed** — cold start and rebuilds are an order of magnitude faster than Webpack on the same config.
2. **Native Module Federation support** via `@module-federation/enhanced/rspack`, kept in lockstep with the MF 2.0 spec.

The config is plain CommonJS (`.cjs`) so it loads without `"type": "module"` gymnastics. Shared config lives in [rspack.shared.cjs](rspack.shared.cjs) as a `createConfig({ name, port, federation })` factory; each app's [rspack.config.cjs](apps/host/rspack.config.cjs) is ~10 lines of differences.

### Module Federation

Module Federation lets separately-built bundles import code from each other **at runtime over HTTP** — no shared build step, no npm publish.

**Two roles:**

- A **remote** (`apps/remote`) builds a manifest file `remoteEntry.js` listing the modules it `exposes`. Example: `"./Button": "./src/Button.ts"`.
- A **host** (`apps/host`) declares `remotes: { remote: "remote@http://localhost:3001/remoteEntry.js" }`. At runtime it fetches that manifest and lets code `import { mountButton } from "remote/Button"` as if it were a local module.

**Why it matters:** host and remote are deployed and versioned independently. Ship a new version of `remote` and the running host picks it up on next page load — no host rebuild. This is how teams own slices of a larger app without coordinating release trains.

The TS contract for the federated import lives in [apps/host/src/remote.d.ts](apps/host/src/remote.d.ts) — treat it as the public API of the remote.

### TypeScript

`strict` is on across the workspace via [tsconfig.base.json](tsconfig.base.json), which each app extends. `ts-loader` compiles inside Rspack; there's no separate `tsc` build step in the dev loop.

### ESLint + Prettier

Flat config ([eslint.config.js](eslint.config.js)) at the root covers all workspace packages. Prettier handles formatting; ESLint handles correctness. Run `pnpm lint` / `pnpm format` from the root.

---

## Commands

```bash
pnpm install        # install all workspace deps
pnpm dev            # run host (:3000) and remote (:3001) in parallel
pnpm dev:host       # just the host
pnpm dev:remote     # just the remote
pnpm build          # build remote then host
pnpm lint           # ESLint across the workspace
pnpm format         # Prettier write
```

On `pnpm dev` each app prints a banner with its URL once its dev server is listening.

---

## How a request flows

1. Browser hits `http://localhost:3000/` → host's `index.html` loads.
2. Host bundle boots ([apps/host/src/index.ts](apps/host/src/index.ts)) and dynamically imports `./bootstrap` (required by MF so shared deps can initialize first).
3. `bootstrap.ts` does `import { mountButton } from "remote/Button"`. MF runtime fetches `http://localhost:3001/remoteEntry.js`, then the chunk containing `Button.ts`.
4. `mountButton` runs in the host's page and appends a `<button>` to `#root`.

Open both http://localhost:3000 (federated) and http://localhost:3001 (remote standalone) to see the same component in both contexts.

---

## Adding a new remote

1. `cp -R apps/remote apps/<new-remote>` and update its `package.json` name and `rspack.config.cjs` port + `exposes`.
2. Add it to [pnpm-workspace.yaml](pnpm-workspace.yaml) — already covered by `apps/*`.
3. In the host's [rspack.config.cjs](apps/host/rspack.config.cjs), add an entry to `remotes`.
4. Declare the import shape in `apps/host/src/<name>.d.ts`.
5. `pnpm install` then `pnpm dev`.

---

## Engineering rules

See [CLAUDE.md](CLAUDE.md) — KISS, DRY-on-third-occurrence, YAGNI, MF boundary discipline, strict TS, minimal comments.
