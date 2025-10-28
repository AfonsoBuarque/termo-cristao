require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createTable, saveScore, getTopScores } = require('./db');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Criar tabela ao iniciar o servidor
createTable();

// Endpoint para salvar pontuação
app.post('/api/scores', async (req, res) => {
    try {
        const { playerName, timeSeconds, word, attempts } = req.body;
        const score = await saveScore(playerName, timeSeconds, word, attempts);
        res.json(score);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao salvar pontuação' });
    }
});

// Endpoint para buscar top 10
app.get('/api/scores', async (req, res) => {
    try {
        const scores = await getTopScores();
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar pontuações' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
