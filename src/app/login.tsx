import { Redirect } from 'expo-router';
import { AuthScreen } from '../features/authentication/components/AuthScreen';
import { useAuth } from '../features/authentication/context/AuthContext';

export default function LoginRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Redirect href="/" />;
  return <AuthScreen initialTab="login" />;
}

