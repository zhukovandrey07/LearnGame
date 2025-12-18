// ========================================
// ALPHAFAMILY PRO - SYLLABLES MODULE
// ========================================

const SyllableGame = {
    currentWordIndex: 0,
    selectedSyllables: [],

    goToMenu() {
        app.go('view-syllable-menu');
    },

    startBasic() {
        this.currentWordIndex = 0;
        this.renderBasic();
        app.go('view-syllable-basic');
    },

    startAdvanced() {
        this.currentWordIndex = 0;
        this.renderAdvanced();
        app.go('view-syllable-advanced');
    },

    renderBasic() {
        const words = DB[app.lang].syllableWords;
        if (!words || words.length === 0) return;

        const wordData = words[this.currentWordIndex];

        // Update emoji
        document.getElementById('syllable-emoji').textContent = wordData.emoji;

        // Update word display (show the word without hyphens for display)
        const wordDisplay = wordData.word.replace(/-/g, '').replace(/́/g, '');
        document.getElementById('syllable-word').textContent = wordDisplay;

        // Update hint
        const t = TRANS[app.lang];
        document.getElementById('syllable-hint').textContent = t.click_syllable;

        // Create syllable tiles
        const container = document.getElementById('syllable-tiles');
        container.innerHTML = '';

        wordData.syllables.forEach((syllable, index) => {
            const tile = document.createElement('div');
            tile.className = 'syllable-tile';
            if (index === wordData.stressIndex) {
                tile.classList.add('stressed');
            }
            tile.textContent = syllable.replace(/́/g, ''); // Remove combining acute accent for display

            tile.onclick = () => {
                audio.playClick();
                // Highlight tile
                document.querySelectorAll('.syllable-tile').forEach(t => t.classList.remove('active'));
                tile.classList.add('active');

                // Speak syllable
                app.speak(syllable.replace(/́/g, ''));

                // Remove active class after animation
                setTimeout(() => {
                    tile.classList.remove('active');
                }, 600);
            };

            container.appendChild(tile);

            // Stagger animation
            setTimeout(() => {
                tile.style.animation = 'syllablePop 0.4s ease forwards';
            }, index * 100);
        });
    },

    nextWord() {
        const words = DB[app.lang].syllableWords;
        audio.playSuccess();

        this.currentWordIndex++;
        if (this.currentWordIndex >= words.length) {
            this.currentWordIndex = 0;
        }

        this.renderBasic();
    },

    renderAdvanced() {
        const words = DB[app.lang].syllableWords;
        if (!words || words.length === 0) return;

        const wordData = words[this.currentWordIndex];
        this.selectedSyllables = [];

        // Update emoji
        document.getElementById('advanced-emoji').textContent = wordData.emoji;

        // Clear assembly zone
        const assemblyZone = document.getElementById('assembly-zone');
        assemblyZone.innerHTML = '';
        assemblyZone.style.minHeight = '80px';

        // Create scrambled syllables
        const scrambledTiles = document.getElementById('scrambled-tiles');
        scrambledTiles.innerHTML = '';

        // Scramble the syllables
        const syllables = [...wordData.syllables];
        for (let i = syllables.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [syllables[i], syllables[j]] = [syllables[j], syllables[i]];
        }

        syllables.forEach((syllable, index) => {
            const tile = document.createElement('div');
            tile.className = 'syllable-tile scrambled';
            tile.textContent = syllable.replace(/́/g, '');
            tile.dataset.syllable = syllable;

            tile.onclick = () => {
                if (tile.classList.contains('used')) return;

                audio.playClick();
                this.addToAssembly(syllable, tile);
            };

            scrambledTiles.appendChild(tile);

            // Stagger animation
            setTimeout(() => {
                tile.style.animation = 'syllablePop 0.4s ease forwards';
            }, index * 100);
        });
    },

    addToAssembly(syllable, sourceTile) {
        const wordData = DB[app.lang].syllableWords[this.currentWordIndex];
        const assemblyZone = document.getElementById('assembly-zone');

        // Mark source tile as used
        sourceTile.classList.add('used');

        // Add to selected array
        this.selectedSyllables.push(syllable);

        // Create tile in assembly zone
        const tile = document.createElement('div');
        tile.className = 'syllable-tile assembled';
        tile.textContent = syllable.replace(/́/g, '');
        assemblyZone.appendChild(tile);

        // Check if word is complete
        if (this.selectedSyllables.length === wordData.syllables.length) {
            setTimeout(() => {
                this.checkAssembly();
            }, 300);
        }
    },

    checkAssembly() {
        const wordData = DB[app.lang].syllableWords[this.currentWordIndex];
        const correct = this.selectedSyllables.every((syl, i) => syl === wordData.syllables[i]);

        if (correct) {
            audio.playSuccess();
            confetti.fire();

            const center = {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            };
            particles.burst(center.x, center.y, 15);

            // Speak praise
            const praises = TRANS[app.lang].yes;
            const praise = praises[Math.floor(Math.random() * praises.length)];
            app.speak(praise);

            // Move to next word
            setTimeout(() => {
                this.currentWordIndex++;
                const words = DB[app.lang].syllableWords;
                if (this.currentWordIndex >= words.length) {
                    this.currentWordIndex = 0;
                }
                this.renderAdvanced();
            }, 2000);
        } else {
            audio.playError();

            // Shake animation
            const assemblyZone = document.getElementById('assembly-zone');
            assemblyZone.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                assemblyZone.style.animation = '';
            }, 500);

            // Speak error message
            const errors = TRANS[app.lang].no;
            const error = errors[Math.floor(Math.random() * errors.length)];
            app.speak(error);

            // Auto reset after a delay
            setTimeout(() => {
                this.resetAssembly();
            }, 1500);
        }
    },

    resetAssembly() {
        audio.playClick();
        this.selectedSyllables = [];

        // Clear assembly zone
        const assemblyZone = document.getElementById('assembly-zone');
        assemblyZone.innerHTML = '';

        // Reset scrambled tiles
        document.querySelectorAll('.syllable-tile.scrambled').forEach(tile => {
            tile.classList.remove('used');
        });
    }
};
