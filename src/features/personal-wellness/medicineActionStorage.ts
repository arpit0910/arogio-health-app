import { createMedicineActionQueue } from './medicineActionQueue';
// Browser reminders are unavailable; keep the shared provider interface side-effect free.
export const medicineActionQueue = createMedicineActionQueue({ get: async () => null, set: async () => {} });
