import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("Iniciando configuração do banco de dados...");

let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  console.log("Criando pool de conexões...");
  pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log("Inicializando Drizzle ORM...");
  db = drizzle(pool, { schema });

  // Teste de conexão
  pool.query('SELECT NOW()').then(() => {
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
  }).catch(error => {
    console.error("Erro ao testar conexão com o banco:", error);
    throw error;
  });

} catch (error) {
  console.error("Erro fatal na configuração do banco de dados:", error);
  throw error;
}

export { pool, db };