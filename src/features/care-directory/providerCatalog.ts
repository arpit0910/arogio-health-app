import { z } from "zod";
import {
  careEntrySchema,
  carePageSchema,
  careDetailSchema,
  publicApi,
  type CareEntry,
  type CareKind,
} from "./api";
import { env } from "../../configuration/environment";
const reference = z.object({
  id: z.string().uuid(),
  name_en: z.string(),
  name_hi: z.string().default(""),
});
const affiliation = z.object({
  hospital_id: z.string().uuid(),
  name_en: z.string(),
  days_of_week: z.array(z.number().int().min(0).max(6)),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  consultation_mode: z.string(),
  availability: z.string(),
  consultation_fee: z.number().nullable(),
});
const profileSchema = z.object({
  id: z.string().uuid(),
  name_en: z.string(),
  name_hi: z.string(),
  city: z.string(),
  state: z.string(),
  address_line1: z.string(),
  address_line2: z.string(),
  landmark: z.string(),
  address_hi: z.string(),
  pincode: z.string(),
  country_code_1: z.string(),
  phone_1: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  summary_en: z.string(),
  summary_hi: z.string(),
  image_url: z.string().nullable(),
  image_alt: z.string(),
  reviewedAt: z.string().nullable(),
  published: z.boolean().optional(),
  updated_at: z.string(),
  hospital_type: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  registration_number: z.string().optional(),
  medical_council: z.string().optional(),
  languages: z.array(z.string()).optional(),
  experience_years: z.number().nullable().optional(),
  consultation_fee: z.number().nullable().optional(),
  departments: z.array(reference).optional(),
  affiliations: z.array(affiliation).optional(),
  accepts_ayushman: z.boolean().nullable().optional(),
  accepts_janaadhaar: z.boolean().nullable().optional(),
  accepts_cghs: z.boolean().nullable().optional(),
  accepts_esic: z.boolean().nullable().optional(),
  rgahs_approved: z.boolean().nullable().optional(),
  is_cashless: z.boolean().nullable().optional(),
  nabh_accredited: z.boolean().nullable().optional(),
});
const pageSchema = z.object({
  items: z.array(profileSchema),
  page: z.number(),
  hasNext: z.boolean(),
  total: z.number(),
});
export function providerImageUrl(
  value: string | null | undefined,
  base = env.apiUrl,
) {
  if (!value) return undefined;
  try {
    const url = new URL(value, base);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.origin !== new URL(base).origin ||
      url.username ||
      url.password
    )
      return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}
export function adaptProvider(
  kind: "doctor" | "hospital",
  raw: unknown,
): CareEntry {
  const row = profileSchema.parse(raw);
  const phone = row.phone_1
    ? row.phone_1.startsWith("+")
      ? row.phone_1
      : row.country_code_1 + row.phone_1
    : null;
  const benefitNames = {
    accepts_ayushman: "Ayushman Bharat",
    accepts_janaadhaar: "Jan Aadhaar",
    accepts_cghs: "CGHS",
    accepts_esic: "ESIC",
    rgahs_approved: "RGHS",
    is_cashless: "Cashless facility",
    nabh_accredited: "NABH accredited",
  } as const;
  return careEntrySchema.parse({
    id: row.id,
    kind,
    name: row.name_en,
    nameHi: row.name_hi,
    city: row.city,
    address: [
      row.address_line1,
      row.address_line2,
      row.landmark,
      row.city,
      row.state,
      row.pincode,
    ]
      .filter(Boolean)
      .join(", "),
    addressHi: row.address_hi,
    phone,
    reviewedAt: row.reviewedAt,
    updatedAt: row.updated_at,
    verification: row.published !== false && row.reviewedAt && Date.parse(row.reviewedAt) >= Date.now() - 180 * 86400000 ? "source-reviewed" : "directory-listing",
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    details: {
      specialties:
        kind === "doctor"
          ? (row.departments ?? []).map((d) => d.name_en)
          : (row.specialties ?? []),
      qualifications: (row.qualifications ?? []).join(", "),
      registration: row.registration_number ?? "",
      languages: row.languages ?? [],
      providerType: row.hospital_type ?? "",
      summary: row.summary_en,
      summaryHi: row.summary_hi,
      precautions: "",
      latitude: row.latitude,
      longitude: row.longitude,
      experienceYears: row.experience_years,
      consultationFee: row.consultation_fee,
      medicalCouncil: row.medical_council,
      benefits: Object.entries(benefitNames)
        .filter(([key]) => row[key as keyof typeof benefitNames] === true)
        .map(([, label]) => label),
    },
    recordedSchedules: (row.affiliations ?? []).map((a) => ({
      hospitalId: a.hospital_id,
      hospitalName: a.name_en,
      days: a.days_of_week,
      start: a.start_time,
      end: a.end_time,
      mode: a.consultation_mode,
      availability: a.availability,
      fee: a.consultation_fee,
    })),
  });
}
export type ProviderFilters = {
  type?: string;
  benefit?: "nabh";
  department_id?: string;
  hospital_id?: string;
  city?: string;
  language?: "en" | "hi";
  limit?: number;
};
export async function loadProviderPage(
  kind: CareKind,
  search = "",
  page = 1,
  signal?: AbortSignal,
  filters: ProviderFilters = {},
) {
  const params = new URLSearchParams({
    search,
    page: String(page),
    limit: String(filters.limit ?? 20),
  });
  if (kind !== "doctor" && kind !== "hospital")
    return carePageSchema.parse(
      await publicApi.request({ path: `/care?kind=${kind}&${params}`, signal }),
    );
  for (const [key, value] of Object.entries(filters))
    if (value !== undefined) params.set(key, String(value));
  const data = pageSchema.parse(
    await publicApi.request({
      path: `/public/${kind === "doctor" ? "doctors" : "hospitals"}?${params}`,
      signal,
    }),
  );
  return {
    items: data.items.map((row) => adaptProvider(kind, row)),
    page: data.page,
    hasNext: data.hasNext,
    coverage: "available-locations",
  };
}
export async function loadProviderDetail(
  id: string,
  kind?: CareKind,
  signal?: AbortSignal,
): Promise<z.infer<typeof careDetailSchema>> {
  if (kind !== "doctor" && kind !== "hospital") {
    const legacy = careDetailSchema.parse(
      await publicApi.request({
        path: `/care/${encodeURIComponent(id)}`,
        signal,
      }),
    );
    if (legacy.kind === "doctor" || legacy.kind === "hospital")
      return loadProviderDetail(id, legacy.kind, signal);
    return legacy;
  }
  const row = profileSchema.parse(
    await publicApi.request({
      path: `/public/${kind === "doctor" ? "doctors" : "hospitals"}/${encodeURIComponent(id)}`,
      signal,
    }),
  );
  const entry = adaptProvider(kind, row);
  let affiliations: CareEntry[] = [],
    affiliationsUnavailable = false;
  if (kind === "doctor") {
    const results = await Promise.allSettled(
      (row.affiliations ?? []).map(async (a) =>
        adaptProvider(
          "hospital",
          await publicApi.request({
            path: `/public/hospitals/${a.hospital_id}`,
            signal,
          }),
        ),
      ),
    );
    affiliationsUnavailable = results.some(
      (result) => result.status === "rejected",
    );
    affiliations = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
  } else {
    try {
      affiliations = (
        await loadProviderPage("doctor", "", 1, signal, {
          hospital_id: id,
          limit: 100,
        })
      ).items;
    } catch {
      affiliationsUnavailable = true;
    }
  }
  if (signal?.aborted) throw new Error("Request cancelled.");
  return careDetailSchema.parse({
    ...entry,
    affiliations,
    affiliationsUnavailable,
  });
}
const departmentSchema = z.object({
  id: z.string().uuid(),
  name_en: z.string(),
  name_hi: z.string(),
});
export async function loadDepartments(signal?: AbortSignal) {
  const result = [];
  for (let page = 1; ; page++) {
    const data = z
      .object({ items: z.array(departmentSchema), hasNext: z.boolean() })
      .parse(
        await publicApi.request({
          path: `/public/departments?page=${page}&limit=100`,
          signal,
        }),
      );
    result.push(...data.items);
    if (!data.hasNext) return result;
  }
}
