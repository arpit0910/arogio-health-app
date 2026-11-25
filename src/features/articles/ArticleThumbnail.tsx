import { useState } from 'react';
import { Image, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { env } from '../../configuration/environment';
import { usePalette } from '../../theme/AppearanceProvider';
import { AppIcon } from '../../components/app/AppIcon';
import { articleImageCandidates } from './articlePresentation';

export function ArticleThumbnail({ thumbnailUrl, imageUrl, style }: {
  thumbnailUrl?: string;
  imageUrl?: string;
  style: StyleProp<ImageStyle & ViewStyle>;
}) {
  const colors = usePalette();
  const [failed, setFailed] = useState<string[]>([]);
  const uri = articleImageCandidates(env.apiUrl, thumbnailUrl, imageUrl).find((candidate) => !failed.includes(candidate));

  if (!uri) {
    return (
      <View accessible={false} style={[{ backgroundColor: colors.subtle }, style, { alignItems: 'center', justifyContent: 'center' }]}>
        <AppIcon name="book" size={22} color={colors.muted} />
      </View>
    );
  }
  return (
    <Image
      key={uri}
      accessible={false}
      source={{ uri }}
      onError={() => setFailed((previous) => previous.includes(uri) ? previous : [...previous, uri])}
      resizeMode="cover"
      style={[{ backgroundColor: colors.subtle }, style]}
    />
  );
}
