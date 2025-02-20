import express from "express";
import session from "express-session";
import { config } from "./config";
import { router } from "./routes";
import { db } from "./db";

const app = express();

app.use(express.json());
app.use(session(config.session));
app.use('/api', router);

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());

(async () => {
  try {
    const server = await registerRoutes(app);

    const port = Number(process.env.PORT || 5000);
    server.listen(port, "0.0.0.0", () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
})();