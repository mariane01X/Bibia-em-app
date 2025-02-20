import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Configura o pool com configurações mínimas e estáveis
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 3000, // Reduzido para 3 segundos
  max: 10, // Reduzido o número máximo de conexões
  idleTimeoutMillis: 10000, // Reduzido para 10 segundos
});

// Teste a conexão imediatamente
pool.connect()
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch(err => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
});

// Log de erros simplificado
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(1);
});

export const db = drizzle(pool, { schema });