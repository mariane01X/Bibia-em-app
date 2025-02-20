import { IStorage } from "./types";
import session from "express-session";
import { users, verses, devotionals, prayers } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import type { User, Verse, Devotional, Prayer, InsertUser, InsertVerse, InsertDevotional, InsertPrayer } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { sql } from "drizzle-orm";
import crypto from 'crypto';

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    console.log('Inicializando DatabaseStorage...');
    try {
      this.sessionStore = new PostgresSessionStore({ 
        pool, 
        createTableIfMissing: true,
        tableName: 'session',  // Nome explícito da tabela de sessão
        pruneSessionInterval: 60 * 15, // Limpa sessões expiradas a cada 15 minutos
        errorLog: console.error.bind(console, 'PostgresSessionStore error:')
      });
      console.log('SessionStore configurado com sucesso');
    } catch (error) {
      console.error('Erro ao configurar SessionStore:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      console.log('Buscando usuário por ID:', id);
      const [user] = await db.select().from(users).where(eq(users.id, id));
      console.log('Usuário encontrado:', user?.nomeUsuario || 'não encontrado');
      return user;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return undefined;
    }
  }

  async getUserByUsername(nomeUsuario: string): Promise<User | undefined> {
    try {
      console.log('Buscando usuário por nome:', nomeUsuario);
      const [user] = await db.select().from(users).where(sql`LOWER(nome_usuario) = LOWER(${nomeUsuario})`);
      console.log('Usuário encontrado:', user?.nomeUsuario || 'não encontrado');
      return user;
    } catch (error) {
      console.error("Erro ao buscar usuário por nome:", error);
      return undefined;
    }
  }

  async createUser(user: InsertUser & { id?: string }): Promise<User> {
    try {
      console.log('Criando novo usuário:', user.nomeUsuario);
      const [created] = await db.insert(users)
        .values({ 
          id: user.id || crypto.randomUUID(),
          ...user 
        })
        .returning();
      console.log('Usuário criado com sucesso:', created.nomeUsuario);
      return created;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      console.log('Atualizando usuário:', id);
      const [updated] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      if (!updated) throw new Error("Usuário não encontrado");
      console.log('Usuário atualizado com sucesso:', updated.nomeUsuario);
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
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

  async getRandomPrayers(limit: number) {
    return db.select().from(prayers).orderBy(sql`RANDOM()`).limit(limit);
  }

  async getTotalPrayers() {
    const result = await db.select({ 
      count: sql<number>`sum(cast(total_oracoes as integer))` 
    }).from(prayers);
    return result[0]?.count || 0;
  }

  async cleanOldPrayers() {
    const total = await this.getTotalPrayers();
    if (total >= 400) {
      await db.delete(prayers)
        .where(sql`data_criacao < (SELECT data_criacao FROM prayers ORDER BY data_criacao DESC OFFSET 100 LIMIT 1)`);
    }
  }
}

export const storage = new DatabaseStorage();