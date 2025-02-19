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
    console.log("Inicializando DatabaseStorage");
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      console.log(`Buscando usuário com ID: ${id}`);
      const [user] = await db.select().from(users).where(eq(users.id, id));
      console.log(user ? "Usuário encontrado" : "Usuário não encontrado");
      return user;
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      return undefined;
    }
  }

  async getUserByUsername(nomeUsuario: string): Promise<User | undefined> {
    try {
      console.log(`Buscando usuário com nome: ${nomeUsuario}`);
      const [user] = await db.select().from(users).where(sql`LOWER(nome_usuario) = LOWER(${nomeUsuario})`);
      console.log(user ? "Usuário encontrado" : "Usuário não encontrado");
      return user;
    } catch (error) {
      console.error("Erro ao buscar usuário por nome:", error);
      return undefined;
    }
  }

  async createUser(user: InsertUser & { id?: string }): Promise<User> {
    console.log("Criando novo usuário:", { ...user, senha: "[REDACTED]" });
    const [created] = await db.insert(users)
      .values({ 
        id: user.id || crypto.randomUUID(),
        ...user 
      })
      .returning();
    console.log("Usuário criado com sucesso");
    return created;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      console.log(`Atualizando usuário ${id}:`, userData);
      const [updated] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      if (!updated) throw new Error("Usuário não encontrado");
      console.log("Usuário atualizado com sucesso");
      return updated;
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  }

  async getVerses(usuarioId: string): Promise<Verse[]> {
    console.log(`Buscando versículos para usuário: ${usuarioId}`);
    const results = await db.select().from(verses).where(eq(verses.usuarioId, usuarioId));
    console.log(`${results.length} versículos encontrados`);
    return results;
  }

  async createVerse(verse: InsertVerse): Promise<Verse> {
    console.log("Criando novo versículo:", verse);
    const [created] = await db.insert(verses).values(verse).returning();
    console.log("Versículo criado com sucesso");
    return created;
  }

  async updateVerse(id: string, verse: Partial<Verse>): Promise<Verse> {
    console.log(`Atualizando versículo ${id}:`, verse);
    const [updated] = await db
      .update(verses)
      .set(verse)
      .where(eq(verses.id, id))
      .returning();
    if (!updated) throw new Error("Versículo não encontrado");
    console.log("Versículo atualizado com sucesso");
    return updated;
  }

  async getDevotionals(usuarioId: string): Promise<Devotional[]> {
    console.log(`Buscando devocionais para usuário: ${usuarioId}`);
    const results = await db.select().from(devotionals).where(eq(devotionals.usuarioId, usuarioId));
    console.log(`${results.length} devocionais encontrados`);
    return results;
  }

  async createDevotional(devotional: InsertDevotional): Promise<Devotional> {
    console.log("Criando novo devocional:", devotional);
    const [created] = await db.insert(devotionals).values(devotional).returning();
    console.log("Devocional criado com sucesso");
    return created;
  }

  async getPrayers(usuarioId: string): Promise<Prayer[]> {
    console.log(`Buscando orações para usuário: ${usuarioId}`);
    const results = await db.select().from(prayers).where(eq(prayers.usuarioId, usuarioId));
    console.log(`${results.length} orações encontradas`);
    return results;
  }

  async createPrayer(prayer: InsertPrayer): Promise<Prayer> {
    console.log("Criando nova oração:", prayer);
    const [created] = await db.insert(prayers).values(prayer).returning();
    console.log("Oração criada com sucesso");
    return created;
  }

  async updatePrayer(id: string, prayer: Partial<Prayer>): Promise<Prayer> {
    console.log(`Atualizando oração ${id}:`, prayer);
    const [updated] = await db
      .update(prayers)
      .set(prayer)
      .where(eq(prayers.id, id))
      .returning();
    if (!updated) throw new Error("Oração não encontrada");
    console.log("Oração atualizada com sucesso");
    return updated;
  }

  async getRandomPrayers(limit: number) {
    console.log(`Buscando ${limit} orações aleatórias`);
    const results = await db.select().from(prayers).orderBy(sql`RANDOM()`).limit(limit);
    console.log(`${results.length} orações aleatórias encontradas`);
    return results;
  }

  async getTotalPrayers() {
    console.log("Calculando total de orações");
    const result = await db.select({ 
      count: sql<number>`sum(cast(total_oracoes as integer))` 
    }).from(prayers);
    const total = result[0]?.count || 0;
    console.log(`Total de orações: ${total}`);
    return total;
  }

  async cleanOldPrayers() {
    console.log("Iniciando limpeza de orações antigas");
    const total = await this.getTotalPrayers();
    if (total >= 400) {
      console.log("Removendo orações antigas (mais de 100)");
      await db.delete(prayers)
        .where(sql`data_criacao < (SELECT data_criacao FROM prayers ORDER BY data_criacao DESC OFFSET 100 LIMIT 1)`);
      console.log("Limpeza concluída");
    } else {
      console.log("Não é necessário limpar orações antigas");
    }
  }
}

export const storage = new DatabaseStorage();