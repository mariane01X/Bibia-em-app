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
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Processo otimizado para encontrar porta disponível
  const findAvailablePort = async (startPort: number): Promise<number> => {
    const net = await import('node:net');
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(startPort, "0.0.0.0", () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          const { port } = address;
          server.close(() => resolve(port));
        } else {
          server.close(() => resolve(startPort));
        }
      });
      server.on('error', () => resolve(findAvailablePort(startPort + 1)));
    });
  };

  const port = await findAvailablePort(5000);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();