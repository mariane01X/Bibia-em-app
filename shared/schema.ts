import { pgTable, text, uuid, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull(),
  password: text('password').notNull(),
});

export const verses = pgTable('verses', {
  id: uuid('id').primaryKey().defaultRandom(),
  reference: text('reference').notNull(),
  content: text('content').notNull(),
  category: text('category'),
  progress: text('progress').default('0'),
  userId: uuid('user_id').notNull().references(() => users.id),
});

export const devotionals = pgTable('devotionals', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  theme: text('theme'),
  date: timestamp('date').defaultNow(),
  userId: uuid('user_id').notNull().references(() => users.id),
});

export const prayers = pgTable('prayers', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category'),
  isAnswered: boolean('is_answered').default(false),
  reminders: jsonb('reminders').default([]),
  userId: uuid('user_id').notNull().references(() => users.id),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  verses: many(verses),
  devotionals: many(devotionals),
  prayers: many(prayers),
}));

// Schema types
export type User = typeof users.$inferSelect;
export type Verse = typeof verses.$inferSelect;
export type Devotional = typeof devotionals.$inferSelect;
export type Prayer = typeof prayers.$inferSelect;

// Insert types
export const insertUserSchema = createInsertSchema(users);
export const insertVerseSchema = createInsertSchema(verses);
export const insertDevotionalSchema = createInsertSchema(devotionals);
export const insertPrayerSchema = createInsertSchema(prayers);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVerse = z.infer<typeof insertVerseSchema>;
export type InsertDevotional = z.infer<typeof insertDevotionalSchema>;
export type InsertPrayer = z.infer<typeof insertPrayerSchema>;