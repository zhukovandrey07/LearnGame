// ========================================
// ALPHAFAMILY PRO - MATH MODULE
// ========================================

const MathGame = {
    state: {
        mode: 'add', // add, sub, mult, div, junior
        level: 1,
        score: 0,
        currentAnswer: 0,
        currentInput: '',
        difficulty: 1,
        streak: 0,
        isSpaceMode: false,
        asteroids: [],
        spaceTimer: null,
        gameLoop: null
    },

    start(mode) {
        this.state.mode = mode;
        this.state.score = 0;
        this.state.level = 1;
        this.state.streak = 0;
        this.state.difficulty = 1;
        this.state.isSpaceMode = false;

        // Check for space mode request (e.g. from a specific button)
        // For now, let's say 'mult' and 'div' default to space mode for fun? 
        // Or make it a toggle? Let's make it a separate start function or argument.

        this.updateUI();
        this.generateProblem();
        app.go('view-math-game');
    },

    startSpaceMode(mode) {
        this.state.mode = mode; // mult or div usually
        this.state.score = 0;
        this.state.isSpaceMode = true;
        this.state.asteroids = [];

        app.go('view-math-space'); // We need to add this view
        this.startSpaceLoop();
    },

    updateUI() {
        const scoreEl = document.getElementById('math-score');
        const levelEl = document.getElementById('math-level');
        if (scoreEl) scoreEl.textContent = this.state.score;
        if (levelEl) levelEl.textContent = this.state.level;
    },

    generateProblem() {
        const visualArea = document.getElementById('math-visual-items');
        const equationArea = document.getElementById('math-equation');
        const optionsArea = document.getElementById('math-options');

        visualArea.innerHTML = '';
        equationArea.innerHTML = '';
        optionsArea.innerHTML = '';

        let answer, options;
        let problemText = '';

        if (this.state.mode === 'junior') {
            // JUNIOR: Counting Objects
            const maxNum = this.state.level <= 2 ? 3 : (this.state.level <= 5 ? 5 : 10);
            answer = Math.floor(Math.random() * maxNum) + 1;

            // Visuals
            const emojis = ['🍎', '🚗', '🐶', '🎈', '⭐', '🍪'];
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];

            for (let i = 0; i < answer; i++) {
                const item = document.createElement('div');
                item.className = 'math-item';
                item.textContent = emoji;
                item.style.animationDelay = `${i * 0.1}s`;
                visualArea.appendChild(item);
            }
        } else {
            // SENIOR: Arithmetic
            const level = this.state.level;
            let n1, n2, op;

            if (this.state.mode === 'mult') {
                n1 = Math.floor(Math.random() * 9) + 1;
                n2 = Math.floor(Math.random() * 9) + 1;
                op = '×';
                answer = n1 * n2;
            } else if (this.state.mode === 'div') {
                n2 = Math.floor(Math.random() * 8) + 2;
                answer = Math.floor(Math.random() * 9) + 1;
                n1 = answer * n2;
                op = '÷';
            } else if (this.state.mode === 'sub') {
                n1 = Math.floor(Math.random() * (10 * level)) + 5;
                n2 = Math.floor(Math.random() * n1);
                op = '-';
                answer = n1 - n2;
            } else { // add
                n1 = Math.floor(Math.random() * (10 * level)) + 1;
                n2 = Math.floor(Math.random() * (10 * level)) + 1;
                op = '+';
                answer = n1 + n2;
            }

            problemText = `${n1} ${op} ${n2} = ?`;
            equationArea.textContent = problemText;
        }

        this.state.currentAnswer = answer;

        // Generate Options
        options = [answer];
        while (options.length < 3) {
            let wrong;
            if (this.state.mode === 'junior') {
                wrong = Math.floor(Math.random() * 10) + 1;
            } else {
                wrong = answer + (Math.floor(Math.random() * 10) - 5);
                if (wrong < 0) wrong = 0;
            }
            if (!options.includes(wrong) && wrong !== answer) {
                options.push(wrong);
            }
        }

        // Shuffle options
        options.sort(() => Math.random() - 0.5);

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'math-option-btn';
            btn.textContent = opt;
            btn.onclick = (e) => this.checkAnswer(opt, e.target);
            optionsArea.appendChild(btn);
        });
    },

    checkAnswer(selected, btn) {
        if (selected === this.state.currentAnswer) {
            // Correct
            audio.playWin();
            btn.classList.add('correct');
            confetti.fire(); // Use global confetti
            this.state.score += 10;
            this.state.streak++;

            // Show full equation
            const equationArea = document.getElementById('math-equation');
            if (equationArea && equationArea.textContent.includes('?')) {
                equationArea.textContent = equationArea.textContent.replace('?', selected);
                equationArea.style.color = '#4ECDC4'; // Green color for success
                equationArea.style.transform = 'scale(1.2)';
            }

            if (this.state.streak % 3 === 0) {
                this.state.level++;
                app.speak(app.getTrans('yes')[Math.floor(Math.random() * app.getTrans('yes').length)]);
            } else {
                app.speak(app.getTrans('yes')[Math.floor(Math.random() * app.getTrans('yes').length)]);
            }

            setTimeout(() => {
                if (equationArea) {
                    equationArea.style.color = '';
                    equationArea.style.transform = '';
                }
                this.updateUI();
                this.generateProblem();
            }, 1500);
        } else {
            // Wrong
            audio.playError();
            btn.classList.add('wrong');
            this.state.streak = 0;
            app.speak(app.getTrans('no')[Math.floor(Math.random() * app.getTrans('no').length)]);
        }
    },

    // --- TABLES ---
    renderTable(num) {
        const disp = document.getElementById('table-display');
        if (!disp) return;
        disp.classList.remove('hidden');
        let html = '';
        for (let i = 1; i <= 10; i++) {
            html += `<div class="table-cell">${num} × ${i} = <b>${num * i}</b></div>`;
        }
        disp.innerHTML = html;
    },

    // --- SPACE MODE ---
    startSpaceLoop() {
        const container = document.getElementById('space-canvas'); // We'll need a canvas or div container
        if (!container) return;
        container.innerHTML = '';

        // Input setup
        const inputDisplay = document.getElementById('space-input');
        this.state.currentInput = '';
        if (inputDisplay) inputDisplay.textContent = '';

        this.state.gameLoop = setInterval(() => {
            this.updateSpaceGame();
        }, 50);

        this.state.spaceTimer = setInterval(() => {
            this.spawnAsteroid();
        }, 2000); // Spawn every 2s
    },

    spawnAsteroid() {
        const container = document.getElementById('space-canvas');
        if (!container) return;

        let n1 = Math.floor(Math.random() * 9) + 1;
        let n2 = Math.floor(Math.random() * 9) + 1;
        let ans = n1 * n2;
        let txt = `${n1}×${n2}`;

        if (this.state.mode === 'div') {
            n2 = Math.floor(Math.random() * 8) + 2;
            ans = Math.floor(Math.random() * 9) + 1;
            n1 = ans * n2;
            txt = `${n1}÷${n2}`;
        }

        const ast = document.createElement('div');
        ast.className = 'asteroid';
        ast.textContent = txt;
        ast.style.left = Math.random() * 80 + 10 + '%';
        ast.style.top = '-50px';
        ast.dataset.answer = ans;

        container.appendChild(ast);
        this.state.asteroids.push({ el: ast, y: -50, speed: 1 + (this.state.score / 100) });
    },

    updateSpaceGame() {
        const container = document.getElementById('space-canvas');
        if (!container) return;
        const height = container.clientHeight;

        this.state.asteroids.forEach((ast, i) => {
            ast.y += ast.speed;
            ast.el.style.top = ast.y + 'px';

            if (ast.y > height) {
                // Game Over or Life lost
                ast.el.remove();
                this.state.asteroids.splice(i, 1);
                // For now just flash red
                container.style.background = '#FFEBEE';
                setTimeout(() => container.style.background = '', 200);
            }
        });
    },

    handleSpaceInput(val) {
        const inputDisplay = document.getElementById('space-input');

        if (val === 'del') {
            this.state.currentInput = this.state.currentInput.slice(0, -1);
        } else if (val === 'ok') {
            // Check answer
            const ans = parseInt(this.state.currentInput);
            const hitIdx = this.state.asteroids.findIndex(a => parseInt(a.el.dataset.answer) === ans);

            if (hitIdx !== -1) {
                // Hit!
                const ast = this.state.asteroids[hitIdx];
                ast.el.classList.add('exploded');
                setTimeout(() => ast.el.remove(), 200);
                this.state.asteroids.splice(hitIdx, 1);
                this.state.score += 10;
                audio.playWin();
            } else {
                audio.playError();
            }
            this.state.currentInput = '';
        } else {
            if (this.state.currentInput.length < 3) this.state.currentInput += val;
        }

        if (inputDisplay) inputDisplay.textContent = this.state.currentInput;
    },

    stopSpaceMode() {
        clearInterval(this.state.gameLoop);
        clearInterval(this.state.spaceTimer);
        this.state.asteroids = [];
    }
};
