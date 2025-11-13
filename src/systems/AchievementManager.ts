/**
 * AchievementManager - Handles achievement tracking and unlocks
 */

import { UserManager } from './UserManager';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  requirement: (stats: any) => boolean;
}

export class AchievementManager {
  private static readonly ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first_blood',
      name: '첫 번째 처치',
      description: '첫 번째 적을 처치하세요',
      icon: '🔪',
      requirement: (stats) => stats.totalKills >= 1,
    },
    {
      id: 'survivor',
      name: '생존자',
      description: '5분 동안 생존하세요',
      icon: '⏱️',
      requirement: (stats) => stats.longestSurvivalTime >= 300000,
    },
    {
      id: 'veteran',
      name: '베테랑',
      description: '10분 동안 생존하세요',
      icon: '🏆',
      requirement: (stats) => stats.longestSurvivalTime >= 600000,
    },
    {
      id: 'master_chef',
      name: '마스터 셰프',
      description: '30분 완주 (게임 클리어)',
      icon: '👨‍🍳',
      requirement: (stats) => stats.longestSurvivalTime >= 1800000,
    },
    {
      id: 'killer',
      name: '킬러',
      description: '100명의 적을 처치하세요',
      icon: '💀',
      requirement: (stats) => stats.totalKills >= 100,
    },
    {
      id: 'massacre',
      name: '대학살',
      description: '500명의 적을 처치하세요',
      icon: '☠️',
      requirement: (stats) => stats.totalKills >= 500,
    },
    {
      id: 'genocide',
      name: '절멸',
      description: '1000명의 적을 처치하세요',
      icon: '💥',
      requirement: (stats) => stats.totalKills >= 1000,
    },
    {
      id: 'leveling_up',
      name: '레벨업!',
      description: '레벨 10에 도달하세요',
      icon: '⬆️',
      requirement: (stats) => stats.highestLevel >= 10,
    },
    {
      id: 'power_overwhelming',
      name: '압도적 힘',
      description: '레벨 20에 도달하세요',
      icon: '💪',
      requirement: (stats) => stats.highestLevel >= 20,
    },
    {
      id: 'dedicated',
      name: '헌신적',
      description: '10회 플레이하세요',
      icon: '🎮',
      requirement: (stats) => stats.totalGamesPlayed >= 10,
    },
    {
      id: 'addicted',
      name: '중독',
      description: '50회 플레이하세요',
      icon: '🕹️',
      requirement: (stats) => stats.totalGamesPlayed >= 50,
    },
    {
      id: 'marathon',
      name: '마라톤',
      description: '누적 플레이 시간 1시간 달성',
      icon: '🏃',
      requirement: (stats) => stats.totalPlaytime >= 3600000,
    },
  ];

  /**
   * Check and unlock achievements based on current stats
   */
  static async checkAchievements(): Promise<string[]> {
    const user = await UserManager.getCurrentUser();
    if (!user) return [];

    const newAchievements: string[] = [];
    const stats = {
      totalKills: user.totalKills,
      longestSurvivalTime: user.highScores.longestSurvivalTime,
      highestLevel: user.highScores.highestLevel,
      totalGamesPlayed: user.totalGamesPlayed,
      totalPlaytime: user.totalPlaytime,
    };

    for (const achievement of this.ACHIEVEMENTS) {
      // Skip if already unlocked
      if (user.achievements.includes(achievement.id)) continue;

      // Check if requirement is met
      if (achievement.requirement(stats)) {
        await UserManager.addAchievement(achievement.id);
        newAchievements.push(achievement.id);
      }
    }

    return newAchievements;
  }

  /**
   * Get achievement by ID
   */
  static getAchievement(id: string): Achievement | undefined {
    return this.ACHIEVEMENTS.find((a) => a.id === id);
  }

  /**
   * Get all achievements
   */
  static getAllAchievements(): Achievement[] {
    return this.ACHIEVEMENTS;
  }

  /**
   * Get unlocked achievements for current user
   */
  static async getUnlockedAchievements(): Promise<Achievement[]> {
    const user = await UserManager.getCurrentUser();
    if (!user) return [];

    return this.ACHIEVEMENTS.filter((a) => user.achievements.includes(a.id));
  }

  /**
   * Get locked achievements for current user
   */
  static async getLockedAchievements(): Promise<Achievement[]> {
    const user = await UserManager.getCurrentUser();
    if (!user) return this.ACHIEVEMENTS;

    return this.ACHIEVEMENTS.filter((a) => !user.achievements.includes(a.id));
  }

  /**
   * Get achievement progress percentage
   */
  static async getProgress(): Promise<number> {
    const user = await UserManager.getCurrentUser();
    if (!user) return 0;

    return Math.floor((user.achievements.length / this.ACHIEVEMENTS.length) * 100);
  }

  /**
   * Check for character unlocks based on achievements
   */
  static async checkCharacterUnlocks(): Promise<void> {
    const user = await UserManager.getCurrentUser();
    if (!user) return;

    // Unlock characters based on achievements
    if (user.achievements.includes('survivor')) {
      await UserManager.unlockCharacter('lineChef');
    }
    if (user.achievements.includes('veteran')) {
      await UserManager.unlockCharacter('sousChef');
    }
    if (user.achievements.includes('master_chef')) {
      await UserManager.unlockCharacter('headChef');
    }
    if (user.achievements.includes('killer')) {
      await UserManager.unlockCharacter('fryChef');
    }
    if (user.achievements.includes('massacre')) {
      await UserManager.unlockCharacter('pastryChef');
    }
    if (user.achievements.includes('genocide')) {
      await UserManager.unlockCharacter('grillMaster');
    }
    if (user.achievements.includes('power_overwhelming')) {
      await UserManager.unlockCharacter('sushiChef');
    }
  }
}
