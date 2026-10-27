import { useLocalSearchParams } from 'expo-router';
import { ComingSoonScreen } from '../../features/home/ComingSoonScreen';
export default function FeatureRoute() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  return <ComingSoonScreen title={typeof name === 'string' ? name.slice(0, 80) : 'Arogio'} back />;
}
