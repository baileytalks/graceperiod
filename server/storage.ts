import { users, emailSubscriptions, visitorCounter, type User, type InsertUser, type EmailSubscription, type InsertEmailSubscription } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createEmailSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription>;
  getEmailSubscription(email: string): Promise<EmailSubscription | undefined>;
  getAllEmailSubscriptions(): Promise<EmailSubscription[]>;
  incrementVisitorCount(): Promise<number>;
  getVisitorCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createEmailSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription> {
    const [emailSubscription] = await db
      .insert(emailSubscriptions)
      .values(subscription)
      .returning();
    return emailSubscription;
  }

  async incrementVisitorCount(): Promise<number> {
    // Get current counter or create if doesn't exist
    const [counter] = await db.select().from(visitorCounter).limit(1);
    
    if (!counter) {
      // Initialize counter if it doesn't exist
      const [newCounter] = await db
        .insert(visitorCounter)
        .values({ count: 0 })
        .returning();
      return newCounter.count;
    }
    
    // Increment existing counter
    const [updatedCounter] = await db
      .update(visitorCounter)
      .set({ 
        count: counter.count + 1,
        lastUpdated: new Date()
      })
      .where(eq(visitorCounter.id, counter.id))
      .returning();
    
    return updatedCounter.count;
  }

  async getEmailSubscription(email: string): Promise<EmailSubscription | undefined> {
    const [subscription] = await db.select().from(emailSubscriptions).where(eq(emailSubscriptions.email, email));
    return subscription || undefined;
  }

  async getAllEmailSubscriptions(): Promise<EmailSubscription[]> {
    return await db.select().from(emailSubscriptions);
  }

  async getVisitorCount(): Promise<number> {
    const [counter] = await db.select().from(visitorCounter).limit(1);
    if (!counter) {
      // Initialize counter if it doesn't exist
      const [newCounter] = await db
        .insert(visitorCounter)
        .values({ count: 0 })
        .returning();
      return newCounter.count;
    }
    return counter.count;
  }
}

export const storage = new DatabaseStorage();
