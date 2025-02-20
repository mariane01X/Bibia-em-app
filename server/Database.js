const { Pool } = require("pg");
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL não está definida nas variáveis de ambiente");
}

// Substitui a URL para usar o pooler do Neon Database (se necessário)
const poolUrl = databaseUrl.includes("neon.tech") 
    ? databaseUrl.replace(".us-east", "-pooler.us-east") 
    : databaseUrl;

const pool = new Pool({
    connectionString: poolUrl,
    max: 20, // Aumentado o número máximo de conexões simultâneas
    idleTimeoutMillis: 30000, // Tempo máximo de inatividade antes de desconectar (30s)
    connectionTimeoutMillis: 5000, // Aumentado o tempo máximo de espera por uma conexão (5s)
    ssl: {
        rejectUnauthorized: false, // Para evitar problemas de certificação SSL
    },
});

// Monitoramento de eventos do pool
pool.on('connect', () => {
    console.log('Nova conexão estabelecida com o banco de dados');
});

pool.on('error', (err) => {
    console.error('Erro inesperado no pool de conexões:', err);
});

// Função genérica para executar consultas no banco de dados
async function queryDatabase(query, params = []) {
    const client = await pool.connect();
    try {
        console.log('Executando query:', query.replace(/\s+/g, ' ').trim());
        const result = await client.query(query, params);
        return result.rows;
    } catch (error) {
        console.error("Erro na consulta ao banco:", error);
        throw error;
    } finally {
        client.release(); // Libera a conexão de volta para o pool
    }
}

// Função para verificar a conexão com o banco
async function checkDatabaseConnection() {
    try {
        const result = await queryDatabase('SELECT NOW()');
        console.log('Conexão com o banco de dados estabelecida:', result[0]);
        return true;
    } catch (error) {
        console.error('Erro ao verificar conexão com o banco:', error);
        return false;
    }
}

module.exports = {
    queryDatabase,
    checkDatabaseConnection,
    pool,
};