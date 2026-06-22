import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  admins: defineTable(v.any()).index("by_email", ["email"]),
  blogPosts: defineTable(v.any()).index("by_slug", ["slug"]),
  contactSubmissions: defineTable(v.any()),
  events: defineTable(v.any()),
  heroCards: defineTable(v.any()),
  heroStats: defineTable(v.any()),
});
