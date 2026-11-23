import { Stack } from 'expo-router';
import { PublicOrAccountGuard } from '../../navigation/AuthenticatedLayout';
export default function AccountLayout() { return <PublicOrAccountGuard><Stack screenOptions={{ headerShown: false }} /></PublicOrAccountGuard>; }
