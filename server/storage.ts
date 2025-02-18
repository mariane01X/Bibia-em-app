import { IStorage } from "./types";
import createMemoryStore from "memorystore";
import session from "express-session";
import { User, Verse, Devotional, Prayer, InsertUser, InsertVerse, InsertDevotional, InsertPrayer } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private verses: Map<number, Verse>;
  private devotionals: Map<number, Devotional>;
  private prayers: Map<number, Prayer>;
  public sessionStore: session.Store;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.verses = new Map();
    this.devotionals = new Map();
    this.prayers = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentId++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async getVerses(userId: number): Promise<Verse[]> {
    return Array.from(this.verses.values()).filter(
      (verse) => verse.userId === userId,
    );
  }

  async createVerse(verse: InsertVerse): Promise<Verse> {
    const id = this.currentId++;
    const newVerse = { ...verse, id };
    this.verses.set(id, newVerse);
    return newVerse;
  }

  async updateVerse(id: number, verse: Partial<Verse>): Promise<Verse> {
    const existing = this.verses.get(id);
    if (!existing) throw new Error("Verse not found");
    const updated = { ...existing, ...verse };
    this.verses.set(id, updated);
    return updated;
  }

  async getDevotionals(userId: number): Promise<Devotional[]> {
    return Array.from(this.devotionals.values()).filter(
      (devotional) => devotional.userId === userId,
    );
  }

  async createDevotional(devotional: InsertDevotional): Promise<Devotional> {
    const id = this.currentId++;
    const newDevotional = { ...devotional, id };
    this.devotionals.set(id, newDevotional);
    return newDevotional;
  }

  async getPrayers(userId: number): Promise<Prayer[]> {
    return Array.from(this.prayers.values()).filter(
      (prayer) => prayer.userId === userId,
    );
  }

  async createPrayer(prayer: InsertPrayer): Promise<Prayer> {
    const id = this.currentId++;
    const newPrayer = { ...prayer, id };
    this.prayers.set(id, newPrayer);
    return newPrayer;
  }

  async updatePrayer(id: number, prayer: Partial<Prayer>): Promise<Prayer> {
    const existing = this.prayers.get(id);
    if (!existing) throw new Error("Prayer not found");
    const updated = { ...existing, ...prayer };
    this.prayers.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
