/**
 * UserManager - Handles user authentication and account management
 * Uses backend API for persistence
 */

import { ApiClient } from '../api/ApiClient';

export interface UserProfile {
  username: string;
  createdAt: number;
  lastLogin: number;
  totalPlaytime: number;
  totalKills: number;
  totalGamesPlayed: number;
  highScores: {
    longestSurvivalTime: number;
    highestLevel: number;
    mostKills: number;
  };
  unlockedCharacters: string[];
  achievements: string[];
  settings: {
    musicVolume: number;
    sfxVolume: number;
  };
}

export class UserManager {
  private static currentUser: UserProfile | null = null;

  /**
   * Auto-login as guest user (for local play without registration)
   */
  static async autoLoginAsGuest(): Promise<void> {
    const guestUsername = 'guest_player';
    const guestPassword = 'guest123';

    // Check if guest user already exists
    const existingUser = await ApiClient.getUserProfile();
    if (existingUser.success && existingUser.profile) {
      // Already logged in
      this.currentUser = existingUser.profile;
      return;
    }

    // Check if current user is set in localStorage
    const currentUsername = ApiClient.getCurrentUsername();
    if (currentUsername) {
      // Try to load existing user profile
      await this.loadUserProfile();
      if (this.currentUser) {
        return;
      }
    }

    // Create or login guest user
    const result = await ApiClient.login(guestUsername, guestPassword);
    if (!result.success) {
      // Guest doesn't exist, create it
      await ApiClient.register(guestUsername, guestPassword);
    }
    await this.loadUserProfile();
  }

  /**
   * Register a new user
   */
  static async register(username: string, password: string): Promise<{ success: boolean; message: string }> {
    // Validation
    if (!username || username.length < 3) {
      return { success: false, message: '사용자 이름은 최소 3자 이상이어야 합니다' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: '비밀번호는 최소 4자 이상이어야 합니다' };
    }

    const result = await ApiClient.register(username, password);

    if (result.success) {
      // Load user profile after registration
      await this.loadUserProfile();
      return { success: true, message: result.message || '계정이 생성되었습니다!' };
    }

    return { success: false, message: result.error || '계정 생성 실패' };
  }

  /**
   * Login with username and password
   */
  static async login(username: string, password: string): Promise<{ success: boolean; message: string }> {
    const result = await ApiClient.login(username, password);

    if (result.success) {
      // Load user profile after login
      await this.loadUserProfile();
      return { success: true, message: result.message || '로그인 성공!' };
    }

    return { success: false, message: result.error || '로그인 실패' };
  }

  /**
   * Logout current user
   */
  static logout(): void {
    this.currentUser = null;
    ApiClient.clearCurrentUser();
  }

  /**
   * Load user profile from backend
   */
  private static async loadUserProfile(): Promise<void> {
    const result = await ApiClient.getUserProfile();
    if (result.success && result.profile) {
      this.currentUser = result.profile;
    }
  }

  /**
   * Get current logged-in user
   */
  static async getCurrentUser(): Promise<UserProfile | null> {
    // If we already have the user cached, return it
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to load from localStorage using stored username
    const username = ApiClient.getCurrentUsername();
    if (username) {
      await this.loadUserProfile();
      return this.currentUser;
    }

    return null;
  }

  /**
   * Get current user synchronously (cached version)
   */
  static getCurrentUserSync(): UserProfile | null {
    return this.currentUser;
  }

  /**
   * Check if user is logged in
   */
  static isLoggedIn(): boolean {
    return ApiClient.getCurrentUsername() !== null;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    const result = await ApiClient.updateUserProfile(updates);
    if (result.success && result.profile) {
      this.currentUser = result.profile;
    }
  }

  /**
   * Update playtime statistics
   */
  static async updatePlaytime(milliseconds: number): Promise<void> {
    await this.updateUserProfile({ totalPlaytime: milliseconds });
  }

  /**
   * Update kill statistics
   */
  static async updateKills(kills: number): Promise<void> {
    await this.updateUserProfile({ totalKills: kills });
  }

  /**
   * Update high scores if new record
   */
  static async updateHighScores(survivalTime: number, level: number, kills: number): Promise<void> {
    await ApiClient.updateUserProfile({
      longestSurvivalTime: survivalTime,
      highestLevel: level,
      mostKills: kills,
      totalGamesPlayed: 1,
    });
    // Reload profile to get updated data
    await this.loadUserProfile();
  }

  /**
   * Unlock a character
   */
  static async unlockCharacter(characterId: string): Promise<void> {
    const user = this.currentUser;
    if (!user) return;

    if (!user.unlockedCharacters.includes(characterId)) {
      await ApiClient.updateUserProfile({ unlockCharacter: characterId });
      await this.loadUserProfile();
    }
  }

  /**
   * Check if character is unlocked
   */
  static isCharacterUnlocked(characterId: string): boolean {
    const user = this.currentUser;
    if (!user) return false;
    return user.unlockedCharacters.includes(characterId);
  }

  /**
   * Add achievement
   */
  static async addAchievement(achievementId: string): Promise<void> {
    const user = this.currentUser;
    if (!user) return;

    if (!user.achievements.includes(achievementId)) {
      await ApiClient.updateUserProfile({ addAchievement: achievementId });
      await this.loadUserProfile();
    }
  }

  /**
   * Update settings
   */
  static async updateSettings(settings: Partial<UserProfile['settings']>): Promise<void> {
    await this.updateUserProfile({ settings } as any);
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
