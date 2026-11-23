import { CareSearchScreen } from '../care-directory/CareSearchScreen';
import { CareDetailScreen } from '../care-directory/CareDetailScreen';
export function HospitalListScreen() { return <CareSearchScreen fixedKind='hospital' />; }
export function HospitalDetailScreen() { return <CareDetailScreen fixedKind='hospital' />; }
