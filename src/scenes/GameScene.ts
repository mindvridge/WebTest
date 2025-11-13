import Phaser from 'phaser';
import { CHARACTER_STATS, ENEMY_CONFIG, GAME_DURATION, XP_CONFIG } from '../config/GameConfig';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Weapon } from '../entities/Weapon';
import { XPGem } from '../entities/XPGem';
import { SaveManager, GameSaveData } from '../systems/SaveManager';
import { UserManager } from '../systems/UserManager';
import { AchievementManager } from '../systems/AchievementManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private weapons: Weapon[] = [];
  private xpGems!: Phaser.GameObjects.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;

  private playerLevel: number = 1;
  private currentXP: number = 0;
  private requiredXP: number = XP_CONFIG.levelUpBase;
  private killCount: number = 0;

  private enemySpawnTimer: number = 0;
  private gameTimer: number = 0;
  private isPaused: boolean = false;
  private autoSaveTimer: number = 0;
  private readonly autoSaveInterval: number = 30000; // 30 seconds

  private selectedCharacter!: string;
  private loadedFromSave: boolean = false;

  constructor() {
    super('GameScene');
  }

  init(data: { character?: string; loadSave?: boolean }) {
    // Check if loading from save
    if (data.loadSave) {
      const saveData = SaveManager.loadGame();
      if (saveData) {
        this.loadedFromSave = true;
        this.loadGameState(saveData);
        return;
      }
    }

    // New game
    this.selectedCharacter = data.character || 'rookie_cook';
    this.playerLevel = 1;
    this.currentXP = 0;
    this.requiredXP = XP_CONFIG.levelUpBase;
    this.killCount = 0;
    this.gameTimer = 0;
    this.loadedFromSave = false;
  }

  private loadGameState(saveData: GameSaveData) {
    this.selectedCharacter = saveData.selectedCharacter;
    this.playerLevel = saveData.playerLevel;
    this.currentXP = saveData.currentXP;
    this.requiredXP = saveData.requiredXP;
    this.killCount = saveData.killCount;
    this.gameTimer = saveData.gameTimer;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Create ground/background
    const bg = this.add.graphics();
    bg.fillStyle(0x4a4a4a, 1);
    bg.fillRect(0, 0, width * 3, height * 3);
    bg.setScrollFactor(0.5);

    // Create grid pattern for restaurant floor
    bg.lineStyle(2, 0x3a3a3a, 0.5);
    for (let x = 0; x < width * 3; x += 64) {
      bg.lineBetween(x, 0, x, height * 3);
    }
    for (let y = 0; y < height * 3; y += 64) {
      bg.lineBetween(0, y, width * 3, y);
    }

    // Initialize player
    const charStats = CHARACTER_STATS[this.selectedCharacter as keyof typeof CHARACTER_STATS];
    this.player = new Player(this, width / 2, height / 2, charStats);
    this.add.existing(this.player);
    this.physics.add.existing(this.player);

    // Restore player state if loading from save
    if (this.loadedFromSave) {
      const saveData = SaveManager.loadGame();
      if (saveData) {
        this.player.health = saveData.playerHealth;
        this.player.maxHealth = saveData.playerMaxHealth;
        this.player.speed = saveData.playerSpeed;
        this.player.defense = saveData.playerDefense;
        this.player.damageMultiplier = saveData.playerDamageMultiplier;
      }
    }

    // Camera follows player
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, width * 3, height * 3);

    // Initialize groups
    this.enemies = this.add.group({
      classType: Enemy,
      runChildUpdate: true
    });

    this.xpGems = this.add.group({
      classType: XPGem,
      runChildUpdate: true
    });

    // Initialize controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // Initialize first weapon
    this.addWeapon(charStats.startWeapon);

    // Setup collisions
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision as any, undefined, this);
    this.physics.add.overlap(this.player, this.xpGems, this.handleXPCollection as any, undefined, this);

    // Initialize UI
    const uiScene = this.scene.get('UIScene');
    uiScene.events.emit('updateHealth', this.player.health, this.player.maxHealth);
    uiScene.events.emit('updateXP', this.currentXP, this.requiredXP);
    uiScene.events.emit('updateLevel', this.playerLevel);
    uiScene.events.emit('updateKills', this.killCount);
  }

  update(time: number, delta: number) {
    if (this.isPaused) return;

    // Update game timer
    this.gameTimer += delta;
    const seconds = Math.floor(this.gameTimer / 1000);
    const uiScene = this.scene.get('UIScene');
    uiScene.events.emit('updateTimer', seconds);

    // Check win condition
    if (this.gameTimer >= GAME_DURATION) {
      this.gameWin();
      return;
    }

    // Auto-save progress
    this.autoSaveTimer += delta;
    if (this.autoSaveTimer >= this.autoSaveInterval) {
      this.autoSave();
      this.autoSaveTimer = 0;
    }

    // Player movement
    this.handlePlayerMovement();

    // Spawn enemies
    this.enemySpawnTimer += delta;
    if (this.enemySpawnTimer >= ENEMY_CONFIG.spawnInterval) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // Update weapons
    this.weapons.forEach(weapon => weapon.update(time, delta));

    // Check for game over
    if (this.player.health <= 0) {
      this.gameOver();
    }
  }

  private autoSave() {
    const saveData: GameSaveData = {
      username: UserManager.getCurrentUser()?.username || '',
      savedAt: Date.now(),
      selectedCharacter: this.selectedCharacter,
      playerLevel: this.playerLevel,
      currentXP: this.currentXP,
      requiredXP: this.requiredXP,
      killCount: this.killCount,
      gameTimer: this.gameTimer,
      playerHealth: this.player.health,
      playerMaxHealth: this.player.maxHealth,
      playerSpeed: this.player.speed,
      playerDefense: this.player.defense,
      playerDamageMultiplier: this.player.damageMultiplier,
      weapons: this.weapons.map(w => ({ type: w.type, level: 1 })),
    };

    SaveManager.saveGame(saveData);
  }

  private handlePlayerMovement() {
    const speed = this.player.speed;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = speed;
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.player.setVelocity(velocityX, velocityY);
  }

  private spawnEnemy() {
    if (this.enemies.getLength() >= ENEMY_CONFIG.maxEnemies) return;

    const spawnDistance = ENEMY_CONFIG.spawnDistance;

    // Spawn at random position outside camera view
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const x = this.player.x + Math.cos(angle) * spawnDistance;
    const y = this.player.y + Math.sin(angle) * spawnDistance;

    // Determine enemy type based on game time
    let enemyType = 'normal';
    const minutes = this.gameTimer / 60000;

    if (minutes > 20) {
      const rand = Math.random();
      if (rand < 0.2) enemyType = 'foodCritic';
      else if (rand < 0.4) enemyType = 'karen';
      else if (rand < 0.6) enemyType = 'hungry';
      else if (rand < 0.8) enemyType = 'influencer';
    } else if (minutes > 10) {
      const rand = Math.random();
      if (rand < 0.3) enemyType = 'karen';
      else if (rand < 0.5) enemyType = 'hungry';
      else if (rand < 0.7) enemyType = 'influencer';
    } else if (minutes > 5) {
      const rand = Math.random();
      if (rand < 0.4) enemyType = 'hungry';
      else if (rand < 0.7) enemyType = 'influencer';
    }

    const enemy = new Enemy(this, x, y, enemyType, this.player);
    this.enemies.add(enemy);
  }

  private handlePlayerEnemyCollision(_player: Player, enemy: Enemy) {
    const damage = enemy.damage - this.player.defense;
    if (damage > 0) {
      this.player.takeDamage(damage);
      const uiScene = this.scene.get('UIScene');
      uiScene.events.emit('updateHealth', this.player.health, this.player.maxHealth);
    }
  }

  private handleXPCollection(_player: Player, xpGem: XPGem) {
    this.currentXP += xpGem.xpValue;
    xpGem.collect();

    // Check for level up
    if (this.currentXP >= this.requiredXP) {
      this.levelUp();
    }

    const uiScene = this.scene.get('UIScene');
    uiScene.events.emit('updateXP', this.currentXP, this.requiredXP);
  }

  private levelUp() {
    this.playerLevel++;
    this.currentXP -= this.requiredXP;
    this.requiredXP = Math.floor(XP_CONFIG.levelUpBase * Math.pow(XP_CONFIG.levelUpMultiplier, this.playerLevel - 1));

    const uiScene = this.scene.get('UIScene') as any;
    uiScene.events.emit('updateLevel', this.playerLevel);

    // Show level up screen
    this.isPaused = true;
    const weaponChoices = this.generateWeaponChoices();
    uiScene.showLevelUp(weaponChoices, (index: number) => {
      this.applyWeaponChoice(weaponChoices[index]);
      this.isPaused = false;
    });
  }

  private generateWeaponChoices() {
    const choices = [
      { name: 'Hamburger Station+', description: '+10 Damage', type: 'hamburger', upgrade: 'damage' },
      { name: 'Pizza Cutter', description: 'Spinning melee attack', type: 'pizzaCutter', upgrade: 'new' },
      { name: 'Coffee Machine', description: 'Rapid fire shots', type: 'coffeeMachine', upgrade: 'new' },
      { name: 'Movement Speed+', description: '+20% Speed', type: 'speed', upgrade: 'stat' },
      { name: 'Max HP+', description: '+20 Max Health', type: 'health', upgrade: 'stat' },
      { name: 'Defense+', description: '+5 Defense', type: 'defense', upgrade: 'stat' }
    ];

    // Shuffle and return 3 random choices
    return Phaser.Utils.Array.Shuffle(choices).slice(0, 3);
  }

  private applyWeaponChoice(choice: any) {
    if (choice.upgrade === 'new') {
      this.addWeapon(choice.type);
    } else if (choice.upgrade === 'damage') {
      const weapon = this.weapons.find(w => w.type === choice.type);
      if (weapon) {
        weapon.upgradeDamage(10);
      }
    } else if (choice.upgrade === 'stat') {
      if (choice.type === 'speed') {
        this.player.speed *= 1.2;
      } else if (choice.type === 'health') {
        this.player.maxHealth += 20;
        this.player.health = Math.min(this.player.health + 20, this.player.maxHealth);
      } else if (choice.type === 'defense') {
        this.player.defense += 5;
      }
    }
  }

  private addWeapon(type: string) {
    const weapon = new Weapon(this, this.player, type, this.enemies);
    this.weapons.push(weapon);
  }

  public enemyKilled(enemy: Enemy) {
    this.killCount++;
    const uiScene = this.scene.get('UIScene');
    uiScene.events.emit('updateKills', this.killCount);

    // Drop XP gem
    const xpGem = new XPGem(this, enemy.x, enemy.y, enemy.xpValue);
    this.xpGems.add(xpGem);
  }

  private gameOver() {
    this.isPaused = true;
    const { width, height } = this.cameras.main;

    // Update user statistics
    this.updateUserStatistics(false);

    // Delete save (game ended)
    SaveManager.deleteSave();

    this.add.text(width / 2, height / 2, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Courier New',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(width / 2, height / 2 + 80, `생존 시간: ${UserManager.formatTime(this.gameTimer)}\n처치 수: ${this.killCount}\n레벨: ${this.playerLevel}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Courier New',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 },
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);

    // Check for new achievements
    const newAchievements = AchievementManager.checkAchievements();
    if (newAchievements.length > 0) {
      this.add.text(width / 2, height / 2 + 180, `새로운 업적 달성: ${newAchievements.length}개!`, {
        fontSize: '18px',
        color: '#ffdd00',
        fontFamily: 'Courier New',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5).setScrollFactor(0);
    }

    this.time.delayedCall(3000, () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
  }

  private gameWin() {
    this.isPaused = true;
    const { width, height } = this.cameras.main;

    // Update user statistics
    this.updateUserStatistics(true);

    // Delete save (game ended)
    SaveManager.deleteSave();

    this.add.text(width / 2, height / 2, 'SHIFT COMPLETE!', {
      fontSize: '64px',
      color: '#00ff00',
      fontFamily: 'Courier New',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.text(width / 2, height / 2 + 80, `생존 성공!\n처치 수: ${this.killCount}\n레벨: ${this.playerLevel}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Courier New',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 },
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0);

    // Check for new achievements
    const newAchievements = AchievementManager.checkAchievements();
    if (newAchievements.length > 0) {
      this.add.text(width / 2, height / 2 + 180, `새로운 업적 달성: ${newAchievements.length}개!`, {
        fontSize: '18px',
        color: '#ffdd00',
        fontFamily: 'Courier New',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5).setScrollFactor(0);
    }

    this.time.delayedCall(5000, () => {
      this.scene.stop('UIScene');
      this.scene.start('MenuScene');
    });
  }

  private updateUserStatistics(_won: boolean) {
    // Update playtime
    UserManager.updatePlaytime(this.gameTimer);

    // Update kills
    UserManager.updateKills(this.killCount);

    // Update high scores
    UserManager.updateHighScores(this.gameTimer, this.playerLevel, this.killCount);

    // Check for character unlocks
    AchievementManager.checkCharacterUnlocks();
  }
}
