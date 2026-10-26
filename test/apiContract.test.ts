import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { authResponseSchema, safeUserSchema, tokenPairSchema, updateProfileSchema } from '../src/features/auth/types.ts';
import { ApiError, HttpClient } from '../src/services/api/httpClient.ts';

const collection = JSON.parse(readFileSync(new URL('../arogio_health_api.postman_collection.json', import.meta.url), 'utf8'));
const requests: any[] = [];
function collect(items: any[]) {
  for (const item of items) {
    if (item.item) collect(item.item);
    else requests.push(item);
  }
}
collect(collection.item);

describe('Supplied API contract', () => {
  it('builds the preview APK against the selected Postman environment', () => {
    const environment = JSON.parse(readFileSync(new URL('../arogio_backend_arogio_com.postman_environment.json', import.meta.url), 'utf8'));
    const settings = new Map(environment.values.filter((entry: any) => entry.enabled !== false).map((entry: any) => [entry.key, entry.value]));
    const buildConfig = JSON.parse(readFileSync(new URL('../eas.json', import.meta.url), 'utf8'));
    assert.equal(buildConfig.build.preview.env.EXPO_PUBLIC_API_URL, `${settings.get('baseUrl')}${settings.get('apiPrefix')}`);
  });
  for (const name of ['Register with Email & Password', 'Login with Email & Password', 'Google OAuth Sign-In']) {
    it(`accepts the documented ${name} response`, () => {
      const request = requests.find((entry) => entry.name === name);
      const response = request.response.find((entry: any) => entry.code >= 200 && entry.code < 300);
      assert.ok(authResponseSchema.safeParse(JSON.parse(response.body)).success);
    });
  }

  it('accepts the documented rotating refresh-token response', () => {
    const request = requests.find((entry) => entry.name === 'Refresh Access Token');
    assert.ok(tokenPairSchema.safeParse(JSON.parse(request.response[0].body)).success);
  });

  it('accepts the documented profile update request and response', () => {
    const request = requests.find((entry) => entry.request.method === 'PATCH');
    assert.ok(updateProfileSchema.safeParse(JSON.parse(request.request.body.raw)).success);
    assert.ok(safeUserSchema.safeParse(JSON.parse(request.response[0].body)).success);
  });
});

describe('API deployment response handling', () => {
  it('rejects a server welcome page returned with HTTP 200', async () => {
    const previous = globalThis.fetch;
    globalThis.fetch = async () => new Response('It works! NodeJS', { headers: { 'content-type': 'text/plain' } });
    try {
      const client = new HttpClient('https://api.test', async () => null);
      await assert.rejects(client.request({ path: '/auth/login', method: 'POST', body: {} }),
        (error: unknown) => error instanceof ApiError && error.code === 'INVALID_API_RESPONSE');
    } finally { globalThis.fetch = previous; }
  });

  it('rejects malformed JSON with a recoverable API error', async () => {
    const previous = globalThis.fetch;
    globalThis.fetch = async () => new Response('{invalid', { headers: { 'content-type': 'application/json' } });
    try {
      const client = new HttpClient('https://api.test', async () => null);
      await assert.rejects(client.request({ path: '/users/me' }),
        (error: unknown) => error instanceof ApiError && error.code === 'INVALID_API_RESPONSE');
    } finally { globalThis.fetch = previous; }
  });

  it('accepts the documented empty logout response', async () => {
    const previous = globalThis.fetch;
    globalThis.fetch = async () => new Response(null, { status: 204 });
    try {
      const client = new HttpClient('https://api.test', async () => null);
      assert.equal(await client.request({ path: '/auth/logout', method: 'POST', body: { refreshToken: 'test' } }), undefined);
    } finally { globalThis.fetch = previous; }
  });
});
