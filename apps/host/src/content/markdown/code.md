# Code blocks

Inline `code` uses a monospace pill. Fenced blocks with a language tag are
rendered through `<CodeBlock />` with syntax tokens.

```ts
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.ATLAS_URI!);
await client.connect();

const orders = client.db("app").collection("orders");
const recent = await orders
  .find({ userId })
  .sort({ createdAt: -1 })
  .limit(20)
  .toArray();
```

```bash
atlas clusters create my-cluster \
  --provider AWS \
  --region US_EAST_1 \
  --tier M10
```

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name":  { "type": "string" },
      "price": { "type": "number" }
    }
  }
}
```

Unknown languages fall back to a plain `<code>` block:

```
plain text — no highlighting
```
