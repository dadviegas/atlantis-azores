# Architecture

This app is a **micro-frontend** scaffold: a shell **host** loads a remote
**micro-frontend** at runtime via Module Federation. React, ReactDOM, and the
design system are shared as singletons so a single React tree owns the page.

## Runtime topology

```mermaid
flowchart LR
  Browser([Browser])
  Host["host @ :3000"]
  Remote["remote @ :3001"]
  DS["@atlantis/design-system<br/>(MF singleton)"]
  LG["@leafygreen-ui/*"]

  Browser -->|GET /| Host
  Host -->|fetch remoteEntry.js| Remote
  Remote -->|exposes ./Button| Host
  Host -. shares .- DS
  Remote -. shares .- DS
  DS --> LG
```

## Boot sequence

```mermaid
sequenceDiagram
  autonumber
  participant B as Browser
  participant H as Host (:3000)
  participant R as Remote (:3001)

  B->>H: GET /
  H-->>B: index.html + main.js
  B->>H: import("./bootstrap")
  H->>R: GET /remoteEntry.js
  R-->>H: manifest
  H->>R: GET federated Button chunk
  R-->>H: Button.tsx (+ shared deps via MF scope)
  H->>B: ReactDOM.createRoot(#root).render(<Dashboard />)
  Note over B,H: Federated <Button /> is mounted inside a host-owned <Surface>.
```

## Build pipeline

```mermaid
flowchart TD
  TS[.ts / .tsx] -->|builtin:swc-loader| BUNDLE
  CSS[.css] -->|css/auto| BUNDLE
  MD[.md] -->|asset/source| BUNDLE
  BUNDLE[rspack] --> MF{Module Federation}
  MF --> HOST[host/dist]
  MF --> REMOTE[remote/dist]
```

## Why this layout

> [!TIP]
> Each app owns its build deps (`@rspack/*`, react, etc.) because pnpm doesn't
> hoist by default. Cross-cutting tools (ESLint, Prettier, TypeScript) live at
> the workspace root.

> [!NOTE]
> The bespoke design-system is **source-only** — apps import `.tsx` directly
> and their SWC pipeline transpiles it. No publish step, no build.
