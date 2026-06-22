import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const saveImageUrl = mutation({
  args: {
    storageId: v.id("_storage"),
    table: v.string(),
    recordId: v.string(),
    field: v.string(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Could not get URL for storage ID");
    
    // @ts-ignore
    await ctx.db.patch(args.recordId, { [args.field]: url });
    return { image_url: url };
  }
});

export const getImageUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return { image_url: url };
  }
});
