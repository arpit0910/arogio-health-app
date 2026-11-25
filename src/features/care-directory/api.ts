import { z } from 'zod';
import { HttpClient } from '../../services/api/httpClient';
import { env } from '../../configuration/environment';
export const publicApi = new HttpClient(env.apiUrl, async () => null);
export const careKinds = ['hospital', 'doctor', 'medicine', 'lab', 'pharmacy'] as const;
export type CareKind = typeof careKinds[number];
export const careEntrySchema = z.object({
  id: z.string().uuid(), kind: z.enum(careKinds), name: z.string(), nameHi: z.string(), city: z.string(), address: z.string(), addressHi: z.string(), phone: z.string().nullable(),
  distanceKm: z.number().nonnegative().nullable().optional(),
  imageUrl:z.string().nullable().optional(),imageAlt:z.string().optional(),
  alternatePhone: z.string().nullable().optional(), email: z.string().nullable().optional(),
  website: z.string().nullable().optional(), mapAddress: z.string().optional(),
  recordedSchedules:z.array(z.object({hospitalId:z.string(),hospitalName:z.string(),days:z.array(z.number()),start:z.string().nullable(),end:z.string().nullable(),mode:z.string(),availability:z.string(),fee:z.number().nullable()})).optional(),
  reviewedAt: z.string().nullable(), updatedAt: z.string(),
  verification: z.enum(['source-reviewed', 'directory-listing']), details: z.object({ specialties: z.array(z.string()), qualifications: z.string(), registration: z.string(), languages: z.array(z.string()), providerType: z.string(), summary: z.string(),summaryHi:z.string().optional(), precautions: z.string(), latitude: z.number().nullable(), longitude: z.number().nullable(),experienceYears:z.number().nullable().optional(),consultationFee:z.number().nullable().optional(),medicalCouncil:z.string().optional(),benefits:z.array(z.string()).optional(), open24Hours: z.boolean().nullable().optional(), cashlessSchemes: z.array(z.string()).optional() }),
});
export type CareEntry = z.infer<typeof careEntrySchema>;
export const carePageSchema = z.object({ items: z.array(careEntrySchema), page: z.number(), hasNext: z.boolean(), coverage: z.string() });
export const careDetailSchema = careEntrySchema.extend({ affiliations: z.array(careEntrySchema),affiliationsUnavailable:z.boolean().optional() });
export const careLabels: Record<CareKind, string> = { hospital: 'Hospitals', doctor: 'Doctors', medicine: 'Medicine information', lab: 'Diagnostic labs', pharmacy: 'Pharmacies' };
export function directoryDirections({ name, address, locality, latitude, longitude }: {
  name: string;
  address: string;
  locality: string;
  latitude: number | null;
  longitude: number | null;
}) {
  const hasCoordinates = latitude != null && longitude != null
    && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
  const destination = hasCoordinates
    ? `${latitude},${longitude}`
    : address.trim() ? [...new Set([name, address, locality].map((part) => part.trim()).filter(Boolean))].join(', ') : '';
  return destination ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}` : null;
}
export function careDirections(entry: CareEntry) {
  return directoryDirections({
    name: entry.name,
    address: entry.mapAddress ?? (entry.address || entry.addressHi),
    locality: entry.mapAddress === undefined ? entry.city : '',
    latitude: entry.details.latitude,
    longitude: entry.details.longitude,
  });
}
export function carePhone(phone: string | null) { const clean = phone?.replace(/[ ()-]/g, ''); return clean && /^\+?\d{6,15}$/.test(clean) ? `tel:${clean}` : null; }

export function careRoute(entry: Pick<CareEntry, 'kind' | 'id'>) {
  const pathname = entry.kind === 'hospital' ? '/hospitals/[id]' : entry.kind === 'doctor' ? '/doctors/[id]' : entry.kind === 'medicine' ? '/medicine-library/[id]' : '/care/[id]';
  return { pathname, params: { id: entry.id } } as const;
}
