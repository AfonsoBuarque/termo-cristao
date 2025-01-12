class TermoGame {
    constructor() {
        this.WORD_LENGTH = 5;
        this.TRIES = 6;
        this.currentRow = 0;
        this.currentTile = 0;
        this.gameOver = false;
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

    saveScore() {
        const playerName = document.getElementById('playerName').value.trim();
        if (!playerName) {
            this.showMessage('Por favor, digite seu nome!');
            return;
        }

        const timeSpent = new Date() - this.startTime;
        const scores = JSON.parse(localStorage.getItem('termoscores'));
        
        scores.push({
            name: playerName,
            time: timeSpent,
            word: this.word,
            date: new Date().toISOString()
        });

        scores.sort((a, b) => a.time - b.time);
        scores.splice(10); // Mantém apenas os top 10

        localStorage.setItem('termoscores', JSON.stringify(scores));
        document.getElementById('victoryModal').classList.add('hidden');
        this.showScoreboard();
    }

    showScoreboard() {
        const modal = document.getElementById('scoreboardModal');
        const list = document.getElementById('scoreboardList');
        const scores = JSON.parse(localStorage.getItem('termoscores'));

        list.innerHTML = '';
        scores.forEach((score, index) => {
            const item = document.createElement('div');
            item.className = 'score-item';
            item.innerHTML = `
                <span class="score-name">${index + 1}. ${score.name}</span>
                <span class="score-time">${this.formatTime(score.time)}</span>
            `;
            list.appendChild(item);
        });

        modal.classList.remove('hidden');
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    getTodaysWord() {
        // Lista de palavras com tema bíblico - todas com exatamente 5 letras
        const palavras = [
            // Nomes bíblicos
            "JESUS", "MARIA", "PEDRO", "PAULO", "LUCAS", "TIAGO", "JUDAS", "JONAS",
            "SAULO", "DAVID", "ISAAC", "JACOB", "NAOMI", "ESTER", "MOISES", "JOSUE",
            "LAZARO", "PILATO", "BALAM", "SARAI", "ISMAEL", "JETRO", "MIRIA", "CALEB",
            "JESSE", "JOABE", "ABNER", "NABAL", "ASAFE",
            
            // Lugares bíblicos
            "SINAI", "BABEL", "EGITO", "SIRIA", "SALEM", "BELEM", "ASSUR", "MOABE",
            "JORDA", "SIDON", "TIROS", "PATMO", "TARSO", "CRETA", "MALTA",
            
            // Objetos e elementos sagrados
            "ALTAR", "SANTO", "ANJOS", "SALMO", "PODER", "JUSTO", "SABIO", "SERVO",
            "SALVO", "REINO", "GRACA", "HONRA", "FORTE", "MANSO", "FIRME", "PURO",
            "LIMPO", "PROVA", "PACTO", "VALOR", "VIVER", "UNIDO", "LIVRE", "PEDRA",
            "PORTA", "MANTO", "LIVRO", "TRIGO", "VINHO", "PEIXE", "BARCO", "FIGOS",
            "MONTE", "TORRE", "PALMA", "COROA", "OLEO", "VELAS", "MIRRA",
            
            // Conceitos bíblicos
            "GRACA", "SANTO", "JUSTO", "SABIO", "SALVO", "LIVRE", "SERVO", "MEIGO",
            "MANSO", "FORTE", "FIRME", "DIGNO", "NOBRE", "PLENO", "CASTO", "PURO",
            
            // Termos religiosos
            "BISPO", "PADRE", "BENCA", "CREDO", "CULTO", "JEJUM", "REZAR", "ORAR",
            "SACRO", "GRATO", "SALVA", "UNGIR", "SEARA", "PREGA",
            
            // Elementos naturais
            "TRIGO", "FIGOS", "PALMA", "CEDRO", "OLIVA", "POMBA", "LEOES", "OASIS",
            "MONTE", "PEDRA", "ROCHA", "AREIA", "FRUTO", "VINHA"
        ];

        // Validar que todas as palavras têm exatamente 5 letras
        const palavrasValidas = palavras.filter(palavra => palavra.length === 5);
        
        // Se alguma palavra foi removida, logar um aviso
        if (palavrasValidas.length !== palavras.length) {
            console.warn(`Removidas ${palavras.length - palavrasValidas.length} palavras inválidas`);
        }
        
        const hoje = new Date();
        const index = (hoje.getFullYear() * 10000 + (hoje.getMonth() + 1) * 100 + hoje.getDate()) % palavrasValidas.length;
        return palavrasValidas[index];
    }

    getWordHint(word) {
        const dicas = {
            // Nomes bíblicos
            "JESUS": "Salvador do mundo segundo a fé cristã",
            "MARIA": "Mãe de Jesus",
            "PEDRO": "Pescador que se tornou apóstolo",
            "PAULO": "Apóstolo dos gentios",
            "LUCAS": "Médico que escreveu um dos evangelhos",
            "TIAGO": "Irmão de João, um dos doze apóstolos",
            "JUDAS": "Traiu Jesus por 30 moedas de prata",
            "JONAS": "Profeta engolido por um grande peixe",
            "SAULO": "Nome original do apóstolo Paulo",
            "DAVID": "Rei que derrotou Golias",
            "ISAAC": "Filho de Abraão e Sara",
            "JACOB": "Teve doze filhos que formaram as tribos de Israel",
            "NAOMI": "Sogra de Rute",
            "ESTER": "Rainha que salvou seu povo",
            "JOSUE": "Sucessor de Moisés",
            "LAZARO": "Homem que Jesus ressuscitou",
            "PILATO": "Governador romano que condenou Jesus",
            "BALAM": "Profeta que teve uma jumenta falante",
            "SARAI": "Nome original de Sara",
            "ISMAEL": "Filho de Abraão com Agar",
            "JETRO": "Sogro de Moisés",
            "MIRIA": "Irmã de Moisés",
            "CALEB": "Espião que trouxe bom relatório da terra prometida",
            "JESSE": "Pai do rei Davi",
            "JOABE": "General do exército de Davi",
            "ABNER": "General do exército de Saul",
            "NABAL": "Homem tolo que se opôs a Davi",
            "ASAFE": "Músico e compositor de salmos",
            
            // Lugares bíblicos
            "SINAI": "Monte onde Moisés recebeu os 10 mandamentos",
            "BABEL": "Torre construída para alcançar o céu",
            "EGITO": "Terra dos faraós",
            "SIRIA": "País ao norte de Israel",
            "SALEM": "Cidade da paz, antiga Jerusalém",
            "BELEM": "Cidade onde Jesus nasceu",
            "ASSUR": "Capital da Assíria",
            "MOABE": "Terra dos descendentes de Ló",
            "JORDA": "Rio onde Jesus foi batizado",
            "SIDON": "Antiga cidade fenícia",
            "TIROS": "Cidade costeira importante",
            "PATMO": "Ilha onde João escreveu Apocalipse",
            "TARSO": "Cidade natal de Paulo",
            "CRETA": "Ilha onde Tito ministrou",
            "MALTA": "Ilha onde Paulo naufragou",
            
            // Objetos sagrados
            "ALTAR": "Local de sacrifício e adoração",
            "SANTO": "Separado para Deus",
            "ANJOS": "Mensageiros celestiais",
            "SALMO": "Cântico sagrado",
            "PODER": "Força divina",
            "JUSTO": "Que age conforme a lei de Deus",
            "SABIO": "Que tem o conhecimento de Deus",
            "SERVO": "Aquele que serve a Deus",
            "SALVO": "Liberto do pecado",
            "REINO": "Domínio de Deus",
            "GRACA": "Favor imerecido de Deus",
            "HONRA": "Dignidade e respeito",
            "FORTE": "Cheio de força",
            "MANSO": "Gentil e humilde",
            "FIRME": "Inabalável na fé",
            "PURO": "Sem mácula",
            "LIMPO": "Sem pecado",
            "PROVA": "Teste de fé",
            "PACTO": "Acordo com Deus",
            "VALOR": "Coragem e bravura",
            "VIVER": "Ter vida em abundância",
            "LIVRE": "Sem amarras do pecado",
            "PEDRA": "Símbolo de firmeza",
            "PORTA": "Entrada para o reino",
            "MANTO": "Veste sagrada",
            "LIVRO": "Escritura sagrada",
            "TRIGO": "Grão usado para fazer pão",
            "VINHO": "Bebida da última ceia",
            "PEIXE": "Símbolo dos primeiros cristãos",
            "BARCO": "Meio de transporte dos apóstolos",
            "FIGOS": "Fruta comum na terra prometida",
            "MONTE": "Local de encontro com Deus",
            "TORRE": "Lugar de vigilância",
            "PALMA": "Símbolo de vitória",
            "COROA": "Símbolo de realeza",
            "OLEO": "Usado para ungir",
            "VELAS": "Iluminam o templo",
            "MIRRA": "Especiaria preciosa",
            
            // Padrão para palavras sem dica específica
            "default": "Palavra relacionada à Bíblia"
        };
        
        return dicas[word] || dicas["default"];
    }
}

// Inicializa o jogo
const game = new TermoGame();
