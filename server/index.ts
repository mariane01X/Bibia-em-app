
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";

const app = express();
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  const server = await setupVite(app);
}

(async () => {
  try {
    const server = await registerRoutes(app);

    const port = 5001;
    server.listen(port, "0.0.0.0", () => {
      console.log(`Servidor rodando exclusivamente em http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
})();
