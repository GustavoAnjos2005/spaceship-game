class PowerupController {
    constructor(game) {
        this.game = game;
        this.powerups = [];
        this.activePowerups = {};
        this.powerupTypes = {
            'shield': {
                color: '#00CCFF',
                duration: 10,
                effect: (player) => {
                    player.shield = 50; // Add 50 shield points
                    this.game.ui.updateHealth(player.health, player.shield);
                },
                endEffect: (player) => {
                    player.shield = 0;
                    this.game.ui.updateHealth(player.health, player.shield);
                }
            },
            'double': {
                color: '#FFAA00',
                duration: 15,
                effect: (player) => {
                    player.setWeapon('double');
                },
                endEffect: (player) => {
                    player.setWeapon('basic');
                }
            },
            'laser': {
                color: '#FF00FF',
                duration: 12,
                effect: (player) => {
                    player.setWeapon('laser');
                },
                endEffect: (player) => {
                    player.setWeapon('basic');
                }
            },
            'health': {
                color: '#00FF88',
                duration: 0, // Instant effect
                effect: (player) => {
                    player.health = Math.min(player.maxHealth, player.health + 30);
                    this.game.ui.updateHealth(player.health, player.shield);
                    this.game.audio.playPowerup();
                }
            }
        };
    }

    reset() {
        this.powerups = [];
        // Clear all active powerups
        for (const type in this.activePowerups) {
            this.deactivatePowerup(type);
        }
    }

    update(deltaTime) {
        // Update powerups movement
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            powerup.y += powerup.speed * deltaTime;

            // Remove if off screen
            if (powerup.y > this.game.height) {
                this.powerups.splice(i, 1);
            }
        }

        // Update active powerups timers
        for (const type in this.activePowerups) {
            if (this.activePowerups[type].duration > 0) {
                this.activePowerups[type].timer += deltaTime;
                
                if (this.activePowerups[type].timer >= this.activePowerups[type].duration) {
                    this.deactivatePowerup(type);
                }
            }
        }
    }

    draw(ctx) {
        this.powerups.forEach(powerup => {
            ctx.save();
            
            // Draw powerup icon
            ctx.fillStyle = powerup.color;
            ctx.beginPath();
            
            switch(powerup.type) {
                case 'shield':
                    ctx.arc(powerup.x + powerup.size/2, powerup.y + powerup.size/2, 
                            powerup.size/2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 'double':
                    ctx.rect(powerup.x, powerup.y, powerup.size, powerup.size/3);
                    ctx.rect(powerup.x, powerup.y + powerup.size*2/3, powerup.size, powerup.size/3);
                    ctx.fill();
                    break;
                    
                case 'laser':
                    ctx.rect(powerup.x + powerup.size/4, powerup.y, powerup.size/2, powerup.size);
                    ctx.fill();
                    break;
                    
                case 'health':
                    ctx.moveTo(powerup.x + powerup.size/2, powerup.y);
                    ctx.lineTo(powerup.x, powerup.y + powerup.size);
                    ctx.lineTo(powerup.x + powerup.size, powerup.y + powerup.size);
                    ctx.closePath();
                    ctx.fill();
                    break;
            }
            
            // Add glow effect
            ctx.shadowColor = powerup.color;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
            
            ctx.restore();
        });
    }

    spawnPowerup(x, y) {
        const types = Object.keys(this.powerupTypes);
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.powerups.push({
            x: x - 15,
            y: y,
            size: 30,
            speed: 100,
            type: type,
            color: this.powerupTypes[type].color
        });
    }

    activatePowerup(type) {
        // If already active, reset timer
        if (this.activePowerups[type]) {
            this.activePowerups[type].timer = 0;
        } else {
            this.activePowerups[type] = {
                timer: 0,
                duration: this.powerupTypes[type].duration
            };
            this.powerupTypes[type].effect(this.game.player);
        }
        
        this.game.audio.playPowerup();
    }

    deactivatePowerup(type) {
        if (this.activePowerups[type]) {
            this.powerupTypes[type].endEffect(this.game.player);
            delete this.activePowerups[type];
        }
    }
}