# Infographics

Custom fenced-code languages render as React infographic components — same
mechanism as ` ```mermaid `. Each block is **JSON**, parsed at render time.

## Stat grid

Use for KPI dashboards, summary metrics, "by the numbers" sections.

```stats
[
  { "value": "12.4k", "label": "Ops/sec",       "delta": "+4.2%", "trend": "up" },
  { "value": "312",   "label": "Connections",   "delta": "steady" },
  { "value": "48ms",  "label": "Replication lag","delta": "+12ms", "trend": "warn" },
  { "value": "99.97%","label": "Uptime (30d)",  "trend": "up",     "delta": "+0.01%" }
]
```

## Steps

Numbered process or how-to.

```steps
[
  { "title": "Provision a cluster", "body": "Pick a provider, region, and tier. Atlas spins up the replica set in a few minutes." },
  { "title": "Add a database user", "body": "SCRAM-SHA-256 credentials, scoped to the database role you need." },
  { "title": "Whitelist your IP",   "body": "Either your dev machine's IP or your app's egress range." },
  { "title": "Connect",             "body": "Grab the SRV URI from the UI and paste it into your app's connection config." }
]
```

## Comparison

Side-by-side feature compare. Highlight the recommended column with
`"highlight": true`.

```compare
[
  {
    "title": "M10",
    "badge": "Dev",
    "rows": [
      { "label": "vCPU",      "value": "2" },
      { "label": "RAM",       "value": "2 GB" },
      { "label": "Storage",   "value": "10 GB" },
      { "label": "Backups",   "value": "—" },
      { "label": "Auto-scale","value": "No" }
    ]
  },
  {
    "title": "M30",
    "badge": "Recommended",
    "highlight": true,
    "rows": [
      { "label": "vCPU",      "value": "2" },
      { "label": "RAM",       "value": "8 GB" },
      { "label": "Storage",   "value": "40 GB" },
      { "label": "Backups",   "value": "Continuous" },
      { "label": "Auto-scale","value": "Yes" }
    ]
  },
  {
    "title": "M50",
    "badge": "Production",
    "rows": [
      { "label": "vCPU",      "value": "4" },
      { "label": "RAM",       "value": "16 GB" },
      { "label": "Storage",   "value": "160 GB" },
      { "label": "Backups",   "value": "Continuous + PIT" },
      { "label": "Auto-scale","value": "Yes" }
    ]
  }
]
```

## Progress meters

Capacity / quota / utilization visualizations.

```meters
[
  { "label": "Storage used",      "value": 72,  "tone": "primary", "caption": "29 GB of 40 GB" },
  { "label": "Active connections","value": 312, "max": 500, "tone": "info" },
  { "label": "Index build",       "value": 100, "tone": "ok",      "caption": "Completed in 4m 12s" },
  { "label": "Backup quota",      "value": 94,  "tone": "warn",    "caption": "Nearing soft limit" },
  { "label": "Error rate",        "value": 8,   "tone": "danger",  "caption": "Above 5% threshold" }
]
```

## Key-value grid

For specs, metadata, "at a glance" facts.

```keyvalue
[
  { "k": "Tier",          "v": "M30" },
  { "k": "Provider",      "v": "AWS · us-east-1" },
  { "k": "MongoDB version","v": "7.0.5" },
  { "k": "Replica set",   "v": "3 nodes" },
  { "k": "Backup",        "v": "Continuous Cloud Backup" },
  { "k": "Encryption",    "v": "AES-256 at rest" }
]
```

## Quote

Pull quotes from docs, customer testimonials, or callouts from an author.

```quote
{
  "text": "Module Federation lets teams ship slices of an application independently — no shared release train, no monolithic bundle.",
  "by":   "Zack Jackson",
  "role": "creator of Module Federation"
}
```
