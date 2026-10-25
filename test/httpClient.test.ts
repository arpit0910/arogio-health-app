import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ApiError, HttpClient } from '../src/services/api/httpClient.ts';

describe('HttpClient Error Handling & Token Injection', () => {
  it('extracts nested error messages from backend ApiError format', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        }),
        { status: 401, headers: { 'content-type': 'application/json' } },
      );
    };

    const client = new HttpClient('https://api.test', async () => null);
    try {
      await client.request({ path: '/auth/login', method: 'POST', body: {} });
      assert.fail('Should have thrown ApiError');
    } catch (err) {
      assert(err instanceof ApiError);
      assert.strictEqual(err.status, 401);
      assert.strictEqual(err.message, 'Invalid email or password');
      assert.strictEqual(err.code, 'INVALID_CREDENTIALS');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('handles validation error arrays properly', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: ['email must be an email', 'password must contain a number'],
          },
        }),
        { status: 400, headers: { 'content-type': 'application/json' } },
      );
    };

    const client = new HttpClient('https://api.test', async () => null);
    try {
      await client.request({ path: '/auth/register', method: 'POST', body: {} });
      assert.fail('Should have thrown ApiError');
    } catch (err) {
      assert(err instanceof ApiError);
      assert.strictEqual(err.status, 400);
      assert(err.message.includes('email must be an email'));
      assert(err.message.includes('password must contain a number'));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('attaches Bearer token in request headers', async () => {
    const originalFetch = globalThis.fetch;
    let capturedAuthHeader: string | null = null;

    globalThis.fetch = async (_url, options) => {
      const headers = options?.headers as Record<string, string>;
      capturedAuthHeader = headers?.Authorization ?? null;
      return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    };

    const client = new HttpClient('https://api.test', async () => 'test-bearer-token');
    await client.request({ path: '/users/me' });

    assert.strictEqual(capturedAuthHeader, 'Bearer test-bearer-token');
    globalThis.fetch = originalFetch;
  });
});
