# Callouts

GitHub-style alert blockquotes are recognized and mapped to the design
system's `<Callout />` component.

> [!NOTE]
> Connections from your app should always go through the SRV connection string
> so failover works without code changes.

> [!TIP]
> Use a compound index on `{ userId: 1, createdAt: -1 }` to speed up the
> "recent orders for a user" query pattern.

> [!WARNING]
> Pausing a cluster stops billing for compute, but storage charges continue.

> [!DANGER]
> Deleting a cluster is irreversible. Make sure you have a snapshot first.

> [!SUCCESS]
> Deployment completed. Replica set is healthy across all three nodes.

Plain blockquotes without an alert directive render as regular blockquotes:

> Atlas is a fully managed cloud database service. You worry about the data,
> we worry about the infrastructure.
