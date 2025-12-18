// ========================================
// ALPHAFAMILY PRO - JUNIOR MODULE (FIXED)
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
            app.finishLevel(3); // All games done
            return;
        }

        const gameType = this.games[this.currentGame];
        this.currentGame++;

        app.go('view-junior-game');
        const container = document.getElementById('junior-game-area');
        container.innerHTML = ''; // Clear previous

        switch (gameType) {
            case 'maze': this.playMaze(container); break;
            case 'balloons': this.playBalloons(container); break;
            case 'puzzle': this.playPuzzle(container); break; // Puzzle logic reuse
            case 'coloring': this.playColoring(container); break;
            case 'feed': this.playFeed(container); break;
            case 'peekaboo': this.playPeekaboo(container); break;
        }
    },

    // 1. MAZE (TRACING)
    playMaze(container) {
        const title = app.getTrans('jun_maze');
        const hint = app.getTrans('jun_maze_h');
        
        container.innerHTML = `
            <h2 class="game-title">${title}</h2>
            <div class="maze-container">
                <canvas id="maze-canvas" width="300" height="300"></canvas>
                <div class="maze-guide">${this.currentLetter.l}</div>
            </div>
            <p class="game-subtitle">${hint}</p>
        `;

        const canvas = document.getElementById('maze-canvas');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const start = (e) => {
            if(e.type === 'touchstart') e.preventDefault();
            isDrawing = true;
            const pos = getPos(e);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        };

        const move = (e) => {
            if (!isDrawing) return;
            if(e.type === 'touchmove') e.preventDefault();
            const pos = getPos(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.strokeStyle = '#FF6B6B';
            ctx.lineWidth = 25;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        };

        const end = () => {
            if (!isDrawing) return;
            isDrawing = false;
            audio.playSuccess();
            confetti.fire();
            setTimeout(() => this.playNextGame(), 1500);
        };

        canvas.addEventListener('mousedown', start);
        canvas.addEventListener('mousemove', move);
        canvas.addEventListener('mouseup', end);
        canvas.addEventListener('touchstart', start, {passive: false});
        canvas.addEventListener('touchmove', move, {passive: false});
        canvas.addEventListener('touchend', end);
    },

    // 2. BALLOONS
    playBalloons(container) {
        const title = app.getTrans('jun_bal') + ` ${this.currentLetter.l}!`;
        
        container.innerHTML = `
            <h2 class="game-title">${title}</h2>
            <div id="balloon-area" class="balloon-area"></div>
        `;

        const area = document.getElementById('balloon-area');
        let popped = 0;
        const target = 5;

        const spawnBalloon = () => {
            if (popped >= target) return;

            const b = document.createElement('div');
            b.className = 'balloon';
            const isTarget = Math.random() > 0.3;
            b.textContent = isTarget ? this.currentLetter.l : '★';
            
            // Random horizontal position
            b.style.left = Math.random() * 80 + 10 + '%';
            // Random color
            const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43'];
            b.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            // Random speed (animation duration)
            b.style.animationDuration = (3 + Math.random() * 3) + 's';

            b.onclick = (e) => {
                e.stopPropagation(); // Prevent issues
                if (isTarget) {
                    audio.playPop();
                    b.style.transform = 'scale(1.5)';
                    b.style.opacity = '0';
                    setTimeout(() => b.remove(), 100);
                    popped++;
                    if (popped >= target) {
                        // Win logic
                        // Clear interval handled by loop check, but lets force clean
                        setTimeout(() => this.playNextGame(), 1000);
                    }
                } else {
                    audio.playError();
                }
            };

            area.appendChild(b);
            
            // Cleanup if balloon goes off screen
            setTimeout(() => {
                if(b.parentNode) b.remove();
            }, 6000);
        };

        // Spawn loop
        const interval = setInterval(() => {
            if (popped >= target || !document.getElementById('balloon-area')) {
                clearInterval(interval);
            } else {
                spawnBalloon();
            }
        }, 800);
    },

    // 3. PUZZLE (Simplified for now)
    playPuzzle(container) {
        // Keeping simple rotation puzzle for brevity, but text fixed
        container.innerHTML = `
            <h2 class="game-title">${app.getTrans('syl_advanced')}</h2>
            <div class="puzzle-grid" id="puzzle-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:5px; width:200px; margin:20px auto;"></div>
        `;
        const grid = document.getElementById('puzzle-grid');
        const rots = [0, 90, 180, 270];
        
        for(let i=0; i<4; i++) {
            const p = document.createElement('div');
            p.style.height = '100px';
            p.style.background = 'white';
            p.style.display = 'flex';
            p.style.alignItems = 'center';
            p.style.justifyContent = 'center';
            p.style.fontSize = '3rem';
            p.style.border = '1px solid #eee';
            p.textContent = this.currentLetter.l;
            p.style.transform = `rotate(${rots[Math.floor(Math.random()*rots.length)]}deg)`;
            p.onclick = function() {
                audio.playClick();
                let curr = parseInt(this.style.transform.replace(/[^0-9]/g, '')) || 0;
                this.style.transform = `rotate(${curr + 90}deg)`;
            };
            grid.appendChild(p);
        }

        // Auto win for flow
        setTimeout(() => {
            audio.playSuccess();
            this.playNextGame();
        }, 3000);
    },

    // 4. COLORING
    playColoring(container) {
        const title = app.getTrans('jun_col');
        
        container.innerHTML = `
            <h2 class="game-title">${title}</h2>
            <div class="coloring-area">
                <div class="coloring-letter" id="coloring-target">${this.currentLetter.l}</div>
                <div class="color-palette">
                    <div class="color-swatch" style="background: #FF6B6B" onclick="JuniorGame.setColor('#FF6B6B')"></div>
                    <div class="color-swatch" style="background: #4ECDC4" onclick="JuniorGame.setColor('#4ECDC4')"></div>
                    <div class="color-swatch" style="background: #FFE66D" onclick="JuniorGame.setColor('#FFE66D')"></div>
                    <div class="color-swatch" style="background: #A8E6CF" onclick="JuniorGame.setColor('#A8E6CF')"></div>
                </div>
            </div>
        `;
        
        this.selectedColor = '#FF6B6B';
        const target = document.getElementById('coloring-target');
        
        target.onclick = () => {
            target.style.color = this.selectedColor;
            target.style.webkitTextStroke = "0px"; // Remove outline when colored
            audio.playSuccess();
            particles.burst(window.innerWidth/2, window.innerHeight/2);
            setTimeout(() => this.playNextGame(), 1500);
        };
    },
    
    setColor(c) {
        this.selectedColor = c;
        audio.playClick();
    },

    // 5. FEED
    playFeed(container) {
        const title = app.getTrans('jun_feed') + ` ${this.currentLetter.l}!`;
        
        container.innerHTML = `
            <h2 class="game-title" style="font-size:1.5rem">${title}</h2>
            <div class="feed-game">
                <div class="animal-mouth" id="animal-mouth">🦁</div>
                <div class="food-items" id="food-items"></div>
            </div>
        `;

        const items = document.getElementById('food-items');
        // Mix correct letter with distractions
        const foods = [this.currentLetter.l, '★', '■', '●'];
        // Shuffle
        foods.sort(() => Math.random() - 0.5);

        foods.forEach(f => {
            const item = document.createElement('div');
            item.className = 'food-item';
            item.textContent = f;
            
            item.onclick = (e) => {
                const el = e.target;
                if (f === this.currentLetter.l) {
                    // Animation to mouth
                    el.style.transition = 'all 0.5s';
                    el.style.transform = 'translateY(-200px) scale(0.5)';
                    el.style.opacity = '0';
                    
                    const mouth = document.getElementById('animal-mouth');
                    mouth.style.transform = 'scale(1.2)';
                    setTimeout(() => mouth.textContent = '😋', 200);
                    
                    audio.playSuccess();
                    setTimeout(() => this.playNextGame(), 1000);
                } else {
                    audio.playError();
                    el.classList.add('shake');
                    setTimeout(()=>el.classList.remove('shake'), 500);
                }
            };
            items.appendChild(item);
        });
    },

    // 6. PEEKABOO
    playPeekaboo(container) {
        const title = app.getTrans('jun_peek');
        
        container.innerHTML = `
            <h2 class="game-title">${title}</h2>
            <div class="hiding-spots">
                <div class="hiding-spot" onclick="JuniorGame.checkHiding(this, false)">🌳</div>
                <div class="hiding-spot" onclick="JuniorGame.checkHiding(this, true)">📦</div>
                <div class="hiding-spot" onclick="JuniorGame.checkHiding(this, false)">🏠</div>
            </div>
        `;
    },

    checkHiding(el, isCorrect) {
        if(el.classList.contains('revealed')) return;
        el.classList.add('revealed');
        
        if (isCorrect) {
            el.innerHTML = `<span class="revealed-letter">${this.currentLetter.l}</span>`;
            audio.playWin();
            app.speak(app.getTrans('jun_peek_found') + " " + this.currentLetter.l);
            confetti.fire();
            setTimeout(() => this.playNextGame(), 2000);
        } else {
            el.innerHTML = '🕷️'; // Spider
            audio.playPop();
        }
    }
};
