import { CareSearchScreen } from '../care-directory/CareSearchScreen';
import { CareDetailScreen } from '../care-directory/CareDetailScreen';
export function MedicineLibraryListScreen() { return <CareSearchScreen fixedKind='medicine' />; }
export function MedicineLibraryDetailScreen() { return <CareDetailScreen fixedKind='medicine' />; }
