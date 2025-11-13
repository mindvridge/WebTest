import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private xpBar!: Phaser.GameObjects.Graphics;
  private xpBarBg!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private killCountText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene', active: false });
  }

  create() {
    const { width } = this.cameras.main;

    // Health bar background
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.8);
    this.healthBarBg.fillRect(20, 20, 300, 30);
    this.healthBarBg.lineStyle(2, 0xffffff, 1);
    this.healthBarBg.strokeRect(20, 20, 300, 30);

    // Health bar
    this.healthBar = this.add.graphics();

    // Health text
    this.add.text(25, 25, 'HP:', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Courier New'
    });

    // XP bar background
    this.xpBarBg = this.add.graphics();
    this.xpBarBg.fillStyle(0x000000, 0.8);
    this.xpBarBg.fillRect(20, 60, 300, 20);
    this.xpBarBg.lineStyle(2, 0xffffff, 1);
    this.xpBarBg.strokeRect(20, 60, 300, 20);

    // XP bar
    this.xpBar = this.add.graphics();

    // Level text
    this.levelText = this.add.text(25, 62, 'Level: 1', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Courier New'
    });

    // Timer
    this.timerText = this.add.text(width / 2, 20, '00:00', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Courier New',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0);

    // Kill count
    this.killCountText = this.add.text(width - 20, 20, 'Kills: 0', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Courier New',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(1, 0);

    // Listen for updates from GameScene
    this.events.on('updateHealth', this.updateHealth, this);
    this.events.on('updateXP', this.updateXP, this);
    this.events.on('updateLevel', this.updateLevel, this);
    this.events.on('updateTimer', this.updateTimer, this);
    this.events.on('updateKills', this.updateKills, this);
  }

  updateHealth(current: number, max: number) {
    this.healthBar.clear();
    const percentage = Math.max(0, current / max);
    const barWidth = 290 * percentage;

    // Color based on health percentage
    let color = 0x00ff00; // Green
    if (percentage < 0.3) color = 0xff0000; // Red
    else if (percentage < 0.6) color = 0xffaa00; // Orange

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(25, 25, barWidth, 20);
  }

  updateXP(current: number, required: number) {
    this.xpBar.clear();
    const percentage = Math.min(1, current / required);
    const barWidth = 290 * percentage;

    this.xpBar.fillStyle(0x00aaff, 1);
    this.xpBar.fillRect(25, 64, barWidth, 12);
  }

  updateLevel(level: number) {
    this.levelText.setText(`Level: ${level}`);
  }

  updateTimer(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    this.timerText.setText(`${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
  }

  updateKills(kills: number) {
    this.killCountText.setText(`Kills: ${kills}`);
  }

  showLevelUp(weapons: Array<{name: string, description: string}>, callback: (index: number) => void) {
    const { width, height } = this.cameras.main;

    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, width, height);

    // Level up text
    const levelUpText = this.add.text(width / 2, 150, 'LEVEL UP!', {
      fontSize: '64px',
      color: '#ffcc00',
      fontFamily: 'Courier New',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Weapon choices
    const startY = 250;
    const spacing = 100;

    weapons.forEach((weapon, index) => {
      const button = this.add.text(width / 2, startY + index * spacing,
        `${weapon.name}\n${weapon.description}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Courier New',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 },
        align: 'center'
      }).setOrigin(0.5).setInteractive();

      button.on('pointerover', () => {
        button.setBackgroundColor('#555555');
      });

      button.on('pointerout', () => {
        button.setBackgroundColor('#333333');
      });

      button.on('pointerdown', () => {
        overlay.destroy();
        levelUpText.destroy();
        weapons.forEach((_, i) => {
          this.children.getAll().forEach(child => {
            if (child instanceof Phaser.GameObjects.Text &&
                child.text.includes(weapons[i].name)) {
              child.destroy();
            }
          });
        });
        callback(index);
      });
    });
  }
}
