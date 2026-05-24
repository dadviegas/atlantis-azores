# Lists

## Unordered

- Clusters
- Search indexes
- Triggers
  - Database triggers
  - Scheduled triggers
  - Authentication triggers

## Ordered

1. Provision a cluster
2. Add a database user
3. Whitelist your IP
4. Connect from your app

## Task list (GFM)

- [x] Create project
- [x] Add network access
- [ ] Configure backup policy
- [ ] Enable Atlas Search

## Footnotes (GFM)

Atlas runs on AWS, GCP, and Azure[^providers]. Multi-region deployments are
supported across all three[^regions].

[^providers]: All three are first-class — same API surface across providers.
[^regions]: Cross-region replication adds latency; check the placement guide.
