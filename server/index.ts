import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de logging otimizado
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    });
  }
  next();
});

(async () => {
  try {
    console.log("Iniciando servidor...");
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Erro no servidor:", err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    if (app.get("env") === "development") {
      console.log("Configurando Vite para desenvolvimento...");
      await setupVite(app, server);
    } else {
      console.log("Configurando modo de produção...");
      serveStatic(app);
    }

    const mainPort = 5000;
    const alternativePorts = [5001, 5002, 5003];
    
    const tryListen = (port) => {
      return new Promise((resolve, reject) => {
        const serverInstance = server.listen(port, "0.0.0.0", () => {
          console.log(`Servidor rodando em http://0.0.0.0:${port}`);
          log(`serving on port ${port}`);
          resolve(true);
        }).on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            resolve(false);
          } else {
            reject(err);
          }
        });
      });
    };

    // Tenta porta principal primeiro
    tryListen(mainPort).then(async (success) => {
      if (!success) {
        console.log(`Porta ${mainPort} em uso, tentando portas alternativas...`);
        for (const port of alternativePorts) {
          const portSuccess = await tryListen(port);
          if (portSuccess) break;
        }
      }
    }).catch((error) => {
      console.error("Erro fatal ao iniciar servidor:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Erro fatal ao iniciar servidor:", error);
    process.exit(1);
  }
})();