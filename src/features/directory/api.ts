import { z } from "zod";
import { apiClient } from "../../services/api/client";
export const articleSchema = z.object({
  id: z.string(),
  title_en: z.string(),
  title_hi: z.string(),
  excerpt_en: z.string(),
  excerpt_hi: z.string(),
  category: z.string(),
  author_name: z.string(),
  created_at: z.string(),
});
export const articleDetailSchema = articleSchema.extend({
  content_en: z.string(),
  content_hi: z.string(),
});
export const bankSchema = z.object({
  id: z.string(),
  name_en: z.string(),
  name_hi: z.string(),
  city: z.string(),
  state: z.string(),
  address_en: z.string(),
  address_hi: z.string(),
  pincode: z.string().nullable(),
  phone: z.string().nullable(),
  country_code: z.string(),
  emergency_phone: z.string().nullable(),
  emergency_country_code: z.string(),
  is_24_7: z.boolean(),
  is_government: z.boolean(),
  component_facility: z.boolean(),
  apheresis_facility: z.boolean(),
  available_blood_groups: z.array(z.string()),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  distanceKm: z.number().optional(),
});
export const articleListSchema = z.object({
  items: z.array(articleSchema),
  page: z.number(),
  hasNext: z.boolean(),
  categories: z.array(z.string()),
});
export const bankListSchema = z.object({
  items: z.array(bankSchema),
  page: z.number(),
  hasNext: z.boolean(),
  missingCoordinates: z.number(),
});
export type Article = z.infer<typeof articleSchema>;
export type Bank = z.infer<typeof bankSchema>;
export async function loadArticles(
  search = "",
  page = 1,
  signal?: AbortSignal,
) {
  return articleListSchema.parse(
    await apiClient.request({
      path: `/articles?limit=12&page=${page}&search=${encodeURIComponent(search)}`,
      signal,
    }),
  );
}
export function dialNumber(number: string | null, country: string) {
  if (!number || !/^[+\d\s()-]+$/.test(number)) return null;
  const digits = number.replace(/[^\d+]/g, "");
  if (!/^\+?\d{6,15}$/.test(digits)) return null;
  return `tel:${digits.startsWith("+") ? digits : country + digits.replace(/^0/, "")}`;
}
