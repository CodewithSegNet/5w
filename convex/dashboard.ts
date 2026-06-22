import { query } from "./_generated/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    // Collect blog stats
    const blogs = await ctx.db.query("blogPosts").collect();
    const blogPublished = blogs.filter((b) => b.is_published).length;
    
    // Collect contact stats
    const contacts = await ctx.db.query("contactSubmissions").collect();
    // @ts-ignore
    const contactsUnread = contacts.filter((c) => c.status === "unread" || !c.status).length;
    
    // Collect event stats
    const events = await ctx.db.query("events").collect();
    const eventsPublished = events.filter((e) => e.is_published).length;
    
    // Collect hero stats
    const heroCards = await ctx.db.query("heroCards").collect();
    const heroVisible = heroCards.filter((h) => h.is_visible !== false).length;
    const heroStats = await ctx.db.query("heroStats").collect();
    
    return {
      blog: {
        total: blogs.length,
        published: blogPublished,
        drafts: blogs.length - blogPublished
      },
      contacts: {
        total: contacts.length,
        unread: contactsUnread
      },
      events: {
        total: events.length,
        published: eventsPublished
      },
      hero: {
        cards: heroCards.length,
        visible: heroVisible,
        stats: heroStats.length
      }
    };
  }
});

export const getUnreadContactsCount = query({
  args: {},
  handler: async (ctx) => {
    const contacts = await ctx.db.query("contactSubmissions").collect();
    // @ts-ignore
    const unread = contacts.filter((c) => c.status === "unread" || !c.status).length;
    return { unread_count: unread };
  }
});
