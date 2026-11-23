import { CareSearchScreen } from '../care-directory/CareSearchScreen';
import { CareDetailScreen } from '../care-directory/CareDetailScreen';
export function DoctorListScreen() { return <CareSearchScreen fixedKind='doctor' />; }
export function DoctorDetailScreen() { return <CareDetailScreen fixedKind='doctor' />; }
