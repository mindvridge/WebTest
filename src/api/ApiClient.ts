/**
 * Local Storage API Client - No server required
 * All data is stored in browser localStorage
 */

export class ApiClient {
  private static readonly STORAGE_PREFIX = 'chef_game_';

  /**
   * Get storage key
   */
  private static getKey(key: string): string {
    return `${this.STORAGE_PREFIX}${key}`;
  }

  /**
   * Get current username
   */
  static getCurrentUsername(): string | null {
    return localStorage.getItem(this.getKey('current_user'));
  }

  /**
   * Set current username
   */
  private static setCurrentUsername(username: string): void {
    localStorage.setItem(this.getKey('current_user'), username);
  }

  /**
   * Clear current user
   */
  static clearCurrentUser(): void {
    localStorage.removeItem(this.getKey('current_user'));
  }

  /**
   * Register new user
   */
  static async register(username: string, password: string): Promise<{
    success: boolean;
    token?: string;
    username?: string;
    message?: string;
    error?: string;
  }> {
    // Check if user already exists
    const existingUser = localStorage.getItem(this.getKey(`user_${username}`));
    if (existingUser) {
      return { success: false, error: '이미 존재하는 사용자 이름입니다' };
    }

    // Create new user profile
    const newProfile = {
      username,
      password, // In production, this should be hashed
      createdAt: Date.now(),
      lastLogin: Date.now(),
      totalPlaytime: 0,
      totalKills: 0,
      totalGamesPlayed: 0,
      highScores: {
        longestSurvivalTime: 0,
        highestLevel: 1,
        mostKills: 0,
      },
      unlockedCharacters: ['rookie'],
      achievements: [],
      settings: {
        musicVolume: 0.7,
        sfxVolume: 0.8,
      },
    };

    localStorage.setItem(this.getKey(`user_${username}`), JSON.stringify(newProfile));
    this.setCurrentUsername(username);

    return {
      success: true,
      token: username, // Use username as token for simplicity
      username,
      message: '계정이 생성되었습니다!',
    };
  }

  /**
   * Login user
   */
  static async login(username: string, password: string): Promise<{
    success: boolean;
    token?: string;
    username?: string;
    message?: string;
    error?: string;
  }> {
    const userDataStr = localStorage.getItem(this.getKey(`user_${username}`));
    if (!userDataStr) {
      return { success: false, error: '사용자를 찾을 수 없습니다' };
    }

    const userData = JSON.parse(userDataStr);
    if (userData.password !== password) {
      return { success: false, error: '비밀번호가 일치하지 않습니다' };
    }

    // Update last login
    userData.lastLogin = Date.now();
    localStorage.setItem(this.getKey(`user_${username}`), JSON.stringify(userData));
    this.setCurrentUsername(username);

    return {
      success: true,
      token: username,
      username,
      message: '로그인 성공!',
    };
  }

  /**
   * Get user profile
   */
  static async getUserProfile(): Promise<{
    success: boolean;
    profile?: any;
    error?: string;
  }> {
    const username = this.getCurrentUsername();
    if (!username) {
      return { success: false, error: '로그인이 필요합니다' };
    }

    const userDataStr = localStorage.getItem(this.getKey(`user_${username}`));
    if (!userDataStr) {
      return { success: false, error: '프로필을 찾을 수 없습니다' };
    }

    return { success: true, profile: JSON.parse(userDataStr) };
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(updates: any): Promise<{
    success: boolean;
    profile?: any;
    error?: string;
  }> {
    const username = this.getCurrentUsername();
    if (!username) {
      return { success: false, error: '로그인이 필요합니다' };
    }

    const userDataStr = localStorage.getItem(this.getKey(`user_${username}`));
    if (!userDataStr) {
      return { success: false, error: '프로필을 찾을 수 없습니다' };
    }

    const userData = JSON.parse(userDataStr);

    // Handle special update types
    if (updates.unlockCharacter) {
      if (!userData.unlockedCharacters.includes(updates.unlockCharacter)) {
        userData.unlockedCharacters.push(updates.unlockCharacter);
      }
    } else if (updates.addAchievement) {
      if (!userData.achievements.includes(updates.addAchievement)) {
        userData.achievements.push(updates.addAchievement);
      }
    } else if (updates.longestSurvivalTime !== undefined) {
      // Update high scores if better
      if (updates.longestSurvivalTime > userData.highScores.longestSurvivalTime) {
        userData.highScores.longestSurvivalTime = updates.longestSurvivalTime;
      }
      if (updates.highestLevel > userData.highScores.highestLevel) {
        userData.highScores.highestLevel = updates.highestLevel;
      }
      if (updates.mostKills > userData.highScores.mostKills) {
        userData.highScores.mostKills = updates.mostKills;
      }
      if (updates.totalGamesPlayed) {
        userData.totalGamesPlayed += updates.totalGamesPlayed;
      }
    } else {
      // Regular updates
      Object.assign(userData, updates);
    }

    localStorage.setItem(this.getKey(`user_${username}`), JSON.stringify(userData));
    return { success: true, profile: userData };
  }

  /**
   * Save game
   */
  static async saveGame(saveData: any): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    const username = this.getCurrentUsername();
    if (!username) {
      return { success: false, error: '로그인이 필요합니다' };
    }

    const saveKey = this.getKey(`save_${username}`);
    const saveWithTimestamp = {
      ...saveData,
      savedAt: Date.now(),
    };

    localStorage.setItem(saveKey, JSON.stringify(saveWithTimestamp));
    return { success: true, message: '게임이 저장되었습니다' };
  }

  /**
   * Load game
   */
  static async loadGame(): Promise<{
    success: boolean;
    save?: any;
    error?: string;
  }> {
    const username = this.getCurrentUsername();
    if (!username) {
      return { success: false, error: '로그인이 필요합니다' };
    }

    const saveKey = this.getKey(`save_${username}`);
    const saveDataStr = localStorage.getItem(saveKey);

    if (!saveDataStr) {
      return { success: false, error: '저장된 게임이 없습니다' };
    }

    return { success: true, save: JSON.parse(saveDataStr) };
  }

  /**
   * Delete saved game
   */
  static async deleteSave(): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    const username = this.getCurrentUsername();
    if (!username) {
      return { success: false, error: '로그인이 필요합니다' };
    }

    const saveKey = this.getKey(`save_${username}`);
    localStorage.removeItem(saveKey);
    return { success: true, message: '저장된 게임이 삭제되었습니다' };
  }

  /**
   * Get leaderboard (local only - shows all users)
   */
  static async getLeaderboard(type: 'survival' | 'level' | 'kills' = 'survival', limit: number = 100): Promise<{
    success: boolean;
    leaderboard?: any[];
    error?: string;
  }> {
    const allUsers: any[] = [];

    // Get all user profiles from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.getKey('user_'))) {
        const userData = JSON.parse(localStorage.getItem(key)!);
        allUsers.push(userData);
      }
    }

    // Sort based on type
    let sorted = [];
    if (type === 'survival') {
      sorted = allUsers.sort((a, b) =>
        b.highScores.longestSurvivalTime - a.highScores.longestSurvivalTime
      );
    } else if (type === 'level') {
      sorted = allUsers.sort((a, b) =>
        b.highScores.highestLevel - a.highScores.highestLevel
      );
    } else if (type === 'kills') {
      sorted = allUsers.sort((a, b) =>
        b.highScores.mostKills - a.highScores.mostKills
      );
    }

    return {
      success: true,
      leaderboard: sorted.slice(0, limit).map(u => ({
        username: u.username,
        longestSurvivalTime: u.highScores.longestSurvivalTime,
        highestLevel: u.highScores.highestLevel,
        mostKills: u.highScores.mostKills,
      }))
    };
  }
}
