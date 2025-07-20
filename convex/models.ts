import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all models for a project
export const getModelsByProject = query({
  args: { projectId: v.id("projects") },
  returns: v.array(
    v.object({
      _id: v.id("models"),
      projectId: v.id("projects"),
      userId: v.id("users"),
      title: v.string(),
      baseModelDetails: v.object({
        modelId: v.union(v.literal("microsoft/phi-2")),
        displayName: v.string(),
        provider: v.string(),
        parameters: v.string(),
        huggingFaceUrl: v.string(),
      }),
      datasetIds: v.array(v.id("datasets")),
      trainingConfig: v.object({
        epochs: v.number(),
        batch_size: v.number(),
        train_quant: v.union(v.literal("int4"), v.literal("int8")),
        download_quant: v.union(v.literal("int4"), v.literal("int8")),
      }),
      modelDownloadUrl: v.optional(v.string()),
      status: v.union(
        v.literal("draft"),
        v.literal("training"),
        v.literal("converting"),
        v.literal("ready"),
        v.literal("error"),
      ),
      jobId: v.optional(v.string()),
      errorMessage: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      _creationTime: v.number(),
    }),
  ),
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
  returns: v.union(
    v.object({
      _id: v.id("models"),
      projectId: v.id("projects"),
      userId: v.id("users"),
      title: v.string(),
      baseModelDetails: v.object({
        modelId: v.union(v.literal("microsoft/phi-2")),
        displayName: v.string(),
        provider: v.string(),
        parameters: v.string(),
        huggingFaceUrl: v.string(),
      }),
      datasetIds: v.array(v.id("datasets")),
      trainingConfig: v.object({
        epochs: v.number(),
        batch_size: v.number(),
        train_quant: v.union(v.literal("int4"), v.literal("int8")),
        download_quant: v.union(v.literal("int4"), v.literal("int8")),
      }),
      modelDownloadUrl: v.optional(v.string()),
      trainingGraph: v.optional(
        v.object({
          schema_version: v.optional(v.number()),
          nodes: v.record(v.string(), v.any()),
          edges: v.array(v.any()),
        }),
      ),
      status: v.union(
        v.literal("draft"),
        v.literal("training"),
        v.literal("converting"),
        v.literal("ready"),
        v.literal("error"),
      ),
      jobId: v.optional(v.string()),
      errorMessage: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      _creationTime: v.number(),
    }),
    v.null(),
  ),
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
    baseModelDetails: v.object({
      modelId: v.union(v.literal("microsoft/phi-2")),
      displayName: v.string(),
      provider: v.string(),
      parameters: v.string(),
      huggingFaceUrl: v.string(),
    }),
    datasetIds: v.array(v.id("datasets")),
    trainingConfig: v.object({
      epochs: v.number(),
      batch_size: v.number(),
      train_quant: v.union(v.literal("int4"), v.literal("int8")),
      download_quant: v.union(v.literal("int4"), v.literal("int8")),
    }),
    trainingGraph: v.optional(
      v.object({
        schema_version: v.optional(v.number()),
        nodes: v.record(v.string(), v.any()),
        edges: v.array(v.any()),
      }),
    ),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("training"),
        v.literal("converting"),
        v.literal("ready"),
        v.literal("error"),
      ),
    ),
  },
  returns: v.id("models"),
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("models", {
      projectId: args.projectId,
      userId: args.userId,
      title: args.title,
      baseModelDetails: args.baseModelDetails,
      datasetIds: args.datasetIds,
      trainingConfig: args.trainingConfig,
      trainingGraph: args.trainingGraph,
      status: args.status || "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update model status and related fields
export const updateModelStatus = mutation({
  args: {
    modelId: v.id("models"),
    status: v.union(
      v.literal("draft"),
      v.literal("training"),
      v.literal("converting"),
      v.literal("ready"),
      v.literal("error"),
    ),
    errorMessage: v.optional(v.string()),
    jobId: v.optional(v.string()),
    modelDownloadUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updateData: {
      status: "draft" | "training" | "converting" | "ready" | "error";
      updatedAt: number;
      errorMessage?: string;
      jobId?: string;
      modelDownloadUrl?: string;
    } = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.errorMessage !== undefined) {
      updateData.errorMessage = args.errorMessage;
    }
    if (args.jobId !== undefined) {
      updateData.jobId = args.jobId;
    }
    if (args.modelDownloadUrl !== undefined) {
      updateData.modelDownloadUrl = args.modelDownloadUrl;
    }

    await ctx.db.patch(args.modelId, updateData);

    return null;
  },
});

// Update model training graph
export const updateModelTrainingGraph = mutation({
  args: {
    modelId: v.id("models"),
    trainingGraph: v.object({
      schema_version: v.optional(v.number()),
      nodes: v.record(v.string(), v.any()),
      edges: v.array(v.any()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.modelId, {
      trainingGraph: args.trainingGraph,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Get models by user
export const getModelsByUser = query({
  args: { userId: v.id("users") },
  returns: v.array(
    v.object({
      _id: v.id("models"),
      projectId: v.id("projects"),
      userId: v.id("users"),
      title: v.string(),
      baseModelDetails: v.object({
        modelId: v.union(v.literal("microsoft/phi-2")),
        displayName: v.string(),
        provider: v.string(),
        parameters: v.string(),
        huggingFaceUrl: v.string(),
      }),
      datasetIds: v.array(v.id("datasets")),
      trainingConfig: v.object({
        epochs: v.number(),
        batch_size: v.number(),
        train_quant: v.union(v.literal("int4"), v.literal("int8")),
        download_quant: v.union(v.literal("int4"), v.literal("int8")),
      }),
      modelDownloadUrl: v.optional(v.string()),
      status: v.union(
        v.literal("draft"),
        v.literal("training"),
        v.literal("converting"),
        v.literal("ready"),
        v.literal("error"),
      ),
      jobId: v.optional(v.string()),
      errorMessage: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      _creationTime: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("models")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get models by job ID
export const getModelByJobId = query({
  args: { jobId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("models"),
      projectId: v.id("projects"),
      userId: v.id("users"),
      title: v.string(),
      baseModelDetails: v.object({
        modelId: v.union(v.literal("microsoft/phi-2")),
        displayName: v.string(),
        provider: v.string(),
        parameters: v.string(),
        huggingFaceUrl: v.string(),
      }),
      datasetIds: v.array(v.id("datasets")),
      trainingConfig: v.object({
        epochs: v.number(),
        batch_size: v.number(),
        train_quant: v.union(v.literal("int4"), v.literal("int8")),
        download_quant: v.union(v.literal("int4"), v.literal("int8")),
      }),
      modelDownloadUrl: v.optional(v.string()),
      trainingGraph: v.optional(
        v.object({
          schema_version: v.optional(v.number()),
          nodes: v.record(v.string(), v.any()),
          edges: v.array(v.any()),
        }),
      ),
      status: v.union(
        v.literal("draft"),
        v.literal("training"),
        v.literal("converting"),
        v.literal("ready"),
        v.literal("error"),
      ),
      jobId: v.optional(v.string()),
      errorMessage: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      _creationTime: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("models")
      .filter((q) => q.eq(q.field("jobId"), args.jobId))
      .unique();
  },
});
