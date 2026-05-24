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

## Bar + line chart

`xychart-beta` supports bar, line, or both layered. Great for showing throughput
vs latency, request volume, or any time-series.

```mermaid
xychart-beta
  title "Cluster operations (ops/sec)"
  x-axis [mon, tue, wed, thu, fri, sat, sun]
  y-axis "Ops/sec (k)" 0 --> 15
  bar [8.2, 9.1, 10.4, 12.4, 11.8, 6.3, 5.1]
  line [8.2, 9.1, 10.4, 12.4, 11.8, 6.3, 5.1]
```

## Line chart

```mermaid
xychart-beta
  title "P95 query latency (ms)"
  x-axis [00, 04, 08, 12, 16, 20, 24]
  y-axis "Latency (ms)" 0 --> 250
  line [42, 38, 65, 180, 220, 140, 55]
```

## Bar chart

```mermaid
xychart-beta
  title "Connections per region"
  x-axis [us-east-1, us-west-2, eu-west-1, ap-south-1]
  y-axis "Connections" 0 --> 400
  bar [312, 184, 96, 41]
```

## Gantt chart

Project timelines and dependencies — useful for roadmaps and release planning.

```mermaid
gantt
  title Atlas migration plan
  dateFormat YYYY-MM-DD
  section Prep
    Audit existing schema   :a1, 2026-01-05, 7d
    Draft index strategy    :a2, after a1, 5d
  section Cutover
    Provision M30 cluster   :b1, after a2, 2d
    Backfill data           :b2, after b1, 4d
    Switch read traffic     :b3, after b2, 1d
    Switch write traffic    :b4, after b3, 1d
  section Cleanup
    Decommission old DB     :c1, after b4, 3d
```

## Git graph

Visualize branching strategies, release flows, hotfixes.

```mermaid
gitGraph
  commit id: "init"
  branch develop
  checkout develop
  commit id: "feat: auth"
  commit id: "feat: orders"
  checkout main
  merge develop tag: "v0.1.0"
  branch hotfix
  commit id: "fix: index"
  checkout main
  merge hotfix tag: "v0.1.1"
  checkout develop
  merge main
  commit id: "feat: search"
```

## Sankey (flow)

Show how a quantity splits across stages — perfect for traffic flow, build
pipelines, or funnel analysis.

```mermaid
sankey-beta
  Browser,Host,1000
  Host,Cache hit,640
  Host,Atlas,360
  Atlas,Primary,360
  Primary,Read,290
  Primary,Write,70
```

## Class diagram

Useful for explaining APIs, data models, or framework internals.

```mermaid
classDiagram
  class Cluster {
    +String id
    +String tier
    +String region
    +start()
    +pause()
    +scale(tier)
  }
  class ReplicaSet {
    +Node primary
    +Node[] secondaries
    +failover()
  }
  class Node {
    +String host
    +String role
    +Number lagMs
  }
  Cluster "1" --> "1" ReplicaSet
  ReplicaSet "1" --> "many" Node
```
