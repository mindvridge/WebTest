import Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Graphics {
  declare body: Phaser.Physics.Arcade.Body;
  public health: number;
  public maxHealth: number;
  public speed: number;
  public defense: number;
  public damageMultiplier: number;

  private invulnerabilityTimer: number = 0;
  private readonly invulnerabilityDuration: number = 500; // 0.5 seconds

  constructor(scene: Phaser.Scene, x: number, y: number, characterStats: any) {
    super(scene);

    this.x = x;
    this.y = y;

    // Apply character stats
    this.health = characterStats.health;
    this.maxHealth = characterStats.health;
    this.speed = characterStats.speed;
    this.defense = characterStats.defense;
    this.damageMultiplier = characterStats.damage;

    // Draw player (chef sprite - simple rectangle for now)
    this.drawPlayer();

    // Set up physics body
    scene.physics.world.enable(this);
    this.body.setSize(32, 32);
    this.body.setOffset(-16, -16);
    // Infinite map - no world bounds
  }

  private drawPlayer() {
    this.clear();

    // Draw chef body (white coat)
    this.fillStyle(0xffffff, 1);
    this.fillRect(-12, -12, 24, 24);

    // Draw chef hat
    this.fillStyle(0xeeeeee, 1);
    this.fillCircle(0, -16, 8);

    // Draw face
    this.fillStyle(0xffcc99, 1);
    this.fillCircle(0, -4, 6);

    // Draw eyes
    this.fillStyle(0x000000, 1);
    this.fillCircle(-3, -6, 2);
    this.fillCircle(3, -6, 2);

    // Draw buttons
    this.fillStyle(0x333333, 1);
    this.fillCircle(0, 0, 2);
    this.fillCircle(0, 6, 2);

    // Border
    this.lineStyle(2, 0x000000, 1);
    this.strokeRect(-12, -12, 24, 24);
  }

  takeDamage(amount: number) {
    // Check invulnerability
    if (this.invulnerabilityTimer > 0) return;

    this.health -= amount;
    this.invulnerabilityTimer = this.invulnerabilityDuration;

    // Flash effect
    this.alpha = 0.5;
    this.scene.time.delayedCall(100, () => {
      this.alpha = 1;
    });

    if (this.health <= 0) {
      this.health = 0;
    }
  }

  setVelocity(x: number, y: number) {
    this.body.setVelocity(x, y);
  }

  preUpdate(_time: number, delta: number) {
    // Update invulnerability timer
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= delta;
    }
  }
}
