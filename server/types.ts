import type { User, Verse, Devotional, Prayer, InsertUser, InsertVerse, InsertDevotional, InsertPrayer } from "@shared/schema";
import type { Store } from "express-session";

export interface IStorage {
  sessionStore: Store;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Verse operations
  getVerses(userId: string): Promise<Verse[]>;
  createVerse(verse: InsertVerse): Promise<Verse>;
  updateVerse(id: string, verse: Partial<Verse>): Promise<Verse>;
  
  // Devotional operations
  getDevotionals(userId: string): Promise<Devotional[]>;
  createDevotional(devotional: InsertDevotional): Promise<Devotional>;
  
  // Prayer operations
  getPrayers(userId: string): Promise<Prayer[]>;
  createPrayer(prayer: InsertPrayer): Promise<Prayer>;
  updatePrayer(id: string, prayer: Partial<Prayer>): Promise<Prayer>;
}
