import { v, ConvexError } from "convex/values";
import { query, mutation, internalMutation, internalAction } from "./_generated/server";
import { api } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/genai";
import { IMAGE_GENERATION_COST } from "./creditCosts";

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

    return {
      image,
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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError("You must be logged in to generate images.");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new ConvexError("User not found.");
        }

        if (user.credits < IMAGE_GENERATION_COST) {
            throw new ConvexError("You don't have enough credits to generate an image.");
        }

        await ctx.db.patch(user._id, {
            credits: user.credits - IMAGE_GENERATION_COST,
        });

        const generationId = await ctx.db.insert("generations", {
            userId: user._id,
            type: "image",
            status: "pending",
            prompt: args.description,
        });

        await ctx.scheduler.runAfter(0, api.generations.generateImage, {
            generationId,
            primaryImageId: args.primaryImageId,
            secondaryImageId: args.secondaryImageId,
            description: args.description,
            styles: args.styles,
        });

        return { generationId };
    },
});

export const generateImage = internalAction({
    args: {
        generationId: v.id("generations"),
        primaryImageId: v.id("_storage"),
        secondaryImageId: v.optional(v.id("_storage")),
        description: v.string(),
        styles: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const prompt = `Style: ${args.styles.join(", ")}. Description: ${args.description}`;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        const primaryImageUrl = await ctx.storage.getUrl(args.primaryImageId);
        const primaryImageResponse = await fetch(primaryImageUrl!);
        const primaryImageBuffer = await primaryImageResponse.arrayBuffer();

        const secondaryImagePart = args.secondaryImageId ? async () => {
            const secondaryImageUrl = await ctx.storage.getUrl(args.secondaryImageId!);
            const secondaryImageResponse = await fetch(secondaryImageUrl!);
            const secondaryImageBuffer = await secondaryImageResponse.arrayBuffer();
            return {
                inlineData: {
                    data: Buffer.from(secondaryImageBuffer).toString("base64"),
                    mimeType: "image/jpeg",
                }
            }
        } : null;

        const imageParts = [
            {
                inlineData: {
                    data: Buffer.from(primaryImageBuffer).toString("base64"),
                    mimeType: "image/jpeg",
                },
            },
        ];

        if (secondaryImagePart) {
            imageParts.push(await secondaryImagePart());
        }

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;

        const imageData = response.candidates[0].content.parts[0].inlineData.data;
        const imageBuffer = Buffer.from(imageData, 'base64');

        const storageId = await ctx.storage.store(imageBuffer);
        const resultUrl = await ctx.storage.getUrl(storageId);

        await ctx.runMutation(internal.generations.updateGenerationResult, {
            generationId: args.generationId,
            storageId,
            resultUrl,
        });
    },
});




export const updateGenerationResult = internalMutation({
    args: {
        generationId: v.id("generations"),
        storageId: v.id("_storage"),
        resultUrl: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.generationId, {
            status: "completed",
            storageId: args.storageId,
            resultUrl: args.resultUrl,
        });
    },
});