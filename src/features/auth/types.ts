import { z } from 'zod';

export const safeUserSchema = z.object({
  id: z.string(),
  fullName: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  mobileNumber: z.string().nullable().optional(),
  heightValue: z.number().nullable().optional(),
  heightUnit: z.enum(['cm', 'in']).nullable().optional(),
  weightValue: z.number().nullable().optional(),
  weightUnit: z.enum(['kg', 'lb']).nullable().optional(),
  bmi: z.number().nullable().optional(),
  status: z.enum(['active', 'disabled', 'pending']),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type SafeUser = z.infer<typeof safeUserSchema>;

export const tokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string().default('Bearer'),
  expiresIn: z.number().default(900),
});
export type TokenPair = z.infer<typeof tokenPairSchema>;

export const authResponseSchema = tokenPairSchema.extend({
  user: safeUserSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
  heightValue: z.number().min(20).max(300).optional(),
  heightUnit: z.enum(['cm', 'in']).optional(),
  weightValue: z.number().min(2).max(1102.3).optional(),
  weightUnit: z.enum(['kg', 'lb']).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export type GoogleLoginInput = {
  idToken: string;
};

