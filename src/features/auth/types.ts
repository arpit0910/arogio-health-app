import { z } from 'zod';
import { validBirthDate } from '../profile/model.ts';

export const safeUserSchema = z.object({
  profileCompletedAt: z.string().nullable().optional(),
  profileSetup: z.record(z.unknown()).nullable().optional(),
  referralCode: z.string().optional(),
  hasReferrer: z.boolean().optional(),
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

export const referralCodeSchema = z.string().trim().toUpperCase().regex(/^[A-F0-9]{12}$/, "Enter the 12-character code from your friend.");

export const registerSchema = z.object({
  referralCode: referralCodeSchema.optional(),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
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

export const updateProfileSchema = registerSchema.pick({
  fullName: true,
  heightValue: true,
  heightUnit: true,
  weightValue: true,
  weightUnit: true,
}).extend({
  fullName: z.string().trim().min(2, 'Enter your full name (at least 2 characters).').max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/).optional(),
  dateOfBirth: z.string().refine(validBirthDate, 'Choose a valid date of birth.').optional(),
  gender: z.enum(['female', 'male', 'other', 'prefer_not_to_say']).optional(),
  location: z.string().trim().max(100).optional(),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active']).optional(),
  healthGoals: z.array(z.enum(['weight_management', 'fitness_activity', 'lose_weight', 'gain_weight', 'stay_fit', 'manage_condition', 'better_eating', 'improve_sleep', 'manage_stress'])).min(1, 'Choose at least one health goal.').optional(),
  photo: z.string().max(220000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/).optional(),
  healthReminders: z.boolean().optional(),
  tipsAndInsights: z.boolean().optional(),
  productUpdates: z.boolean().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type GoogleLoginInput = {
  idToken: string;
  referralCode?: string;
};

