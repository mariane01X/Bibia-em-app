import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Configuração robusta do pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 30000, // 30 segundos para timeout
  idleTimeoutMillis: 10000 // 10 segundos de idle
});

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 10000;

async function connectWithRetry(retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) {
  try {
    const client = await pool.connect();
    console.log("Database connection established successfully");
    client.release();
    return true;
  } catch (err) {
    console.error("Database connection failed:", err);

    if (retries > 0) {
      const nextDelay = Math.min(delay * 2, MAX_RETRY_DELAY);
      console.log(`Retrying in ${delay/1000} seconds... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectWithRetry(retries - 1, nextDelay);
    }

    console.error("Max retries reached, but application will continue running...");
    return false;
  }
}

// Teste a conexão inicial
connectWithRetry().catch(console.error);

// Gerenciamento de erros mais robusto
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  // Tentar reconectar automaticamente após erro inesperado
  setTimeout(() => {
    console.log('Attempting to reconnect after pool error...');
    connectWithRetry(2).catch(console.error);
  }, 5000);
});

export const db = drizzle(pool, { schema });