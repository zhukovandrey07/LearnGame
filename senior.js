const SeniorGame = {
    state: {
        targetWord: '',
        targetSpeech: '',
        currentLetters: [],
        poolLetters: [],
        isHardMode: false,
        timer: null,
        timeLeft: 0
    },

    init() {
        // Event listeners or global setup if needed
    },

    start(letterData) {
        // letterData comes from DB.letters[idx]
        // We need to pick a word from ops
        const op = letterData.ops[Math.floor(Math.random() * letterData.ops.length)];

        this.state.targetWord = op.w;
        this.state.targetSpeech = op.s || op.w;
        this.state.currentLetters = [];
        this.state.timeLeft = 15;

        // Show screen
        app.go('view-game-senior');

        // Setup UI
        document.getElementById('sen-img').innerText = op.i;
        document.getElementById('lbl-task-write').innerText = app.getTrans('write');
        document.getElementById('lbl-hard').innerText = app.getTrans('hard');

        // Timer
        const bar = document.getElementById('timer-bar');
        if (bar) bar.style.width = '100%';

        if (this.state.timer) clearInterval(this.state.timer);
        this.state.timer = setInterval(() => {
            this.state.timeLeft -= 0.1;
            if (bar) bar.style.width = (this.state.timeLeft / 15 * 100) + '%';
            if (this.state.timeLeft <= 0) clearInterval(this.state.timer);
        }, 100);

        app.speak(this.state.targetSpeech);
        this.renderPool();
        this.renderSlots();
    },

    toggleHardMode() {
        this.state.isHardMode = document.getElementById('chk-hardmode').checked;
        // Restart current word if possible, or just apply to next
        // For now, let's just re-render pool if we are in game
        if (this.state.targetWord) {
            this.renderPool();
            this.state.currentLetters = [];
            this.renderSlots();
        }
    },

    renderPool() {
        const container = document.getElementById('sen-pool');
        container.innerHTML = '';

        let pool = this.state.targetWord.split('');

        // Hard mode: add extra random letters
        if (this.state.isHardMode) {
            const alphabet = DB[app.lang].letters.map(x => x.l).join('');
            for (let k = 0; k < 5; k++) {
                pool.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
            }
        }

        // Create objects and shuffle
        let poolObjs = pool.map((char, i) => ({
            char: char,
            id: 'pool-char-' + i,
            used: false
        }));

        poolObjs.sort(() => Math.random() - 0.5);
        this.state.poolLetters = poolObjs;

        poolObjs.forEach(obj => {
            const btn = document.createElement('div');
            btn.className = 'letter-chip';
            btn.id = obj.id;
            btn.innerText = obj.char;
            btn.onclick = () => this.addLetter(obj);
            container.appendChild(btn);
        });
    },

    renderSlots() {
        const container = document.getElementById('sen-slots');
        container.innerHTML = '';

        for (let i = 0; i < this.state.targetWord.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'slot';

            if (i < this.state.currentLetters.length) {
                const letterObj = this.state.currentLetters[i];
                slot.innerText = letterObj.char;
                slot.className += ' filled';
                slot.onclick = () => this.removeLetter(i);
            }

            container.appendChild(slot);
        }
    },

    addLetter(letterObj) {
        if (this.state.currentLetters.length < this.state.targetWord.length) {
            this.state.currentLetters.push(letterObj);

            // Mark as used visually
            const btn = document.getElementById(letterObj.id);
            if (btn) btn.classList.add('used');

            audio.playClick(); // Use core audio
            this.renderSlots();

            if (this.state.currentLetters.length === this.state.targetWord.length) {
                setTimeout(() => this.checkAnswer(), 500);
            }
        }
    },

    removeLetter(index) {
        const letterObj = this.state.currentLetters[index];
        this.state.currentLetters.splice(index, 1);

        // Unmark used
        const btn = document.getElementById(letterObj.id);
        if (btn) btn.classList.remove('used');

        audio.playClick();
        this.renderSlots();
    },

    checkAnswer() {
        const attempt = this.state.currentLetters.map(x => x.char).join('');
        if (attempt.toLowerCase() === this.state.targetWord.toLowerCase()) {
            // Correct
            clearInterval(this.state.timer);
            document.querySelectorAll('.slot').forEach(s => s.classList.add('correct'));

            let stars = 1;
            if (this.state.timeLeft > 7) stars = 3;
            else if (this.state.timeLeft > 3) stars = 2;

            app.finishLevel(stars);
        } else {
            // Wrong
            audio.playError();
            document.querySelectorAll('.slot').forEach(s => s.classList.add('wrong'));

            setTimeout(() => {
                // Reset slots but keep pool
                this.state.currentLetters.forEach(obj => {
                    const btn = document.getElementById(obj.id);
                    if (btn) btn.classList.remove('used');
                });
                this.state.currentLetters = [];
                this.renderSlots();
            }, 1000);
        }
    },

    speakCurrent() {
        app.speak(this.state.targetSpeech);
    }
};
