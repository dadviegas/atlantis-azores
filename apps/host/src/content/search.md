# Atlas Search

**Atlas Search** brings full-text search to your MongoDB data, powered by
Apache Lucene — no separate search cluster to operate.

## How it works

1. Define a search index on a collection
2. Atlas keeps it in sync with your documents in near-real-time
3. Query it with the `$search` aggregation stage

```js
db.products.aggregate([
  {
    $search: {
      index: "default",
      text: {
        query: "wireless headphones",
        path: ["name", "description"],
        fuzzy: { maxEdits: 1 },
      },
    },
  },
  { $limit: 20 },
]);
```

## Index definition

A minimal dynamic index — Atlas figures out the field types:

```json
{
  "mappings": { "dynamic": true }
}
```

A static index gives you full control:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name":        { "type": "string" },
      "description": { "type": "string" },
      "price":       { "type": "number" },
      "tags":        { "type": "stringFacet" }
    }
  }
}
```

> [!NOTE]
> Search indexes live separately from regular MongoDB indexes — both can
> coexist on the same collection.

> [!TIP]
> Use **facets** for filterable navigation (price ranges, brand, category) and
> **autocomplete** for type-ahead inputs.
