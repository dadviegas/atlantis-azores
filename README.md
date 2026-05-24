# atlantis-azores

A **micro-frontend** scaffold: two React + TypeScript apps built with **Rspack** and wired together at runtime via **Module Federation**, managed as a **pnpm workspace** monorepo. The host renders an Atlas-themed dashboard that composes a bespoke design system and MongoDB's LeafyGreen components, and consumes a federated panel from the remote.

```
atlantis-azores/
├── apps/
│   ├── host/             → shell app + Atlas dashboard (http://localhost:3000)
│   └── remote/           → exposes federated Button     (http://localhost:3001)
├── packages/
│   └── design-system/    → @atlantis/design-system (tokens, React primitives, Markdown, Mermaid)
├── stubs/                → browser-side stubs (e.g. @emotion/server)
├── rspack.shared.cjs     → shared Rspack config factory (SWC, CSS, MF singletons)
├── tsconfig.base.json    → shared TS compiler options
├── eslint.config.js      → flat ESLint config (workspace-wide)
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

Because pnpm doesn't hoist, each app declares its own build deps (`@rspack/*`, react, etc.). Only tooling shared across the whole repo (eslint, prettier, typescript) lives at the root.

### Rspack

[Rspack](https://rspack.dev) is a Rust-based bundler with a Webpack-compatible API. We use it for three reasons:

1. **Speed** — cold start and rebuilds are an order of magnitude faster than Webpack on the same config.
2. **Native Module Federation support** via `@module-federation/enhanced/rspack`, kept in lockstep with the MF 2.0 spec.
3. **Bundled toolchain** — `builtin:swc-loader` for TS/TSX, `css/auto` for CSS, and `asset/source` for `.md` files, all without extra deps.

The config is plain CommonJS (`.cjs`) so it loads without `"type": "module"` gymnastics. Shared config lives in [rspack.shared.cjs](rspack.shared.cjs) as a `createConfig({ name, port, federation })` factory; each app's [rspack.config.cjs](apps/host/rspack.config.cjs) is ~10 lines of differences.

The shared config also:

- Declares **MF singletons** for `react`, `react-dom`, and `@atlantis/design-system` so a single React tree owns the federated page.
- Aliases `@emotion/server/create-instance` to a browser stub at [stubs/emotion-server-create-instance.js](stubs/emotion-server-create-instance.js) — `@leafygreen-ui/emotion` unconditionally imports it for SSR critical-CSS extraction, which otherwise pulls a node-stream chain (`through`, `readable-stream`, `Buffer`) into the browser bundle.

### Module Federation

Module Federation lets separately-built bundles import code from each other **at runtime over HTTP** — no shared build step, no npm publish.

**Two roles:**

- A **remote** (`apps/remote`) builds a manifest file `remoteEntry.js` listing the modules it `exposes`. Example: `"./Button": "./src/Button.tsx"`.
- A **host** (`apps/host`) declares `remotes: { remote: "remote@http://localhost:3001/remoteEntry.js" }`. At runtime it fetches that manifest and lets code `import { mountButton } from "remote/Button"` as if it were a local module.

**Why it matters:** host and remote are deployed and versioned independently. Ship a new version of `remote` and the running host picks it up on next page load — no host rebuild. This is how teams own slices of a larger app without coordinating release trains.

The federated `mountButton(target, label)` creates a React root on the target (cached per element in a `WeakMap`, so repeat calls re-render the same root) and renders a LeafyGreen `<Button>` wrapped in `LeafyGreenProvider`. React, ReactDOM, and the design system are shared as MF singletons, so the federated chunk doesn't ship its own copy. The TS contract for the federated import lives in [apps/host/src/remote.d.ts](apps/host/src/remote.d.ts) — treat it as the public API of the remote.

### TypeScript

`strict` is on across the workspace via [tsconfig.base.json](tsconfig.base.json), which each app extends. `builtin:swc-loader` does the actual transpilation inside Rspack (faster than ts-loader, no rootDir constraints across workspace packages); there's no separate `tsc` build step in the dev loop.

### Design system

[packages/design-system/](packages/design-system/) ships as `@atlantis/design-system`. It's a **source-only** package — no build step. Apps import TSX directly; their Rspack/ts-loader pipeline transpiles it. Token CSS and base styles ship as separate stylesheet entries.

Layers:

- **Tokens** ([src/styles/tokens.css](packages/design-system/src/styles/tokens.css)) — six palettes (`cove`, `atelier`, `botanic`, `tide`, `riso`, `cabin`), light/dark via `[data-theme]`, density via `[data-density]`, font families.
- **Base + prose** ([src/styles/components.css](packages/design-system/src/styles/components.css)) — `.atlas-root` reset and `.prose` typography. Scoped so it doesn't leak into host chrome.
- **Primitives** — `Button`, `IconButton`, `Badge`, `Surface`, `Input`, `TabGroup`, `Avatar`, `Kbd`, `Callout`, `CodeBlock`, `Markdown`, `Mermaid`, plus the `Icon` set.
- **Atlas (LeafyGreen)** — MongoDB's [`@leafygreen-ui/*`](https://www.mongodb.design/) components re-exported under a subpath so they don't collide with the bespoke primitives. Starter set: `Button`, typography (`Body`, `H1`–`H3`, `Subtitle`, `Description`, `Label`), `Icon`, plus `LeafyGreenProvider`.

```ts
import { Button, Body, Icon } from "@atlantis/design-system/atlas";
```

The wrappers are pure re-exports — add another LG package to [src/atlas/index.ts](packages/design-system/src/atlas/index.ts) when you need it.

Usage from an app:

```ts
// 1. Add to deps
// pnpm --filter <app> add @atlantis/design-system react react-dom

// 2. Load styles once at app entry
import "@atlantis/design-system/styles/tokens.css";
import "@atlantis/design-system/styles/components.css";

// 3. Mount under a themed root and import components
import { Button, Markdown } from "@atlantis/design-system";
```

Then wrap your app in `<div className="atlas-root" data-palette="cove" data-theme="light" data-density="comfy">…</div>`.

### Markdown + Mermaid

`<Markdown>` wraps `react-markdown` with `remark-gfm` (tables, task lists, footnotes, GitHub alerts) and `rehype-raw` (so embedded HTML like `<mark>`, `<details>`, `<sub>` renders). It maps:

- Fenced code with `language-mermaid` → `<Mermaid>` (lazy-loads the `mermaid` library, themes itself from the active palette CSS vars, caps the SVG to ~640×360).
- Fenced code with any other language → `<CodeBlock>` (syntax-tokenized).
- GitHub-style alert blockquotes (`> [!NOTE] / [!TIP] / [!WARNING] / [!DANGER] / [!SUCCESS]`) → `<Callout>`.
- `<kbd>` → `<Kbd>`.

The `.prose` styles cover headings (h1–h6), lists (with decaying bullets for nesting), GFM task-list checkboxes, tables, blockquotes, code, `hr`, `<mark>`, `<del>`, `<details>` + `<summary>`, footnotes, and responsive images.

### The Atlas dashboard

[apps/host/src/Dashboard.tsx](apps/host/src/Dashboard.tsx) renders a themed engineering-notes site with an Atlas-style left rail and a header (theme toggle + avatar). The left rail is split into two sections, each holding areas with ~16 subtopic notes apiece:

**Languages**
- **JavaScript** — variables & scope, types & coercion, closures, `this`, prototypes, classes, async, event loop, iterators, modules, errors, collections, memory & GC, modern features, pitfalls.
- **TypeScript** — basic types, interfaces vs types, generics, narrowing, utility/mapped/conditional/template-literal types, declarations, `tsconfig`, strict mode, inference, decorators, type-level patterns, pitfalls.
- **Styles & CSS** — selectors & specificity, cascade, box model, flexbox, grid, positioning, custom properties, responsive design, container queries, typography, color, transitions/animations, logical properties, modern features (`:has`, `@layer`, `@scope`), pitfalls.

**Tooling**
- **Module Federation** — why MF, host vs remote, exposes/remotes, shared deps, versioning, TS types, runtime loading, dynamic remotes, SSR, Rspack vs Webpack, error boundaries, testing, production, plus a walkthrough of this repo.
- **Frontend Infrastructure** — bundlers landscape, Webpack vs Rspack, Vite, transpilers (Babel/SWC/tsc/esbuild), loaders & plugins, code splitting, tree shaking, source maps, assets, dev server & HMR, build perf, monorepos, package managers, CI/CD, bundle analysis.

Picking an area in the sidebar swaps the main view; a secondary nav (pill tabs) above the content lets you jump between that area's subtopics. Each subtopic is its own `.md` file under [apps/host/src/content/topics/&lt;area&gt;/](apps/host/src/content/topics/) — Rspack's `asset/source` rule turns them into strings at build time, and a per-area `_meta.ts` collects them into the `{ id, label, body }` list. [content/areas.ts](apps/host/src/content/areas.ts) groups the areas into the two sidebar sections. The Module Federation → **This repo** subtopic also embeds the federated `remote/Button` as a live demo.

State that survives reloads lives in `localStorage`:

- `atlas.theme` — `"light"` / `"dark"`
- `atlas.area` — current sidebar selection
- `atlas.subtopic` — current secondary-nav selection within the area

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
3. [bootstrap.tsx](apps/host/src/bootstrap.tsx) loads `tokens.css` + `components.css`, wraps everything in `LeafyGreenProvider`, and `createRoot(#root).render(<Dashboard />)`.
4. `<Dashboard />` renders the sidebar + main view. When the user navigates to **Module Federation → This repo**, an effect calls `mountButton(ref, "Loaded from remote@:3001")` on a host-owned `<div>`. MF runtime fetches `http://localhost:3001/remoteEntry.js`, then the chunk containing `Button.tsx`.
5. `mountButton` creates (or reuses, via `WeakMap`) a React root on the target and renders a LeafyGreen `<Button>` inside `LeafyGreenProvider`. React is loaded once via MF's shared scope.

Open both http://localhost:3000 (federated dashboard) and http://localhost:3001 (remote standalone) to see the federated component in both contexts.

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
