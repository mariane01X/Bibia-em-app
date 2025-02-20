// testConnection.js
const { queryDatabase } = require('./server/Database.js');

async function testDatabaseConnection() {node testConnection.jsconst { Pool } = require("pg");
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL;

// Substitui a URL para usar o pooler do Neon Database (se necessário)
const poolUrl = databaseUrl.includes("neon.tech") 
    ? databaseUrl.replace(".us-east", "-pooler.us-east") 
    : databaseUrl;

const pool = new Pool({
    connectionString: poolUrl,
    max: 10, // Define o número máximo de conexões simultâneas
    idleTimeoutMillis: 30000, // Tempo máximo de inatividade antes de desconectar (30s)
    connectionTimeoutMillis: 2000, // Tempo máximo de espera por uma conexão (2s)
    ssl: {
        rejectUnauthorized: false, // Para evitar problemas de certificação SSL
    },
});

// Função genérica para executar consultas no banco de dados
async function queryDatabase(query, params = []) {
    const client = await pool.connect();
    try {
        const result = await client.query(query, params);
        return result.rows;
    } catch (error) {
        console.error("Erro na consulta ao banco:", error);
        throw error;
    } finally {
        client.release(); // Libera a conexão de volta para o pool
    }
}

module.exports = {
    queryDatabase,
    pool, // Exporta o pool caso precise para outras funções
};
