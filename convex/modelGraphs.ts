import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a model graph
export const createModelGraph = mutation({
  args: {
    modelId: v.id("models"),
    projectId: v.id("projects"),
    userId: v.id("users"),
    nodes: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        position: v.object({
          x: v.number(),
          y: v.number(),
        }),
        data: v.any(),
        measured: v.optional(
          v.object({
            width: v.number(),
            height: v.number(),
          }),
        ),
        selected: v.optional(v.boolean()),
        dragging: v.optional(v.boolean()),
      }),
    ),
    edges: v.array(
      v.object({
        id: v.string(),
        source: v.string(),
        target: v.string(),
        sourceHandle: v.optional(v.string()),
        targetHandle: v.optional(v.string()),
        type: v.optional(v.string()),
        animated: v.optional(v.boolean()),
      }),
    ),
    viewport: v.object({
      x: v.number(),
      y: v.number(),
      zoom: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("modelGraphs", {
      modelId: args.modelId,
      projectId: args.projectId,
      userId: args.userId,
      nodes: args.nodes,
      edges: args.edges,
      viewport: args.viewport,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get model graph by model ID
export const getModelGraphByModelId = query({
  args: { modelId: v.id("models") },
  returns: v.union(
    v.object({
      _id: v.id("modelGraphs"),
      modelId: v.id("models"),
      projectId: v.id("projects"),
      userId: v.id("users"),
      nodes: v.array(v.any()),
      edges: v.array(v.any()),
      viewport: v.object({
        x: v.number(),
        y: v.number(),
        zoom: v.number(),
      }),
      createdAt: v.number(),
      updatedAt: v.number(),
      _creationTime: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("modelGraphs")
      .withIndex("byModel", (q) => q.eq("modelId", args.modelId))
      .first();
  },
});
