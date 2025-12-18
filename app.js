// ========================================
// ALPHAFAMILY PRO - MAIN APP
// ========================================

const app = {
    // State
    profile: '',
    lang: 'ru',
    level: 0,
    isMathMode: false,
    muted: false,

    // Progress
    progress: {
        junior: {
            ru: { lvl: 0, stars: [] },
            en: { lvl: 0, stars: [] },
            he: { lvl: 0, stars: [] },
            numbers: { lvl: 0, stars: [] }
        },
        senior: {
            ru: { lvl: 0, stars: [] },
            en: { lvl: 0, stars: [] },
            he: { lvl: 0, stars: [] }
        }
    },

    // Initialization
    init() {
        try {
            this.loadProgress();
            this.updateLocalization();
        } catch (e) {
            console.error('Init failed:', e);
            localStorage.removeItem('alphaFamilyPro'); // Clear corrupt data
        } finally {
            this.hideLoading();
        }

        // Check if language is already set (saved in localStorage)
        const saved = localStorage.getItem('alphaFamilyPro');
        if (saved) {
            try {
                if (JSON.parse(saved).lang) {
                    this.go('view-roles', true);
                    return;
                }
            } catch (e) { }
        }
        this.go('view-language', true);
    },

    // Loading
    hideLoading() {
        setTimeout(() => {
            const loading = document.getElementById('loading-screen');
            if (loading) loading.classList.add('hidden');
        }, 1500);
    },

    // Progress Management
    loadProgress() {
        try {
            const saved = localStorage.getItem('alphaFamilyPro');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.progress) this.progress = data.progress;
                if (data.lang) this.lang = data.lang;
                if (data.muted !== undefined) this.muted = data.muted;
            }
        } catch (e) {
            console.error('Load progress failed:', e);
            localStorage.removeItem('alphaFamilyPro');
        }
        this.updateMuteIcon();
    },

    saveProgress() {
        localStorage.setItem('alphaFamilyPro', JSON.stringify({
            progress: this.progress,
            lang: this.lang,
            muted: this.muted
        }));
    },

    // Navigation
    go(screenId, silent = false) {
        if (!silent) audio.playClick();
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.remove('hidden');
    },

    goBackFromMap() {
        if (this.profile === 'junior') {
            this.go('view-roles');
        } else {
            this.go('view-senior-menu');
        }
    },

    // Language
    setLang(lang) {
        this.lang = lang;
        document.documentElement.dir = (lang === 'he') ? 'rtl' : 'ltr';
        this.updateLocalization();
        this.saveProgress();
    },

    getTrans(key) {
        return TRANS[this.lang][key];
    },

    // Profile Selection
    setProfile(profile) {
        this.profile = profile;
        this.saveProgress();
        confetti.fire();

        // Junior Restrictions
        const juniorHidden = document.querySelectorAll('.dict-btn, .find-btn');
        juniorHidden.forEach(el => {
            if (profile === 'junior') {
                el.style.display = 'none';
            } else {
                el.style.display = 'flex';
            }
        });

        if (profile === 'junior') {
            this.isMathMode = false;
            this.renderMap();
            setTimeout(() => this.go('view-map'), 600);
        } else {
            setTimeout(() => this.go('view-senior-menu'), 600);
        }
    },

    // Speech
    speak(text) {
        if (typeof voice !== 'undefined') {
            voice.speak(text, this.lang);
        }
    },

    updateLocalization() {
        const t = TRANS[this.lang];
        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setText('lbl-subtitle', t.subtitle);
        setText('lbl-jun-title', t.jun_t);
        setText('lbl-jun-desc', t.jun_d);
        setText('lbl-sen-title', t.sen_t);
        setText('lbl-sen-desc', t.sen_d);
        setText('lbl-select-subj', t.sel_sub);
        setText('lbl-letters', t.l_let);
        setText('lbl-math', t.l_math);
        setText('lbl-map', t.map);
        setText('lbl-dict', t.dict);
        setText('lbl-find', t.find);
        setText('lbl-select-lang', t.select_lang);

        // Syllable labels
        setText('lbl-syllables', t.l_syllables);
        setText('lbl-syllable-select', t.select_mode);
        setText('lbl-syl-basic', t.syl_basic);
        setText('lbl-syl-advanced', t.syl_advanced);
        setText('lbl-next-word', t.next_word);
        setText('lbl-reset', t.reset);
    },

    // Audio Control
    toggleMute() {
        this.muted = !this.muted;
        this.updateMuteIcon();
        if (this.muted && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        this.saveProgress();
    },

    updateMuteIcon() {
        const icon = document.getElementById('mute-icon');
        if (icon) icon.textContent = this.muted ? '🔇' : '🔊';
    },

    startSubject(subject) {
        if (subject === 'letters') {
            this.isMathMode = false;
            this.renderMap();
            this.go('view-map');
        }
    },

    goToMathMenu() {
        if (this.profile === 'junior') {
            MathGame.start('junior');
        } else {
            MathGame.start('senior');
        }
    },

    // Map Rendering
    renderMap() {
        const container = document.getElementById('map-container');
        if (!container) return;
        container.innerHTML = '';

        let list, current, starsArr;
        if (this.isMathMode && this.profile === 'junior') {
            list = DB[this.lang].numbers;
            current = this.progress.junior.numbers.lvl;
            starsArr = this.progress.junior.numbers.stars;
        } else {
            list = DB[this.lang].letters;
            current = this.progress[this.profile][this.lang].lvl;
            starsArr = this.progress[this.profile][this.lang].stars;
        }

        list.forEach((item, idx) => {
            const node = document.createElement('div');
            node.textContent = item.l || item.v;

            if (idx < current) {
                node.className = 'level-node completed';
                node.onclick = () => this.startLevel(idx);

                const stars = starsArr[idx] || 0;
                let starsHTML = '<div class="level-stars">';
                for (let i = 0; i < 3; i++) {
                    starsHTML += `<div class="tiny-star ${i < stars ? 'gold' : ''}">★</div>`;
                }
                starsHTML += '</div>';
                node.innerHTML += starsHTML;
            } else if (idx === current) {
                node.className = 'level-node unlocked';
                node.onclick = () => this.startLevel(idx);
            } else {
                node.className = 'level-node locked';
            }

            container.appendChild(node);

            // Animation
            setTimeout(() => {
                node.style.animation = 'fadeInUp 0.5s ease forwards';
            }, idx * 50);
        });
    },

    // Level Management
    startLevel(idx) {
        this.level = idx;
        let data;

        if (this.isMathMode && this.profile === 'junior') {
            // Junior Math (Counting)
            MathGame.start('junior');
        } else {
            // Letters
            data = DB[this.lang].letters[idx];
            if (this.profile === 'junior') {
                JuniorGame.start(data);
            } else {
                SeniorGame.start(data);
            }
        }
    },

    finishLevel(stars) {
        // Update progress
        let currentLvl, starsArr;

        if (this.isMathMode && this.profile === 'junior') {
            currentLvl = this.progress.junior.numbers.lvl;
            starsArr = this.progress.junior.numbers.stars;
        } else {
            currentLvl = this.progress[this.profile][this.lang].lvl;
            starsArr = this.progress[this.profile][this.lang].stars;
        }

        if (this.level === currentLvl) {
            // Unlock next
            if (this.isMathMode && this.profile === 'junior') {
                this.progress.junior.numbers.lvl++;
            } else {
                this.progress[this.profile][this.lang].lvl++;
            }
        }

        // Save stars
        if (!starsArr[this.level] || stars > starsArr[this.level]) {
            starsArr[this.level] = stars;
        }

        this.saveProgress();
        this.renderMap();
        this.go('view-map');

        // Praise
        confetti.fire();
        const praises = TRANS[this.lang].yes;
        const praise = praises[Math.floor(Math.random() * praises.length)];
        this.speak(praise);
    },

    // Delegate Syllable Methods
    goToSyllableMenu() { SyllableGame.goToMenu(); },
    startSyllableBasic() { SyllableGame.startBasic(); },
    startSyllableAdvanced() { SyllableGame.startAdvanced(); },
    nextSyllableWord() { SyllableGame.nextWord(); },

    // Dictionary
    showDictionary() {
        const container = document.getElementById('dict-container');
        if (!container) return;
        container.innerHTML = '';
        const list = DB[this.lang].letters;

        for (let i = 0; i < list.length; i++) {
            const lObj = list[i];
            const div = document.createElement('div');
            div.className = 'dict-item';

            let html = `<div class="dict-letter">${lObj.l}</div><div class="dict-words">`;
            lObj.ops.forEach(op => {
                html += `<span class="dict-word" onclick="app.speak('${op.s || op.w}')">${op.i} ${op.w}</span>`;
            });
            html += `</div>`;
            div.innerHTML = html;
            container.appendChild(div);
        }
        this.go('view-dict');
    },

    showPhilwordMenu() {
        const container = document.getElementById('phil-menu-container');
        if (!container) return;
        container.innerHTML = '';
        const list = DB[this.lang].letters;
        for (let i = 0; i < list.length; i++) {
            const node = document.createElement('div');
            node.className = 'level-node unlocked';
            node.innerText = list[i].l;
            node.onclick = () => PhilwordsGame.start(i);
            container.appendChild(node);
        }
        this.go('view-phil-menu');
    }
};

// ========================================
// START APP
// ========================================

window.addEventListener('load', () => {
    app.init();
});
