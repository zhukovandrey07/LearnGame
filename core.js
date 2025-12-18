// ========================================
// ALPHAFAMILY PRO - CORE SYSTEMS
// ========================================

// AUDIO SYSTEM
class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = 0.3;

        // Resume on first interaction
        const resumeAudio = () => {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            window.removeEventListener('click', resumeAudio);
            window.removeEventListener('touchstart', resumeAudio);
            window.removeEventListener('keydown', resumeAudio);
        };

        window.addEventListener('click', resumeAudio);
        window.addEventListener('touchstart', resumeAudio);
        window.addEventListener('keydown', resumeAudio);
    }

    wakeUp() {
        try {
            if (this.ctx.state === 'suspended') this.ctx.resume();
        } catch (e) {
            console.warn('AudioContext resume failed (waiting for user interaction)');
        }
    }

    playTone(frequency, type, duration, volume = 1) {
        if (typeof app !== 'undefined' && app.muted) return; // Respect global mute
        this.wakeUp();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        gain.gain.setValueAtTime(this.masterVolume * volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playSuccess() {
        this.playTone(523.25, 'sine', 0.1);
        setTimeout(() => this.playTone(659.25, 'sine', 0.1), 100);
        setTimeout(() => this.playTone(783.99, 'sine', 0.3), 200);
    }

    playWin() {
        this.playSuccess();
        setTimeout(() => this.playSuccess(), 300);
    }

    playPop() {
        this.playTone(800, 'sine', 0.05, 0.5);
    }

    playError() {
        this.playTone(150, 'sawtooth', 0.3, 0.4);
    }

    playClick() {
        this.playTone(600, 'sine', 0.05, 0.3);
    }
}

const audio = new AudioManager();

// PARTICLE SYSTEM
class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles');
    }

    createParticle(x, y, emoji, duration = 1000) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            font-size: 2rem;
            pointer-events: none;
            z-index: 1000;
            animation: particleRise ${duration}ms ease-out forwards;
        `;
        particle.textContent = emoji;
        this.container.appendChild(particle);

        setTimeout(() => particle.remove(), duration);
    }

    burst(x, y, count = 10) {
        const emojis = ['✨', '⭐', '🌟', '💫', '🎉', '🎊'];
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                const offsetX = (Math.random() - 0.5) * 100;
                const offsetY = (Math.random() - 0.5) * 100;
                this.createParticle(x + offsetX, y + offsetY, emoji);
            }, i * 50);
        }
    }
}

const particles = new ParticleSystem();

// VOICE SELECTOR
class VoiceSelector {
    constructor() {
        this.voices = [];
        this.synth = window.speechSynthesis;
        if (this.synth) {
            this.synth.onvoiceschanged = () => this.loadVoices();
            this.loadVoices();
        }
    }

    loadVoices() {
        this.voices = this.synth.getVoices();
    }

    getBestVoice(lang) {
        // Map app lang codes to BCP 47 tags
        const langMap = {
            'ru': 'ru-RU',
            'en': 'en-US',
            'he': 'he-IL'
        };
        const target = langMap[lang] || lang;

        // Filter by language
        const langVoices = this.voices.filter(v => v.lang.includes(target));

        if (langVoices.length === 0) return null;

        // Priority: Google -> Microsoft -> Others
        const google = langVoices.find(v => v.name.includes('Google'));
        if (google) return google;

        const microsoft = langVoices.find(v => v.name.includes('Microsoft'));
        if (microsoft) return microsoft;

        return langVoices[0];
    }

    speak(text, lang) {
        if (!this.synth || (typeof app !== 'undefined' && app.muted)) return;

        this.synth.cancel(); // Stop previous
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = this.getBestVoice(lang);

        if (voice) utterance.voice = voice;
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;

        this.synth.speak(utterance);
    }
}

const voice = new VoiceSelector();

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes particleRise {
        0% { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(-100px) scale(0); }
    }
`;
document.head.appendChild(style);

// CONFETTI SYSTEM
class ConfettiSystem {
    constructor() {
        this.canvas = document.getElementById('confetti');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    fire() {
        this.particles = [];
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

        for (let i = 0; i < 150; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20 - 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                life: 100
            });
        }

        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.particles.length === 0) return;

        this.particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.5; // Gravity
            p.rotation += p.rotationSpeed;
            p.life--;

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation * Math.PI / 180);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            this.ctx.restore();

            if (p.life <= 0) this.particles.splice(i, 1);
        });

        requestAnimationFrame(() => this.animate());
    }
}

const confetti = new ConfettiSystem();
