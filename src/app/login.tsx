import { Redirect } from 'expo-router';
import { AuthScreen } from '../features/auth/components/AuthScreen';
import { useAuth } from '../features/auth/context/AuthContext';

export default function LoginRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Redirect href="/" />;
  return <AuthScreen initialTab="login" />;
}

