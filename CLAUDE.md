# atlantis-azores

Monorepo using **pnpm workspaces** + **Rspack** + **Module Federation**.

- [apps/host](apps/host/) — shell app, port 3000, consumes remotes.
- [apps/remote](apps/remote/) — micro-frontend, port 3001, exposes `./Button`.

## Commands

- `pnpm install` — install all workspace deps.
- `pnpm dev` — run host and remote in parallel.
- `pnpm build` — build remote then host.
- `pnpm lint` / `pnpm lint:fix` — ESLint across the workspace.
- `pnpm format` — Prettier write.

## Engineering rules

Follow these when writing or modifying code in this repo.

### KISS — keep it simple

- Prefer the simplest solution that solves the problem in front of you.
- No speculative abstractions, config knobs, or "what if later" hooks. Add them when a second real caller appears, not before.
- A few extra lines beats a clever abstraction that hides intent.

### DRY — but only for *real* duplication

- Deduplicate logic that is genuinely the same concept and changes together.
- Do **not** deduplicate code that just *looks* similar — incidental duplication is fine and often clearer than a forced shared helper.
- Rule of thumb: extract on the third occurrence, not the second.

### YAGNI

- Don't add features, options, or exports that nothing currently uses.
- Delete dead code rather than leaving it "in case".

### Boundaries

- Cross-app contracts live at the Module Federation boundary (`exposes` in remote, `remotes` in host). Treat exposed modules as a public API: stable signatures, typed via `remote.d.ts`.
- Don't reach into a remote's internals — only consume what it exposes.

### TypeScript

- `strict` is on; keep it on. No `any` without a comment explaining why.
- Type at boundaries (exposed modules, function signatures). Let inference do the rest.

### Code style

- Default to **no comments**. Write a comment only when *why* is non-obvious — never to restate *what* the code does.
- Small functions, clear names, early returns over nested conditionals.
- Match existing patterns in the file before introducing new ones.

### Dependencies

- Each app declares its own runtime/build deps in its `package.json` (pnpm doesn't hoist by default).
- Shared tooling-only deps (eslint, prettier, typescript) live at the root.
- Don't add a dependency for something the standard library or existing deps already do.

### Before you ship

- `pnpm lint` is clean.
- `pnpm build` succeeds for both apps.
- `pnpm dev` loads http://localhost:3000 and the federated button renders.
