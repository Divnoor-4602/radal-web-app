import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Generate upload URL for CSV file
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    // Generate and return upload URL
    // Note: Authentication is handled by saveDataset function
    return await ctx.storage.generateUploadUrl();
  },
});

// Save dataset metadata after file upload (Azure Blob Storage)
export const saveDataset = mutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.string(), // Azure blob path
    azureUrl: v.optional(v.string()), // Public Azure URL
    title: v.string(),
    description: v.optional(v.string()),
    originalFilename: v.string(),
    fileSize: v.number(),
    mimeType: v.optional(v.string()),
    userId: v.optional(v.id("users")), // Optional for API route calls
  },
  returns: v.id("datasets"),
  handler: async (ctx, args) => {
    let userId: Id<"users">;

    if (args.userId) {
      // Called from API route with userId provided
      userId = args.userId;

      // Verify the user exists
      const user = await ctx.db.get(args.userId);
      if (!user) {
        throw new Error("User not found");
      }
    } else {
      // Called from client - use authentication context
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      // Find the user in our database
      const user = await ctx.db
        .query("users")
        .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (!user) {
        throw new Error("User not found");
      }

      userId = user._id;
    }

    // Verify the project belongs to the user
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }

    // Create the dataset record
    const datasetId = await ctx.db.insert("datasets", {
      projectId: args.projectId,
      userId: userId,
      title: args.title,
      description: args.description,
      originalFilename: args.originalFilename,
      storageId: args.storageId, // Azure blob path
      azureUrl: args.azureUrl, // Public Azure URL
      fileSize: args.fileSize,
      mimeType: args.mimeType || "text/csv",
      rowCount: 0, // Will be updated after processing
      columnCount: 0, // Will be updated after processing
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return datasetId;
  },
});

// Update dataset with processing statistics
export const updateDatasetStats = mutation({
  args: {
    datasetId: v.id("datasets"),
    rows: v.number(),
    columns: v.number(),
    headers: v.array(v.string()),
    userId: v.optional(v.id("users")), // Optional for API route calls
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    let userId: Id<"users">;

    if (args.userId) {
      // Called from API route with userId provided
      userId = args.userId;

      // Verify the user exists
      const user = await ctx.db.get(args.userId);
      if (!user) {
        throw new Error("User not found");
      }
    } else {
      // Called from client - use authentication context
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      // Find the user in our database
      const user = await ctx.db
        .query("users")
        .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (!user) {
        throw new Error("User not found");
      }

      userId = user._id;
    }

    // Get the dataset
    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset) {
      throw new Error("Dataset not found");
    }

    // Verify the dataset belongs to the user
    if (dataset.userId !== userId) {
      throw new Error("Dataset access denied");
    }

    // Update dataset with processing results
    await ctx.db.patch(args.datasetId, {
      rowCount: args.rows,
      columnCount: args.columns,
      headers: args.headers,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Get storage URL for a specific dataset
export const getStorageUrl = query({
  args: {
    datasetId: v.id("datasets"),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    // Get the dataset
    const dataset = await ctx.db.get(args.datasetId);
    if (!dataset) {
      return null;
    }

    // Get the storage URL
    const storageUrl = await ctx.storage.getUrl(dataset.storageId);
    return storageUrl;
  },
});

// Get all datasets for a project (simplified version for dashboard)
export const getDatasetsByProject = query({
  args: { projectId: v.id("projects") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("datasets")
      .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

// Get all datasets for a project
export const getProjectDatasets = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.array(
    v.object({
      _id: v.id("datasets"),
      title: v.string(),
      description: v.optional(v.string()),
      originalFilename: v.string(),
      fileSize: v.number(),
      rowCount: v.optional(v.number()),
      columnCount: v.optional(v.number()),
      headers: v.optional(v.array(v.string())),
      createdAt: v.number(),
      storageUrl: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find the user in our database
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the project belongs to the user
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or access denied");
    }

    // Get all datasets for the project
    const datasets = await ctx.db
      .query("datasets")
      .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Return datasets with storage URLs
    return Promise.all(
      datasets.map(async (dataset) => {
        // Use Azure URL since datasets are stored in Azure Blob Storage
        const storageUrl = dataset.azureUrl;

        return {
          _id: dataset._id,
          title: dataset.title,
          description: dataset.description,
          originalFilename: dataset.originalFilename,
          fileSize: dataset.fileSize,
          rowCount: dataset.rowCount,
          columnCount: dataset.columnCount,
          headers: dataset.headers,
          createdAt: dataset.createdAt,
          storageUrl: storageUrl || undefined,
        };
      }),
    );
  },
});

// Get dataset stats for project dashboard (count and latest title)
export const getDatasetStatsForProject = query({
  args: { projectId: v.id("projects") },
  returns: v.object({
    totalCount: v.number(),
    latestDatasetTitle: v.union(v.string(), v.literal("none")),
  }),
  handler: async (ctx, args) => {
    const datasets = await ctx.db
      .query("datasets")
      .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    const totalCount = datasets.length;

    if (totalCount === 0) {
      return {
        totalCount: 0,
        latestDatasetTitle: "none" as const,
      };
    }

    // Get the latest dataset (first in desc order)
    const latestDataset = datasets[0];

    return {
      totalCount,
      latestDatasetTitle: latestDataset.title,
    };
  },
});
