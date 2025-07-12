var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  emailSubscriptions: () => emailSubscriptions,
  insertEmailSubscriptionSchema: () => insertEmailSubscriptionSchema,
  insertUserSchema: () => insertUserSchema,
  users: () => users,
  visitorCounter: () => visitorCounter
});
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var emailSubscriptions = pgTable("email_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  location: text("location"),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull()
});
var visitorCounter = pgTable("visitor_counter", {
  id: serial("id").primaryKey(),
  count: integer("count").notNull().default(1012),
  lastUpdated: timestamp("last_updated").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertEmailSubscriptionSchema = createInsertSchema(emailSubscriptions).pick({
  email: true,
  location: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async createEmailSubscription(subscription) {
    const [emailSubscription] = await db.insert(emailSubscriptions).values(subscription).returning();
    return emailSubscription;
  }
  async incrementVisitorCount() {
    const [counter] = await db.select().from(visitorCounter).limit(1);
    if (!counter) {
      const [newCounter] = await db.insert(visitorCounter).values({ count: 0 }).returning();
      return newCounter.count;
    }
    const [updatedCounter] = await db.update(visitorCounter).set({
      count: counter.count + 1,
      lastUpdated: /* @__PURE__ */ new Date()
    }).where(eq(visitorCounter.id, counter.id)).returning();
    return updatedCounter.count;
  }
  async getEmailSubscription(email) {
    const [subscription] = await db.select().from(emailSubscriptions).where(eq(emailSubscriptions.email, email));
    return subscription || void 0;
  }
  async getAllEmailSubscriptions() {
    return await db.select().from(emailSubscriptions);
  }
  async getVisitorCount() {
    const [counter] = await db.select().from(visitorCounter).limit(1);
    if (!counter) {
      const [newCounter] = await db.insert(visitorCounter).values({ count: 0 }).returning();
      return newCounter.count;
    }
    return counter.count;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";

// server/email.ts
import { Resend } from "resend";
if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable must be set");
}
var resend = new Resend(process.env.RESEND_API_KEY);
async function sendEmail(params) {
  try {
    const emailData = {
      from: params.from,
      to: params.to,
      subject: params.subject
    };
    if (params.html) {
      emailData.html = params.html;
    } else if (params.text) {
      emailData.text = params.text;
    }
    await resend.emails.send(emailData);
    return true;
  } catch (error) {
    console.error("Resend email error:", error);
    return false;
  }
}
async function notifyGraceOfNewSubscriber(subscriberEmail) {
  const emailContent = {
    to: "graceperiodartist@gmail.com",
    from: "Grace Period <onboarding@resend.dev>",
    subject: "\u{1F3B5} Amazing! New Grace Period subscriber!",
    text: `Hey Grace!

Exciting news! Someone just joined the Grace Period family! \u{1F389}

New subscriber: ${subscriberEmail}

Your music is reaching more people every day. Keep creating that magic! \u2728

Time: ${(/* @__PURE__ */ new Date()).toLocaleString()}

Much love,
Your Grace Period website \u{1F495}`,
    html: `
      <div style="font-family: 'Piazzolla', serif; color: #3d405b; line-height: 1.6; max-width: 600px;">
        <h2 style="color: #e22a43; font-size: 24px; margin-bottom: 20px;">\u{1F3B5} Amazing! New Grace Period subscriber!</h2>
        
        <p style="font-size: 18px; margin-bottom: 20px;">Hey Grace!</p>
        
        <p style="margin-bottom: 20px;">Exciting news! Someone just joined the Grace Period family! \u{1F389}</p>
        
        <div style="background: #f4f1de; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <strong style="color: #e22a43;">New subscriber:</strong> ${subscriberEmail}
        </div>
        
        <p style="margin-bottom: 20px;">Your music is reaching more people every day. Keep creating that magic! \u2728</p>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Time: ${(/* @__PURE__ */ new Date()).toLocaleString()}<br>
          Much love,<br>
          <strong style="color: #e22a43;">Your Grace Period website \u{1F495}</strong>
        </p>
      </div>
    `
  };
  return sendEmail(emailContent);
}

// server/notion.ts
import { Client } from "@notionhq/client";
var notion = new Client({
  auth: process.env.NOTION_INTEGRATION_SECRET
});
function extractPageIdFromUrl(pageUrl) {
  const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
  if (match && match[1]) {
    return match[1];
  }
  throw Error("Failed to extract page ID");
}
var NOTION_PAGE_ID = extractPageIdFromUrl(process.env.NOTION_PAGE_URL);
async function getPosts() {
  try {
    const response = await notion.databases.query({
      database_id: NOTION_PAGE_ID,
      sorts: [
        {
          property: "PublishedDate",
          direction: "descending"
        }
      ]
    });
    return response.results.map((page) => {
      const properties = page.properties;
      const coverImage = page.cover?.external?.url || page.cover?.file?.url || null;
      return {
        id: page.id,
        title: properties.Title?.title?.[0]?.plain_text || "Untitled Post",
        body: properties.Body?.rich_text?.[0]?.plain_text || "",
        tags: properties.Tags?.multi_select?.map((tag) => tag.name) || [],
        publishedDate: properties.PublishedDate?.date?.start || null,
        url: page.url,
        coverImage
      };
    });
  } catch (error) {
    console.error("Error fetching posts from Notion:", error);
    return [];
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.use((req, res, next) => {
    const host = req.get("host");
    if (host === "www.graceperiod.live") {
      const protocol = req.get("x-forwarded-proto") || (req.secure ? "https" : "http");
      return res.redirect(301, `${protocol}://graceperiod.live${req.originalUrl}`);
    }
    next();
  });
  app2.post("/api/subscribe", async (req, res) => {
    try {
      const validatedData = insertEmailSubscriptionSchema.parse(req.body);
      const existingSubscription = await storage.getEmailSubscription(validatedData.email);
      if (existingSubscription) {
        return res.status(400).json({
          message: "This email is already subscribed to our updates."
        });
      }
      const subscription = await storage.createEmailSubscription(validatedData);
      try {
        await notifyGraceOfNewSubscriber(subscription.email);
        console.log(`Notification sent to Grace about new subscriber: ${subscription.email}`);
      } catch (emailError) {
        console.error("Failed to send notification email to Grace:", emailError);
      }
      res.status(201).json({
        message: "Successfully subscribed to updates!",
        subscription: { id: subscription.id, email: subscription.email }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid email format.",
          errors: error.errors
        });
      }
      console.error("Subscription error:", error);
      res.status(500).json({
        message: "Something went wrong. Please try again later."
      });
    }
  });
  app2.get("/api/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getAllEmailSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({
        message: "Failed to fetch subscriptions."
      });
    }
  });
  app2.get("/api/posts", async (req, res) => {
    try {
      const posts = await getPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({
        message: "Failed to fetch posts."
      });
    }
  });
  app2.post("/api/visitor-count", async (req, res) => {
    try {
      const count = await storage.incrementVisitorCount();
      res.json({ count });
    } catch (error) {
      console.error("Error incrementing visitor count:", error);
      res.status(500).json({
        message: "Failed to increment visitor count."
      });
    }
  });
  app2.get("/api/visitor-count", async (req, res) => {
    try {
      const count = await storage.getVisitorCount();
      res.json({ count });
    } catch (error) {
      console.error("Error getting visitor count:", error);
      res.status(500).json({
        message: "Failed to get visitor count."
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
