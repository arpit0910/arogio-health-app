import { it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { z } from "zod";
const doctorId = "11111111-1111-4111-8111-111111111111",
  hospitalId = "22222222-2222-4222-8222-222222222222",
  departmentId = "33333333-3333-4333-8333-333333333333";
const base = {
  id: doctorId,
  name_en: "Test doctor",
  name_hi: "Hindi name",
  city: "Delhi",
  state: "Delhi",
  address_line1: "Test street",
  address_line2: "",
  landmark: "",
  address_hi: "Hindi address",
  pincode: "110001",
  country_code_1: "+91",
  phone_1: "9000000000",
  source_url: "https://example.test/source",
  latitude: null,
  longitude: null,
  summary_en: "Biography",
  summary_hi: "",
  image_url: `/api/v1/public/doctors/${doctorId}/image?v=revision`,
  image_alt: "Uploaded portrait",
  reviewedAt: "2026-11-15T00:00:00Z",
  updated_at: "2026-11-15T00:00:00Z",
};
const doctor = {
  ...base,
  qualifications: ["MBBS", "MD"],
  registration_number: "TEST-001",
  medical_council: "Test council",
  languages: ["Hindi", "English"],
  experience_years: 10,
  consultation_fee: 600,
  departments: [
    { id: departmentId, name_en: "Cardiology", name_hi: "Hindi department" },
  ],
  affiliations: [
    {
      hospital_id: hospitalId,
      name_en: "Test hospital",
      days_of_week: [1, 3],
      start_time: "09:00",
      end_time: "13:00",
      consultation_mode: "in_person",
      availability: "Call first",
      consultation_fee: 700,
    },
  ],
};
const hospital = {
  ...base,
  id: hospitalId,
  name_en: "Test hospital",
  image_url: `/api/v1/public/hospitals/${hospitalId}/image?v=revision`,
  hospital_type: "Private",
  specialties: ["Cardiology"],
  accepts_ayushman: true,
  nabh_accredited: true,
  is_cashless: null,
};
type Request = { path: string; signal?: AbortSignal; method?: string; body?: unknown };
function loader(request: (options: Request) => Promise<unknown>) {
  const cache = new Map<string, any>();
  function load(file: string) {
    if (cache.has(file)) return cache.get(file);
    const module = { exports: {} as any };
    cache.set(file, module.exports);
    const deps: Record<string, unknown> = {
      zod: { z },
      "../../configuration/environment": {
        env: { apiUrl: "https://api.example.test/api/v1" },
      },
      "../../services/api/httpClient": {
        HttpClient: class {
          request = request;
        },
      },
    };
    vm.runInNewContext(
      ts.transpileModule(readFileSync(file, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS },
      }).outputText,
      {
        module,
        exports: module.exports,
        URL,
        URLSearchParams,
        AbortController,
        require: (name: string) => {
          if (name === "./api")
            return load("src/features/care-directory/api.ts");
          if (name === "../care-directory/providerCatalog")
            return load("src/features/care-directory/providerCatalog.ts");
          if (name in deps) return deps[name];
          throw new Error("Unexpected import " + name);
        },
      },
    );
    return module.exports;
  }
  return {
    api: load("src/features/care-directory/api.ts"),
    catalog: load("src/features/care-directory/providerCatalog.ts"),
    home: () => load("src/features/home-dashboard/discoveryApi.ts"),
  };
}
it("adapts published doctor and hospital API contracts including photos, fees and recorded schedules", () => {
  const { catalog } = loader(async () => null),
    d = catalog.adaptProvider("doctor", doctor),
    h = catalog.adaptProvider("hospital", hospital);
  assert.equal(d.nameHi, "Hindi name");
  assert.equal(d.phone, "+919000000000");
  assert.equal(d.details.qualifications, "MBBS, MD");
  assert.equal(d.details.specialties[0], "Cardiology");
  assert.equal(d.details.consultationFee, 600);
  assert.equal(d.recordedSchedules[0].fee, 700);
  assert.equal(d.imageUrl, doctor.image_url);
  assert.equal(h.details.providerType, "Private");
  assert.equal(h.details.benefits.join(","), "Ayushman Bharat,NABH accredited");
  assert.equal(
    catalog.providerImageUrl(d.imageUrl),
    "https://api.example.test" + doctor.image_url,
  );
  for (const value of [
    "javascript:alert(1)",
    "data:image/png;base64,abc",
    "https://other.test/photo.jpg",
    "https://user:secret@api.example.test/photo.jpg",
  ])
    assert.equal(catalog.providerImageUrl(value), undefined);
});
it("keeps contact and facility data and uses only usable map destinations", () => {
  const { api, catalog } = loader(async () => null);
  const entry = catalog.adaptProvider("hospital", {
    ...hospital,
    address_line1: "Main Road",
    country_code_2: "+91",
    phone_2: "8000000000",
    email: "reception@example.test",
    website: "https://example.test",
    is_24_7: true,
    cashless_schemes: ["Example scheme"],
  });
  assert.equal(entry.alternatePhone, "+918000000000");
  assert.equal(entry.email, "reception@example.test");
  assert.equal(entry.website, "https://example.test");
  assert.equal(entry.details.open24Hours, true);
  assert.equal(entry.details.cashlessSchemes.join(), "Example scheme");
  assert.match(new URL(api.careDirections(entry)).searchParams.get("destination")!, /Main Road/);
  assert.equal(new URL(api.careDirections({
    ...entry, details: { ...entry.details, latitude: 26.9, longitude: 75.8 },
  })).searchParams.get("destination"), "26.9,75.8");
  assert.equal(api.careDirections(catalog.adaptProvider("hospital", {
    ...hospital, address_line1: "", address_line2: "", landmark: "", address_hi: "",
  })), null);
});
it("uses server-side filters and pagination without a fixed city", async () => {
  const paths: string[] = [];
  const { catalog } = loader(async ({ path }) => {
    paths.push(path);
    return { items: [doctor], page: 2, hasNext: true, total: 50 };
  });
  const data = await catalog.loadProviderPage("doctor", "Heart", 2, undefined, {
    department_id: departmentId,
  });
  assert.equal(data.hasNext, true);
  assert.equal(data.page, 2);
  assert.match(paths[0], /^\/public\/doctors\?/);
  const q = new URL("https://test" + paths[0]).searchParams;
  assert.equal(q.get("department_id"), departmentId);
  assert.equal(q.get("search"), "Heart");
  assert.equal(q.has("city"), false);
});
it("loads structured doctor details and public hospital relations with uploaded images", async () => {
  const { catalog } = loader(async ({ path }) => {
    if (path === `/public/doctors/${doctorId}`) return doctor;
    if (path === `/public/hospitals/${hospitalId}`) return hospital;
    throw Error(path);
  });
  const result = await catalog.loadProviderDetail(doctorId, "doctor");
  assert.equal(result.affiliations[0].kind, "hospital");
  assert.equal(result.affiliations[0].imageUrl, hospital.image_url);
  assert.equal(result.recordedSchedules[0].start, "09:00");
});
it("sends nearby coordinates in the request body and preserves server distances and pagination", async () => {
  const location = { latitude: 28.61, longitude: 77.21, radiusKm: 50 };
  const calls: Request[] = [];
  const { catalog } = loader(async (request) => {
    calls.push(request);
    return { items: [{ ...hospital, distanceKm: 2.4 }], total: 25, page: 1, hasNext: true };
  });
  const page = await catalog.loadProviderPage("hospital", "heart", 1, undefined, { location, type: "Private" });
  assert.equal(calls[0].path, "/public/hospitals/nearby");
  assert.equal(calls[0].method, "POST");
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0].body)), { location, type: "Private", search: "heart", page: 1 });
  assert.equal(page.items[0].distanceKm, 2.4);
  assert.equal(page.hasNext, true);
});
it("loads affiliated doctors through the new hospital filter", async () => {
  let filtered = false;
  const { catalog } = loader(async ({ path }) => {
    if (path === `/public/hospitals/${hospitalId}`) return hospital;
    filtered =
      new URL("https://test" + path).searchParams.get("hospital_id") ===
      hospitalId;
    return { items: [doctor], total: 1, page: 1, hasNext: false };
  });
  const result = await catalog.loadProviderDetail(hospitalId, "hospital");
  assert.equal(filtered, true);
  assert.equal(result.affiliations[0].id, doctorId);
});
it("keeps Home available across recorded locations and isolates section failures", async () => {
  const calls: string[] = [];
  const { home } = loader(async ({ path }) => {
    calls.push(path);
    if (path.startsWith("/public/doctors")) throw Error("offline");
    return { items: [hospital], total: 1, page: 1, hasNext: false };
  });
  const result = await home().loadDiscovery(new AbortController().signal, "Delhi");
  assert.equal(result.coverage, "available-locations");
  assert.equal(result.hospitals.status, "available");
  assert.equal(result.doctors.status, "unavailable");
  assert.equal(result.hospitals.items[0].imageUrl, hospital.image_url);
  assert.equal(calls.length, 2);
  assert.ok(calls.every(path => new URL("https://test" + path).searchParams.get("city") === "Delhi"));
});
it("reads all pages of active departments", async () => {
  let page = 0;
  const { catalog } = loader(async () => ({
    items: [
      {
        id: departmentId,
        source_key: "test:department",
        name_en: "Department " + ++page,
        name_hi: "",
      },
    ],
    hasNext: page === 1,
  }));
  const result = await catalog.loadDepartments();
  assert.equal(result.length, 2);
});

it('preserves the main profile when related providers fail and respects cancellation',async()=>{
 const {catalog}=loader(async({path})=>{if(path===`/public/hospitals/${hospitalId}`)return hospital;throw Error('offline');});
 const result=await catalog.loadProviderDetail(hospitalId,'hospital');assert.equal(result.id,hospitalId);assert.equal(result.affiliationsUnavailable,true);
 const controller=new AbortController();controller.abort();await assert.rejects(()=>catalog.loadProviderDetail(hospitalId,'hospital',controller.signal),/cancelled/);
});
