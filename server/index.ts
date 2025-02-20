
import express from "express";
import { registerRoutes } from "./routes";
import { createViteDevServer } from "./vite";

const app = express();
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  const vite = await createViteDevServer();
  app.use(vite.middlewares);
}

(async () => {
  try {
    const server = await registerRoutes(app);

    const port = Number(process.env.PORT || 5001);
    server.listen(port, "0.0.0.0", () => {
      console.log(`Servidor rodando em http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
})();
