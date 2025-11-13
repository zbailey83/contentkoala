import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    credits: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  generations: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("image"), v.literal("video")),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    prompt: v.string(),
    storageId: v.optional(v.id("_storage")),
    resultUrl: v.optional(v.string()),
  }).index("by_user_id_type", ["userId", "type"]),
});
