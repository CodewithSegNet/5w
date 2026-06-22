import { query } from "./_generated/server";

export const getPublicHero = query({
  handler: async (ctx) => {
    const cards = await ctx.db
      .query("heroCards")
      .filter((q) => q.eq(q.field("is_visible"), true))
      .collect();
      
    // Sort cards by display_order in memory
    cards.sort((a, b) => a.display_order - b.display_order);

    const stats = await ctx.db
      .query("heroStats")
      .filter((q) => q.eq(q.field("is_visible"), true))
      .collect();
      
    stats.sort((a, b) => a.display_order - b.display_order);

    return {
      cards,
      stats,
    };
  },
});
