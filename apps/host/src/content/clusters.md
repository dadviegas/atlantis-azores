# Clusters

An **Atlas cluster** is a deployment of MongoDB managed by Atlas. Each cluster
runs as a replica set (or sharded cluster) across multiple availability zones
in the cloud provider of your choice.

## Tiers

| Tier  | Use case                      | Notes                                  |
| ----- | ----------------------------- | -------------------------------------- |
| M0    | Learning, demos               | Free, shared, 512 MB                   |
| M10   | Small apps, dev/staging       | Dedicated, 2 GB RAM                    |
| M30   | Production workloads          | 8 GB RAM, auto-scaling supported       |
| M50+  | High-throughput production    | Dedicated NVMe, sharding recommended   |

## Lifecycle

1. **Create** — pick provider, region, tier
2. **Connect** — whitelist IP, add user, copy SRV URI
3. **Operate** — monitor metrics, set alerts
4. **Scale** — vertical (tier) or horizontal (sharding)

```bash
atlas clusters create prod-orders \
  --provider AWS \
  --region US_EAST_1 \
  --tier M30 \
  --diskSizeGB 40
```

> [!TIP]
> Enable **cluster auto-scaling** for variable workloads — Atlas will scale
> compute up and down within bounds you define, and you only pay for what's
> active.

> [!WARNING]
> Changing the cluster tier triggers a rolling restart. Plan around your peak
> traffic windows.
