import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// create a project
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.string(),
  },
  returns: v.object({
    _id: v.id("projects"),
    name: v.string(),
    description: v.string(),
    createdAt: v.number(),
    _creationTime: v.number(),
  }),
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find the user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Create the project
    const projectId = await ctx.db.insert("projects", {
      userId: user._id,
      name: args.name,
      description: args.description,
      createdAt: Date.now(),
      graph: {
        schema_version: 1,
        nodes: [],
        edges: [],
        meta: {
          created_by: user._id,
          created_at: new Date().toISOString(),
          clerk_id: identity.subject,
          jwt_token: "initial-creation",
        },
      },
      status: "draft",
      updatedAt: Date.now(),
    });

    // Get the created project to return
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Failed to create project");
    }

    // Return project details without userId
    return {
      _id: project._id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      _creationTime: project._creationTime,
    };
  },
});

// get all projects for a user
export const getUserProjects = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("projects"),
      name: v.string(),
      description: v.string(),
      createdAt: v.number(),
      _creationTime: v.number(),
    }),
  ),
  handler: async (ctx) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find the user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Query all projects for this user
    const projects = await ctx.db
      .query("projects")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Return projects without userId
    return projects.map((project) => ({
      _id: project._id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      _creationTime: project._creationTime,
    }));
  },
});

// get project by id
export const getProjectById = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.union(
    v.object({
      _id: v.id("projects"),
      name: v.string(),
      description: v.string(),
      createdAt: v.number(),
      _creationTime: v.number(),
      status: v.union(
        v.literal("draft"),
        v.literal("valid"),
        v.literal("training"),
        v.literal("ready"),
        v.literal("error"),
      ),
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
      updatedAt: v.number(),
      jobId: v.optional(v.string()),
      hfSpaceUrl: v.optional(v.string()),
      blobPackage: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find the user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the project by ID
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return null;
    }

    // Check if the project belongs to the current user
    if (project.userId !== user._id) {
      throw new Error("Project not found or access denied");
    }

    // Return full project details without userId
    return {
      _id: project._id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      _creationTime: project._creationTime,
      status: project.status,
      graph: project.graph,
      updatedAt: project.updatedAt,
      jobId: project.jobId,
      hfSpaceUrl: project.hfSpaceUrl,
      blobPackage: project.blobPackage,
    };
  },
});

// Update project graph and status
export const updateProjectGraph = mutation({
  args: {
    projectId: v.id("projects"),
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
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get the project to verify it exists
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Update the project with new graph and status
    await ctx.db.patch(args.projectId, {
      graph: args.graph,
      status: args.status,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Update project status and job ID
export const updateProjectStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(
      v.literal("draft"),
      v.literal("valid"),
      v.literal("training"),
      v.literal("ready"),
      v.literal("error"),
    ),
    jobId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get the project to verify it exists
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Update the project status and jobId
    await ctx.db.patch(args.projectId, {
      status: args.status,
      jobId: args.jobId,
      updatedAt: Date.now(),
    });

    return null;
  },
});
