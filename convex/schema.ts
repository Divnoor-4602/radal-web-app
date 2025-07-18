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
    graph: v.object({
      schema_version: v.optional(v.number()),
      nodes: v.array(v.any()),
      edges: v.array(v.any()),
      meta: v.optional(
        v.object({
          created_by: v.string(),
          created_at: v.string(),
          clerk_id: v.string(),
          jwt_token: v.string(),
        }),
      ),
    }),
    status: v.union(
      v.literal("draft"),
      v.literal("valid"),
      v.literal("training"),
      v.literal("ready"),
      v.literal("error"),
    ),
    jobId: v.optional(v.string()),
    hfSpaceUrl: v.optional(v.string()),
    blobPackage: v.optional(v.string()),
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
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error"),
    ),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byProject", ["projectId"])
    .index("byUser", ["userId"])
    .index("byStatus", ["status"]),

  // models schema for base model configurations
  models: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    modelId: v.union(v.literal("phi-2")), // Can expand to more models later
    quant: v.union(v.literal("int4"), v.literal("int8"), v.literal("fp16")),
    status: v.union(v.literal("draft"), v.literal("ready"), v.literal("error")),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byProject", ["projectId"])
    .index("byUser", ["userId"])
    .index("byModelId", ["modelId"])
    .index("byStatus", ["status"]),
});
