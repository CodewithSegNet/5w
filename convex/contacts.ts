import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submitContact = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contactSubmissions", {
      name: args.name,
      email: args.email,
      subject: args.subject,
      message: args.message,
      is_read: false,
      is_archived: false,
      created_at: new Date().toISOString(),
    });
    
    return { id, detail: "Message sent successfully" };
  },
});
