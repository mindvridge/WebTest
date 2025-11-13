/**
 * SaveManager - Handles game progress saving and loading
 * Stores game state per user account
 */

import { UserManager } from './UserManager';

export interface GameSaveData {
  username: string;
  savedAt: number;

  // Game progress
  selectedCharacter: string;
  playerLevel: number;
  currentXP: number;
  requiredXP: number;
  killCount: number;
  gameTimer: number;

  // Player stats
  playerHealth: number;
  playerMaxHealth: number;
  playerSpeed: number;
  playerDefense: number;
  playerDamageMultiplier: number;

  // Weapons
  weapons: Array<{
    type: string;
    level: number;
  }>;
}

export class SaveManager {
  private static readonly SAVE_KEY_PREFIX = 'chefs_last_stand_save_';

  /**
   * Save current game state
   */
  static saveGame(gameData: GameSaveData): { success: boolean; message: string } {
    const user = UserManager.getCurrentUser();
    if (!user) {
      return { success: false, message: '로그인이 필요합니다' };
    }

    const saveKey = this.SAVE_KEY_PREFIX + user.username;
    const saveData: GameSaveData = {
      ...gameData,
      username: user.username,
      savedAt: Date.now(),
    };

    try {
      localStorage.setItem(saveKey, JSON.stringify(saveData));
      return { success: true, message: '게임이 저장되었습니다' };
    } catch (error) {
      return { success: false, message: '저장 실패: 용량 부족' };
    }
  }

  /**
   * Load saved game state
   */
  static loadGame(): GameSaveData | null {
    const user = UserManager.getCurrentUser();
    if (!user) return null;

    const saveKey = this.SAVE_KEY_PREFIX + user.username;
    const saveDataStr = localStorage.getItem(saveKey);

    if (!saveDataStr) return null;

    try {
      const saveData: GameSaveData = JSON.parse(saveDataStr);
      // Verify the save belongs to current user
      if (saveData.username !== user.username) return null;
      return saveData;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if a save exists for current user
   */
  static hasSavedGame(): boolean {
    return this.loadGame() !== null;
  }

  /**
   * Delete saved game
   */
  static deleteSave(): void {
    const user = UserManager.getCurrentUser();
    if (!user) return;

    const saveKey = this.SAVE_KEY_PREFIX + user.username;
    localStorage.removeItem(saveKey);
  }

  /**
   * Get save info without loading full data
   */
  static getSaveInfo(): { exists: boolean; savedAt?: number; character?: string } | null {
    const saveData = this.loadGame();
    if (!saveData) {
      return { exists: false };
    }

    return {
      exists: true,
      savedAt: saveData.savedAt,
      character: saveData.selectedCharacter,
    };
  }

  /**
   * Format save time as relative time
   */
  static formatSaveTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return `방금 전`;
  }
}
