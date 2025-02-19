import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertVerseSchema, insertDevotionalSchema, insertPrayerSchema } from "@shared/schema";
import { ZodError } from "zod";
import QRCode from "qrcode";
import { pool, db } from './db';
import { sql } from "drizzle-orm";
import { users } from "@shared/schema";

// Código Pix Copia e Cola atualizado com o código do usuário
const PIX_CODIGO = "00020126330014br.gov.bcb.pix0111042387912075204000053039865802BR5925FELIPE DA COSTA BENCHIMOL6009Sao Paulo62290525REC67B53A45C2E757132927356304BF9B";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Rota de diagnóstico para verificar o banco de dados
  app.get("/api/health", async (req, res) => {
    try {
      console.log("Verificando saúde do banco de dados...");
      // Testa a conexão com o banco
      await pool.query('SELECT NOW()');

      // Tenta contar os usuários para verificar se as tabelas existem
      const [{ count }] = await db.select({ 
        count: sql<number>`count(*)` 
      }).from(users);

      console.log(`Banco de dados saudável. Total de usuários: ${count}`);
      res.json({ 
        status: 'healthy',
        database: 'connected',
        usersCount: count
      });
    } catch (error: any) {
      console.error("Erro no health check:", error);
      res.status(500).json({ 
        status: 'unhealthy',
        error: error.message 
      });
    }
  });

  // Rota para gerar QR Code PIX
  app.get("/api/qrcode-pix", async (req, res) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(PIX_CODIGO);
      res.json({ qrCodeUrl: qrCodeDataURL });
    } catch (error) {
      console.error("Erro ao gerar QR Code PIX:", error);
      res.status(500).json({ error: "Erro ao gerar QR Code PIX" });
    }
  });

  app.get("/api/verses", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Tentativa não autenticada de acessar versículos");
      return res.sendStatus(401);
    }
    try {
      console.log(`Buscando versículos para usuário: ${req.user.id}`);
      const verses = await storage.getVerses(req.user.id);
      console.log(`${verses.length} versículos encontrados`);
      res.json(verses);
    } catch (error) {
      console.error("Erro ao buscar versículos:", error);
      res.status(500).json({ error: "Erro ao buscar versículos" });
    }
  });

  app.post("/api/verses", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Tentativa não autenticada de criar versículo");
      return res.sendStatus(401);
    }
    try {
      console.log("Dados recebidos para criar versículo:", req.body);
      const verse = insertVerseSchema.parse({ ...req.body, usuarioId: req.user.id });
      const created = await storage.createVerse(verse);
      console.log("Versículo criado com sucesso:", created);
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof ZodError) {
        console.error("Erro de validação ao criar versículo:", e.errors);
        res.status(400).json(e.errors);
      } else {
        console.error("Erro ao criar versículo:", e);
        res.status(500).json({ error: "Erro ao criar versículo" });
      }
    }
  });

  app.patch("/api/verses/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Tentativa não autenticada de atualizar versículo");
      return res.sendStatus(401);
    }
    try {
      console.log(`Atualizando versículo ${req.params.id}:`, req.body);
      const updated = await storage.updateVerse(req.params.id, req.body);
      console.log("Versículo atualizado com sucesso:", updated);
      res.json(updated);
    } catch (error) {
      console.error("Erro ao atualizar versículo:", error);
      res.status(500).json({ error: "Erro ao atualizar versículo" });
    }
  });

  app.get("/api/devotionals", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Tentativa não autenticada de acessar devocionais");
      return res.sendStatus(401);
    }
    try {
      console.log(`Buscando devocionais para usuário: ${req.user.id}`);
      const devotionals = await storage.getDevotionals(req.user.id);
      console.log(`${devotionals.length} devocionais encontrados`);
      res.json(devotionals);
    } catch (error) {
      console.error("Erro ao buscar devocionais:", error);
      res.status(500).json({ error: "Erro ao buscar devocionais" });
    }
  });

  app.post("/api/devotionals", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Tentativa não autenticada de criar devocional");
      return res.sendStatus(401);
    }
    try {
      console.log("Dados recebidos para criar devocional:", req.body);
      const devotional = insertDevotionalSchema.parse({
        ...req.body,
        usuarioId: req.user.id,
      });
      const created = await storage.createDevotional(devotional);
      console.log("Devocional criado com sucesso:", created);
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof ZodError) {
        console.error("Erro de validação ao criar devocional:", e.errors);
        res.status(400).json(e.errors);
      } else {
        console.error("Erro ao criar devocional:", e);
        res.status(500).json({ error: "Erro ao criar devocional" });
      }
    }
  });

  app.get("/api/prayers", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Tentativa não autenticada de acessar orações");
      return res.sendStatus(401);
    }
    try {
      console.log(`Buscando orações aleatórias`);
      const prayers = await storage.getRandomPrayers(100);
      console.log(`${prayers.length} orações encontradas`);
      res.json(prayers);
    } catch (error) {
      console.error("Erro ao buscar orações:", error);
      res.status(500).json({ error: "Erro ao buscar orações" });
    }
  });

  app.get("/api/prayers/total", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Tentativa não autenticada de acessar total de orações");
      return res.sendStatus(401);
    }
    try {
      const total = await storage.getTotalPrayers();
      console.log(`Total de orações: ${total}`);
      res.json({ total });
    } catch (error) {
      console.error("Erro ao buscar total de orações:", error);
      res.status(500).json({ error: "Erro ao buscar total de orações" });
    }
  });

  app.post("/api/prayers", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Tentativa não autenticada de criar oração");
      return res.sendStatus(401);
    }
    try {
      console.log("Dados recebidos para criar oração:", req.body);
      const prayer = insertPrayerSchema.parse({
        ...req.body,
        usuarioId: req.user.id,
      });
      const created = await storage.createPrayer(prayer);
      console.log("Oração criada com sucesso:", created);
      res.status(201).json(created);
    } catch (e) {
      if (e instanceof ZodError) {
        console.error("Erro de validação ao criar oração:", e.errors);
        res.status(400).json(e.errors);
      } else {
        console.error("Erro ao criar oração:", e);
        res.status(500).json({ error: "Erro ao criar oração" });
      }
    }
  });

  app.patch("/api/prayers/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Tentativa não autenticada de atualizar oração");
      return res.sendStatus(401);
    }
    try {
      console.log(`Atualizando oração ${req.params.id}:`, req.body);
      const updated = await storage.updatePrayer(req.params.id, req.body);
      console.log("Oração atualizada com sucesso:", updated);
      res.json(updated);
    } catch (error) {
      console.error("Erro ao atualizar oração:", error);
      res.status(500).json({ error: "Erro ao atualizar oração" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}