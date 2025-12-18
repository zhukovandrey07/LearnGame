const PhilwordsGame = {
    state: {
        words: [],
        grid: [],
        selectedIndices: [],
        foundWords: [],
        size: 10
    },

    start(letterIdx) {
        // Get words starting with this letter (or related to it)
        // In the original code, it took ops from the letter.
        const letterData = DB[app.lang].letters[letterIdx];
        if (!letterData) return;

        this.state.words = letterData.ops.map(o => o.w.toUpperCase());
        this.state.foundWords = [];
        this.state.selectedIndices = [];

        app.go('view-game-phil');

        // UI Setup
        document.getElementById('phil-letter-big').innerText = letterData.l;
        document.getElementById('lbl-phil-hint').innerText = app.getTrans('find');

        this.renderTargets();
        this.generateGrid();
        this.renderGrid();
    },

    renderTargets() {
        const container = document.getElementById('phil-targets');
        container.innerHTML = '';
        this.state.words.forEach(word => {
            const tag = document.createElement('div');
            tag.className = 'phil-word-tag';
            tag.innerText = word;
            tag.id = 'ph-tag-' + word;
            container.appendChild(tag);
        });
    },

    generateGrid() {
        const size = this.state.size;
        this.state.grid = new Array(size * size).fill('');

        // Alphabet for fillers
        let alphabet = "";
        if (app.lang === 'ru') alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
        else if (app.lang === 'en') alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        else alphabet = "אבגדהוזחטיכלמנסעפצקרשת";

        // Place words
        this.state.words.forEach(word => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 100) {
                attempts++;
                const dir = Math.random() > 0.5 ? 'h' : 'v';
                const r = Math.floor(Math.random() * size);
                const c = Math.floor(Math.random() * size);

                if (dir === 'h' && c + word.length > size) continue;
                if (dir === 'v' && r + word.length > size) continue;

                let fit = true;
                for (let k = 0; k < word.length; k++) {
                    const idx = dir === 'h' ? r * size + (c + k) : (r + k) * size + c;
                    if (this.state.grid[idx] !== '' && this.state.grid[idx] !== word[k]) fit = false;
                }

                if (fit) {
                    for (let k = 0; k < word.length; k++) {
                        const idx = dir === 'h' ? r * size + (c + k) : (r + k) * size + c;
                        this.state.grid[idx] = word[k];
                    }
                    placed = true;
                }
            }
        });

        // Fill empty spaces
        for (let i = 0; i < this.state.grid.length; i++) {
            if (this.state.grid[i] === '') {
                this.state.grid[i] = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    },

    renderGrid() {
        const container = document.getElementById('phil-grid');
        container.innerHTML = '';

        this.state.grid.forEach((char, i) => {
            const cell = document.createElement('div');
            cell.className = 'phil-cell';
            cell.innerText = char;
            cell.dataset.idx = i;
            cell.onclick = () => this.handleCellClick(i);
            container.appendChild(cell);
        });
    },

    handleCellClick(idx) {
        const cell = document.querySelector(`.phil-cell[data-idx="${idx}"]`);
        if (cell.classList.contains('found')) return;

        if (this.state.selectedIndices.includes(idx)) {
            // Deselect
            this.state.selectedIndices = this.state.selectedIndices.filter(i => i !== idx);
            cell.classList.remove('selected');
        } else {
            // Select
            this.state.selectedIndices.push(idx);
            cell.classList.add('selected');
        }

        this.checkSelection();
    },

    checkSelection() {
        // Sort indices to form a string
        // But wait, user might select in random order. 
        // We need to check if selected indices form a line and a word.

        // Let's sort by index to simplify linear check
        const indices = [...this.state.selectedIndices].sort((a, b) => a - b);
        const selectedStr = indices.map(i => this.state.grid[i]).join('');
        const revStr = selectedStr.split('').reverse().join('');

        // Check if it matches any target word
        let match = this.state.words.find(w => w === selectedStr || w === revStr);

        if (match && !this.state.foundWords.includes(match)) {
            // Check linearity
            if (this.checkLinearity(indices)) {
                // Found!
                audio.playWin(); // Use core audio
                this.state.foundWords.push(match);

                // Mark cells as found
                indices.forEach(i => {
                    const c = document.querySelector(`.phil-cell[data-idx="${i}"]`);
                    c.classList.remove('selected');
                    c.classList.add('found');
                });

                // Mark tag as done
                const tag = document.getElementById('ph-tag-' + match);
                if (tag) tag.classList.add('done');

                // Clear selection
                this.state.selectedIndices = [];

                // Check win all
                if (this.state.foundWords.length === this.state.words.length) {
                    confetti.fire();
                    setTimeout(() => {
                        app.go('view-phil-menu'); // Go back to menu
                    }, 2000);
                }
            }
        }
    },

    checkLinearity(indices) {
        if (indices.length < 2) return false; // Single letter words? Unlikely but possible.
        const size = this.state.size;

        // Check Horizontal
        const row0 = Math.floor(indices[0] / size);
        const isHoriz = indices.every(i => Math.floor(i / size) === row0);
        if (isHoriz) {
            // Check adjacency
            for (let k = 0; k < indices.length - 1; k++) {
                if (indices[k + 1] !== indices[k] + 1) return false;
            }
            return true;
        }

        // Check Vertical
        const col0 = indices[0] % size;
        const isVert = indices.every(i => i % size === col0);
        if (isVert) {
            for (let k = 0; k < indices.length - 1; k++) {
                if (indices[k + 1] !== indices[k] + size) return false;
            }
            return true;
        }

        return false;
    }
};
