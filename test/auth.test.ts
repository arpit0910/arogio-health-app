import { describe, it } from 'node:test';
import assert from 'node:assert';
import { loginSchema, registerSchema, safeUserSchema, tokenPairSchema } from '../src/features/auth/types.ts';

describe('Auth Schemas & Input Validation', () => {
  it('validates a correct login input', () => {
    const valid = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'SecurePassword123!',
    });
    assert.strictEqual(valid.success, true);
  });

  it('rejects an invalid email in login input', () => {
    const invalid = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'Password123!',
    });
    assert.strictEqual(invalid.success, false);
  });

  it('rejects empty password in login input', () => {
    const invalid = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    assert.strictEqual(invalid.success, false);
  });

  it('validates a complete registration payload matching postman collection', () => {
    const valid = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'SecurePassword123!',
      fullName: 'Arogio User',
      heightValue: 68,
      heightUnit: 'in',
      weightValue: 150.8,
      weightUnit: 'lb',
    });
    assert.strictEqual(valid.success, true);
  });

  it('enforces backend password complexity rules', () => {
    // Too short (< 12 chars)
    const tooShort = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'Short1!',
    });
    assert.strictEqual(tooShort.success, false);

    // Missing lowercase
    const noLower = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'UPPERCASE12345!',
    });
    assert.strictEqual(noLower.success, false);

    // Missing uppercase
    const noUpper = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'lowercase12345!',
    });
    assert.strictEqual(noUpper.success, false);

    // Missing number
    const noNumber = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'NoNumbersHereAtAll!',
    });
    assert.strictEqual(noNumber.success, false);
  });

  it('validates SafeUser schema from GET /users/me response', () => {
    const userPayload = {
      id: 'f94db1ea-5353-4889-bc3f-7e9b380f2d4e',
      fullName: 'Arogio User',
      username: 'arogio_user',
      email: 'user@example.com',
      mobileNumber: '+1234567890',
      heightValue: 68,
      heightUnit: 'in',
      weightValue: 150.8,
      weightUnit: 'lb',
      bmi: 23,
      status: 'active',
      createdAt: '2026-10-24T06:48:39.320Z',
      updatedAt: '2026-10-24T06:48:39.320Z',
    };
    const parsed = safeUserSchema.safeParse(userPayload);
    assert.strictEqual(parsed.success, true);
  });

  it('validates TokenPair schema from /auth/refresh', () => {
    const tokenPayload = {
      accessToken: 'sample-access-token-jwt',
      refreshToken: 'sample-refresh-token-string',
      tokenType: 'Bearer',
      expiresIn: 900,
    };
    const parsed = tokenPairSchema.safeParse(tokenPayload);
    assert.strictEqual(parsed.success, true);
  });
});
