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

## Collapsible details

Use `<details>` + `<summary>` to hide secondary content behind a disclosure.

<details>
<summary>What happens during a tier change?</summary>

Atlas performs a rolling upgrade across replica set members:

1. Sync the new node from the primary
2. Step down and promote the new node
3. Repeat for remaining secondaries

Total time depends on data size; expect a few minutes per node on M30+.
</details>

<details>
<summary>How is backup billed?</summary>

Continuous Cloud Backups are billed per GB of snapshot storage. Pausing the
cluster does **not** pause backup storage charges.
</details>
