import { internalMutation, query, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

export const current = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.string(),
      clerkId: v.string(),
      email: v.string(),
      createdAt: v.number(),
      isWhitelisted: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.string(),
      clerkId: v.string(),
      email: v.string(),
      createdAt: v.number(),
      isWhitelisted: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, { clerkId }) => {
    return await userByClerkId(ctx, clerkId);
  },
});

// New function to check if a user is whitelisted by their Clerk ID
export const isUserWhitelisted = query({
  args: { clerkId: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { clerkId }) => {
    const user = await userByClerkId(ctx, clerkId);
    // If user doesn't exist, they are not whitelisted
    if (!user) {
      return false;
    }
    return user.isWhitelisted;
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  returns: v.null(),
  async handler(ctx, { data }) {
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      clerkId: data.id,
      email: data.email_addresses[0].email_address,
      createdAt: Date.now(),
      isWhitelisted: false,
    };

    const user = await userByClerkId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
    return null;
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  returns: v.null(),
  async handler(ctx, { clerkUserId }) {
    const user = await userByClerkId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
    return null;
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByClerkId(ctx, identity.subject);
}

async function userByClerkId(ctx: QueryCtx, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
    .unique();
}
