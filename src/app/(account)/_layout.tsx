import { Stack } from 'expo-router';
import { AccountGuard } from '../../navigation/AuthenticatedLayout';
export default function AccountLayout() { return <AccountGuard><Stack screenOptions={{ headerShown: false }} /></AccountGuard>; }
