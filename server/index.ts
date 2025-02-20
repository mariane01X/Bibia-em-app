import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { checkDatabaseConnection } from "./Database";

async function startServer() {
  const app = express();
  app.use(express.json());

  const API_PORT = process.env.PORT || 5001;

  try {
    // Verifica a conexão com o banco de dados
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.error("Falha ao conectar com o banco de dados");
      process.exit(1);
    }

    // Configura o Vite em desenvolvimento
    if (process.env.NODE_ENV !== "production") {
      await setupVite(app);
    } else {
      serveStatic(app);
    }

    // Registra as rotas da API
    const server = await registerRoutes(app);

    server.listen(API_PORT, "0.0.0.0", () => {
      console.log(`API rodando em http://0.0.0.0:${API_PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);