class TermoGame {
    constructor() {
        this.WORD_LENGTH = 5;
        this.TRIES = 6;
        this.currentRow = 0;
        this.currentTile = 0;
        this.gameOver = false;
        this.words = WORDS_DATA.words;
        this.hints = WORDS_DATA.hints;
        this.word = this.getTodaysWord();
        this.hint = this.getWordHint(this.word);
        this.startTime = new Date();
        
        this.initializeBoard();
        this.initializeKeyboard();
        this.initializeEventListeners();
        this.initializeHintButton();
        this.initializeScoreboard();
        
        // Desabilita o botão de dica inicialmente
        const hintBtn = document.getElementById('hintBtn');
        hintBtn.style.display = 'none';
    }

    initializeBoard() {
        const board = document.getElementById('board');
        for (let i = 0; i < this.TRIES; i++) {
            const row = document.createElement('div');
            row.className = 'board-row';
            
            for (let j = 0; j < this.WORD_LENGTH; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                row.appendChild(tile);
            }
            
            board.appendChild(row);
        }
    }

    initializeKeyboard() {
        document.querySelectorAll('#keyboard button').forEach(button => {
            button.addEventListener('click', () => {
                const key = button.getAttribute('data-key');
                if (key === 'ENTER') {
                    this.submitGuess();
                } else if (key === 'BACKSPACE') {
                    this.deleteLetter();
                } else {
                    this.addLetter(key);
                }
            });
        });
    }

    initializeEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            if (e.key === 'Enter') {
                this.submitGuess();
            } else if (e.key === 'Backspace') {
                this.deleteLetter();
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                this.addLetter(e.key.toUpperCase());
            }
        });
    }

    initializeHintButton() {
        const hintBtn = document.getElementById('hintBtn');
        hintBtn.addEventListener('click', () => this.showHint());
    }

    initializeScoreboard() {
        const statsBtn = document.getElementById('statsBtn');
        const closeBtn = document.getElementById('closeScoreboard');
        const saveBtn = document.getElementById('saveScore');
        
        statsBtn.addEventListener('click', () => this.showScoreboard());
        closeBtn.addEventListener('click', () => {
            document.getElementById('scoreboardModal').classList.add('hidden');
        });
        saveBtn.addEventListener('click', () => this.saveScore());
        
        if (!localStorage.getItem('termoscores')) {
            localStorage.setItem('termoscores', JSON.stringify([]));
        }
    }

    addLetter(letter) {
        if (this.currentTile < this.WORD_LENGTH && this.currentRow < this.TRIES && !this.gameOver) {
            const row = document.getElementsByClassName('board-row')[this.currentRow];
            const tile = row.children[this.currentTile];
            tile.textContent = letter;
            tile.classList.add('filled');
            this.currentTile++;
        }
    }

    deleteLetter() {
        if (this.currentTile > 0 && !this.gameOver) {
            this.currentTile--;
            const row = document.getElementsByClassName('board-row')[this.currentRow];
            const tile = row.children[this.currentTile];
            tile.textContent = '';
            tile.classList.remove('filled');
        }
    }

    submitGuess() {
        if (this.gameOver) return;
        
        if (this.currentTile !== this.WORD_LENGTH) {
            this.showMessage('Palavra incompleta!');
            return;
        }

        const row = document.getElementsByClassName('board-row')[this.currentRow];
        const guess = Array.from(row.children).map(tile => tile.textContent).join('');

        if (!this.words.includes(guess)) {
            this.showMessage('Palavra não está na lista!');
            return;
        }
        
        this.checkGuess(guess, row);
        
        if (guess === this.word) {
            this.gameOver = true;
            const timeSpent = new Date() - this.startTime;
            this.showVictoryModal(timeSpent);
            document.getElementById('hintBtn').style.display = 'none';
            return;
        }

        this.currentRow++;
        this.currentTile = 0;
        
        // Mostra o botão de dica apenas quando estiver na última tentativa
        if (this.currentRow === this.TRIES - 1) {
            document.getElementById('hintBtn').style.display = 'block';
        }
        
        if (this.currentRow === this.TRIES) {
            this.gameOver = true;
            this.showMessage(`Fim de jogo! A palavra era ${this.word}`);
            document.getElementById('hintBtn').style.display = 'none';
        }
    }

    checkGuess(guess, row) {
        const guessArray = guess.split('');
        const wordArray = this.word.split('');
        const result = Array(this.WORD_LENGTH).fill('absent');
        const letterCount = {};

        wordArray.forEach(letter => {
            letterCount[letter] = (letterCount[letter] || 0) + 1;
        });

        guessArray.forEach((letter, index) => {
            if (letter === wordArray[index]) {
                result[index] = 'correct';
                letterCount[letter]--;
            }
        });

        guessArray.forEach((letter, index) => {
            if (result[index] !== 'correct' && letterCount[letter] > 0) {
                result[index] = 'present';
                letterCount[letter]--;
            }
        });

        guessArray.forEach((letter, index) => {
            const tile = row.children[index];
            const keyboardKey = document.querySelector(`button[data-key="${letter}"]`);
            
            setTimeout(() => {
                tile.classList.add(result[index]);
                
                if (!keyboardKey.classList.contains('correct')) {
                    if (result[index] === 'correct' || 
                        (result[index] === 'present' && !keyboardKey.classList.contains('present')) ||
                        (result[index] === 'absent' && !keyboardKey.classList.contains('present'))) {
                        keyboardKey.classList.remove('correct', 'present', 'absent');
                        keyboardKey.classList.add(result[index]);
                    }
                }
            }, index * 100);
        });
    }

    showHint() {
        this.showMessage(this.hint, 5000);
    }

    showMessage(text, duration = 2000) {
        const message = document.getElementById('message');
        message.textContent = text;
        message.classList.remove('hidden');
        setTimeout(() => {
            message.classList.add('hidden');
        }, duration);
    }

    showVictoryModal(timeSpent) {
        const modal = document.getElementById('victoryModal');
        const timeSpentElement = document.getElementById('timeSpent');
        timeSpentElement.textContent = this.formatTime(timeSpent);
        modal.classList.remove('hidden');
    }

    async saveScore() {
        const playerName = document.getElementById('playerName').value.trim();
        if (!playerName) {
            this.showMessage('Por favor, digite seu nome!');
            return;
        }

        const timeSpent = new Date() - this.startTime;
        const scoreData = {
            playerName: playerName,
            timeSeconds: Math.floor(timeSpent / 1000),
            word: this.word,
            attempts: this.currentRow + 1
        };

        try {
            const response = await fetch('http://localhost:3001/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(scoreData)
            });

            if (!response.ok) {
                throw new Error('Falha ao salvar pontuação');
            }

            document.getElementById('victoryModal').classList.add('hidden');
            this.showScoreboard();
        } catch (error) {
            this.showMessage('Erro ao salvar pontuação. Tente novamente.');
            console.error('Erro:', error);
        }
    }

    async showScoreboard() {
        const modal = document.getElementById('scoreboardModal');
        const list = document.getElementById('scoreboardList');
        list.innerHTML = '<p>Carregando...</p>';
        modal.classList.remove('hidden');

        try {
            const response = await fetch('http://localhost:3001/api/scores');
            if (!response.ok) {
                throw new Error('Falha ao buscar pontuações');
            }
            const scores = await response.json();

            list.innerHTML = '';
            if (scores.length === 0) {
                list.innerHTML = '<p>Ainda não há pontuações.</p>';
                return;
            }

            scores.forEach((score, index) => {
                const item = document.createElement('div');
                item.className = 'score-item';
                item.innerHTML = `
                    <span class="score-name">${index + 1}. ${score.player_name}</span>
                    <span class="score-time">${this.formatTime(score.time_seconds * 1000)}</span>
                `;
                list.appendChild(item);
            });
        } catch (error) {
            list.innerHTML = '<p>Erro ao carregar pontuações.</p>';
            console.error('Erro:', error);
        }
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    getTodaysWord() {
        const hoje = new Date();
        const index = (hoje.getFullYear() * 10000 + (hoje.getMonth() + 1) * 100 + hoje.getDate()) % this.words.length;
        return this.words[index];
    }

    getWordHint(word) {
        return this.hints[word] || this.hints["default"];
    }
}

// Inicializa o jogo
const game = new TermoGame();
