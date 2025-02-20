
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
    }).on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.error('Porta já está em uso. Tentando novamente em 1 segundo...');
        setTimeout(() => {
          server.close();
          server.listen(port, "0.0.0.0");
        }, 1000);
      }
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
})();
