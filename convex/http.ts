import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

const handleCors = () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};

const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

const mapId = (item: any) => {
  if (!item) return item;
  return { ...item, id: item._id };
};

// We will route everything through a single prefix route for simplicity since Convex Router doesn't have path params
http.route({
  pathPrefix: "/api/",
  method: "OPTIONS",
  handler: httpAction(async () => handleCors()),
});

http.route({
  pathPrefix: "/api/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/blog/public" || path === "/api/blog" || path === "/api/blog/") {
      const limitParam = url.searchParams.get("limit");
      const limit = limitParam ? parseInt(limitParam, 10) : undefined;
      const posts = await ctx.runQuery(api.blog.getPublicPosts, { limit });
      posts.posts = posts.posts.map(mapId);
      if (path === "/api/blog/public") {
        return jsonResponse(posts);
      }
      return jsonResponse(posts.posts); // Dashboard expects an array
    }
    
    if (path === "/api/events/public" || path === "/api/events" || path === "/api/events/") {
      const events = await ctx.runQuery(api.events.getPublicEvents, {});
      return jsonResponse(events.map(mapId));
    }
    
    if (path === "/api/hero/public") {
      const hero = await ctx.runQuery(api.hero.getPublicHero, {});
      hero.cards = hero.cards.map(mapId);
      hero.stats = hero.stats.map(mapId);
      return jsonResponse(hero);
    }
    
    if (path === "/api/auth/users") {
      const users = await ctx.runQuery(api.auth.getUsers, {});
      return jsonResponse(users);
    }
    
    if (path === "/api/dashboard/stats") {
      const stats = await ctx.runQuery(api.dashboard.getStats, {});
      return jsonResponse(stats);
    }
    
    if (path === "/api/contacts/count") {
      const count = await ctx.runQuery(api.dashboard.getUnreadContactsCount, {});
      return jsonResponse(count);
    }

    // Add simple get handlers for dashboard tables
    // (Contacts, HeroCards, HeroStats)
    const tableMap: Record<string, string> = {
      "/api/contacts": "contactSubmissions",
      "/api/contacts/": "contactSubmissions",
      "/api/hero/cards": "heroCards",
      "/api/hero/cards/": "heroCards",
      "/api/hero/stats": "heroStats",
      "/api/hero/stats/": "heroStats",
      "/api/blog": "blogPosts",
      "/api/blog/": "blogPosts",
      "/api/events": "events",
      "/api/events/": "events",
      "/api/auth/users": "admins",
      "/api/auth/users/": "admins",
    };

    const targetTable = tableMap[path];
    if (targetTable) {
      const items = await ctx.runQuery(api.crud.list, { table: targetTable });
      return jsonResponse(items);
    }
    
    // Check if it's a get by id e.g. /api/blog/jd8...
    for (const prefix of Object.keys(tableMap)) {
      if (path.startsWith(prefix) && path.length > prefix.length) {
        let idPart = path.slice(prefix.length);
        if (idPart.startsWith("/")) idPart = idPart.slice(1);
        if (idPart && !idPart.includes("/")) {
          try {
            const item = await ctx.runQuery(api.crud.get, { id: idPart as any });
            return jsonResponse(item);
          } catch(e) {}
        }
      }
    }

    return jsonResponse({ error: "Not found" }, 404);
  }),
});

http.route({
  pathPrefix: "/api/",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const path = url.pathname;
    
    try {
      if (path === "/api/auth/login") {
        const body = await request.json();
        const result = await ctx.runAction(api.auth.loginAction, { email: body.email, password: body.password });
        return jsonResponse(result);
      }
      
      if (path === "/api/auth/register") {
        const body = await request.json();
        const result = await ctx.runAction(api.auth.registerAction, { full_name: body.full_name, email: body.email, password: body.password });
        return jsonResponse(result, 201);
      }
      
      const tableMap: Record<string, string> = {
        "/api/contacts": "contactSubmissions",
        "/api/contacts/": "contactSubmissions",
        "/api/hero/cards": "heroCards",
        "/api/hero/cards/": "heroCards",
        "/api/hero/stats": "heroStats",
        "/api/hero/stats/": "heroStats",
        "/api/blog": "blogPosts",
        "/api/blog/": "blogPosts",
        "/api/events": "events",
        "/api/events/": "events",
      };

      const targetTable = tableMap[path];
      if (targetTable) {
        const body = await request.json();
        const result = await ctx.runMutation(api.crud.create, { table: targetTable, data: body });
        return jsonResponse(result, 201);
      }

      if (path === "/api/upload-url") {
        const uploadUrl = await ctx.runMutation(api.files.generateUploadUrl, {});
        return jsonResponse({ uploadUrl });
      }

      if (path === "/api/save-image") {
        const body = await request.json();
        if (body.recordId) {
          const result = await ctx.runMutation(api.files.saveImageUrl, {
            storageId: body.storageId as any,
            table: body.table,
            recordId: body.recordId as any,
            field: body.field
          });
          return jsonResponse(result);
        } else {
          const result = await ctx.runMutation(api.files.getImageUrl, {
            storageId: body.storageId as any
          });
          return jsonResponse(result);
        }
      }

      return jsonResponse({ error: "Not found" }, 404);
    } catch (err: any) {
      return jsonResponse({ detail: err.message }, 400);
    }
  }),
});

http.route({
  pathPrefix: "/api/",
  method: "PUT",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      const parts = path.split("/");
      const id = parts[parts.length - 1];
      const body = await request.json();
      
      if (path.startsWith("/api/auth/users/")) {
        const result = await ctx.runAction(api.auth.updateUserAction, { 
          id: id, 
          full_name: body.full_name, 
          email: body.email, 
          password: body.password 
        });
        return jsonResponse(result);
      }
      
      const result = await ctx.runMutation(api.crud.update, { id: id as any, data: body });
      return jsonResponse(result);
    } catch(err: any) {
      return jsonResponse({ detail: err.message }, 400);
    }
  })
});

http.route({
  pathPrefix: "/api/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      const parts = path.split("/");
      const id = parts[parts.length - 1];
      
      const result = await ctx.runMutation(api.crud.remove, { id: id as any });
      return jsonResponse(result);
    } catch(err: any) {
      return jsonResponse({ detail: err.message }, 400);
    }
  })
});

export default http;
