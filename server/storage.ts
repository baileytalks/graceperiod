import {
  users,
  emailSubscriptions,
  visitorCounter,
  type User,
  type InsertUser,
  type EmailSubscription,
  type InsertEmailSubscription,
} from "@shared/schema";
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
  constructor(private readonly database = db!) {}

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.database.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.database.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.database
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createEmailSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription> {
    const [emailSubscription] = await this.database
      .insert(emailSubscriptions)
      .values(subscription)
      .returning();
    return emailSubscription;
  }

  async incrementVisitorCount(): Promise<number> {
    // Get current counter or create if doesn't exist
    const [counter] = await this.database.select().from(visitorCounter).limit(1);
    
    if (!counter) {
      // Initialize counter if it doesn't exist
      const [newCounter] = await this.database
        .insert(visitorCounter)
        .values({ count: 0 })
        .returning();
      return newCounter.count;
    }
    
    // Increment existing counter
    const [updatedCounter] = await this.database
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
    const [subscription] = await this.database.select().from(emailSubscriptions).where(eq(emailSubscriptions.email, email));
    return subscription || undefined;
  }

  async getAllEmailSubscriptions(): Promise<EmailSubscription[]> {
    return await this.database.select().from(emailSubscriptions);
  }

  async getVisitorCount(): Promise<number> {
    const [counter] = await this.database.select().from(visitorCounter).limit(1);
    if (!counter) {
      // Initialize counter if it doesn't exist
      const [newCounter] = await this.database
        .insert(visitorCounter)
        .values({ count: 0 })
        .returning();
      return newCounter.count;
    }
    return counter.count;
  }
}
class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private emailSubs: EmailSubscription[] = [];
  private visitor = { count: 1012, lastUpdated: new Date(), id: 1 };
  private nextUserId = 1;
  private nextEmailId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find((u) => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = { id: this.nextUserId++, ...user } as User;
    this.users.push(newUser);
    return newUser;
  }

  async createEmailSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription> {
    const newSub: EmailSubscription = {
      id: this.nextEmailId++,
      subscribedAt: new Date(),
      ...subscription,
    } as EmailSubscription;
    this.emailSubs.push(newSub);
    return newSub;
  }

  async getEmailSubscription(email: string): Promise<EmailSubscription | undefined> {
    return this.emailSubs.find((s) => s.email === email);
  }

  async getAllEmailSubscriptions(): Promise<EmailSubscription[]> {
    return [...this.emailSubs];
  }

  async incrementVisitorCount(): Promise<number> {
    this.visitor.count += 1;
    this.visitor.lastUpdated = new Date();
    return this.visitor.count;
  }

  async getVisitorCount(): Promise<number> {
    return this.visitor.count;
  }
}

export const storage: IStorage = db ? new DatabaseStorage() : new InMemoryStorage();
