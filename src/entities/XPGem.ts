import Phaser from 'phaser';

export class XPGem extends Phaser.GameObjects.Graphics {
  declare body: Phaser.Physics.Arcade.Body;
  public xpValue: number;
  private isCollected: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, xpValue: number) {
    super(scene);

    this.x = x;
    this.y = y;
    this.xpValue = xpValue;

    // Draw XP gem
    this.drawGem();

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    this.body.setSize(12, 12);
    this.body.setOffset(-6, -6);

    // Bounce effect
    scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Sparkle effect
    scene.tweens.add({
      targets: this,
      alpha: 0.7,
      duration: 300,
      yoyo: true,
      repeat: -1
    });
  }

  private drawGem() {
    this.clear();

    // Determine color based on XP value
    let color = 0x00aaff; // Blue for small XP
    if (this.xpValue >= 10) color = 0xff00ff; // Purple for large XP
    else if (this.xpValue >= 5) color = 0xffaa00; // Orange for medium XP

    // Draw gem shape (diamond)
    this.fillStyle(color, 1);
    this.beginPath();
    this.moveTo(0, -8);
    this.lineTo(6, 0);
    this.lineTo(0, 8);
    this.lineTo(-6, 0);
    this.closePath();
    this.fillPath();

    // Draw gem outline
    this.lineStyle(2, 0xffffff, 1);
    this.strokePath();

    // Draw gem highlight
    this.fillStyle(0xffffff, 0.6);
    this.fillCircle(-2, -3, 2);
  }

  collect() {
    if (this.isCollected) return;
    this.isCollected = true;

    // Collection effect
    this.scene.tweens.add({
      targets: this,
      scale: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.destroy();
      }
    });

    // Particle effect
    const particles = this.scene.add.particles(this.x, this.y, undefined, {
      speed: { min: 50, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: 300,
      quantity: 5,
      tint: 0x00aaff
    });

    this.scene.time.delayedCall(300, () => {
      particles.destroy();
    });
  }
}
