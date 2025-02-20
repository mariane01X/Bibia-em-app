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

    const ports = [5000, 5001, 5002, 5003];
    
    const tryListen = async () => {
      for (const port of ports) {
        try {
          await new Promise((resolve, reject) => {
            server.listen(port, "0.0.0.0")
              .once('listening', () => {
                console.log(`Servidor rodando em http://0.0.0.0:${port}`);
                resolve(true);
              })
              .once('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                  console.log(`Porta ${port} em uso, tentando próxima...`);
                  resolve(false);
                } else {
                  reject(err);
                }
              });
          });
          return true;
        } catch (err) {
          console.error(`Erro na porta ${port}:`, err);
        }
      }
      throw new Error('Nenhuma porta disponível');
    };

    const startServer = async () => {
      try {
        await tryListen();
      } catch (error) {
        console.error("Erro fatal ao iniciar servidor:", error);
        process.exit(1);
      }
    };

    startServer();
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