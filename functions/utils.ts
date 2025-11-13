/**
 * Utility functions for Cloudflare Workers backend
 */

export interface Env {
  DB: D1Database;
}

/**
 * Hash password using Web Crypto API
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generate random session token
 */
export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create JSON response with CORS headers
 */
export function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * Create error response
 */
export function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ success: false, error: message }, status);
}

/**
 * Create success response
 */
export function successResponse(data: any): Response {
  return jsonResponse({ success: true, ...data });
}

/**
 * Verify session token and get user ID
 */
export async function verifyToken(env: Env, token: string | null): Promise<number | null> {
  if (!token) return null;

  const now = Date.now();
  const result = await env.DB.prepare(
    'SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?'
  ).bind(token, now).first<{ user_id: number }>();

  return result?.user_id || null;
}

/**
 * Create session for user
 */
export async function createSession(env: Env, userId: number): Promise<string> {
  const token = generateToken();
  const now = Date.now();
  const expiresAt = now + (30 * 24 * 60 * 60 * 1000); // 30 days

  await env.DB.prepare(
    'INSERT INTO sessions (user_id, token, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(userId, token, now, expiresAt).run();

  return token;
}

/**
 * Get user profile data
 */
export async function getUserProfile(env: Env, userId: number): Promise<any> {
  // Get user data
  const user = await env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(userId).first();

  if (!user) return null;

  // Get unlocked characters
  const unlockedChars = await env.DB.prepare(
    'SELECT character_id FROM unlocked_characters WHERE user_id = ?'
  ).bind(userId).all();

  // Get achievements
  const achievements = await env.DB.prepare(
    'SELECT achievement_id FROM achievements WHERE user_id = ?'
  ).bind(userId).all();

  return {
    username: user.username,
    createdAt: user.created_at,
    lastLogin: user.last_login,
    totalPlaytime: user.total_playtime,
    totalKills: user.total_kills,
    totalGamesPlayed: user.total_games_played,
    highScores: {
      longestSurvivalTime: user.longest_survival_time,
      highestLevel: user.highest_level,
      mostKills: user.most_kills,
    },
    unlockedCharacters: unlockedChars.results.map((r: any) => r.character_id),
    achievements: achievements.results.map((r: any) => r.achievement_id),
    settings: {
      musicVolume: user.music_volume,
      sfxVolume: user.sfx_volume,
    },
  };
}

/**
 * Parse request body as JSON
 */
export async function parseBody<T = any>(request: Request): Promise<T | null> {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }
    return await request.json() as T;
  } catch {
    return null;
  }
}

/**
 * Get Authorization token from header
 */
export function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
