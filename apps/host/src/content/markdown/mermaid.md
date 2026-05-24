# Mermaid diagrams

Fenced blocks tagged ` ```mermaid ` are detected by `<Markdown />` and routed
to the `<Mermaid />` component, which lazy-loads the `mermaid` library and
renders the diagram as SVG. The diagram picks up the active palette via the
`data-theme` on the surrounding `atlas-root`.

## Flowchart

```mermaid
flowchart LR
  A[Client] -->|connect| B((SRV))
  B --> C[(Primary)]
  C --> D[(Secondary)]
  C --> E[(Secondary)]
  D -.replicate.-> C
  E -.replicate.-> C
```

## Sequence diagram

```mermaid
sequenceDiagram
  participant App
  participant Atlas
  participant Cluster
  App->>Atlas: GET /clusters
  Atlas->>Cluster: status?
  Cluster-->>Atlas: healthy
  Atlas-->>App: 200 OK
```

## State diagram

```mermaid
stateDiagram-v2
  [*] --> Provisioning
  Provisioning --> Active: ready
  Active --> Paused: pause
  Paused --> Active: resume
  Active --> Terminated: delete
  Terminated --> [*]
```
