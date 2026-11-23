import { z } from 'zod';
import { HttpClient } from '../../services/api/httpClient';
import { env } from '../../configuration/environment';
export const publicApi = new HttpClient(env.apiUrl, async () => null);
export const careKinds = ['hospital', 'doctor', 'medicine', 'lab', 'pharmacy'] as const;
export type CareKind = typeof careKinds[number];
export const careEntrySchema = z.object({
  id: z.string().uuid(), kind: z.enum(careKinds), name: z.string(), nameHi: z.string(), city: z.string(), address: z.string(), addressHi: z.string(), phone: z.string().nullable(),
  imageUrl:z.string().nullable().optional(),imageAlt:z.string().optional(),
  recordedSchedules:z.array(z.object({hospitalId:z.string(),hospitalName:z.string(),days:z.array(z.number()),start:z.string().nullable(),end:z.string().nullable(),mode:z.string(),availability:z.string(),fee:z.number().nullable()})).optional(),
  sourceUrl: z.string().refine(value => !value || /^https:\/\//.test(value)), reviewedAt: z.string().nullable(), updatedAt: z.string(),
  verification: z.enum(['source-reviewed', 'directory-listing']), details: z.object({ specialties: z.array(z.string()), qualifications: z.string(), registration: z.string(), languages: z.array(z.string()), providerType: z.string(), summary: z.string(),summaryHi:z.string().optional(), precautions: z.string(), latitude: z.number().nullable(), longitude: z.number().nullable(),experienceYears:z.number().nullable().optional(),consultationFee:z.number().nullable().optional(),medicalCouncil:z.string().optional(),benefits:z.array(z.string()).optional() }),
});
export type CareEntry = z.infer<typeof careEntrySchema>;
export const carePageSchema = z.object({ items: z.array(careEntrySchema), page: z.number(), hasNext: z.boolean(), coverage: z.string() });
export const careDetailSchema = careEntrySchema.extend({ affiliations: z.array(careEntrySchema),affiliationsUnavailable:z.boolean().optional() });
export const careLabels: Record<CareKind, string> = { hospital: 'Hospitals', doctor: 'Doctors', medicine: 'Medicine information', lab: 'Diagnostic labs', pharmacy: 'Pharmacies' };
export function careDirections(entry: CareEntry) { return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(entry.details.latitude != null && entry.details.longitude != null ? `${entry.details.latitude},${entry.details.longitude}` : `${entry.name}, ${entry.address}, ${entry.city}`); }
export function carePhone(phone: string | null) { const clean = phone?.replace(/[ ()-]/g, ''); return clean && /^\+?\d{6,15}$/.test(clean) ? `tel:${clean}` : null; }

export function careRoute(entry: Pick<CareEntry, 'kind' | 'id'>) {
  const pathname = entry.kind === 'hospital' ? '/hospitals/[id]' : entry.kind === 'doctor' ? '/doctors/[id]' : entry.kind === 'medicine' ? '/medicine-library/[id]' : '/care/[id]';
  return { pathname, params: { id: entry.id } } as const;
}
