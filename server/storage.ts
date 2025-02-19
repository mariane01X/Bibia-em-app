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

  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      return undefined;
    }
  }

  async getUserByUsername(nomeUsuario: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.nomeUsuario, nomeUsuario));
      return user;
    } catch (error) {
      console.error("Erro ao buscar usuário por nome:", error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getVerses(usuarioId: string): Promise<Verse[]> {
    return db.select().from(verses).where(eq(verses.usuarioId, usuarioId));
  }

  async createVerse(verse: InsertVerse): Promise<Verse> {
    const [created] = await db.insert(verses).values(verse).returning();
    return created;
  }

  async updateVerse(id: string, verse: Partial<Verse>): Promise<Verse> {
    const [updated] = await db
      .update(verses)
      .set(verse)
      .where(eq(verses.id, id))
      .returning();
    if (!updated) throw new Error("Versículo não encontrado");
    return updated;
  }

  async getDevotionals(usuarioId: string): Promise<Devotional[]> {
    return db.select().from(devotionals).where(eq(devotionals.usuarioId, usuarioId));
  }

  async createDevotional(devotional: InsertDevotional): Promise<Devotional> {
    const [created] = await db.insert(devotionals).values(devotional).returning();
    return created;
  }

  async getPrayers(usuarioId: string): Promise<Prayer[]> {
    return db.select().from(prayers).where(eq(prayers.usuarioId, usuarioId));
  }

  async createPrayer(prayer: InsertPrayer): Promise<Prayer> {
    const [created] = await db.insert(prayers).values(prayer).returning();
    return created;
  }

  async updatePrayer(id: string, prayer: Partial<Prayer>): Promise<Prayer> {
    const [updated] = await db
      .update(prayers)
      .set(prayer)
      .where(eq(prayers.id, id))
      .returning();
    if (!updated) throw new Error("Oração não encontrada");
    return updated;
  }
}

export const storage = new DatabaseStorage();