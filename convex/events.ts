import { query } from "./_generated/server";

export const getPublicEvents = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_published"), true))
      .order("desc") // we should sort by event_date, but Convex doesn't allow ordering by arbitrary fields unless indexed
      .collect();
  },
});
