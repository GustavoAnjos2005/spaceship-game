class EnemyController {
    constructor(game) {
        this.game = game;
        this.enemies = [];
        this.asteroids = [];
        this.enemySpawnTimer = 0;
        this.asteroidSpawnTimer = 0;
        this.enemySpawnInterval = 5;
        this.asteroidSpawnInterval = 2;
        
        this.enemyTypes = [
            {
                width: 40,
                height: 40,
                health: 30,
                speed: 100,
                color: '#FF5555',
                score: 50,
                fireRate: 2,
                fireTimer: 0
            },
            {
                width: 30,
                height: 50,
                health: 20,
                speed: 150,
                color: '#FFAA00',
                score: 30,
                fireRate: 1.5,
                fireTimer: 0
            }
        ];
        
        this.asteroidTypes = [
            { size: 30, health: 15, speed: 100, color: '#8F0D87', score: 10 },
            { size: 50, health: 30, speed: 80, color: '#5A0D8F', score: 20 },
            { size: 70, health: 50, speed: 60, color: '#3A0D8F', score: 30 }
        ];
    }

    reset() {
        this.enemies = [];
        this.asteroids = [];
        this.enemySpawnTimer = 0;
        this.asteroidSpawnTimer = 0;
    }

    update(deltaTime) {
        // Spawn enemies
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnInterval / this.game.difficulty) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
            this.enemySpawnInterval = Math.max(1, 5 - this.game.difficulty);
        }
        
        // Spawn asteroids
        this.asteroidSpawnTimer += deltaTime;
        if (this.asteroidSpawnTimer >= this.asteroidSpawnInterval / this.game.difficulty) {
            this.spawnAsteroid();
            this.asteroidSpawnTimer = 0;
            this.asteroidSpawnInterval = Math.max(0.5, 2 - this.game.difficulty * 0.5);
        }
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            enemy.y += enemy.speed * deltaTime;
            
            enemy.fireTimer += deltaTime;
            if (enemy.fireTimer >= enemy.fireRate) {
                this.enemyFire(enemy);
                enemy.fireTimer = 0;
            }
            
            if (enemy.y > this.game.height) {
                this.enemies.splice(i, 1);
            }
        }
        
        // Update asteroids
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            
            asteroid.y += asteroid.speed * deltaTime;
            asteroid.x += Math.sin(asteroid.y * 0.05) * 20 * deltaTime;
            asteroid.rotation += asteroid.rotationSpeed * deltaTime;
            
            if (asteroid.y > this.game.height) {
                this.asteroids.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        // Draw enemies
        this.enemies.forEach(enemy => {
            ctx.save();
            ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.moveTo(0, -enemy.height / 2);
            ctx.lineTo(-enemy.width / 2, enemy.height / 2);
            ctx.lineTo(enemy.width / 2, enemy.height / 2);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.restore();
        });
        
        // Draw asteroids
        this.asteroids.forEach(asteroid => {
            ctx.save();
            ctx.translate(asteroid.x + asteroid.size / 2, asteroid.y + asteroid.size / 2);
            ctx.rotate(asteroid.rotation);
            
            ctx.fillStyle = asteroid.color;
            ctx.beginPath();
            
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const radius = asteroid.size / 2 * (0.8 + Math.random() * 0.4);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#E0B0FF';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            ctx.restore();
        });
    }

    spawnEnemy() {
        const type = Math.floor(Math.random() * this.enemyTypes.length);
        const enemyType = this.enemyTypes[type];
        const x = Math.random() * (this.game.width - enemyType.width);
        
        this.enemies.push({
            ...enemyType,
            x,
            y: -enemyType.height,
            rotation: 0,
            fireTimer: Math.random() * enemyType.fireRate
        });
    }

    spawnAsteroid() {
        const type = Math.floor(Math.random() * this.asteroidTypes.length);
        const asteroidType = this.asteroidTypes[type];
        const x = Math.random() * (this.game.width - asteroidType.size);
        
        this.asteroids.push({
            ...asteroidType,
            x,
            y: -asteroidType.size,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 3
        });
    }

    enemyFire(enemy) {
        this.game.audio.playEnemyShoot();
        
        this.game.projectileController.addEnemyProjectile(
            enemy.x + enemy.width / 2 - 5,
            enemy.y + enemy.height,
            10,
            20,
            '#FF5555',
            15,
            0,
            400
        );
    }

    damageEnemy(index, damage) {
        this.enemies[index].health -= damage;
        
        if (this.enemies[index].health <= 0) {
            this.game.audio.playExplosion();
            this.game.addScore(this.enemies[index].score);
            this.createExplosion(
                this.enemies[index].x + this.enemies[index].width / 2,
                this.enemies[index].y + this.enemies[index].height / 2,
                this.enemies[index].width
            );
            this.enemies.splice(index, 1);
            return true;
        }
        
        return false;
    }

    damageAsteroid(index, damage) {
        this.asteroids[index].health -= damage;
        
        if (this.asteroids[index].health <= 0) {
            this.game.audio.playExplosion();
            this.game.addScore(this.asteroids[index].score);
            this.createExplosion(
                this.asteroids[index].x + this.asteroids[index].size / 2,
                this.asteroids[index].y + this.asteroids[index].size / 2,
                this.asteroids[index].size
            );
            
            if (Math.random() < 0.2) {
                this.game.powerupController.spawnPowerup(
                    this.asteroids[index].x + this.asteroids[index].size / 2,
                    this.asteroids[index].y + this.asteroids[index].size / 2
                );
            }
            
            this.asteroids.splice(index, 1);
            return true;
        }
        
        return false;
    }

    createExplosion(x, y, size) {
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 100 + 50;
            const lifetime = Math.random() * 0.5 + 0.3;
            const radius = Math.random() * 5 + 2;
            const color = `hsl(${Math.random() * 30 + 10}, 100%, 50%)`;
            
            this.game.projectileController.addParticle(
                x,
                y,
                radius,
                color,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                lifetime
            );
        }
    }
}