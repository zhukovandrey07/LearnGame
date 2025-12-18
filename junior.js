// ========================================
// ALPHAFAMILY PRO - JUNIOR MODULE
// ========================================

const JuniorGame = {
    currentLetter: null,
    currentGame: 0,
    games: ['maze', 'balloons', 'puzzle', 'coloring', 'feed', 'peekaboo'],

    start(letterData) {
        this.currentLetter = letterData;
        this.currentGame = 0;
        this.playNextGame();
    },

    playNextGame() {
        if (this.currentGame >= this.games.length) {
            app.finishLevel(3); // All games done, finish level with 3 stars
            return;
        }

        const gameType = this.games[this.currentGame];
        this.currentGame++;

        app.go('view-junior-game');
        const container = document.getElementById('junior-game-area');
        container.innerHTML = ''; // Clear previous game

        switch (gameType) {
            case 'maze': this.playMaze(container); break;
            case 'balloons': this.playBalloons(container); break;
            case 'puzzle': this.playPuzzle(container); break;
            case 'coloring': this.playColoring(container); break;
            case 'feed': this.playFeed(container); break;
            case 'peekaboo': this.playPeekaboo(container); break;
        }
    },

    // ========================================
    // 1. MAZE GAME (Tracing)
    // ========================================
    playMaze(container) {
        container.innerHTML = `
            <h2 class="game-title">Нарисуй букву!</h2>
            <div class="maze-container">
                <canvas id="maze-canvas" width="300" height="300"></canvas>
                <div class="maze-guide">${this.currentLetter.l}</div>
            </div>
            <p class="game-hint">Проведи пальцем по букве</p>
        `;

        const canvas = document.getElementById('maze-canvas');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        // Draw guide (faint letter)
        ctx.font = '250px Nunito';
        ctx.fillStyle = '#eee';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.currentLetter.l, 150, 150);

        const startDrawing = (e) => {
            if (e.type === 'touchstart') e.preventDefault();
            isDrawing = true;
            ctx.beginPath();
            const x = e.offsetX || e.touches[0].clientX - canvas.getBoundingClientRect().left;
            const y = e.offsetY || e.touches[0].clientY - canvas.getBoundingClientRect().top;
            ctx.moveTo(x, y);
        };

        const draw = (e) => {
            if (!isDrawing) return;
            e.preventDefault();
            const x = e.offsetX || e.touches[0].clientX - canvas.getBoundingClientRect().left;
            const y = e.offsetY || e.touches[0].clientY - canvas.getBoundingClientRect().top;

            ctx.lineTo(x, y);
            ctx.strokeStyle = '#FF6B6B';
            ctx.lineWidth = 20;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        };

        const stopDrawing = () => {
            if (!isDrawing) return;
            isDrawing = false;

            // Simple validation: just check if they drew enough
            // In a real app, we'd check path overlap
            audio.playSuccess();
            confetti.fire();
            setTimeout(() => this.playNextGame(), 1500);
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);
    },

    // ========================================
    // 2. BALLOON POP
    // ========================================
    playBalloons(container) {
        container.innerHTML = `
            <h2 class="game-title">Лопай шарики с буквой ${this.currentLetter.l}!</h2>
            <div id="balloon-area" class="balloon-area"></div>
        `;

        const area = document.getElementById('balloon-area');
        let popped = 0;
        const target = 5;

        const spawnBalloon = () => {
            if (popped >= target) return;

            const balloon = document.createElement('div');
            balloon.className = 'balloon';
            const isTarget = Math.random() > 0.3;
            balloon.textContent = isTarget ? this.currentLetter.l : '★';

            balloon.style.left = Math.random() * 80 + '%';
            balloon.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;

            balloon.onclick = () => {
                if (isTarget) {
                    audio.playPop();
                    balloon.style.transform = 'scale(1.5)';
                    balloon.style.opacity = '0';
                    setTimeout(() => balloon.remove(), 200);
                    popped++;
                    if (popped >= target) {
                        audio.playSuccess();
                        setTimeout(() => this.playNextGame(), 1000);
                    }
                } else {
                    audio.playError();
                }
            };

            area.appendChild(balloon);
            setTimeout(() => balloon.remove(), 4000); // Auto remove if missed
        };

        const interval = setInterval(() => {
            if (popped >= target) clearInterval(interval);
            else spawnBalloon();
        }, 800);
    },

    // ========================================
    // 3. PUZZLE GAME
    // ========================================
    playPuzzle(container) {
        container.innerHTML = `
            <h2 class="game-title">Собери пазл!</h2>
            <div class="puzzle-grid" id="puzzle-grid"></div>
        `;

        const grid = document.getElementById('puzzle-grid');
        // Simple 2x2 puzzle logic (mockup for now using CSS rotation)
        // In real app, we'd slice an image. Here we use the letter.

        const pieces = [0, 90, 180, 270]; // Rotations
        let solved = 0;

        for (let i = 0; i < 4; i++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.textContent = this.currentLetter.l;
            // Clip path to show quadrant would be better, but simple rotation for now
            piece.style.transform = `rotate(${pieces[Math.floor(Math.random() * pieces.length)]}deg)`;

            piece.onclick = () => {
                audio.playClick();
                const currentRot = parseInt(piece.style.transform.replace('rotate(', '').replace('deg)', ''));
                const newRot = currentRot + 90;
                piece.style.transform = `rotate(${newRot}deg)`;

                if (newRot % 360 === 0) {
                    piece.classList.add('correct');
                    solved++; // This logic is simplified; needs real check
                }
            };
            grid.appendChild(piece);
        }

        // Auto-win for demo after 3 seconds if too hard
        setTimeout(() => {
            audio.playSuccess();
            this.playNextGame();
        }, 3000);
    },

    // ========================================
    // 4. COLORING GAME
    // ========================================
    playColoring(container) {
        container.innerHTML = `
            <h2 class="game-title">Раскрась букву!</h2>
            <div class="coloring-area">
                <div class="coloring-letter" id="coloring-target">${this.currentLetter.l}</div>
                <div class="color-palette">
                    <div class="color-swatch" style="background: #FF6B6B" onclick="JuniorGame.setColor('#FF6B6B')"></div>
                    <div class="color-swatch" style="background: #4ECDC4" onclick="JuniorGame.setColor('#4ECDC4')"></div>
                    <div class="color-swatch" style="background: #FFE66D" onclick="JuniorGame.setColor('#FFE66D')"></div>
                </div>
            </div>
        `;

        this.selectedColor = '#FF6B6B';
        const target = document.getElementById('coloring-target');

        target.onclick = () => {
            audio.playClick();
            target.style.color = this.selectedColor;
            audio.playSuccess();
            setTimeout(() => this.playNextGame(), 1000);
        };
    },

    setColor(color) {
        this.selectedColor = color;
        audio.playClick();
    },

    // ========================================
    // 5. FEED THE ANIMAL
    // ========================================
    playFeed(container) {
        const animal = '🦁'; // Could be dynamic based on letter
        container.innerHTML = `
            <h2 class="game-title">Покорми Льва буквой ${this.currentLetter.l}!</h2>
            <div class="feed-game">
                <div class="animal-mouth" id="animal-mouth">${animal}</div>
                <div class="food-items" id="food-items"></div>
            </div>
        `;

        const items = document.getElementById('food-items');
        const foods = [this.currentLetter.l, '★', '●', '■'];
        foods.sort(() => Math.random() - 0.5);

        foods.forEach(f => {
            const item = document.createElement('div');
            item.className = 'food-item';
            item.textContent = f;
            item.draggable = true; // Simple click for mobile usually better

            item.onclick = () => {
                if (f === this.currentLetter.l) {
                    item.style.transition = 'all 0.5s';
                    item.style.top = '50px'; // Move to mouth
                    item.style.opacity = '0';
                    audio.playSuccess();
                    document.getElementById('animal-mouth').style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        document.getElementById('animal-mouth').style.transform = 'scale(1)';
                        this.playNextGame();
                    }, 1000);
                } else {
                    audio.playError();
                    item.classList.add('shake');
                }
            };
            items.appendChild(item);
        });
    },

    // ========================================
    // 6. PEEKABOO
    // ========================================
    playPeekaboo(container) {
        container.innerHTML = `
            <h2 class="game-title">Где спряталась буква?</h2>
            <div class="hiding-spots">
                <div class="hiding-spot" onclick="JuniorGame.checkHiding(this, false)">🌳</div>
                <div class="hiding-spot" onclick="JuniorGame.checkHiding(this, true)">🪨</div>
                <div class="hiding-spot" onclick="JuniorGame.checkHiding(this, false)">🏠</div>
            </div>
        `;
    },

    checkHiding(element, isCorrect) {
        // Randomize correct spot in real version
        // For demo, let's say it's always the rock or passed param

        element.classList.add('revealed');
        if (isCorrect) {
            element.innerHTML = `<span class="revealed-letter">${this.currentLetter.l}</span>`;
            audio.playSuccess();
            app.speak(`Ку-ку! Это буква ${this.currentLetter.l}`);
            setTimeout(() => this.playNextGame(), 2000);
        } else {
            element.innerHTML = '🕷️'; // Spider or empty
            audio.playPop();
        }
    }
};
