import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all models for a project
export const getModelsByProject = query({
  args: { projectId: v.id("projects") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("models")
      .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

// Get a specific model by ID
export const getModelById = query({
  args: { modelId: v.id("models") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.modelId);
  },
});

// Create a new model
export const createModel = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    modelId: v.union(v.literal("phi-2")),
    quant: v.union(v.literal("int4"), v.literal("int8"), v.literal("fp16")),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("ready"), v.literal("error")),
    ),
  },
  returns: v.id("models"),
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("models", {
      projectId: args.projectId,
      userId: args.userId,
      title: args.title,
      description: args.description,
      modelId: args.modelId,
      quant: args.quant,
      status: args.status || "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update model status
export const updateModelStatus = mutation({
  args: {
    modelId: v.id("models"),
    status: v.union(v.literal("draft"), v.literal("ready"), v.literal("error")),
    errorMessage: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.modelId, {
      status: args.status,
      errorMessage: args.errorMessage,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Get models by user
export const getModelsByUser = query({
  args: { userId: v.id("users") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("models")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});
