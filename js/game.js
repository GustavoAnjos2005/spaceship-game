class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.gameTime = 0;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameRunning = false;
        this.animationId = null;
        this.difficulty = 1;
        
        this.player = new Player(this);
        this.enemyController = new EnemyController(this);
        this.projectileController = new ProjectileController(this);
        this.powerupController = new PowerupController(this);
        this.ui = new UI(this);
        this.audio = new AudioController();
        this.collision = new Collision(this);
        
        this.assets = {
            images: {},
            spritesLoaded: false,
            explosionFrames: 6,
            explosionFrameWidth: 64,
            explosionFrameHeight: 64
        };
        
        this.init();
    }
    
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.error(`Erro ao carregar imagem: ${src}`);
                reject();
            };
            img.src = src;
        });
    }
    
    init() {
        this.highScore = parseInt(localStorage.getItem('spaceHighScore')) || 0;
        this.ui.updateHighScore(this.highScore);
        
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.startGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            document.getElementById('mobileControls').style.display = 'flex';
            this.setupMobileControls();
        }
    }
    
    setupMobileControls() {
        const leftBtn = document.getElementById('leftButton');
        const rightBtn = document.getElementById('rightButton');
        const fireBtn = document.getElementById('fireButton');

        leftBtn.addEventListener('touchstart', () => this.player.moveLeft());
        leftBtn.addEventListener('touchend', () => this.player.stopLeft());
        rightBtn.addEventListener('touchstart', () => this.player.moveRight());
        rightBtn.addEventListener('touchend', () => this.player.stopRight());
        fireBtn.addEventListener('touchstart', () => this.player.startFiring());
        fireBtn.addEventListener('touchend', () => this.player.stopFiring());
    }
    
    handleKeyDown(e) {
        if (!this.gameRunning) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                this.player.moveLeft();
                break;
            case 'ArrowRight':
                this.player.moveRight();
                break;
            case ' ':
                this.player.startFiring();
                break;
        }
    }
    
    handleKeyUp(e) {
        switch(e.key) {
            case 'ArrowLeft':
                this.player.stopLeft();
                break;
            case 'ArrowRight':
                this.player.stopRight();
                break;
            case ' ':
                this.player.stopFiring();
                break;
        }
    }
    
    startGame() {
        this.score = 0;
        this.gameTime = 0;
        this.difficulty = 1;
        
        this.player.reset();
        this.enemyController.reset();
        this.projectileController.reset();
        this.powerupController.reset();
        
        this.ui.hideScreens();
        this.ui.updateScore(this.score);
        this.ui.updateHealth(this.player.health, this.player.shield);
        this.ui.updateWeapon(this.player.currentWeapon.toUpperCase());
        
        this.gameRunning = true;
        this.lastTime = performance.now();
        this.audio.playBackground();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        if (!this.gameRunning) return;
        
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.gameTime += this.deltaTime;
        this.difficulty = 1 + Math.min(this.gameTime / 60, 3);
        
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawBackground();
        
        this.player.update(this.deltaTime);
        this.player.draw(this.ctx);
        
        this.enemyController.update(this.deltaTime);
        this.enemyController.draw(this.ctx);
        
        this.projectileController.update(this.deltaTime);
        this.projectileController.draw(this.ctx);
        
        this.powerupController.update(this.deltaTime);
        this.powerupController.draw(this.ctx);
        
        this.collision.checkAll();
        
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    drawBackground() {
        this.ctx.fillStyle = '#E0B0FF';
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * this.width;
            const y = (Math.random() * this.height + (Date.now() / 100) % this.height) % this.height;
            const size = Math.random() * 1.5;
            const opacity = Math.random() * 0.8 + 0.2;
            
            this.ctx.globalAlpha = opacity;
            this.ctx.fillRect(x, y, size, size);
            this.ctx.globalAlpha = 1;
        }
        
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width
        );
        gradient.addColorStop(0, 'rgba(90, 13, 143, 0.1)');
        gradient.addColorStop(1, 'rgba(10, 8, 24, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    addScore(points) {
        this.score += points;
        this.ui.updateScore(this.score);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('spaceHighScore', this.highScore.toString());
            this.ui.updateHighScore(this.highScore);
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        cancelAnimationFrame(this.animationId);
        this.audio.stopBackground();
        this.audio.playGameOver();
        this.ui.showGameOver(this.score, this.highScore);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.game = game;
});