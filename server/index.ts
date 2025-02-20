import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { pool } from "./db";

async function startServer() {
  console.log("Iniciando processo de inicialização do servidor...");
  const app = express();
  app.use(express.json());

  // Garantir que a porta seja um número
  const API_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

  try {
    // Rota de teste simples
    app.get("/api/test", (req, res) => {
      console.log("Rota de teste acessada");
      res.json({ status: "ok", message: "Servidor funcionando!" });
    });

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

    // Adiciona mais logs para o processo de inicialização
    console.log(`Iniciando servidor na porta ${API_PORT}...`);
    server.listen(API_PORT, () => {
      console.log(`=================================`);
      console.log(`Servidor API rodando em http://0.0.0.0:${API_PORT}`);
      console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=================================`);
    });

    // Adiciona handler para erros do servidor
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`ERRO CRÍTICO: Porta ${API_PORT} já está em uso!`);
        console.error('Verifique se não há outro processo usando esta porta.');
        process.exit(1);
      } else {
        console.error('Erro no servidor:', error);
      }
    });

  } catch (error) {
    console.error('Erro fatal ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Adiciona handler para erros não tratados
process.on('uncaughtException', (error) => {
  console.error('Erro não tratado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Promise rejeitada não tratada:', error);
  process.exit(1);
});

console.log("Iniciando aplicação...");
startServer().catch((error) => {
  console.error('Erro ao iniciar o servidor:', error);
  process.exit(1);
});