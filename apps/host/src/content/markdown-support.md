# Markdown support

This page is rendered by `@atlantis/design-system`'s `<Markdown />` component
(`react-markdown` + `remark-gfm`, with custom renderers for code, callouts, and `kbd`).

## Inline formatting

You get the usual: **bold**, *italic*, ~~strikethrough~~, `inline code`, and
[links](https://www.mongodb.com/atlas).

## Headings

### Level 3
#### Level 4
##### Level 5

## Lists

Unordered:

- Clusters
- Search indexes
- Triggers
  - Database triggers
  - Scheduled triggers

Ordered:

1. Provision a cluster
2. Add a database user
3. Connect from your app

Task list (GFM):

- [x] Create project
- [x] Add network access
- [ ] Configure backup policy

## Tables (GFM)

| Tier  | vCPU | RAM   | Storage |
| ----- | ---- | ----- | ------- |
| M10   | 2    | 2 GB  | 10 GB   |
| M30   | 2    | 8 GB  | 40 GB   |
| M50   | 4    | 16 GB | 160 GB  |

## Code blocks

Fenced code with a language tag renders through `<CodeBlock />` with syntax
tokens:

```ts
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.ATLAS_URI!);
await client.connect();
const docs = await client.db("app").collection("orders").find({}).toArray();
```

```bash
atlas clusters create my-cluster \
  --provider AWS \
  --region US_EAST_1 \
  --tier M10
```

## Callouts

Use GitHub-style alert blockquotes — they map to `<Callout />`:

> [!NOTE]
> Connections from your app should always go through the SRV connection string.

> [!TIP]
> Use a compound index on `{ userId: 1, createdAt: -1 }` to speed up the
> "recent orders for a user" query pattern.

> [!WARNING]
> Pausing a cluster stops billing for compute, but storage charges continue.

> [!DANGER]
> Deleting a cluster is irreversible. Make sure you have a snapshot.

> [!SUCCESS]
> Deployment completed. Replica set is healthy across all three nodes.

## Keyboard

Press <kbd>Cmd</kbd> + <kbd>K</kbd> to open the command palette.

## Blockquote (plain)

> Atlas is a fully managed cloud database service. You worry about the data,
> we worry about the infrastructure.
