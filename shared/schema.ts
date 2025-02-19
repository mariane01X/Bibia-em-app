import { pgTable, text, uuid, boolean, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable('users', {
  id: text('id').primaryKey(),  // Mudado de uuid para text para aceitar o master-user
  nomeUsuario: text('nome_usuario').notNull(),
  senha: text('senha').notNull(),
  idadeConversao: text('idade_conversao'),
  dataBatismo: text('data_batismo'),
  editCounter: integer('edit_counter').default(0),
});

export const verses = pgTable('verses', {
  id: uuid('id').primaryKey().defaultRandom(),
  referencia: text('referencia').notNull(),
  conteudo: text('conteudo').notNull(),
  categoria: text('categoria'),
  progresso: text('progresso').default('0'),
  dataCriacao: timestamp('data_criacao').defaultNow(),
  usuarioId: text('usuario_id').notNull().references(() => users.id),
});

export const devotionals = pgTable('devotionals', {
  id: uuid('id').primaryKey().defaultRandom(),
  titulo: text('titulo').notNull(),
  conteudo: text('conteudo').notNull(),
  tema: text('tema'),
  data: timestamp('data').defaultNow(),
  usuarioId: text('usuario_id').notNull().references(() => users.id),
});

export const prayers = pgTable('prayers', {
  id: uuid('id').primaryKey().defaultRandom(),
  titulo: text('titulo').notNull(),
  descricao: text('descricao').notNull(),
  idade: text('idade').notNull(),
  oradores: text('oradores').array().default([]).notNull(),
  totalOracoes: text('total_oracoes').default('0'),
  dataCriacao: timestamp('data_criacao').defaultNow(),
  usuarioId: text('usuario_id').notNull().references(() => users.id),
});

// Relações
export const usersRelations = relations(users, ({ many }) => ({
  verses: many(verses),
  devotionals: many(devotionals),
  prayers: many(prayers),
}));

// Tipos do esquema
export type User = typeof users.$inferSelect;
export type Verse = typeof verses.$inferSelect;
export type Devotional = typeof devotionals.$inferSelect;
export type Prayer = typeof prayers.$inferSelect;

// Tipos para inserção
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertVerseSchema = createInsertSchema(verses);
export const insertDevotionalSchema = createInsertSchema(devotionals);
export const insertPrayerSchema = createInsertSchema(prayers);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVerse = z.infer<typeof insertVerseSchema>;
export type InsertDevotional = z.infer<typeof insertDevotionalSchema>;
export type InsertPrayer = z.infer<typeof insertPrayerSchema>;