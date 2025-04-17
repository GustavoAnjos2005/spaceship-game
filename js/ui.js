class UI {
    constructor(game) {
        this.game = game;
        this.healthFill = document.querySelector('.health-fill');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.weaponElement = document.getElementById('weaponDisplay');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalHighScoreElement = document.getElementById('finalHighScore');
    }

    updateScore(score) {
        this.scoreElement.textContent = score;
    }

    updateHighScore(highScore) {
        this.highScoreElement.textContent = highScore;
    }

    updateHealth(health, shield = 0) {
        const percentage = Math.max(0, health) / this.game.player.maxHealth * 100;
        this.healthFill.style.width = `${percentage}%`;
        
        const healthDisplay = this.healthFill.parentElement.nextElementSibling;
        if (shield > 0) {
            healthDisplay.textContent = `SHIELD: ${shield}% | HEALTH: ${Math.max(0, health)}%`;
        } else {
            healthDisplay.textContent = `HEALTH: ${Math.max(0, health)}%`;
        }
    }

    updateWeapon(weapon) {
        this.weaponElement.textContent = `WEAPON: ${weapon}`;
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
}