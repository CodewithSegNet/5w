import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const insertData = mutation({
  args: {
    table: v.string(),
    records: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const { table, records } = args;
    const insertedIds = [];
    
    for (const record of records) {
      // @ts-ignore - dynamic table name
      const id = await ctx.db.insert(table, record);
      insertedIds.push(id);
    }
    
    return { count: insertedIds.length };
  },
});
