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

        // Sistema de escudo
        this.shieldActive = false;
        this.shieldTime = 0;
        this.maxShieldTime = 10;
        this.shieldRadius = Math.max(this.width, this.height) * 0.8;

        // Sistema de armas
        this.weapons = {
            basic: { damage: 10, fireRate: 0.3, projectileSpeed: 600, color: '#E0B0FF' },
            double: { damage: 15, fireRate: 0.20, projectileSpeed: 700, color: '#00CCFF', spread: 0.2 },
            laser: { damage: 50, fireRate: 0.5, projectileSpeed: 900, color: '#FF00FF' }
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
        this.shieldActive = false;
        this.shieldTime = 0;
        this.game.ui.updateShield(0);
    }

    update(deltaTime) {
        if (this.moveDirection !== 0) {
            this.x += this.moveDirection * this.speed * deltaTime;
            this.x = Math.max(0, Math.min(this.game.width - this.width, this.x));
        }

        if (this.fireCooldown > 0) this.fireCooldown -= deltaTime;
        
        if (this.isFiring && this.fireCooldown <= 0) {
            this.fire();
            this.fireCooldown = this.weapons[this.currentWeapon].fireRate;
        }

        if (this.shieldActive) {
            this.shieldTime -= deltaTime;
            if (this.shieldTime <= 0) {
                this.shieldActive = false;
                this.game.ui.updateShield(0);
            } else {
                this.game.ui.updateShield((this.shieldTime / this.maxShieldTime) * 100);
            }
        }
    }

    draw(ctx) {
        if (this.shieldActive) {
            ctx.save();
            ctx.strokeStyle = '#00CCFF';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.6 - (0.3 * Math.sin(Date.now() / 200));
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, this.shieldRadius, 0, Math.PI*2);
            ctx.stroke();
            
            if (Math.random() < 0.3) {
                const angle = Math.random() * Math.PI*2;
                const x = this.x + this.width/2 + Math.cos(angle) * this.shieldRadius*0.9;
                const y = this.y + this.height/2 + Math.sin(angle) * this.shieldRadius*0.9;
                ctx.fillStyle = '#00CCFF';
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI*2);
                ctx.fill();
            }
            ctx.restore();
        }

        ctx.fillStyle = '#5A0D8F';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#E0B0FF';
        ctx.lineWidth = 3;
        ctx.stroke();

        if (this.moveDirection !== 0) {
            ctx.fillStyle = 'rgba(224, 176, 255, 0.5)';
            ctx.beginPath();
            ctx.moveTo(this.x + this.width/3, this.y + this.height);
            ctx.lineTo(this.x + this.width/2, this.y + this.height + 15);
            ctx.lineTo(this.x + this.width*2/3, this.y + this.height);
            ctx.closePath();
            ctx.fill();
        }
    }

    fire() {
        const weapon = this.weapons[this.currentWeapon];
        this.game.audio.playShoot();

        switch(this.currentWeapon) {
            case 'basic':
                this.createProjectile(weapon, this.x + this.width/2 - 3, 0);
                break;
            case 'double':
                this.createProjectile(weapon, this.x + this.width/3 - 3, -weapon.spread);
                this.createProjectile(weapon, this.x + this.width*2/3 - 3, weapon.spread);
                break;
            case 'laser':
                this.createProjectile(weapon, this.x + this.width/2 - 5, 0, 10, 30);
                break;
        }
    }

    createProjectile(weapon, xOffset, spread, width = 6, height = 20) {
        this.game.projectileController.addProjectile(
            xOffset,
            this.y,
            width,
            height,
            weapon.color,
            weapon.damage,
            spread * weapon.projectileSpeed,
            -weapon.projectileSpeed
        );
    }

    takeDamage(amount) {
        if (this.shieldActive) {
            this.shieldTime -= amount / 10;
            this.game.ui.updateShield((this.shieldTime / this.maxShieldTime) * 100);
            this.game.audio.playShieldHit();
            return;
        }

        this.health = Math.max(0, this.health - amount);
        this.game.ui.updateHealth(this.health);
        this.game.audio.playHit();

        if (this.health <= 0) this.game.gameOver();
    }

    activateShield() {
        this.shieldActive = true;
        this.shieldTime = this.maxShieldTime;
        this.game.ui.updateShield(100);
        this.game.audio.playShield();
    }

    moveLeft() { this.moveDirection = -1; }
    moveRight() { this.moveDirection = 1; }
    stopMoving() { this.moveDirection = 0; }
    startFiring() { this.isFiring = true; }
    stopFiring() { this.isFiring = false; }

    setWeapon(type) {
        if (this.weapons[type]) {
            this.currentWeapon = type;
            this.game.ui.updateWeapon(type.toUpperCase());
        }
    }
}