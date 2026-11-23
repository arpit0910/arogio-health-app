import * as SecureStore from 'expo-secure-store';
import { createMedicineActionQueue } from './medicineActionQueue';
export const medicineActionQueue = createMedicineActionQueue({ get: SecureStore.getItemAsync, set: SecureStore.setItemAsync });
