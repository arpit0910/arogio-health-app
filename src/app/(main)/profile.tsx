import { AccountProfileScreen } from '../../features/profile/components/AccountProfileScreen';
import { PrivateFeature } from '../../features/care-directory/CarePrimitives';
export default function ProfileRoute() { return <PrivateFeature><AccountProfileScreen /></PrivateFeature>; }
