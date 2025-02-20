import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { pool } from "./db";

async function startServer() {
  const app = express();
  app.use(express.json());

  // Usar a porta 5000 conforme especificado no .replit
  const API_PORT = 5000;

  try {
    // Verifica a conexão com o banco de dados
    console.log("Verificando conexão com o banco de dados...");
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('Conexão com o banco de dados estabelecida:', result.rows[0]);
    } catch (error) {
      console.error("Falha ao conectar com o banco de dados:", error);
      process.exit(1);
    }
    console.log("Conexão com o banco de dados estabelecida com sucesso");

    // Cria o servidor HTTP
    console.log("Registrando rotas da API...");
    const server = await registerRoutes(app);

    // Configura o Vite em desenvolvimento depois das rotas
    if (process.env.NODE_ENV !== "production") {
      console.log("Configurando Vite para ambiente de desenvolvimento");
      try {
        await setupVite(app, server);
        console.log("Vite configurado com sucesso");
      } catch (error) {
        console.error("Erro ao configurar Vite:", error);
        process.exit(1);
      }
    } else {
      console.log("Configurando servidor para produção");
      serveStatic(app);
    }

    console.log(`Tentando iniciar o servidor na porta ${API_PORT}...`);
    server.listen(API_PORT, '0.0.0.0', () => {
      console.log(`API rodando em http://0.0.0.0:${API_PORT}`);
    });

    // Adiciona handler para erros do servidor
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Porta ${API_PORT} já está em uso. Encerrando...`);
        process.exit(1);
      } else {
        console.error('Erro no servidor:', error);
      }
    });

  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);