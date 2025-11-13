/**
 * UserManager - Handles user authentication and account management
 * Uses localStorage for persistence (no backend required)
 */

export interface UserProfile {
  username: string;
  passwordHash: string;
  createdAt: number;
  lastLogin: number;
  totalPlaytime: number; // in milliseconds
  totalKills: number;
  totalGamesPlayed: number;
  highScores: {
    longestSurvivalTime: number; // in milliseconds
    highestLevel: number;
    mostKills: number;
  };
  unlockedCharacters: string[]; // character IDs
  achievements: string[]; // achievement IDs
  settings: {
    musicVolume: number;
    sfxVolume: number;
  };
}

export class UserManager {
  private static readonly STORAGE_KEY = 'chefs_last_stand_users';
  private static readonly CURRENT_USER_KEY = 'chefs_last_stand_current_user';
  private static currentUser: UserProfile | null = null;

  /**
   * Simple hash function for password (NOT cryptographically secure - for demo only)
   * In production, use proper backend authentication
   */
  private static hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Get all users from localStorage
   */
  private static getAllUsers(): { [username: string]: UserProfile } {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Save all users to localStorage
   */
  private static saveAllUsers(users: { [username: string]: UserProfile }): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  /**
   * Register a new user
   */
  static register(username: string, password: string): { success: boolean; message: string } {
    // Validation
    if (!username || username.length < 3) {
      return { success: false, message: '사용자 이름은 최소 3자 이상이어야 합니다' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: '비밀번호는 최소 4자 이상이어야 합니다' };
    }

    const users = this.getAllUsers();

    // Check if user already exists
    if (users[username]) {
      return { success: false, message: '이미 존재하는 사용자 이름입니다' };
    }

    // Create new user profile
    const newUser: UserProfile = {
      username,
      passwordHash: this.hashPassword(password),
      createdAt: Date.now(),
      lastLogin: Date.now(),
      totalPlaytime: 0,
      totalKills: 0,
      totalGamesPlayed: 0,
      highScores: {
        longestSurvivalTime: 0,
        highestLevel: 0,
        mostKills: 0,
      },
      unlockedCharacters: ['rookie_cook'], // Start with rookie unlocked
      achievements: [],
      settings: {
        musicVolume: 0.7,
        sfxVolume: 0.8,
      },
    };

    users[username] = newUser;
    this.saveAllUsers(users);
    this.currentUser = newUser;
    localStorage.setItem(this.CURRENT_USER_KEY, username);

    return { success: true, message: '계정이 생성되었습니다!' };
  }

  /**
   * Login with username and password
   */
  static login(username: string, password: string): { success: boolean; message: string } {
    const users = this.getAllUsers();
    const user = users[username];

    if (!user) {
      return { success: false, message: '사용자를 찾을 수 없습니다' };
    }

    if (user.passwordHash !== this.hashPassword(password)) {
      return { success: false, message: '잘못된 비밀번호입니다' };
    }

    // Update last login
    user.lastLogin = Date.now();
    users[username] = user;
    this.saveAllUsers(users);

    this.currentUser = user;
    localStorage.setItem(this.CURRENT_USER_KEY, username);

    return { success: true, message: '로그인 성공!' };
  }

  /**
   * Logout current user
   */
  static logout(): void {
    this.currentUser = null;
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  /**
   * Get current logged-in user
   */
  static getCurrentUser(): UserProfile | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from localStorage
    const currentUsername = localStorage.getItem(this.CURRENT_USER_KEY);
    if (currentUsername) {
      const users = this.getAllUsers();
      this.currentUser = users[currentUsername] || null;
      return this.currentUser;
    }

    return null;
  }

  /**
   * Check if user is logged in
   */
  static isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Update user profile
   */
  static updateUserProfile(updates: Partial<UserProfile>): void {
    const user = this.getCurrentUser();
    if (!user) return;

    const users = this.getAllUsers();
    users[user.username] = { ...user, ...updates };
    this.saveAllUsers(users);
    this.currentUser = users[user.username];
  }

  /**
   * Update playtime statistics
   */
  static updatePlaytime(milliseconds: number): void {
    const user = this.getCurrentUser();
    if (!user) return;

    this.updateUserProfile({
      totalPlaytime: user.totalPlaytime + milliseconds,
    });
  }

  /**
   * Update kill statistics
   */
  static updateKills(kills: number): void {
    const user = this.getCurrentUser();
    if (!user) return;

    this.updateUserProfile({
      totalKills: user.totalKills + kills,
    });
  }

  /**
   * Update high scores if new record
   */
  static updateHighScores(survivalTime: number, level: number, kills: number): void {
    const user = this.getCurrentUser();
    if (!user) return;

    const newHighScores = { ...user.highScores };
    let updated = false;

    if (survivalTime > newHighScores.longestSurvivalTime) {
      newHighScores.longestSurvivalTime = survivalTime;
      updated = true;
    }
    if (level > newHighScores.highestLevel) {
      newHighScores.highestLevel = level;
      updated = true;
    }
    if (kills > newHighScores.mostKills) {
      newHighScores.mostKills = kills;
      updated = true;
    }

    if (updated) {
      this.updateUserProfile({
        highScores: newHighScores,
        totalGamesPlayed: user.totalGamesPlayed + 1,
      });
    }
  }

  /**
   * Unlock a character
   */
  static unlockCharacter(characterId: string): void {
    const user = this.getCurrentUser();
    if (!user) return;

    if (!user.unlockedCharacters.includes(characterId)) {
      this.updateUserProfile({
        unlockedCharacters: [...user.unlockedCharacters, characterId],
      });
    }
  }

  /**
   * Check if character is unlocked
   */
  static isCharacterUnlocked(characterId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.unlockedCharacters.includes(characterId);
  }

  /**
   * Add achievement
   */
  static addAchievement(achievementId: string): void {
    const user = this.getCurrentUser();
    if (!user) return;

    if (!user.achievements.includes(achievementId)) {
      this.updateUserProfile({
        achievements: [...user.achievements, achievementId],
      });
    }
  }

  /**
   * Update settings
   */
  static updateSettings(settings: Partial<UserProfile['settings']>): void {
    const user = this.getCurrentUser();
    if (!user) return;

    this.updateUserProfile({
      settings: { ...user.settings, ...settings },
    });
  }

  /**
   * Format time in MM:SS format
   */
  static formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
