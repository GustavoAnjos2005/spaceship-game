class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameWrapper = document.getElementById('gameWrapper');
        
        // Configurações iniciais
        this.isMobile = /Mobi|Android/i.test(navigator.userAgent);
        this.setupCanvasSize();
        window.addEventListener('resize', () => this.setupCanvasSize());
        
        // Variáveis do jogo
        this.gameTime = 0;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.score = 0;
        this.highScore = 0;
        this.difficulty = 1;
        this.gameRunning = false;
        this.animationId = null;
        
        // Sistemas do jogo
        this.player = new Player(this);
        this.enemyController = new EnemyController(this);
        this.projectileController = new ProjectileController(this);
        this.powerupController = new PowerupController(this);
        this.ui = new UI(this);
        this.audio = new AudioController();
        this.collision = new Collision(this);
        
        this.init();
    }

    setupCanvasSize() {
        const aspectRatio = 800 / 600;
        let canvasWidth, canvasHeight;

        if (this.isMobile) {
            const controlsHeight = window.innerHeight > window.innerWidth ? 80 : 60;
            const maxHeight = window.innerHeight - controlsHeight;
            
            canvasWidth = window.innerWidth;
            canvasHeight = canvasWidth / aspectRatio;
            
            if (canvasHeight > maxHeight) {
                canvasHeight = maxHeight;
                canvasWidth = canvasHeight * aspectRatio;
            }
        } else {
            canvasWidth = 800;
            canvasHeight = 600;
        }

        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.width = `${canvasWidth}px`;
        this.canvas.style.height = `${canvasHeight}px`;
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    init() {
        // Carregar recorde
        this.highScore = parseInt(localStorage.getItem('spaceHighScore')) || 0;
        this.ui.updateHighScore(this.highScore);

        // Event listeners
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Controles mobile
        if (this.isMobile) {
            this.setupMobileControls();
            document.getElementById('mobileControls').style.display = 'flex';
        }
    }

    setupMobileControls() {
        const controls = document.getElementById('mobileControls');
        const handlePress = (e) => {
            e.preventDefault();
            if (e.target.id === 'leftButton') this.player.moveLeft();
            if (e.target.id === 'rightButton') this.player.moveRight();
            if (e.target.id === 'fireButton') this.player.startFiring();
        };

        const handleRelease = (e) => {
            e.preventDefault();
            if (e.target.id === 'leftButton' || e.target.id === 'rightButton') this.player.stopMoving();
            if (e.target.id === 'fireButton') this.player.stopFiring();
        };

        controls.addEventListener('touchstart', handlePress);
        controls.addEventListener('touchend', handleRelease);
        controls.addEventListener('touchcancel', handleRelease);
        
        // Prevenir scroll
        controls.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }

    startGame() {
        // Resetar estado do jogo
        this.score = 0;
        this.gameTime = 0;
        this.difficulty = 1;
        this.gameRunning = true;
        this.lastTime = performance.now();
        
        // Resetar entidades
        this.player.reset();
        this.enemyController.reset();
        this.projectileController.reset();
        this.powerupController.reset();
        
        // Atualizar UI
        this.ui.hideScreens();
        this.ui.updateScore(this.score);
        this.ui.updateHealth(this.player.health);
        this.ui.updateWeapon(this.player.currentWeapon.toUpperCase());
        this.ui.updateShield(0);
        
        // Iniciar sistemas
        this.audio.playBackground();
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.gameLoop();
    }

    gameLoop(currentTime = 0) {
        if (!this.gameRunning) return;

        // Calcular deltaTime
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.gameTime += this.deltaTime;
        
        // Aumentar dificuldade
        this.difficulty = 1 + Math.min(this.gameTime / 60, 3);

        // Atualizar elementos
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
        
        // Verificar colisões
        this.collision.checkAll();

        // Continuar loop
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    drawBackground() {
        // Fundo estrelado
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

        // Efeito de nebulosa
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
            localStorage.setItem('spaceHighScore', this.highScore);
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
            case 'ArrowRight':
                this.player.stopMoving();
                break;
            case ' ':
                this.player.stopFiring();
                break;
        }
    }
}

// Inicializar o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => new Game());