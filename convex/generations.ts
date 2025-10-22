import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";

export const getLatestAdCreations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = (await ctx.db.query("users").withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject)).unique())?._id;
    if (!userId) {
      return null;
    }

    const image = await ctx.db
      .query("generations")
      .withIndex("by_user_id_type", (q) => q.eq("userId", userId).eq("type", "image"))
      .order("desc")
      .first();

    const video = await ctx.db
      .query("generations")
      .withIndex("by_user_id_type", (q) => q.eq("userId", userId).eq("type", "video"))
      .order("desc")
      .first();

    return {
      image,
      video,
    };
  },
});

export const startImageGeneration = mutation({
    args: {
        primaryImageId: v.id("_storage"),
        secondaryImageId: v.optional(v.id("_storage")),
        description: v.string(),
        styles: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        // TODO: Implement image generation logic
        console.log("startImageGeneration called with:", args);
        return { success: true };
    },
});

export const startVideoGeneration = mutation({
    args: {
        imageId: v.id("_storage"),
        description: v.string(),
        styles: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        // TODO: Implement video generation logic
        console.log("startVideoGeneration called with:", args);
        return { success: true };
    },
});