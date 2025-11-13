import Phaser from 'phaser';
import { CHARACTER_STATS } from '../config/GameConfig';

export class MenuScene extends Phaser.Scene {
  private selectedCharacter: string = 'rookie';

  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, 100, "CHEF'S LAST STAND", {
      fontSize: '64px',
      color: '#ff6b35',
      fontFamily: 'Courier New',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 180, 'Survive the 24-Hour Shift!', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Character selection
    this.add.text(width / 2, 250, 'Select Your Chef:', {
      fontSize: '28px',
      color: '#ffcc00',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    const characters = Object.keys(CHARACTER_STATS);
    const buttonStartY = 320;
    const buttonSpacing = 50;

    characters.forEach((charKey, index) => {
      const char = CHARACTER_STATS[charKey as keyof typeof CHARACTER_STATS];
      const button = this.add.text(width / 2, buttonStartY + index * buttonSpacing,
        `${char.name} - HP: ${char.health} | Speed: ${char.speed}`, {
        fontSize: '18px',
        color: charKey === this.selectedCharacter ? '#00ff00' : '#ffffff',
        fontFamily: 'Courier New',
        backgroundColor: charKey === this.selectedCharacter ? '#333333' : '#000000',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5).setInteractive();

      button.on('pointerover', () => {
        button.setColor('#ffcc00');
      });

      button.on('pointerout', () => {
        button.setColor(charKey === this.selectedCharacter ? '#00ff00' : '#ffffff');
      });

      button.on('pointerdown', () => {
        this.selectedCharacter = charKey;
        this.scene.restart();
      });
    });

    // Start button
    const startButton = this.add.text(width / 2, height - 100, 'START GAME', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Courier New',
      backgroundColor: '#ff6b35',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerover', () => {
      startButton.setScale(1.1);
    });

    startButton.on('pointerout', () => {
      startButton.setScale(1);
    });

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene', { character: this.selectedCharacter });
      this.scene.launch('UIScene');
    });

    // Instructions
    this.add.text(width / 2, height - 50, 'WASD to move | Auto-attack enemies', {
      fontSize: '16px',
      color: '#999999',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
  }
}
