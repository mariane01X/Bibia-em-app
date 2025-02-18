import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const verses = pgTable("verses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  reference: text("reference").notNull(),
  content: text("content").notNull(),
  progress: integer("progress").notNull().default(0),
  lastReviewed: timestamp("last_reviewed"),
});

export const devotionals = pgTable("devotionals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  theme: text("theme"),
  date: timestamp("date").notNull(),
});

export const prayers = pgTable("prayers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  isAnswered: boolean("is_answered").notNull().default(false),
  reminders: jsonb("reminders").notNull().default([]),
});

export const insertUserSchema = createInsertSchema(users);
export const insertVerseSchema = createInsertSchema(verses).omit({ id: true });
export const insertDevotionalSchema = createInsertSchema(devotionals).omit({ id: true });
export const insertPrayerSchema = createInsertSchema(prayers).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Verse = typeof verses.$inferSelect;
export type Devotional = typeof devotionals.$inferSelect;
export type Prayer = typeof prayers.$inferSelect;
