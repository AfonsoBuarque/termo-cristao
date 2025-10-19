const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgres://postgres:postgres@91.229.245.81:5434/n8n?sslmode=disable'
});

async function checkDatabase() {
    try {
        // Testa a conexão
        const client = await pool.connect();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');

        // Verifica se a tabela existe
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'termo'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            console.log('❌ Tabela "termo" não encontrada. Criando tabela...');
            
            // Cria a tabela
            await client.query(`
                CREATE TABLE termo (
                    id SERIAL PRIMARY KEY,
                    player_name VARCHAR(100) NOT NULL,
                    time_seconds INTEGER NOT NULL,
                    word VARCHAR(5) NOT NULL,
                    attempts INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            
            console.log('✅ Tabela "termo" criada com sucesso!');
        } else {
            console.log('✅ Tabela "termo" já existe!');
            
            // Mostra a estrutura da tabela
            const tableInfo = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'termo';
            `);
            
            console.log('\nEstrutura da tabela:');
            tableInfo.rows.forEach(col => {
                console.log(`${col.column_name}: ${col.data_type}`);
            });
        }

        client.release();
    } catch (err) {
        console.error('❌ Erro ao verificar banco de dados:', err);
    } finally {
        await pool.end();
    }
}

checkDatabase();
