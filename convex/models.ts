import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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
        modelId: v.union(
          v.literal("microsoft/phi-2"),
          v.literal("microsoft/Phi-3-mini-4k-instruct"),
          v.literal("microsoft/Phi-3.5-mini-instruct"),
          v.literal("meta-llama/Llama-3.2-3B-Instruct"),
          v.literal("meta-llama/Llama-3.2-1B-Instruct"),
          v.literal("microsoft/DialoGPT-small"),
        ),
        displayName: v.string(),
        provider: v.string(),
        parameters: v.string(),
      }),
      datasetIds: v.array(v.id("datasets")),
      trainingConfig: v.object({
        epochs: v.number(),
        batch_size: v.number(),
        train_quant: v.union(v.literal("int4"), v.literal("int8")),
        download_quant: v.union(v.literal("int4"), v.literal("int8")),
      }),
      modelDownloadUrl: v.optional(v.string()),
      repoId: v.optional(v.string()),
      trainingGraph: v.optional(
        v.object({
          schema_version: v.optional(v.number()),
          nodes: v.record(v.string(), v.any()),
          edges: v.array(v.any()),
        }),
      ),
      status: v.union(
        v.literal("pending"),
        v.literal("training"),
        v.literal("converting"),
        v.literal("ready"),
        v.literal("failed"),
      ),
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
        modelId: v.union(
          v.literal("microsoft/phi-2"),
          v.literal("microsoft/Phi-3-mini-4k-instruct"),
          v.literal("microsoft/Phi-3.5-mini-instruct"),
          v.literal("meta-llama/Llama-3.2-3B-Instruct"),
          v.literal("meta-llama/Llama-3.2-1B-Instruct"),
          v.literal("microsoft/DialoGPT-small"),
        ),
        displayName: v.string(),
        provider: v.string(),
        parameters: v.string(),
      }),
      datasetIds: v.array(v.id("datasets")),
      trainingConfig: v.object({
        epochs: v.number(),
        batch_size: v.number(),
        train_quant: v.union(v.literal("int4"), v.literal("int8")),
        download_quant: v.union(v.literal("int4"), v.literal("int8")),
      }),
      modelDownloadUrl: v.optional(v.string()),
      repoId: v.optional(v.string()),
      trainingGraph: v.optional(
        v.object({
          schema_version: v.optional(v.number()),
          nodes: v.record(v.string(), v.any()),
          edges: v.array(v.any()),
        }),
      ),
      status: v.union(
        v.literal("pending"),
        v.literal("training"),
        v.literal("converting"),
        v.literal("ready"),
        v.literal("failed"),
      ),
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
      modelId: v.union(
        v.literal("microsoft/phi-2"),
        v.literal("microsoft/Phi-3-mini-4k-instruct"),
        v.literal("microsoft/Phi-3.5-mini-instruct"),
        v.literal("meta-llama/Llama-3.2-3B-Instruct"),
        v.literal("meta-llama/Llama-3.2-1B-Instruct"),
        v.literal("microsoft/DialoGPT-small"),
      ),
      displayName: v.string(),
      provider: v.string(),
      parameters: v.string(),
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
        v.literal("pending"),
        v.literal("training"),
        v.literal("converting"),
        v.literal("ready"),
        v.literal("failed"),
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
      status: args.status || "pending",
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
      v.literal("pending"),
      v.literal("training"),
      v.literal("converting"),
      v.literal("ready"),
      v.literal("failed"),
    ),
    errorMessage: v.optional(v.string()),
    modelDownloadUrl: v.optional(v.string()),
    repoId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updateData: {
      status: "pending" | "training" | "converting" | "ready" | "failed";
      updatedAt: number;
      errorMessage?: string;
      modelDownloadUrl?: string;
      repoId?: string;
    } = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.errorMessage !== undefined) {
      updateData.errorMessage = args.errorMessage;
    }
    if (args.modelDownloadUrl !== undefined) {
      updateData.modelDownloadUrl = args.modelDownloadUrl;
    }
    if (args.repoId !== undefined) {
      updateData.repoId = args.repoId;
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
        modelId: v.union(
          v.literal("microsoft/phi-2"),
          v.literal("microsoft/Phi-3-mini-4k-instruct"),
          v.literal("microsoft/Phi-3.5-mini-instruct"),
          v.literal("meta-llama/Llama-3.2-3B-Instruct"),
          v.literal("meta-llama/Llama-3.2-1B-Instruct"),
          v.literal("microsoft/DialoGPT-small"),
        ),
        displayName: v.string(),
        provider: v.string(),
        parameters: v.string(),
      }),
      datasetIds: v.array(v.id("datasets")),
      trainingConfig: v.object({
        epochs: v.number(),
        batch_size: v.number(),
        train_quant: v.union(v.literal("int4"), v.literal("int8")),
        download_quant: v.union(v.literal("int4"), v.literal("int8")),
      }),
      modelDownloadUrl: v.optional(v.string()),
      repoId: v.optional(v.string()),
      status: v.union(
        v.literal("pending"),
        v.literal("training"),
        v.literal("converting"),
        v.literal("ready"),
        v.literal("failed"),
      ),
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

// Get model stats for project dashboard (count and latest status)
export const getModelStatsForProject = query({
  args: { projectId: v.id("projects") },
  returns: v.object({
    totalCount: v.number(),
    latestModelStatus: v.union(
      v.literal("pending"),
      v.literal("training"),
      v.literal("converting"),
      v.literal("ready"),
      v.literal("failed"),
      v.literal("none"),
    ),
  }),
  handler: async (ctx, args) => {
    const models = await ctx.db
      .query("models")
      .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    const totalCount = models.length;

    if (totalCount === 0) {
      return {
        totalCount: 0,
        latestModelStatus: "none" as const,
      };
    }

    // Get the latest model (first in desc order)
    const latestModel = models[0];

    return {
      totalCount,
      latestModelStatus: latestModel.status,
    };
  },
});

// Get recent model for project dashboard (for currently training card)
export const getRecentModelForProject = query({
  args: { projectId: v.id("projects") },
  returns: v.union(
    v.object({
      modelName: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("training"),
        v.literal("converting"),
        v.literal("ready"),
        v.literal("failed"),
      ),
      title: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const models = await ctx.db
      .query("models")
      .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(1);

    if (models.length === 0) {
      return null;
    }

    const recentModel = models[0];

    return {
      modelName: recentModel.baseModelDetails.displayName,
      status: recentModel.status,
      title: recentModel.title,
    };
  },
});

// ACTION WRAPPER: External HTTP API endpoint for updating model status => JOB REPLACEMENT
// This wraps the updateModelStatus mutation so it can be called via /api/setModelMetadata
export const setModelMetadata = action({
  args: {
    trainingId: v.string(), // Accept string, will convert to Id internally (this is the model ID)
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("training"),
        v.literal("converting"),
        v.literal("ready"),
        v.literal("failed"),
      ),
    ),
    error: v.optional(v.string()),
    repoId: v.optional(v.string()),
    modelUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    // Convert string trainingId to Convex Id
    const modelId = args.trainingId as Id<"models">;

    // Call the internal mutation
    await ctx.runMutation(api.models.updateModelStatus, {
      modelId: modelId,
      status: args.status || "pending",
      errorMessage: args.error,
      repoId: args.repoId,
      modelDownloadUrl: args.modelUrl,
    });

    return null;
  },
});

// ACTION WRAPPER: Set model URL for a training job
export const setModelUrl = action({
  args: {
    trainingId: v.string(), // This is the model ID
    modelUrl: v.string(),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("training"),
        v.literal("converting"),
        v.literal("ready"),
        v.literal("failed"),
      ),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    // Convert string trainingId to Convex Id
    const modelId = args.trainingId as Id<"models">;

    // Call the internal mutation to update the model download URL
    await ctx.runMutation(api.models.updateModelStatus, {
      modelId: modelId,
      status: args.status || "ready", // Default to ready if no status provided
      modelDownloadUrl: args.modelUrl,
    });

    return null;
  },
});
