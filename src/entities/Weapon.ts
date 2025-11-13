import Phaser from 'phaser';
import { WEAPON_CONFIG } from '../config/GameConfig';
import { Player } from './Player';
import { Enemy } from './Enemy';

export class Weapon {
  public type: string;
  private scene: Phaser.Scene;
  private player: Player;
  private enemies: Phaser.GameObjects.Group;
  private config: any;

  private cooldownTimer: number = 0;
  private damage: number;
  private level: number = 1;

  // Weapon-specific properties
  private projectiles: Phaser.GameObjects.Graphics[] = [];
  private orbitalWeapons: Phaser.GameObjects.Graphics[] = [];
  private orbitAngle: number = 0;
  private activeAOE: Phaser.GameObjects.Graphics[] = [];

  constructor(scene: Phaser.Scene, player: Player, type: string, enemies: Phaser.GameObjects.Group) {
    this.scene = scene;
    this.player = player;
    this.type = type;
    this.enemies = enemies;
    this.config = WEAPON_CONFIG[type as keyof typeof WEAPON_CONFIG];
    this.damage = this.config.damage;

    // Initialize weapon-specific setup
    if (type === 'iceCreamScoop') {
      this.createOrbitalWeapon();
    }
  }

  update(_time: number, delta: number) {
    this.cooldownTimer -= delta;

    if (this.cooldownTimer <= 0) {
      this.attack();
      this.cooldownTimer = this.config.cooldown;
    }

    // Update weapon-specific behaviors
    if (this.type === 'iceCreamScoop') {
      this.updateOrbital(delta);
    }

    // Update projectiles
    this.updateProjectiles(delta);
  }

  private attack() {
    switch (this.type) {
      case 'hamburger':
        this.attackHamburger();
        break;
      case 'pizzaCutter':
        this.attackPizzaCutter();
        break;
      case 'sodaFountain':
        this.attackSodaFountain();
        break;
      case 'coffeeMachine':
        this.attackCoffeeMachine();
        break;
      case 'fryerOil':
        this.attackFryerOil();
        break;
      case 'iceCreamScoop':
        // Orbital is passive, no active attack
        break;
    }
  }

  private attackHamburger() {
    // Find nearest enemy
    const nearestEnemy = this.findNearestEnemy(this.config.range);
    if (!nearestEnemy) return;

    // Create projectile
    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      nearestEnemy.x, nearestEnemy.y
    );

    this.createProjectile(
      this.player.x, this.player.y,
      angle,
      this.config.projectileSpeed,
      this.damage * this.player.damageMultiplier,
      0xff6b35, // Hamburger color (orange)
      this.config.pierce
    );
  }

  private attackPizzaCutter() {
    // Create spinning blade around player
    const blade = this.scene.add.graphics();
    blade.lineStyle(4, 0xff0000, 1);
    blade.strokeCircle(0, 0, this.config.radius);
    blade.setPosition(this.player.x, this.player.y);

    this.activeAOE.push(blade);

    // Check collision with enemies in range
    const enemiesInRange = this.getEnemiesInRange(this.config.radius);
    enemiesInRange.forEach(enemy => {
      enemy.takeDamage(this.damage * this.player.damageMultiplier);
    });

    // Animate and destroy
    let rotation = 0;
    const interval = setInterval(() => {
      rotation += 0.2;
      blade.setRotation(rotation);
    }, 16);

    this.scene.time.delayedCall(this.config.duration, () => {
      clearInterval(interval);
      blade.destroy();
      const index = this.activeAOE.indexOf(blade);
      if (index > -1) this.activeAOE.splice(index, 1);
    });
  }

  private attackSodaFountain() {
    // Create area of effect
    const aoe = this.scene.add.graphics();
    aoe.fillStyle(0x00aaff, 0.3);
    aoe.fillCircle(0, 0, this.config.radius);
    aoe.lineStyle(2, 0x00ffff, 1);
    aoe.strokeCircle(0, 0, this.config.radius);
    aoe.setPosition(this.player.x, this.player.y);

    this.activeAOE.push(aoe);

    // Damage and slow enemies over time
    const damageInterval = setInterval(() => {
      const enemiesInRange = this.getEnemiesInRange(this.config.radius, aoe.x, aoe.y);
      enemiesInRange.forEach(enemy => {
        enemy.takeDamage(this.damage * this.player.damageMultiplier);
        enemy.speed *= this.config.slowEffect;
        this.scene.time.delayedCall(500, () => {
          enemy.speed /= this.config.slowEffect;
        });
      });
    }, 500);

    // Clean up
    this.scene.time.delayedCall(this.config.duration, () => {
      clearInterval(damageInterval);
      aoe.destroy();
      const index = this.activeAOE.indexOf(aoe);
      if (index > -1) this.activeAOE.splice(index, 1);
    });
  }

  private attackCoffeeMachine() {
    // Find nearest enemy and rapid fire
    const nearestEnemy = this.findNearestEnemy(this.config.range);
    if (!nearestEnemy) return;

    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      nearestEnemy.x, nearestEnemy.y
    );

    this.createProjectile(
      this.player.x, this.player.y,
      angle,
      this.config.projectileSpeed,
      this.damage * this.player.damageMultiplier,
      0x5c3317, // Coffee brown
      0
    );
  }

  private attackFryerOil() {
    // Create multiple oil pools at random positions near player
    for (let i = 0; i < this.config.poolCount; i++) {
      const angle = (Math.PI * 2 / this.config.poolCount) * i;
      const distance = 100;
      const x = this.player.x + Math.cos(angle) * distance;
      const y = this.player.y + Math.sin(angle) * distance;

      const pool = this.scene.add.graphics();
      pool.fillStyle(0xffaa00, 0.6);
      pool.fillCircle(0, 0, this.config.poolRadius);
      pool.setPosition(x, y);

      this.activeAOE.push(pool);

      // Damage enemies in pool over time
      const damageInterval = setInterval(() => {
        const enemiesInRange = this.getEnemiesInRange(this.config.poolRadius, x, y);
        enemiesInRange.forEach(enemy => {
          enemy.takeDamage(this.damage * this.player.damageMultiplier);
        });
      }, 500);

      // Clean up
      this.scene.time.delayedCall(this.config.duration, () => {
        clearInterval(damageInterval);
        pool.destroy();
        const index = this.activeAOE.indexOf(pool);
        if (index > -1) this.activeAOE.splice(index, 1);
      });
    }
  }

  private createOrbitalWeapon() {
    const orbital = this.scene.add.graphics();
    orbital.fillStyle(0xffccff, 1);
    orbital.fillCircle(0, 0, 10);
    orbital.lineStyle(2, 0xffffff, 1);
    orbital.strokeCircle(0, 0, 10);

    this.orbitalWeapons.push(orbital);
  }

  private updateOrbital(delta: number) {
    this.orbitAngle += (this.config.orbitSpeed * delta) / 1000;

    this.orbitalWeapons.forEach((orbital, index) => {
      const angleOffset = (Math.PI * 2 / this.orbitalWeapons.length) * index;
      const x = this.player.x + Math.cos(this.orbitAngle + angleOffset) * this.config.orbitRadius;
      const y = this.player.y + Math.sin(this.orbitAngle + angleOffset) * this.config.orbitRadius;

      orbital.setPosition(x, y);

      // Check collision with enemies
      const enemiesInRange = this.getEnemiesInRange(15, x, y);
      enemiesInRange.forEach(enemy => {
        enemy.takeDamage(this.damage * this.player.damageMultiplier);
      });
    });
  }

  private createProjectile(x: number, y: number, angle: number, speed: number, damage: number, color: number, pierce: number) {
    const projectile = this.scene.add.graphics();
    projectile.fillStyle(color, 1);
    projectile.fillCircle(0, 0, 6);
    projectile.setPosition(x, y);

    const projectileData: any = projectile.getData('weaponData') || {};
    projectileData.vx = Math.cos(angle) * speed;
    projectileData.vy = Math.sin(angle) * speed;
    projectileData.damage = damage;
    projectileData.pierce = pierce;
    projectileData.hitEnemies = [];
    projectile.setData('weaponData', projectileData);

    this.projectiles.push(projectile);
  }

  private updateProjectiles(delta: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      const data = projectile.getData('weaponData');

      if (!data) {
        projectile.destroy();
        this.projectiles.splice(i, 1);
        continue;
      }

      // Move projectile
      projectile.x += data.vx * (delta / 1000);
      projectile.y += data.vy * (delta / 1000);

      // Check collision with enemies
      const enemiesInRange = this.getEnemiesInRange(10, projectile.x, projectile.y);
      let hit = false;

      enemiesInRange.forEach(enemy => {
        if (!data.hitEnemies.includes(enemy)) {
          enemy.takeDamage(data.damage);
          data.hitEnemies.push(enemy);
          data.pierce--;

          if (data.pierce < 0) {
            hit = true;
          }
        }
      });

      // Remove projectile if it hit or is off screen
      const bounds = this.scene.cameras.main.worldView;
      if (hit ||
          projectile.x < bounds.x - 100 || projectile.x > bounds.right + 100 ||
          projectile.y < bounds.y - 100 || projectile.y > bounds.bottom + 100) {
        projectile.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  private findNearestEnemy(range: number): Enemy | null {
    let nearest: Enemy | null = null;
    let nearestDist = range;

    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      if (dist < nearestDist) {
        nearest = enemy;
        nearestDist = dist;
      }
    });

    return nearest;
  }

  private getEnemiesInRange(range: number, x?: number, y?: number): Enemy[] {
    const centerX = x ?? this.player.x;
    const centerY = y ?? this.player.y;
    const enemiesInRange: Enemy[] = [];

    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      const dist = Phaser.Math.Distance.Between(centerX, centerY, enemy.x, enemy.y);

      if (dist <= range) {
        enemiesInRange.push(enemy);
      }
    });

    return enemiesInRange;
  }

  upgradeDamage(amount: number) {
    this.damage += amount;
    this.level++;
  }

  destroy() {
    this.projectiles.forEach(p => p.destroy());
    this.orbitalWeapons.forEach(o => o.destroy());
    this.activeAOE.forEach(a => a.destroy());
  }
}
