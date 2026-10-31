import { useTranslation } from "../localization/LanguageProvider";
import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { useAuth } from '../features/auth/context/AuthContext';
import { ProfileSetupScreen } from '../features/profile/components/ProfileSetupScreen';
export default function SetupProfileRoute() {
  const { t: tr } = useTranslation();
  const { user, isLoading } = useAuth();
  if (isLoading) return <ActivityIndicator accessibilityLabel={tr("Loading profile")} />;
  if (!user) return <Redirect href="/signup" />;
  return <ProfileSetupScreen key={user.id} />;
}
