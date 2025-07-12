import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmailSubscriptionSchema } from "@shared/schema";
import { z } from "zod";
import { notifyGraceOfNewSubscriber } from "./email";
import { getPosts } from "./notion";

export async function registerRoutes(app: Express): Promise<Server> {
  // Redirect www.graceperiod.live to graceperiod.live
  app.use((req, res, next) => {
    const host = req.get('host');
    if (host === 'www.graceperiod.live') {
      const protocol = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
      return res.redirect(301, `${protocol}://graceperiod.live${req.originalUrl}`);
    }
    next();
  });

  // Email subscription endpoint
  app.post("/api/subscribe", async (req, res) => {
    try {
      const validatedData = insertEmailSubscriptionSchema.parse(req.body);
      
      // Check if email already exists
      const existingSubscription = await storage.getEmailSubscription(validatedData.email);
      if (existingSubscription) {
        return res.status(400).json({ 
          message: "This email is already subscribed to our updates." 
        });
      }

      const subscription = await storage.createEmailSubscription(validatedData);
      
      // Send notification email to Grace
      try {
        await notifyGraceOfNewSubscriber(subscription.email);
        console.log(`Notification sent to Grace about new subscriber: ${subscription.email}`);
      } catch (emailError) {
        console.error("Failed to send notification email to Grace:", emailError);
        // Don't fail the subscription if email fails
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

  // Get all subscriptions (for admin purposes)
  app.get("/api/subscriptions", async (req, res) => {
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

  // Get posts from Notion
  app.get("/api/posts", async (req, res) => {
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

  // Increment visitor count
  app.post("/api/visitor-count", async (req, res) => {
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

  // Get visitor count
  app.get("/api/visitor-count", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
