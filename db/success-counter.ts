import { env } from 'cloudflare:workers';

type CountRow = { count: number };

const database = () => (env as unknown as { DB: D1Database }).DB;

export async function getSuccessfulPlayerCount() {
  const row = await database().prepare('SELECT COUNT(*) AS count FROM successful_players').first<CountRow>();
  return Number(row?.count ?? 0);
}

export async function registerSuccessfulPlayer(visitorId: string) {
  await database().prepare(
    'INSERT OR IGNORE INTO successful_players (visitor_id, first_success_at) VALUES (?, ?)',
  ).bind(visitorId, Date.now()).run();
  return getSuccessfulPlayerCount();
}
