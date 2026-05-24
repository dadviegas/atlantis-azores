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

## Mind map

Mermaid mind maps are great for showing concept maps and feature trees.

```mermaid
mindmap
  root((Atlas))
    Database
      Clusters
      Backup
      Performance Advisor
    Search
      Indexes
      Autocomplete
      Facets
    App Services
      Triggers
      Functions
    Charts
      Dashboards
      Embedded
```

## Quadrant chart

A 2×2 positioning chart — useful for prioritization.

```mermaid
quadrantChart
  title Cluster tiers by cost vs throughput
  x-axis Low cost --> High cost
  y-axis Low throughput --> High throughput
  quadrant-1 Premium
  quadrant-2 Overprovisioned
  quadrant-3 Starter
  quadrant-4 Efficient
  M0: [0.1, 0.1]
  M10: [0.25, 0.3]
  M30: [0.45, 0.6]
  M50: [0.65, 0.8]
  M80: [0.85, 0.92]
```

## Pie chart

```mermaid
pie title Workload mix
  "Reads"  : 62
  "Writes" : 23
  "Search" : 10
  "Other"  :  5
```

## Entity-relationship (documents)

ER diagrams describe document schemas and the relationships between collections.

```mermaid
erDiagram
  USER ||--o{ ORDER : places
  USER {
    string _id
    string email
    string name
    date   createdAt
  }
  ORDER ||--|{ LINE_ITEM : contains
  ORDER {
    string _id
    string userId
    number total
    string status
  }
  LINE_ITEM {
    string sku
    number qty
    number priceCents
  }
  PRODUCT ||--o{ LINE_ITEM : "sold as"
  PRODUCT {
    string sku
    string name
    number priceCents
  }
```

## User journey

```mermaid
journey
  title Onboard a new Atlas project
  section Setup
    Create project: 5: Dev
    Add team:       4: Dev, Admin
  section Cluster
    Provision M10:  3: Dev
    Whitelist IP:   2: Dev
  section Ship
    Connect app:    5: Dev
    Monitor:        4: Dev, SRE
```

## Timeline

```mermaid
timeline
  title Atlas project milestones
  2024-Q1 : Project created
          : First M10 cluster
  2024-Q2 : Search enabled
          : Charts dashboards
  2024-Q3 : Multi-region rollout
  2024-Q4 : Triggers + serverless
```
