
import express from "express";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());

(async () => {
  try {
    const server = await registerRoutes(app);

    const port = Number(process.env.PORT || 5000);
    server.listen(port, "0.0.0.0", () => {
      console.log(`Servidor rodando em http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
})();
