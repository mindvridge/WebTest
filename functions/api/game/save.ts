/**
 * GET/POST/DELETE /api/game/save
 * Save, load, or delete game progress
 */

import { Env, verifyToken, parseBody, getAuthToken, errorResponse, successResponse } from '../../utils';

interface SaveGameRequest {
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

/**
 * GET /api/game/save
 * Load saved game
 */
export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Verify authentication
  const token = getAuthToken(request);
  const userId = await verifyToken(env, token);

  if (!userId) {
    return errorResponse('인증이 필요합니다', 401);
  }

  // Get latest save
  const save = await env.DB.prepare(
    'SELECT * FROM game_saves WHERE user_id = ? ORDER BY saved_at DESC LIMIT 1'
  ).bind(userId).first();

  if (!save) {
    return successResponse({ save: null });
  }

  // Parse weapons JSON
  const saveData = {
    savedAt: save.saved_at,
    selectedCharacter: save.selected_character,
    playerLevel: save.player_level,
    currentXP: save.current_xp,
    requiredXP: save.required_xp,
    killCount: save.kill_count,
    gameTimer: save.game_timer,
    playerHealth: save.player_health,
    playerMaxHealth: save.player_max_health,
    playerSpeed: save.player_speed,
    playerDefense: save.player_defense,
    playerDamageMultiplier: save.player_damage_multiplier,
    weapons: JSON.parse(save.weapons as string),
  };

  return successResponse({ save: saveData });
}

/**
 * POST /api/game/save
 * Save game progress
 */
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Verify authentication
  const token = getAuthToken(request);
  const userId = await verifyToken(env, token);

  if (!userId) {
    return errorResponse('인증이 필요합니다', 401);
  }

  // Parse request body
  const body = await parseBody<SaveGameRequest>(request);
  if (!body) {
    return errorResponse('Invalid request body');
  }

  try {
    const now = Date.now();

    // Delete old saves (keep only one save per user)
    await env.DB.prepare(
      'DELETE FROM game_saves WHERE user_id = ?'
    ).bind(userId).run();

    // Create new save
    await env.DB.prepare(
      `INSERT INTO game_saves (
        user_id, saved_at, selected_character, player_level,
        current_xp, required_xp, kill_count, game_timer,
        player_health, player_max_health, player_speed,
        player_defense, player_damage_multiplier, weapons
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      userId,
      now,
      body.selectedCharacter,
      body.playerLevel,
      body.currentXP,
      body.requiredXP,
      body.killCount,
      body.gameTimer,
      body.playerHealth,
      body.playerMaxHealth,
      body.playerSpeed,
      body.playerDefense,
      body.playerDamageMultiplier,
      JSON.stringify(body.weapons)
    ).run();

    return successResponse({
      message: '게임이 저장되었습니다',
      savedAt: now,
    });
  } catch (error: any) {
    console.error('Save game error:', error);
    return errorResponse('게임 저장 중 오류가 발생했습니다', 500);
  }
}

/**
 * DELETE /api/game/save
 * Delete saved game
 */
export async function onRequestDelete(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Verify authentication
  const token = getAuthToken(request);
  const userId = await verifyToken(env, token);

  if (!userId) {
    return errorResponse('인증이 필요합니다', 401);
  }

  try {
    await env.DB.prepare(
      'DELETE FROM game_saves WHERE user_id = ?'
    ).bind(userId).run();

    return successResponse({
      message: '저장된 게임이 삭제되었습니다',
    });
  } catch (error: any) {
    console.error('Delete save error:', error);
    return errorResponse('저장 삭제 중 오류가 발생했습니다', 500);
  }
}
