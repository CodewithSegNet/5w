import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { table: v.string(), data: v.any() },
  handler: async (ctx, args) => {
    // @ts-ignore
    const id = await ctx.db.insert(args.table, args.data);
    return { ...args.data, id, _id: id };
  }
});

export const update = mutation({
  args: { id: v.string(), data: v.any() },
  handler: async (ctx, args) => {
    // @ts-ignore
    await ctx.db.patch(args.id, args.data);
    // @ts-ignore
    const item = await ctx.db.get(args.id);
    return { ...item, id: item._id };
  }
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    // @ts-ignore
    await ctx.db.delete(args.id);
    return { success: true };
  }
});

export const list = query({
  args: { table: v.string() },
  handler: async (ctx, args) => {
    // @ts-ignore
    const items = await ctx.db.query(args.table).collect();
    return items.map((i: any) => ({ ...i, id: i._id }));
  }
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    // @ts-ignore
    const item = await ctx.db.get(args.id);
    return item ? { ...item, id: item._id } : null;
  }
});
