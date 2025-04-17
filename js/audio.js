class AudioController {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.backgroundSource = null;
        this.sounds = {
            shoot: { url: 'assets/audio/laser4.wav', buffer: null, volume: 0.4 },
            explosion: { url: 'assets/audio/explosion.wav', buffer: null, volume: 0.6 },
            powerup: { url: 'assets/audio/power_up_sound_v1.ogg', buffer: null, volume: 0.5 },
            hit: { url: 'assets/audio/sfx_hurt.ogg', buffer: null, volume: 0.5 },
            enemyShoot: { url: 'assets/audio/laser5.wav', buffer: null, volume: 0.3 },
            gameOver: { url: 'assets/audio/ThisGameisOver.wav', buffer: null, volume: 0.7 },
            background: { url: 'assets/audio/Space journey.mp3', buffer: null, volume: 0.7, loop: true }
        };
        
        this.loadAll();
    }

    async loadAll() {
        try {
            for (const key in this.sounds) {
                const response = await fetch(this.sounds[key].url);
                const arrayBuffer = await response.arrayBuffer();
                this.sounds[key].buffer = await this.audioContext.decodeAudioData(arrayBuffer);
            }
        } catch (error) {
            console.error("Erro ao carregar áudios:", error);
        }
    }

    playSound(key) {
        if (!this.sounds[key]?.buffer) {
            console.warn(`Áudio ${key} não carregado`);
            return null;
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = this.sounds[key].buffer;
        gainNode.gain.value = this.sounds[key].volume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        if (this.sounds[key].loop) {
            source.loop = true;
        }
        
        source.start(0);
        return source;
    }

    playShoot() {
        this.playSound('shoot');
    }

    playExplosion() {
        this.playSound('explosion');
    }

    playPowerup() {
        this.playSound('powerup');
    }

    playHit() {
        this.playSound('hit');
    }

    playEnemyShoot() {
        this.playSound('enemyShoot');
    }

    playGameOver() {
        this.playSound('gameOver');
    }

    playBackground() {
        if (this.backgroundSource) {
            this.backgroundSource.stop();
        }
        this.backgroundSource = this.playSound('background');
    }

    stopBackground() {
        if (this.backgroundSource) {
            this.backgroundSource.stop();
            this.backgroundSource = null;
        }
    }
}