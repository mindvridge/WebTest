/**
 * POST /api/auth/register
 * Register a new user account
 */

import { Env, hashPassword, createSession, parseBody, errorResponse, successResponse } from '../../utils';

interface RegisterRequest {
  username: string;
  password: string;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Parse request body
  const body = await parseBody<RegisterRequest>(request);
  if (!body) {
    return errorResponse('Invalid request body');
  }

  const { username, password } = body;

  // Validation
  if (!username || username.length < 3) {
    return errorResponse('사용자 이름은 최소 3자 이상이어야 합니다');
  }
  if (!password || password.length < 4) {
    return errorResponse('비밀번호는 최소 4자 이상이어야 합니다');
  }

  // Check if username already exists
  const existingUser = await env.DB.prepare(
    'SELECT id FROM users WHERE username = ?'
  ).bind(username).first();

  if (existingUser) {
    return errorResponse('이미 존재하는 사용자 이름입니다');
  }

  // Hash password
  const passwordHash = await hashPassword(password);
  const now = Date.now();

  try {
    // Create user
    const result = await env.DB.prepare(
      `INSERT INTO users (
        username, password_hash, created_at, last_login,
        total_playtime, total_kills, total_games_played,
        longest_survival_time, highest_level, most_kills,
        music_volume, sfx_volume
      ) VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0.7, 0.8)`
    ).bind(username, passwordHash, now, now).run();

    const userId = result.meta.last_row_id;

    // Unlock rookie character by default
    await env.DB.prepare(
      'INSERT INTO unlocked_characters (user_id, character_id, unlocked_at) VALUES (?, ?, ?)'
    ).bind(userId, 'rookie_cook', now).run();

    // Create session
    const token = await createSession(env, userId);

    return successResponse({
      message: '계정이 생성되었습니다!',
      token,
      username,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return errorResponse('계정 생성 중 오류가 발생했습니다', 500);
  }
}
