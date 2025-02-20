import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Configuração mais resiliente do pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10 segundos
  max: 5, // Número reduzido de conexões
  idleTimeoutMillis: 30000 // 30 segundos
});

// Teste a conexão imediatamente
pool.connect()
  .then(() => {
    console.log("Database connection established successfully");
  })
  .catch(err => {
    console.error("Initial database connection failed:", err);
    process.exit(1);
});

// Gerenciamento de erros mais robusto
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  // Apenas loga o erro, não encerra o processo
  // Permite que o pool tente reconectar automaticamente
});

export const db = drizzle(pool, { schema });