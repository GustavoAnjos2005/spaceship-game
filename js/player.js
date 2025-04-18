class Player {
    constructor(game) {
        this.game = game;
        this.width = 40;
        this.height = 60;
        this.x = game.width / 2 - this.width / 2;
        this.y = game.height - this.height - 20;
        this.speed = 500;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.moveDirection = 0;
        
        // Weapon properties
        this.weapons = {
            basic: {
                damage: 10,
                fireRate: 0.3,
                projectileSpeed: 600,
                color: '#E0B0FF'
            },
            double: {
                damage: 8,
                fireRate: 0.25,
                projectileSpeed: 600,
                color: '#00CCFF',
                spread: 0.2
            },
            laser: {
                damage: 15,
                fireRate: 0.5,
                projectileSpeed: 800,
                color: '#FF00FF'
            }
        };
        
        this.currentWeapon = 'basic';
        this.fireCooldown = 0;
        this.isFiring = false;
    }
    
    reset() {
        this.x = this.game.width / 2 - this.width / 2;
        this.y = this.game.height - this.height - 20;
        this.health = this.maxHealth;
        this.currentWeapon = 'basic';
        this.moveDirection = 0;
    }
    
    update(deltaTime) {
        // Movement
        if (this.moveDirection !== 0) {
            this.x += this.moveDirection * this.speed * deltaTime;
            this.x = Math.max(0, Math.min(this.game.width - this.width, this.x));
        }
        
        // Weapon cooldown
        if (this.fireCooldown > 0) {
            this.fireCooldown -= deltaTime;
        }
        
        // Firing
        if (this.isFiring && this.fireCooldown <= 0) {
            this.fire();
            this.fireCooldown = this.weapons[this.currentWeapon].fireRate;
        }
    }
    
    draw(ctx) {
        // Draw ship
        ctx.fillStyle = '#5A0D8F';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Draw ship details
        ctx.strokeStyle = '#E0B0FF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw engine glow when moving
        if (this.moveDirection !== 0) {
            ctx.fillStyle = 'rgba(224, 176, 255, 0.5)';
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 3, this.y + this.height);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height + 15);
            ctx.lineTo(this.x + this.width * 2/3, this.y + this.height);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    fire() {
        const weapon = this.weapons[this.currentWeapon];
        this.game.audio.playShoot();
        
        switch(this.currentWeapon) {
            case 'basic':
                this.game.projectileController.addProjectile(
                    this.x + this.width / 2 - 3,
                    this.y,
                    6,
                    20,
                    weapon.color,
                    weapon.damage,
                    0,
                    -weapon.projectileSpeed
                );
                break;
                
            case 'double':
                // Left projectile
                this.game.projectileController.addProjectile(
                    this.x + this.width / 3 - 3,
                    this.y,
                    6,
                    20,
                    weapon.color,
                    weapon.damage,
                    -weapon.spread * weapon.projectileSpeed,
                    -weapon.projectileSpeed
                );
                // Right projectile
                this.game.projectileController.addProjectile(
                    this.x + this.width * 2/3 - 3,
                    this.y,
                    6,
                    20,
                    weapon.color,
                    weapon.damage,
                    weapon.spread * weapon.projectileSpeed,
                    -weapon.projectileSpeed
                );
                break;
                
            case 'laser':
                this.game.projectileController.addProjectile(
                    this.x + this.width / 2 - 5,
                    this.y,
                    10,
                    30,
                    weapon.color,
                    weapon.damage,
                    0,
                    -weapon.projectileSpeed
                );
                break;
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        this.game.ui.updateHealth(this.health);
        this.game.audio.playHit();
        
        if (this.health <= 0) {
            this.health = 0;
            this.game.gameOver();
        }
    }
    
    moveLeft() {
        this.moveDirection = -1;
    }
    
    moveRight() {
        this.moveDirection = 1;
    }
    
    stopMoving() {
        this.moveDirection = 0;
    }
    
    startFiring() {
        this.isFiring = true;
    }
    
    stopFiring() {
        this.isFiring = false;
    }
    
    setWeapon(type) {
        if (this.weapons[type]) {
            this.currentWeapon = type;
            this.game.ui.updateWeapon(type.toUpperCase());
        }
    }
}