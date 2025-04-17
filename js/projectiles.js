class ProjectileController {
    constructor(game) {
        this.game = game;
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.particles = [];
        this.explosions = [];
    }
    
    reset() {
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.particles = [];
        this.explosions = [];
    }
    
    update(deltaTime) {
        // Atualiza projéteis do jogador
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.x += proj.vx * deltaTime;
            proj.y += proj.vy * deltaTime;
            
            if (proj.y < -proj.height || proj.y > this.game.height || 
                proj.x < -proj.width || proj.x > this.game.width) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Atualiza projéteis inimigos
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const proj = this.enemyProjectiles[i];
            proj.x += proj.vx * deltaTime;
            proj.y += proj.vy * deltaTime;
            
            if (proj.y < -proj.height || proj.y > this.game.height || 
                proj.x < -proj.width || proj.x > this.game.width) {
                this.enemyProjectiles.splice(i, 1);
            }
        }
        
        // Atualiza partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.lifetime -= deltaTime;
            
            if (particle.lifetime <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Atualiza explosões
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update(deltaTime);
            if (this.explosions[i].completed) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        // Desenha explosões primeiro (para ficarem atrás)
        this.explosions.forEach(explosion => {
            explosion.draw(ctx);
        });
        
        // Desenha projéteis do jogador
        this.projectiles.forEach(proj => {
            ctx.fillStyle = proj.color;
            ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
            
            // Efeito de brilho
            ctx.shadowColor = proj.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
            ctx.shadowBlur = 0;
        });
        
        // Desenha projéteis inimigos
        this.enemyProjectiles.forEach(proj => {
            ctx.fillStyle = proj.color;
            ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
            
            // Efeito de brilho
            ctx.shadowColor = proj.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
            ctx.shadowBlur = 0;
        });
        
        // Desenha partículas
        this.particles.forEach(particle => {
            ctx.globalAlpha = particle.lifetime / particle.maxLifetime;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    }
    
    addExplosion(x, y, size) {
        if (this.game.assets.spritesLoaded && this.game.assets.images.explosion) {
            const explosion = new SpriteAnimation(
                this.game.assets.images.explosion,
                x - size/2,
                y - size/2,
                size,
                size,
                this.game.assets.explosionFrames,
                0.05,
                false
            );
            this.explosions.push(explosion);
        } else {
            this.createParticleExplosion(x, y, size);
        }
        this.game.audio.playExplosion();
    }
    
    createParticleExplosion(x, y, size) {
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 100 + 50;
            const lifetime = Math.random() * 0.5 + 0.3;
            const radius = Math.random() * 5 + 2;
            const color = `hsl(${Math.random() * 30 + 10}, 100%, 50%)`;
            
            this.addParticle(
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
    
    addProjectile(x, y, width, height, color, damage, vx, vy) {
        this.projectiles.push({ x, y, width, height, color, damage, vx, vy });
    }
    
    addEnemyProjectile(x, y, width, height, color, damage, vx, vy) {
        this.enemyProjectiles.push({ x, y, width, height, color, damage, vx, vy });
    }
    
    addParticle(x, y, radius, color, vx, vy, lifetime) {
        this.particles.push({
            x, y, radius, color, vx, vy,
            lifetime,
            maxLifetime: lifetime
        });
    }
}

class SpriteAnimation {
    constructor(spriteSheet, x, y, width, height, frameCount, frameDuration, loop) {
        this.spriteSheet = spriteSheet;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.frameCount = frameCount;
        this.frameDuration = frameDuration;
        this.loop = loop;
        this.currentTime = 0;
        this.completed = false;
    }
    
    update(deltaTime) {
        if (this.completed) return;
        
        this.currentTime += deltaTime;
        
        if (this.currentTime >= this.frameCount * this.frameDuration) {
            if (this.loop) {
                this.currentTime = 0;
            } else {
                this.completed = true;
            }
        }
    }
    
    draw(ctx) {
        if (this.completed || !this.spriteSheet) return;
        
        const frameIndex = Math.min(
            Math.floor(this.currentTime / this.frameDuration),
            this.frameCount - 1
        );
        
        const frameWidth = this.spriteSheet.width / this.frameCount;
        
        ctx.save();
        ctx.drawImage(
            this.spriteSheet,
            frameIndex * frameWidth,
            0,
            frameWidth,
            this.spriteSheet.height,
            this.x,
            this.y,
            this.width,
            this.height
        );
        ctx.restore();
    }
}