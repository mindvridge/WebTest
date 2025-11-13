import Phaser from 'phaser';
import { ENEMY_TYPES } from '../config/GameConfig';
import { Player } from './Player';
import type { GameScene } from '../scenes/GameScene';

export class Enemy extends Phaser.GameObjects.Graphics {
  declare body: Phaser.Physics.Arcade.Body;
  public health: number;
  public maxHealth: number;
  public speed: number;
  public damage: number;
  public xpValue: number;
  public enemyType: string;

  private player: Player;
  private color: number;
  private hitFlashTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: string, player: Player) {
    super(scene);

    this.x = x;
    this.y = y;
    this.player = player;
    this.enemyType = type;

    // Get enemy stats
    const stats = ENEMY_TYPES[type as keyof typeof ENEMY_TYPES];
    this.health = stats.health;
    this.maxHealth = stats.health;
    this.speed = stats.speed;
    this.damage = stats.damage;
    this.xpValue = stats.xp;
    this.color = stats.color;

    // Draw enemy
    this.drawEnemy();

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    this.body.setSize(28, 28);
    this.body.setOffset(-14, -14);
  }

  private drawEnemy() {
    this.clear();

    // Different shapes for different enemy types
    if (this.enemyType === 'boss') {
      // Larger, more menacing for boss
      this.fillStyle(this.color, 1);
      this.fillRect(-20, -20, 40, 40);
      this.lineStyle(3, 0x000000, 1);
      this.strokeRect(-20, -20, 40, 40);

      // Angry eyes
      this.fillStyle(0xff0000, 1);
      this.fillCircle(-8, -8, 4);
      this.fillCircle(8, -8, 4);
    } else if (this.enemyType === 'karen') {
      // Karen shape (angry customer)
      this.fillStyle(this.color, 1);
      this.fillCircle(0, 0, 14);
      this.lineStyle(2, 0x000000, 1);
      this.strokeCircle(0, 0, 14);

      // Angry expression
      this.fillStyle(0xff0000, 1);
      this.fillCircle(-5, -3, 2);
      this.fillCircle(5, -3, 2);
      this.lineStyle(2, 0xff0000, 1);
      this.lineBetween(-5, 5, 5, 3);
    } else if (this.enemyType === 'influencer') {
      // Influencer (phone out)
      this.fillStyle(this.color, 1);
      this.fillCircle(0, 0, 14);
      this.lineStyle(2, 0x000000, 1);
      this.strokeCircle(0, 0, 14);

      // Phone
      this.fillStyle(0x000000, 1);
      this.fillRect(5, -8, 6, 10);
    } else if (this.enemyType === 'foodCritic') {
      // Food critic (clipboard)
      this.fillStyle(this.color, 1);
      this.fillCircle(0, 0, 14);
      this.lineStyle(2, 0x000000, 1);
      this.strokeCircle(0, 0, 14);

      // Clipboard
      this.fillStyle(0xffffff, 1);
      this.fillRect(-8, -5, 6, 8);
      this.lineStyle(1, 0x000000, 1);
      this.strokeRect(-8, -5, 6, 8);
    } else {
      // Normal/Hungry customer (simple shape)
      this.fillStyle(this.color, 1);
      this.fillCircle(0, 0, 14);
      this.lineStyle(2, 0x000000, 1);
      this.strokeCircle(0, 0, 14);

      // Eyes
      this.fillStyle(0x000000, 1);
      this.fillCircle(-4, -2, 2);
      this.fillCircle(4, -2, 2);
    }
  }

  update(_time: number, delta: number) {
    // Check if game is paused
    const gameScene = this.scene as GameScene;
    if ((gameScene as any).isPaused) {
      return;
    }

    // Move toward player
    if (this.player && this.body) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
      this.body.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
      );
    }

    // Update hit flash
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= delta;
      if (this.hitFlashTimer <= 0) {
        this.drawEnemy();
      }
    }
  }

  takeDamage(amount: number) {
    this.health -= amount;

    // Flash white when hit
    this.clear();
    this.fillStyle(0xffffff, 1);
    this.fillCircle(0, 0, 14);
    this.hitFlashTimer = 100;

    if (this.health <= 0) {
      this.die();
    }
  }

  private die() {
    // Notify game scene
    (this.scene as GameScene).enemyKilled(this);

    // Death effect
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(this.color, 0.5);
    graphics.fillCircle(this.x, this.y, 20);
    graphics.setAlpha(1);

    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => {
        graphics.destroy();
      }
    });

    this.destroy();
  }
}
