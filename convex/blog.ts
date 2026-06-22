import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPublicPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let posts = await ctx.db
      .query("blogPosts")
      .filter((q) => q.eq(q.field("is_published"), true))
      .order("desc")
      .collect();
      
    if (args.limit) {
      posts = posts.slice(0, args.limit);
    }
    
    return {
      posts: posts,
      total: posts.length,
      page: 1,
      total_pages: 1
    };
  },
});
