/**
 * GET/PUT /api/user/profile
 * Get or update user profile
 */

import { Env, verifyToken, getUserProfile, parseBody, getAuthToken, errorResponse, successResponse } from '../../utils';

/**
 * GET /api/user/profile
 * Get current user's profile
 */
export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Verify authentication
  const token = getAuthToken(request);
  const userId = await verifyToken(env, token);

  if (!userId) {
    return errorResponse('인증이 필요합니다', 401);
  }

  // Get user profile
  const profile = await getUserProfile(env, userId);
  if (!profile) {
    return errorResponse('사용자를 찾을 수 없습니다', 404);
  }

  return successResponse({ profile });
}

interface UpdateProfileRequest {
  totalPlaytime?: number;
  totalKills?: number;
  totalGamesPlayed?: number;
  longestSurvivalTime?: number;
  highestLevel?: number;
  mostKills?: number;
  musicVolume?: number;
  sfxVolume?: number;
  unlockCharacter?: string;
  addAchievement?: string;
}

/**
 * PUT /api/user/profile
 * Update user profile (stats, settings, unlocks, achievements)
 */
export async function onRequestPut(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Verify authentication
  const token = getAuthToken(request);
  const userId = await verifyToken(env, token);

  if (!userId) {
    return errorResponse('인증이 필요합니다', 401);
  }

  // Parse request body
  const body = await parseBody<UpdateProfileRequest>(request);
  if (!body) {
    return errorResponse('Invalid request body');
  }

  try {
    // Build update query for users table
    const updates: string[] = [];
    const values: any[] = [];

    if (body.totalPlaytime !== undefined) {
      updates.push('total_playtime = total_playtime + ?');
      values.push(body.totalPlaytime);
    }
    if (body.totalKills !== undefined) {
      updates.push('total_kills = total_kills + ?');
      values.push(body.totalKills);
    }
    if (body.totalGamesPlayed !== undefined) {
      updates.push('total_games_played = total_games_played + ?');
      values.push(body.totalGamesPlayed);
    }
    if (body.longestSurvivalTime !== undefined) {
      updates.push('longest_survival_time = MAX(longest_survival_time, ?)');
      values.push(body.longestSurvivalTime);
    }
    if (body.highestLevel !== undefined) {
      updates.push('highest_level = MAX(highest_level, ?)');
      values.push(body.highestLevel);
    }
    if (body.mostKills !== undefined) {
      updates.push('most_kills = MAX(most_kills, ?)');
      values.push(body.mostKills);
    }
    if (body.musicVolume !== undefined) {
      updates.push('music_volume = ?');
      values.push(body.musicVolume);
    }
    if (body.sfxVolume !== undefined) {
      updates.push('sfx_volume = ?');
      values.push(body.sfxVolume);
    }

    // Update users table if there are any updates
    if (updates.length > 0) {
      values.push(userId);
      await env.DB.prepare(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...values).run();
    }

    // Unlock character if requested
    if (body.unlockCharacter) {
      await env.DB.prepare(
        'INSERT OR IGNORE INTO unlocked_characters (user_id, character_id, unlocked_at) VALUES (?, ?, ?)'
      ).bind(userId, body.unlockCharacter, Date.now()).run();
    }

    // Add achievement if requested
    if (body.addAchievement) {
      await env.DB.prepare(
        'INSERT OR IGNORE INTO achievements (user_id, achievement_id, achieved_at) VALUES (?, ?, ?)'
      ).bind(userId, body.addAchievement, Date.now()).run();
    }

    // Get updated profile
    const profile = await getUserProfile(env, userId);

    return successResponse({
      message: '프로필이 업데이트되었습니다',
      profile,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return errorResponse('프로필 업데이트 중 오류가 발생했습니다', 500);
  }
}
