import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Configura o pool com retry
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  max: 20,
  idleTimeoutMillis: 30000,
  maxUses: 7500,
});

// Teste a conexão imediatamente
pool.connect().catch(err => {
  console.error("Failed to connect to the database:", err);
  process.exit(1);
});

export const db = drizzle(pool, { schema });