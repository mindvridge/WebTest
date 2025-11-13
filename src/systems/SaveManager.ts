/**
 * SaveManager - Handles game progress saving and loading
 * Stores game state using backend API
 */

import { ApiClient } from '../api/ApiClient';

export interface GameSaveData {
  savedAt: number;
  selectedCharacter: string;
  playerLevel: number;
  currentXP: number;
  requiredXP: number;
  killCount: number;
  gameTimer: number;
  playerHealth: number;
  playerMaxHealth: number;
  playerSpeed: number;
  playerDefense: number;
  playerDamageMultiplier: number;
  weapons: Array<{
    type: string;
    level: number;
  }>;
}

export class SaveManager {
  /**
   * Save current game state
   */
  static async saveGame(gameData: Omit<GameSaveData, 'savedAt'>): Promise<{ success: boolean; message: string }> {
    const result = await ApiClient.saveGame(gameData);

    if (result.success) {
      return { success: true, message: result.message || '게임이 저장되었습니다' };
    }

    return { success: false, message: result.error || '저장 실패' };
  }

  /**
   * Load saved game state
   */
  static async loadGame(): Promise<GameSaveData | null> {
    const result = await ApiClient.loadGame();

    if (result.success && result.save) {
      return result.save;
    }

    return null;
  }

  /**
   * Check if a save exists
   */
  static async hasSavedGame(): Promise<boolean> {
    const save = await this.loadGame();
    return save !== null;
  }

  /**
   * Delete saved game
   */
  static async deleteSave(): Promise<void> {
    await ApiClient.deleteSave();
  }

  /**
   * Get save info without loading full data
   */
  static async getSaveInfo(): Promise<{ exists: boolean; savedAt?: number; character?: string } | null> {
    const saveData = await this.loadGame();
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
