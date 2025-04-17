class Collision {
    constructor(game) {
        this.game = game;
        this.debug = false; // Altere para true para ver hitboxes
    }

    checkAll() {
        this.checkPlayerEnemyProjectiles();
        this.checkPlayerEnemies();
        this.checkPlayerAsteroids();
        this.checkProjectilesEnemies();
        this.checkProjectilesAsteroids();
        this.checkPlayerPowerups();
    }

    checkPlayerEnemyProjectiles() {
        const player = this.game.player;
        const projectiles = this.game.projectileController.enemyProjectiles;
        
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const proj = projectiles[i];
            
            if (this.debug) {
                this.game.ctx.fillStyle = 'rgba(255,0,0,0.3)';
                this.game.ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
            }
            
            if (this.rectCollision(
                player.x, player.y, player.width, player.height,
                proj.x, proj.y, proj.width, proj.height
            )) {
                // Efeito visual
                this.game.projectileController.addParticle(
                    proj.x + proj.width/2,
                    proj.y + proj.height/2,
                    10,
                    proj.color,
                    0, 0,
                    0.5
                );
                
                // Dano no jogador
                if (player.shield > 0) {
                    player.shield = Math.max(0, player.shield - proj.damage);
                    if (player.shield <= 0) {
                        player.takeDamage(proj.damage);
                    }
                } else {
                    player.takeDamage(proj.damage);
                }
                
                this.game.audio.playHit();
                projectiles.splice(i, 1);
            }
        }
    }

    checkPlayerEnemies() {
        const player = this.game.player;
        const enemies = this.game.enemyController.enemies;
        
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            
            if (this.rectCollision(
                player.x, player.y, player.width, player.height,
                enemy.x, enemy.y, enemy.width, enemy.height
            )) {
                player.takeDamage(20);
                this.game.enemyController.damageEnemy(i, 100);
            }
        }
    }

    checkPlayerAsteroids() {
        const player = this.game.player;
        const asteroids = this.game.enemyController.asteroids;
        
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const asteroid = asteroids[i];
            
            if (this.circleRectCollision(
                asteroid.x + asteroid.size/2, asteroid.y + asteroid.size/2, asteroid.size/2,
                player.x, player.y, player.width, player.height
            )) {
                player.takeDamage(asteroid.size/5);
                this.game.enemyController.damageAsteroid(i, 100);
            }
        }
    }

    checkProjectilesEnemies() {
        const projectiles = this.game.projectileController.projectiles;
        const enemies = this.game.enemyController.enemies;
        
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const proj = projectiles[i];
            
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                
                if (this.rectCollision(
                    proj.x, proj.y, proj.width, proj.height,
                    enemy.x, enemy.y, enemy.width, enemy.height
                )) {
                    const destroyed = this.game.enemyController.damageEnemy(j, proj.damage);
                    projectiles.splice(i, 1);
                    if (destroyed) break;
                }
            }
        }
    }

    checkProjectilesAsteroids() {
        const projectiles = this.game.projectileController.projectiles;
        const asteroids = this.game.enemyController.asteroids;
        
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const proj = projectiles[i];
            
            for (let j = asteroids.length - 1; j >= 0; j--) {
                const asteroid = asteroids[j];
                
                if (this.circleRectCollision(
                    asteroid.x + asteroid.size/2, asteroid.y + asteroid.size/2, asteroid.size/2,
                    proj.x, proj.y, proj.width, proj.height
                )) {
                    const destroyed = this.game.enemyController.damageAsteroid(j, proj.damage);
                    projectiles.splice(i, 1);
                    if (destroyed) break;
                }
            }
        }
    }

    checkPlayerPowerups() {
        const player = this.game.player;
        const powerups = this.game.powerupController.powerups;
        
        for (let i = powerups.length - 1; i >= 0; i--) {
            const powerup = powerups[i];
            
            if (this.rectCollision(
                player.x, player.y, player.width, player.height,
                powerup.x, powerup.y, powerup.size, powerup.size
            )) {
                this.game.powerupController.activatePowerup(powerup.type);
                powerups.splice(i, 1);
            }
        }
    }

    rectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && 
               x1 + w1 > x2 && 
               y1 < y2 + h2 && 
               y1 + h1 > y2;
    }

    circleRectCollision(cx, cy, radius, rx, ry, rw, rh) {
        let testX = cx;
        let testY = cy;

        if (cx < rx)         testX = rx;
        else if (cx > rx+rw) testX = rx+rw;
        if (cy < ry)         testY = ry;
        else if (cy > ry+rh) testY = ry+rh;

        const distX = cx - testX;
        const distY = cy - testY;
        const distance = Math.sqrt(distX*distX + distY*distY);

        return distance <= radius;
    }
}