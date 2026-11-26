import { useState } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import { env } from '../../configuration/environment';
import { usePalette } from '../../theme/AppearanceProvider';
import { articleImageCandidates } from './articlePresentation';

export function ArticleThumbnail({ thumbnailUrl, imageUrl, style }: {
  thumbnailUrl?: string;
  imageUrl?: string;
  style: StyleProp<ViewStyle>;
}) {
  const colors = usePalette();
  const [failed, setFailed] = useState<string[]>([]);
  const uri = articleImageCandidates(env.apiUrl, thumbnailUrl, imageUrl).find((candidate) => !failed.includes(candidate));
  return (
    <View style={[{ backgroundColor: colors.subtle }, style, { overflow: 'hidden' }]}>
      {uri && <Image
        key={uri}
        accessible={false}
        source={{ uri }}
        onError={() => setFailed((previous) => previous.includes(uri) ? previous : [...previous, uri])}
        resizeMode="cover"
        resizeMethod="resize"
        style={{ width: '100%', height: '100%' }}
      />}
    </View>
  );
}
