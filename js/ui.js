class UI {
    constructor(game) {
        this.game = game;
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.healthBar = document.querySelector('.health-fill');
        this.healthText = document.querySelector('.health-text');
        this.weaponDisplay = document.getElementById('weaponDisplay');
        this.shieldValue = document.querySelector('.shield-value');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalHighScoreElement = document.getElementById('finalHighScore');
        
        this.createMenuBackground();
    }
    
    updateScore(score) {
        this.scoreElement.textContent = score;
    }
    
    updateHighScore(highScore) {
        this.highScoreElement.textContent = highScore;
    }
    
    updateHealth(health) {
        const percent = Math.max(0, health);
        this.healthBar.style.width = `${percent}%`;
        this.healthText.textContent = `${percent}%`;
        
        // Muda cor baseado na saúde
        if (percent < 30) {
            this.healthBar.style.background = 'linear-gradient(to right, #FF5555, #FF0000)';
        } else if (percent < 60) {
            this.healthBar.style.background = 'linear-gradient(to right, #FFAA00, #FF5555)';
        } else {
            this.healthBar.style.background = 'linear-gradient(to right, #00FF88, #00CCFF)';
        }
    }
    
    updateWeapon(weapon) {
        this.weaponDisplay.textContent = `WEAPON: ${weapon}`;
    }
    
    updateShield(percent) {
        if (percent > 0) {
            this.shieldValue.textContent = `${Math.round(percent)}%`;
            
            // Efeito de ativação
            if (percent === 100) {
                this.shieldValue.style.animation = 'shieldActivate 0.5s';
                setTimeout(() => {
                    this.shieldValue.style.animation = '';
                }, 500);
            }
        }
    }
    
    hideScreens() {
        this.startScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
    }
    
    showGameOver(score, highScore) {
        this.finalScoreElement.textContent = score;
        this.finalHighScoreElement.textContent = highScore;
        this.gameOverScreen.style.display = 'flex';
    }
    
    createMenuBackground() {
        const canvas = document.createElement('canvas');
        canvas.width = this.game.width;
        canvas.height = this.game.height;
        const ctx = canvas.getContext('2d');
        
        // Estrelas
        ctx.fillStyle = '#E0B0FF';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 1.5;
            const opacity = Math.random() * 0.5 + 0.1;
            
            ctx.globalAlpha = opacity;
            ctx.fillRect(x, y, size, size);
            ctx.globalAlpha = 1;
        }
        
        // Nebulosa
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width
        );
        gradient.addColorStop(0, 'rgba(90, 13, 143, 0.2)');
        gradient.addColorStop(1, 'rgba(10, 8, 24, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        this.startScreen.style.backgroundImage = `url(${canvas.toDataURL()})`;
    }
}