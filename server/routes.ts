import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertVerseSchema, insertDevotionalSchema, insertPrayerSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/verses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const verses = await storage.getVerses(req.user.id);
    res.json(verses);
  });

  app.post("/api/verses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const verse = insertVerseSchema.parse({ ...req.body, userId: req.user.id });
      const created = await storage.createVerse(verse);
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.patch("/api/verses/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const updated = await storage.updateVerse(parseInt(req.params.id), req.body);
    res.json(updated);
  });

  app.get("/api/devotionals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const devotionals = await storage.getDevotionals(req.user.id);
    res.json(devotionals);
  });

  app.post("/api/devotionals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const devotional = insertDevotionalSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const created = await storage.createDevotional(devotional);
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.get("/api/prayers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const prayers = await storage.getPrayers(req.user.id);
    res.json(prayers);
  });

  app.post("/api/prayers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const prayer = insertPrayerSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const created = await storage.createPrayer(prayer);
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.patch("/api/prayers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const updated = await storage.updatePrayer(parseInt(req.params.id), req.body);
    res.json(updated);
  });

  const httpServer = createServer(app);
  return httpServer;
}
