class TermoGame {
    constructor() {
        // ... (código anterior do jogo)

        this.startTime = null;
        this.attempts = 0;
    }

    async saveScore(playerName) {
        const endTime = new Date();
        const timeSeconds = Math.floor((endTime - this.startTime) / 1000);
        
        try {
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerName,
                    timeSeconds,
                    word: this.word,
                    attempts: this.attempts
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar pontuação');
            }

            await this.updateScoreboard();
        } catch (error) {
            console.error('Erro:', error);
            this.showMessage('Erro ao salvar pontuação. Tente novamente.');
        }
    }

    async updateScoreboard() {
        try {
            const response = await fetch('/api/scores');
            const scores = await response.json();
            
            const scoreboardList = document.getElementById('scoreboardList');
            scoreboardList.innerHTML = '';
            
            scores.forEach(score => {
                const scoreItem = document.createElement('div');
                scoreItem.className = 'score-item';
                scoreItem.innerHTML = `
                    <span class="score-name">${score.player_name}</span>
                    <span class="score-time">${score.time_seconds}s</span>
                `;
                scoreboardList.appendChild(scoreItem);
            });
        } catch (error) {
            console.error('Erro ao atualizar placar:', error);
        }
    }

    startGame() {
        // ... (código anterior)
        this.startTime = new Date();
        this.attempts = 0;
    }

    submitGuess() {
        // ... (código anterior)
        this.attempts++;
    }
}

// Inicializar o jogo
const game = new TermoGame();
game.updateScoreboard(); // Carregar placar inicial
