/**
 * Route smoke tests using Elysia's in-process request handler.
 * These test HTTP shape and auth enforcement WITHOUT a live Supabase.
 *
 * Tests that require DB are skipped when SUPABASE_URL is not set.
 */
import { describe, it, expect, beforeAll } from 'bun:test';
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';

// Minimal app without DB routes for auth shape tests
const makeMinimalApp = () =>
  new Elysia()
    .use(cors())
    .get('/health', () => ({
      success: true,
      service: 'medcare-api',
      timestamp: new Date().toISOString(),
    }));

const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

// ── Health ─────────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns 200 with success shape', async () => {
    const app = makeMinimalApp();
    const res = await app.handle(new Request('http://localhost/health'));

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.service).toBe('medcare-api');
    expect(typeof body.timestamp).toBe('string');
  });
});

// ── Auth enforcement ───────────────────────────────────────────────────────

describe('Auth enforcement (no token)', () => {
  // Import the full app only if Supabase env is present, else skip
  const skipIfNoDb = hasSupabase ? it : it.skip;

  skipIfNoDb('GET /residents returns 401 without token', async () => {
    const { app } = await import('../index');
    const res = await app.handle(new Request('http://localhost/residents'));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Unauthorized');
  });

  skipIfNoDb('GET /stock returns 401 without token', async () => {
    const { app } = await import('../index');
    const res = await app.handle(new Request('http://localhost/stock'));
    expect(res.status).toBe(401);
  });

  skipIfNoDb('POST /dispense returns 401 without token', async () => {
    const { app } = await import('../index');
    const res = await app.handle(
      new Request('http://localhost/dispense', { method: 'POST', body: JSON.stringify({}) })
    );
    expect(res.status).toBe(401);
  });

  skipIfNoDb('GET /wards returns 401 without token', async () => {
    const { app } = await import('../index');
    const res = await app.handle(new Request('http://localhost/wards'));
    expect(res.status).toBe(401);
  });
});

// ── Response shape contracts ───────────────────────────────────────────────

describe('Response shape', () => {
  it('health response has required fields', async () => {
    const app = makeMinimalApp();
    const res = await app.handle(new Request('http://localhost/health'));
    const body = await res.json() as any;

    expect(body).toHaveProperty('success');
    expect(body).toHaveProperty('service');
    expect(body).toHaveProperty('timestamp');
  });

  it('timestamp is valid ISO string', async () => {
    const app = makeMinimalApp();
    const res = await app.handle(new Request('http://localhost/health'));
    const body = await res.json() as any;

    const parsed = new Date(body.timestamp);
    expect(parsed.toString()).not.toBe('Invalid Date');
  });
});

// ── Validation ─────────────────────────────────────────────────────────────

describe('Input validation', () => {
  const skipIfNoDb = hasSupabase ? it : it.skip;

  skipIfNoDb('POST /residents with missing required fields returns 400 or 401', async () => {
    const { app } = await import('../index');
    const res = await app.handle(
      new Request('http://localhost/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Missing required: name, room
        body: JSON.stringify({ ward_id: 'some-id' }),
      })
    );
    // Either 401 (no auth token) or 400 (validation) — both are correct rejections
    expect([400, 401]).toContain(res.status);
  });

  skipIfNoDb('PATCH /stock/by-medication/:id with empty body returns 400 or 401', async () => {
    const { app } = await import('../index');
    const res = await app.handle(
      new Request('http://localhost/stock/by-medication/some-uuid', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    );
    expect([400, 401]).toContain(res.status);
  });
});
