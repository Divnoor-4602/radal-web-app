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
      status: "valid", // Updated to match new schema
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
      status: v.union(
        v.literal("valid"),
        v.literal("training"),
        v.literal("ready"),
        v.literal("error"),
      ),
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
      status: project.status,
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
        v.literal("valid"),
        v.literal("training"),
        v.literal("ready"),
        v.literal("error"),
      ),
      updatedAt: v.number(),
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

    // Return project details without userId
    return {
      _id: project._id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      _creationTime: project._creationTime,
      status: project.status,
      updatedAt: project.updatedAt,
    };
  },
});

// Server-side compatible version that takes clerkId as parameter
export const getProjectByIdWithClerkId = query({
  args: {
    projectId: v.id("projects"),
    clerkId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("projects"),
      name: v.string(),
      description: v.string(),
      createdAt: v.number(),
      _creationTime: v.number(),
      status: v.union(
        v.literal("valid"),
        v.literal("training"),
        v.literal("ready"),
        v.literal("error"),
      ),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    // Find the user by clerkId
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the project by ID
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return null;
    }

    // Check if the project belongs to the specified user
    if (project.userId !== user._id) {
      throw new Error("Project not found or access denied");
    }

    // Return project details without userId
    return {
      _id: project._id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      _creationTime: project._creationTime,
      status: project.status,
      updatedAt: project.updatedAt,
    };
  },
});

// Update project status only (removed graph update functionality)
export const updateProjectStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(
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

    // Update the project status
    await ctx.db.patch(args.projectId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Delete a project
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
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

    // Get the project
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Verify the project belongs to the user
    if (project.userId !== user._id) {
      throw new Error("Project access denied");
    }

    // Delete all models in the project first
    const modelsInProject = await ctx.db
      .query("models")
      .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const model of modelsInProject) {
      await ctx.db.delete(model._id);
    }

    // Delete all datasets in the project
    const datasetsInProject = await ctx.db
      .query("datasets")
      .withIndex("byProject", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const dataset of datasetsInProject) {
      await ctx.db.delete(dataset._id);
    }

    // Finally, delete the project record
    await ctx.db.delete(args.projectId);

    return null;
  },
});
