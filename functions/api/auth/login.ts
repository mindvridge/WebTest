/**
 * POST /api/auth/login
 * Login with username and password
 */

import { Env, hashPassword, createSession, parseBody, errorResponse, successResponse } from '../../utils';

interface LoginRequest {
  username: string;
  password: string;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Parse request body
  const body = await parseBody<LoginRequest>(request);
  if (!body) {
    return errorResponse('Invalid request body');
  }

  const { username, password } = body;

  if (!username || !password) {
    return errorResponse('사용자 이름과 비밀번호를 입력하세요');
  }

  // Find user
  const user = await env.DB.prepare(
    'SELECT id, password_hash FROM users WHERE username = ?'
  ).bind(username).first<{ id: number; password_hash: string }>();

  if (!user) {
    return errorResponse('사용자를 찾을 수 없습니다');
  }

  // Verify password
  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.password_hash) {
    return errorResponse('잘못된 비밀번호입니다');
  }

  // Update last login
  const now = Date.now();
  await env.DB.prepare(
    'UPDATE users SET last_login = ? WHERE id = ?'
  ).bind(now, user.id).run();

  // Create session
  const token = await createSession(env, user.id);

  return successResponse({
    message: '로그인 성공!',
    token,
    username,
  });
}
