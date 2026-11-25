import { loadProviderPage } from "../care-directory/providerCatalog";
export async function loadDiscovery(signal: AbortSignal, city?: string) {
  const results = await Promise.allSettled(
    ["hospital", "doctor"].map((kind) =>
      loadProviderPage(kind as "hospital" | "doctor", "", 1, signal, {
        limit: 3,
        ...(city ? { city } : {}),
      }),
    ),
  );
  if (signal.aborted) throw new Error("Request cancelled.");
  const section = (result: (typeof results)[number]) =>
    result.status === "fulfilled"
      ? { status: "available" as const, items: result.value.items }
      : { status: "unavailable" as const, items: [] };
  return {
    coverage: "available-locations" as const,
    hospitals: section(results[0]),
    doctors: section(results[1]),
    availability: "contact-provider" as const,
  };
}
