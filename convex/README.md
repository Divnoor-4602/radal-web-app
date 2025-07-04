# Convex Functions

This directory contains your Convex backend functions.

## Getting Started

Write your Convex functions here. See [Convex Functions Documentation](https://docs.convex.dev/functions) for more details.

## Function Types

### Query Functions

Query functions read data from the database:

```ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getItems = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("items").take(args.limit);
    return items;
  },
});
```

### Mutation Functions

Mutation functions modify data in the database:

```ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createItem = mutation({
  args: {
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("items", {
      name: args.name,
      description: args.description,
    });
    return id;
  },
});
```

## Usage in React Components

```ts
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function MyComponent() {
  const items = useQuery(api.functions.getItems, { limit: 10 });
  const createItem = useMutation(api.functions.createItem);

  const handleCreate = () => {
    createItem({ name: "New Item", description: "Description" });
  };

  return (
    <div>
      {items?.map((item) => (
        <div key={item._id}>{item.name}</div>
      ))}
      <button onClick={handleCreate}>Create Item</button>
    </div>
  );
}
```

## CLI Commands

- `npx convex dev` - Start development server
- `npx convex deploy` - Deploy to production
- `npx convex docs` - Open documentation
