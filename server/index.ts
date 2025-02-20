
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";

const app = express();
app.use(express.json());

const API_PORT = 5001;
const VITE_PORT = 5173;

if (process.env.NODE_ENV !== "production") {
  const viteServer = await setupVite(app, VITE_PORT);
}

(async () => {
  try {
    const server = await registerRoutes(app);

    server.listen(API_PORT, "0.0.0.0", () => {
      console.log(`API rodando em http://0.0.0.0:${API_PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
})();
