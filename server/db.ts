import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Configura o pool com retry e logs
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  max: 20,
  idleTimeoutMillis: 30000,
  maxUses: 7500,
  keepAlive: true,
  keepAliveTimeoutMillis: 1000,
});

// Teste a conexão imediatamente e adiciona logs
pool.connect()
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch(err => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
});

// Log de queries para debug e reconexão automática
pool.on('error', async (err) => {
  console.error('Unexpected error on idle client', err);
  try {
    await pool.end();
    await pool.connect();
    console.log("Reconnected to database after error");
  } catch (reconnectErr) {
    console.error('Failed to reconnect:', reconnectErr);
    process.exit(-1);
  }
});

export const db = drizzle(pool, { schema });