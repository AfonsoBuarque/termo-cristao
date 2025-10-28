const { Pool } = require('pg');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Carregada' : 'Não encontrada');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Criar a tabela se não existir
const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS termo (
                id SERIAL PRIMARY KEY,
                player_name VARCHAR(100) NOT NULL,
                time_seconds INTEGER NOT NULL,
                word VARCHAR(5) NOT NULL,
                attempts INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Tabela criada/verificada com sucesso');
    } catch (err) {
        console.error('Erro ao criar tabela:', err);
    }
};

// Salvar pontuação
const saveScore = async (playerName, timeSeconds, word, attempts) => {
    try {
        const result = await pool.query(
            'INSERT INTO termo (player_name, time_seconds, word, attempts) VALUES ($1, $2, $3, $4) RETURNING *',
            [playerName, timeSeconds, word, attempts]
        );
        return result.rows[0];
    } catch (err) {
        console.error('Erro ao salvar pontuação:', err);
        throw err;
    }
};

// Buscar top 10 pontuações
const getTopScores = async () => {
    try {
        const result = await pool.query(
            'SELECT player_name, time_seconds, word, attempts, created_at FROM termo ORDER BY time_seconds ASC LIMIT 10'
        );
        return result.rows;
    } catch (err) {
        console.error('Erro ao buscar pontuações:', err);
        throw err;
    }
};

module.exports = {
    createTable,
    saveScore,
    getTopScores
};
