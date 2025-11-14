import Phaser from 'phaser';
import { CHARACTER_STATS } from '../config/GameConfig';
import { UserManager } from '../systems/UserManager';
import { SaveManager } from '../systems/SaveManager';
import { AchievementManager } from '../systems/AchievementManager';

export class MenuScene extends Phaser.Scene {
  private selectedCharacter: string = 'rookie';

  constructor() {
    super('MenuScene');
  }

  async create() {
    const { width, height } = this.cameras.main;

    // Auto-login as guest for local play
    if (!UserManager.isLoggedIn()) {
      await UserManager.autoLoginAsGuest();
    }

    let user = await UserManager.getCurrentUser();
    if (!user) {
      // Fallback: create guest user if still not logged in
      await UserManager.autoLoginAsGuest();
      user = await UserManager.getCurrentUser();
      if (!user) {
        console.error('Failed to create guest user');
        return;
      }
    }

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a2a, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 60, "CHEF'S LAST STAND", {
      fontSize: '48px',
      color: '#ff6b35',
      fontFamily: 'Courier New',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // User info panel (top right)
    const userInfoText = [
      `${user.username}`,
      `최고 기록: ${UserManager.formatTime(user.highScores.longestSurvivalTime)}`,
      `최고 레벨: ${user.highScores.highestLevel}`,
      `총 처치: ${user.totalKills}`,
      `업적: ${user.achievements.length}/${AchievementManager.getAllAchievements().length}`,
    ].join('\n');

    this.add.text(width - 20, 20, userInfoText, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Courier New',
      backgroundColor: '#1a1a1a',
      padding: { x: 10, y: 8 },
      align: 'right'
    }).setOrigin(1, 0);

    // Logout button
    const logoutButton = this.add.text(20, 20, '로그아웃', {
      fontSize: '14px',
      color: '#ff6666',
      fontFamily: 'Courier New',
      backgroundColor: '#1a1a1a',
      padding: { x: 10, y: 5 }
    }).setOrigin(0).setInteractive();

    logoutButton.on('pointerover', () => {
      logoutButton.setBackgroundColor('#333333');
    });

    logoutButton.on('pointerout', () => {
      logoutButton.setBackgroundColor('#1a1a1a');
    });

    logoutButton.on('pointerdown', () => {
      UserManager.logout();
      this.scene.start('LoginScene');
    });

    // Continue button (if save exists)
    let yOffset = 140;
    const saveInfo = await SaveManager.getSaveInfo();
    if (saveInfo?.exists) {
      const continueButton = this.add.text(width / 2, yOffset, '계속하기', {
        fontSize: '28px',
        color: '#ffffff',
        fontFamily: 'Courier New',
        backgroundColor: '#00aa00',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive();

      continueButton.on('pointerover', () => {
        continueButton.setScale(1.1);
      });

      continueButton.on('pointerout', () => {
        continueButton.setScale(1);
      });

      continueButton.on('pointerdown', () => {
        this.scene.start('GameScene', { loadSave: true });
        this.scene.launch('UIScene');
      });

      this.add.text(width / 2, yOffset + 40, `저장된 시간: ${SaveManager.formatSaveTime(saveInfo.savedAt!)}`, {
        fontSize: '12px',
        color: '#999999',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);

      yOffset += 100;
    }

    // Character selection
    this.add.text(width / 2, yOffset, '캐릭터 선택:', {
      fontSize: '24px',
      color: '#ffcc00',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    yOffset += 40;

    // Get unlocked characters only
    const allCharacters = Object.keys(CHARACTER_STATS);
    const unlockedCharacters = allCharacters.filter(charKey =>
      UserManager.isCharacterUnlocked(charKey)
    );

    // Ensure at least rookie_cook is unlocked
    if (unlockedCharacters.length === 0) {
      unlockedCharacters.push('rookie_cook');
    }

    const buttonStartY = yOffset;
    const buttonSpacing = 42;

    unlockedCharacters.forEach((charKey, index) => {
      const char = CHARACTER_STATS[charKey as keyof typeof CHARACTER_STATS];
      const isSelected = charKey === this.selectedCharacter;

      const button = this.add.text(width / 2, buttonStartY + index * buttonSpacing,
        `${char.name} - HP: ${char.health} | Speed: ${char.speed}`, {
        fontSize: '16px',
        color: isSelected ? '#00ff00' : '#ffffff',
        fontFamily: 'Courier New',
        backgroundColor: isSelected ? '#333333' : '#1a1a1a',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5).setInteractive();

      button.on('pointerover', () => {
        button.setColor('#ffcc00');
      });

      button.on('pointerout', () => {
        button.setColor(isSelected ? '#00ff00' : '#ffffff');
      });

      button.on('pointerdown', () => {
        this.selectedCharacter = charKey;
        this.scene.restart();
      });
    });

    // Show locked characters count
    const lockedCount = allCharacters.length - unlockedCharacters.length;
    if (lockedCount > 0) {
      this.add.text(width / 2, buttonStartY + unlockedCharacters.length * buttonSpacing,
        `🔒 잠긴 캐릭터: ${lockedCount}개 (업적으로 해제)`, {
        fontSize: '14px',
        color: '#777777',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);
    }

    // Start button
    const startButton = this.add.text(width / 2, height - 80, '새 게임 시작', {
      fontSize: '28px',
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

    startButton.on('pointerdown', async () => {
      // Confirm if there's a saved game
      if (saveInfo?.exists) {
        const confirmDelete = confirm('저장된 게임이 삭제됩니다. 계속하시겠습니까?');
        if (!confirmDelete) return;
        await SaveManager.deleteSave();
      }

      this.scene.start('GameScene', { character: this.selectedCharacter });
      this.scene.launch('UIScene');
    });

    // Instructions
    this.add.text(width / 2, height - 30, 'WASD 이동 | 자동 공격', {
      fontSize: '14px',
      color: '#999999',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Achievements button
    const achievementsButton = this.add.text(20, height - 40, `업적 보기 (${user.achievements.length}/${AchievementManager.getAllAchievements().length})`, {
      fontSize: '14px',
      color: '#ffdd00',
      fontFamily: 'Courier New',
      backgroundColor: '#1a1a1a',
      padding: { x: 10, y: 5 }
    }).setOrigin(0).setInteractive();

    achievementsButton.on('pointerover', () => {
      achievementsButton.setBackgroundColor('#333333');
    });

    achievementsButton.on('pointerout', () => {
      achievementsButton.setBackgroundColor('#1a1a1a');
    });

    achievementsButton.on('pointerdown', () => {
      this.showAchievements();
    });
  }

  private async showAchievements() {
    const { width, height } = this.cameras.main;

    // Create overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.9);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    overlay.setScrollFactor(0);
    overlay.setDepth(1000);

    // Title
    const title = this.add.text(width / 2, 80, '업적', {
      fontSize: '32px',
      color: '#ffdd00',
      fontFamily: 'Courier New',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1001);

    const allAchievements = AchievementManager.getAllAchievements();
    const user = await UserManager.getCurrentUser();
    if (!user) return;

    let yPos = 140;
    const achievementTexts: Phaser.GameObjects.Text[] = [];

    allAchievements.forEach((achievement) => {
      const isUnlocked = user.achievements.includes(achievement.id);
      const color = isUnlocked ? '#00ff00' : '#666666';
      const icon = isUnlocked ? achievement.icon : '🔒';

      const text = this.add.text(width / 2, yPos,
        `${icon} ${achievement.name} - ${achievement.description}`, {
        fontSize: '14px',
        color: color,
        fontFamily: 'Courier New',
        backgroundColor: '#1a1a1a',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5).setDepth(1001);

      achievementTexts.push(text);
      yPos += 30;
    });

    // Close button
    const closeButton = this.add.text(width / 2, height - 60, '닫기', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Courier New',
      backgroundColor: '#ff6b35',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive().setDepth(1001);

    closeButton.on('pointerover', () => {
      closeButton.setScale(1.1);
    });

    closeButton.on('pointerout', () => {
      closeButton.setScale(1);
    });

    closeButton.on('pointerdown', () => {
      overlay.destroy();
      title.destroy();
      achievementTexts.forEach(t => t.destroy());
      closeButton.destroy();
    });
  }
}
