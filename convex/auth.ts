import { action, internalQuery, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

export const loginAction = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.auth.getUserByEmail, { email: args.email });
    
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(args.password, user.hashed_password);
    
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    return {
      access_token: user._id,
      token_type: "bearer",
      admin: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        is_superadmin: true
      }
    };
  }
});

export const registerAction = action({
  args: { full_name: v.string(), email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.runQuery(internal.auth.getUserByEmail, { email: args.email });
    if (existing) throw new Error("Email already registered");
    
    const hashed_password = await bcrypt.hash(args.password, 10);
    
    const user = {
      full_name: args.full_name,
      email: args.email,
      hashed_password: hashed_password,
      created_at: new Date().toISOString()
    };
    
    await ctx.runMutation(internal.auth.createAdmin, { data: user });
    return { success: true };
  }
});

export const updateUserAction = action({
  args: { id: v.string(), full_name: v.string(), email: v.string(), password: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const updateData: any = { full_name: args.full_name, email: args.email };
    if (args.password) {
      updateData.hashed_password = await bcrypt.hash(args.password, 10);
    }
    await ctx.runMutation(internal.auth.updateAdmin, { id: args.id, data: updateData });
    return { success: true };
  }
});

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("admins").collect();
    return users.map((u: any) => ({
      id: u._id,
      full_name: u.full_name,
      email: u.email,
      created_at: u.created_at
    }));
  }
});

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  }
});

export const createAdmin = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, args) => {
    // @ts-ignore
    await ctx.db.insert("admins", args.data);
  }
});

export const updateAdmin = internalMutation({
  args: { id: v.string(), data: v.any() },
  handler: async (ctx, args) => {
    // @ts-ignore
    await ctx.db.patch(args.id, args.data);
  }
});
