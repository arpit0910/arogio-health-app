import { useState } from 'react';
import { Image, type ImageSourcePropType, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { env } from '../../configuration/environment';
import { usePalette } from '../../theme/AppearanceProvider';
import { articleImageCandidates } from './articlePresentation';

const bundledCovers: Record<string, ImageSourcePropType> = {
  care: require('../../../assets/articles/care.jpg'),
  family: require('../../../assets/articles/family.jpg'),
  mindfulness: require('../../../assets/articles/mindfulness.jpg'),
  movement: require('../../../assets/articles/movement.jpg'),
  nutrition: require('../../../assets/articles/nutrition.jpg'),
  sleep: require('../../../assets/articles/sleep.jpg'),
  walking: require('../../../assets/articles/walking.jpg'),
  wellbeing: require('../../../assets/articles/wellbeing.jpg'),
  yoga: require('../../../assets/articles/yoga.jpg'),
};

export function ArticleThumbnail({ thumbnailUrl, imageUrl, style }: {
  thumbnailUrl?: string;
  imageUrl?: string;
  style: StyleProp<ImageStyle & ViewStyle>;
}) {
  const colors = usePalette();
  const [failed, setFailed] = useState<string[]>([]);
  const uri = articleImageCandidates(env.apiUrl, thumbnailUrl, imageUrl).find((candidate) => !failed.includes(candidate));
  const coverName = /\/admin-assets\/article-thumbnails\/([a-z]+)\.jpg(?:[?#]|$)/i.exec(thumbnailUrl ?? '')?.[1];
  const fallback = (coverName && bundledCovers[coverName.toLowerCase()]) || bundledCovers.wellbeing;
  return (
    <Image
      key={uri}
      accessible={false}
      source={uri ? { uri } : fallback}
      onError={uri ? () => setFailed((previous) => previous.includes(uri) ? previous : [...previous, uri]) : undefined}
      resizeMode="cover"
      style={[{ backgroundColor: colors.subtle }, style]}
    />
  );
}
