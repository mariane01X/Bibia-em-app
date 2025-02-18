import { IStorage } from "./types";
import session from "express-session";
import { users, verses, devotionals, prayers } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import type { User, Verse, Devotional, Prayer, InsertUser, InsertVerse, InsertDevotional, InsertPrayer } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getVerses(userId: number): Promise<Verse[]> {
    return db.select().from(verses).where(eq(verses.userId, userId));
  }

  async createVerse(verse: InsertVerse): Promise<Verse> {
    const [created] = await db.insert(verses).values(verse).returning();
    return created;
  }

  async updateVerse(id: number, verse: Partial<Verse>): Promise<Verse> {
    const [updated] = await db
      .update(verses)
      .set(verse)
      .where(eq(verses.id, id))
      .returning();
    if (!updated) throw new Error("Verse not found");
    return updated;
  }

  async getDevotionals(userId: number): Promise<Devotional[]> {
    return db.select().from(devotionals).where(eq(devotionals.userId, userId));
  }

  async createDevotional(devotional: InsertDevotional): Promise<Devotional> {
    const [created] = await db.insert(devotionals).values(devotional).returning();
    return created;
  }

  async getPrayers(userId: number): Promise<Prayer[]> {
    return db.select().from(prayers).where(eq(prayers.userId, userId));
  }

  async createPrayer(prayer: InsertPrayer): Promise<Prayer> {
    const [created] = await db.insert(prayers).values(prayer).returning();
    return created;
  }

  async updatePrayer(id: number, prayer: Partial<Prayer>): Promise<Prayer> {
    const [updated] = await db
      .update(prayers)
      .set(prayer)
      .where(eq(prayers.id, id))
      .returning();
    if (!updated) throw new Error("Prayer not found");
    return updated;
  }
}

export const storage = new DatabaseStorage();