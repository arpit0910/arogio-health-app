import { useTranslation } from "../../localization/LanguageProvider";
import { useLocalSearchParams } from 'expo-router';
import { ComingSoonScreen } from '../../features/home/ComingSoonScreen';
export default function FeatureRoute() {
  const { t: tr } = useTranslation();
  const { name } = useLocalSearchParams<{ name?: string }>();
  return <ComingSoonScreen title={tr(typeof name === 'string' ? name.slice(0, 80) : 'Arogio')} back />;
}
