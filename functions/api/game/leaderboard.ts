/**
 * GET /api/game/leaderboard
 * Get leaderboard rankings
 */

import { Env, jsonResponse, errorResponse } from '../../utils';

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Parse query parameters
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'survival'; // survival, level, kills
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 100);

  try {
    let query: string;
    let orderBy: string;

    switch (type) {
      case 'level':
        orderBy = 'highest_level DESC';
        break;
      case 'kills':
        orderBy = 'most_kills DESC';
        break;
      case 'survival':
      default:
        orderBy = 'longest_survival_time DESC';
        break;
    }

    query = `
      SELECT
        username,
        longest_survival_time,
        highest_level,
        most_kills,
        total_games_played
      FROM users
      WHERE ${type === 'survival' ? 'longest_survival_time' : type === 'level' ? 'highest_level' : 'most_kills'} > 0
      ORDER BY ${orderBy}
      LIMIT ?
    `;

    const result = await env.DB.prepare(query).bind(limit).all();

    const leaderboard = result.results.map((row: any, index: number) => ({
      rank: index + 1,
      username: row.username,
      longestSurvivalTime: row.longest_survival_time,
      highestLevel: row.highest_level,
      mostKills: row.most_kills,
      totalGamesPlayed: row.total_games_played,
    }));

    return jsonResponse({
      success: true,
      type,
      leaderboard,
    });
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    return errorResponse('리더보드 조회 중 오류가 발생했습니다', 500);
  }
}
