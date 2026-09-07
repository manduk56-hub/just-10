import { getSuccessfulPlayerCount, registerSuccessfulPlayer } from '@/db/success-counter';

const TARGET = 10000;
const TOLERANCE = 100;
const VISITOR_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const headers = { 'Cache-Control': 'no-store' };

export async function GET() {
  try {
    return Response.json({ count: await getSuccessfulPlayerCount() }, { headers });
  } catch {
    return Response.json({ error: 'success_count_unavailable' }, { status: 503, headers });
  }
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as { visitorId?: unknown; time?: unknown };
    if (typeof input.visitorId !== 'string' || !VISITOR_ID.test(input.visitorId) ||
        typeof input.time !== 'number' || !Number.isFinite(input.time) ||
        Math.abs(input.time - TARGET) > TOLERANCE) {
      return Response.json({ error: 'invalid_success' }, { status: 400, headers });
    }
    return Response.json({ count: await registerSuccessfulPlayer(input.visitorId) }, { headers });
  } catch {
    return Response.json({ error: 'invalid_request' }, { status: 400, headers });
  }
}
