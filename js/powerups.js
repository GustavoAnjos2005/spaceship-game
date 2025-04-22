class PowerupController {
    constructor(game) {
        this.game = game;
        this.powerups = [];
        this.activePowerups = {};

        this.powerupTypes = [
            {
                type: 'health',
                color: '#00FF88',
                duration: 0,
                effect: (player) => {
                    player.health = Math.min(player.maxHealth, player.health + 30);
                    this.game.ui.updateHealth(player.health);
                    this.game.audio.playPowerup();
                }
            },
            {
                type: 'shield',
                color: '#00CCFF',
                duration: 15,
                effect: (player) => {
                    player.activateShield();
                },
                endEffect: (player) => {
                    player.shieldActive = false;
                    this.game.ui.updateShield(0);
                }
            },
            {
                type: 'double',
                color: '#FFAA00',
                duration: 20,
                effect: (player) => {
                    player.setWeapon('double');
                },
                endEffect: (player) => {
                    player.setWeapon('basic');
                }
            },
            {
                type: 'laser',
                color: '#FF00FF',
                duration: 15,
                effect: (player) => {
                    player.setWeapon('laser');
                },
                endEffect: (player) => {
                    player.setWeapon('basic');
                }
            }
        ];
    }

    reset() {
        this.powerups = [];
        for (const type in this.activePowerups) {
            this.deactivatePowerup(type);
        }
    }

    update(deltaTime) {
        // Atualizar posição dos powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            powerup.y += 100 * deltaTime;

            if (powerup.y > this.game.height) {
                this.powerups.splice(i, 1);
            }
        }

        // Atualizar powerups ativos
        for (const type in this.activePowerups) {
            const powerup = this.activePowerups[type];
            powerup.timer += deltaTime;
            
            if (powerup.timer >= powerup.duration) {
                this.deactivatePowerup(type);
            }
        }
    }

    draw(ctx) {
        this.powerups.forEach(powerup => {
            ctx.save();
            ctx.translate(powerup.x + 15, powerup.y + 15);
            
            ctx.fillStyle = powerup.color;
            ctx.shadowColor = powerup.color;
            ctx.shadowBlur = 15;

            switch (powerup.type) {
                case 'health':
                    ctx.beginPath();
                    ctx.moveTo(0, -10);
                    ctx.lineTo(-10, 10);
                    ctx.lineTo(10, 10);
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                case 'shield':
                    ctx.beginPath();
                    ctx.arc(0, 0, 10, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 'double':
                    ctx.fillRect(-5, -7, 10, 4);
                    ctx.fillRect(-5, 3, 10, 4);
                    break;
                    
                case 'laser':
                    ctx.fillRect(-3, -10, 6, 20);
                    break;
            }

            ctx.restore();
        });
    }

    spawnPowerup(x, y) {
        const type = this.powerupTypes[Math.floor(Math.random() * this.powerupTypes.length)];
        const size = 30;
        
        this.powerups.push({
            x: x - size/2,
            y: y - size/2,
            size: size,
            type: type.type,
            color: type.color,
            duration: type.duration
        });
    }

    activatePowerup(type) {
        const powerupType = this.powerupTypes.find(p => p.type === type);
        if (!powerupType) return;

        // Se já está ativo, resetar timer
        if (this.activePowerups[type]) {
            this.activePowerups[type].timer = 0;
        } 
        else {
            this.activePowerups[type] = {
                timer: 0,
                duration: powerupType.duration
            };
            powerupType.effect(this.game.player);
        }
        
        this.game.audio.playPowerup();
    }

    deactivatePowerup(type) {
        const powerupType = this.powerupTypes.find(p => p.type === type);
        if (powerupType && powerupType.endEffect) {
            powerupType.endEffect(this.game.player);
        }
        delete this.activePowerups[type];
    }
}