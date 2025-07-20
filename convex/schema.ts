import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  // user schema for saving clerk users in convex
  users: defineTable({
    name: v.string(),
    clerkId: v.string(),
    email: v.string(),
    createdAt: v.number(),
  }).index("byClerkId", ["clerkId"]),

  // projects schema linked to users
  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    status: v.union(
      v.literal("valid"),
      v.literal("training"),
      v.literal("ready"),
      v.literal("error"),
    ),
  })
    .index("byUserId", ["userId"])
    .index("byStatus", ["status"]),

  // datasets schema for CSV files (using Azure Blob Storage)
  datasets: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    originalFilename: v.string(),
    storageId: v.string(), // Azure blob path (e.g., "users/{userId}/projects/{projectId}/datasets/{datasetId}/file.csv")
    azureUrl: v.optional(v.string()), // Public Azure blob URL
    fileSize: v.number(),
    mimeType: v.string(),
    rowCount: v.optional(v.number()),
    columnCount: v.optional(v.number()),
    headers: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byProject", ["projectId"])
    .index("byUser", ["userId"]),

  // models schema for fine tuned model configurations
  models: defineTable({
    // base fields
    projectId: v.id("projects"),
    userId: v.id("users"),
    title: v.string(),

    // base model details
    baseModelDetails: v.object({
      modelId: v.union(v.literal("microsoft/phi-2")), // Can expand to more models later
      displayName: v.string(),
      provider: v.string(),
      parameters: v.string(),
      huggingFaceUrl: v.string(),
    }),

    // Dataset reference used for fine tuning the models
    datasetIds: v.array(v.id("datasets")),

    // Training configuration used for the model.
    trainingConfig: v.object({
      epochs: v.number(), // 1-10
      batch_size: v.number(), // 1, 2, 4, 8
      train_quant: v.union(v.literal("int4"), v.literal("int8")),
      download_quant: v.union(v.literal("int4"), v.literal("int8")),
    }),

    // donwload url of the model
    modelDownloadUrl: v.optional(v.string()),

    // Complete training graph of the model for reproducability
    trainingGraph: v.optional(
      v.object({
        schema_version: v.optional(v.number()),
        nodes: v.record(v.string(), v.any()),
        edges: v.array(v.any()),
      }),
    ),

    // Status of the model
    status: v.union(
      v.literal("draft"),
      v.literal("training"),
      v.literal("converting"),
      v.literal("ready"),
      v.literal("error"),
    ),

    // Job id
    jobId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byProject", ["projectId"])
    .index("byUser", ["userId"])
    .index("byDataset", ["datasetIds"])
    .index("byModelId", ["baseModelDetails.modelId"])
    .index("byStatus", ["status"]),
});
